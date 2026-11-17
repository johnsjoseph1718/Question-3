"""
URL Validation and SSRF Protection Utilities.
Ensures URLs are well-formed, use supported protocols (HTTP/HTTPS),
and do not target private, loopback, link-local, or cloud-internal IP addresses.
"""

import ipaddress
import re
import socket
from urllib.parse import urlsplit, urlunsplit


# Blocked top-level domains and special hostnames
BLOCKED_HOSTNAMES = {
    "localhost",
    "metadata.google.internal",
    "instance-data",
}

BLOCKED_SUFFIXES = (
    ".local",
    ".internal",
    ".lan",
    ".home",
    ".corp",
    ".localdomain",
    ".intranet",
)

# Cloud metadata IP ranges and carrier-grade NAT
EXTRA_DISALLOWED_NETWORKS = [
    ipaddress.ip_network("100.64.0.0/10"),    # Carrier-grade NAT
    ipaddress.ip_network("198.18.0.0/15"),    # Network benchmark tests
    ipaddress.ip_network("192.0.0.0/24"),     # IETF Protocol Assignments
    ipaddress.ip_network("192.0.2.0/24"),     # TEST-NET-1
    ipaddress.ip_network("198.51.100.0/24"),  # TEST-NET-2
    ipaddress.ip_network("203.0.113.0/24"),   # TEST-NET-3
    ipaddress.ip_network("240.0.0.0/4"),      # Reserved
    ipaddress.ip_network("fc00::/7"),         # Unique local IPv6
    ipaddress.ip_network("fe80::/10"),        # Link-local IPv6
]


def is_safe_ip(ip_str: str) -> bool:
    """Check if an IP address string is public and safe to connect to."""
    try:
        ip = ipaddress.ip_address(ip_str)

        # Standard RFC check
        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
        ):
            return False

        # Additional disallowed ranges (cloud metadata, CGNAT, benchmark ranges)
        for net in EXTRA_DISALLOWED_NETWORKS:
            if ip in net:
                return False

        # Explicit AWS / GCP / Azure metadata endpoint: 169.254.169.254
        if str(ip) == "169.254.169.254":
            return False

        return True
    except ValueError:
        return False


def validate_and_sanitize_url(raw_url: str) -> tuple[bool, str, str | None]:
    """
    Validates, normalizes, and verifies that the URL is safe to fetch.

    Returns:
        tuple[is_valid (bool), sanitized_url (str), error_message (str | None)]
    """
    if not raw_url or not isinstance(raw_url, str):
        return False, "", "URL cannot be empty."

    url = raw_url.strip()

    # Prepend https:// if missing
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+\-.]*://", url):
        url = "https://" + url

    try:
        parsed = urlsplit(url)
    except Exception as e:
        return False, "", f"Failed to parse URL: {str(e)}"

    # Scheme validation (only http and https permitted)
    if parsed.scheme.lower() not in ("http", "https"):
        return False, "", f"Unsupported protocol '{parsed.scheme}'. Only HTTP and HTTPS are allowed."

    hostname = parsed.hostname
    if not hostname:
        return False, "", "Invalid URL: missing hostname."

    hostname_lower = hostname.lower()

    # Check hostname blacklists
    if hostname_lower in BLOCKED_HOSTNAMES:
        return False, "", f"Access to '{hostname}' is restricted (SSRF protection)."

    for suffix in BLOCKED_SUFFIXES:
        if hostname_lower.endswith(suffix):
            return False, "", f"Access to internal domain (*{suffix}) is restricted."

    # Validate port if specified
    if parsed.port:
        # Prevent access to non-standard internal ports (e.g. 22, 25, 3306, 5432, 6379, 27017)
        if parsed.port not in (80, 443, 8080, 8443):
            return False, "", f"Port {parsed.port} is not permitted. Only standard web ports (80, 443, 8080, 8443) are allowed."

    # DNS Resolution and SSRF protection
    try:
        addr_info = socket.getaddrinfo(hostname, parsed.port or (443 if parsed.scheme == "https" else 80), proto=socket.IPPROTO_TCP)
        if not addr_info:
            return False, "", f"Unable to resolve domain '{hostname}'."

        resolved_ips = []
        for item in addr_info:
            sockaddr = item[4]
            ip_str = sockaddr[0]
            resolved_ips.append(ip_str)

            if not is_safe_ip(ip_str):
                return False, "", f"Security violation: domain resolves to restricted IP ({ip_str})."

    except socket.gaierror:
        return False, "", f"Domain name '{hostname}' could not be resolved. Please verify the URL."
    except Exception as e:
        return False, "", f"Network resolution error for '{hostname}': {str(e)}"

    # Reconstruct clean normalized URL (strip credentials if user tried user:pass@host)
    netloc = hostname
    if parsed.port and parsed.port not in (80, 443):
        netloc = f"{hostname}:{parsed.port}"

    sanitized_url = urlunsplit((
        parsed.scheme.lower(),
        netloc,
        parsed.path or "/",
        parsed.query,
        ""  # strip fragments
    ))

    return True, sanitized_url, None
