"""
Website Scraper Service.
Safely fetches public webpage content with timeout protection, size limiting,
SSRF redirect protection, and BeautifulSoup4 text cleaning.
"""

import logging
import re
from urllib.parse import urljoin, urlsplit
import requests
from bs4 import BeautifulSoup

from utils.validators import validate_and_sanitize_url

logger = logging.getLogger(__name__)

# Max content size: 5 MB
MAX_CONTENT_LENGTH = 5 * 1024 * 1024
DEFAULT_TIMEOUT = (5.0, 10.0)  # (connect timeout, read timeout)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36 WebInsightBot/1.0"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Upgrade-Insecure-Requests": "1",
}


class ScrapingError(Exception):
    """Custom exception for scraping failures with user-friendly messages."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def fetch_webpage(url: str) -> tuple[str, str]:
    """
    Fetches the HTML content of the target URL with SSRF-safe redirect validation,
    response size limiting, and error handling.

    Returns:
        tuple[html_content (str), final_url (str)]
    """
    is_valid, sanitized_url, err = validate_and_sanitize_url(url)
    if not is_valid:
        raise ScrapingError(err or "Invalid URL.", status_code=400)

    session = requests.Session()
    session.headers.update(HEADERS)

    current_url = sanitized_url
    max_redirects = 5

    try:
        for _ in range(max_redirects):
            # Fetch with stream=True to guard against huge downloads
            response = session.get(
                current_url,
                timeout=DEFAULT_TIMEOUT,
                stream=True,
                allow_redirects=False,
            )

            # Check for redirects manually to validate destination against SSRF
            if response.is_redirect or response.status_code in (301, 302, 303, 307, 308):
                location = response.headers.get("Location")
                if not location:
                    break
                redirect_url = urljoin(current_url, location)
                is_valid_redir, sanitized_redir, redir_err = validate_and_sanitize_url(redirect_url)
                if not is_valid_redir:
                    raise ScrapingError(
                        f"Redirect blocked by SSRF protection: {redir_err}",
                        status_code=400,
                    )
                current_url = sanitized_redir
                continue

            # Check HTTP status codes
            if response.status_code == 401:
                raise ScrapingError("This website requires authentication (HTTP 401 Unauthorized).", status_code=403)
            elif response.status_code == 403:
                raise ScrapingError(
                    "This website blocked automated access (HTTP 403 Forbidden). "
                    "It may be protected by anti-bot verification or Cloudflare.",
                    status_code=403,
                )
            elif response.status_code == 404:
                raise ScrapingError("The requested webpage was not found (HTTP 404).", status_code=404)
            elif response.status_code == 429:
                raise ScrapingError("Rate limited by the destination website (HTTP 429). Please try again later.", status_code=429)
            elif response.status_code >= 500:
                raise ScrapingError(f"The destination web server returned an error (HTTP {response.status_code}).", status_code=502)
            elif response.status_code != 200:
                raise ScrapingError(f"Received unexpected HTTP status {response.status_code} from website.", status_code=400)

            # Verify Content-Type
            content_type = response.headers.get("Content-Type", "").lower()
            if not any(t in content_type for t in ("text/html", "application/xhtml+xml", "text/plain")):
                raise ScrapingError(
                    f"Unsupported content type '{content_type}'. WebInsight only summarizes web pages (HTML).",
                    status_code=415,
                )

            # Check Content-Length header if provided
            declared_length = response.headers.get("Content-Length")
            if declared_length and declared_length.isdigit() and int(declared_length) > MAX_CONTENT_LENGTH:
                raise ScrapingError("Webpage is too large to process (exceeds 5MB limit).", status_code=413)

            # Download content safely in chunks
            content_chunks = []
            downloaded_bytes = 0
            for chunk in response.iter_content(chunk_size=16384):
                if chunk:
                    downloaded_bytes += len(chunk)
                    if downloaded_bytes > MAX_CONTENT_LENGTH:
                        raise ScrapingError("Webpage exceeded maximum allowed size of 5MB.", status_code=413)
                    content_chunks.append(chunk)

            # Detect encoding and decode
            raw_data = b"".join(content_chunks)
            encoding = response.encoding or response.apparent_encoding or "utf-8"
            try:
                html_text = raw_data.decode(encoding, errors="replace")
            except Exception:
                html_text = raw_data.decode("utf-8", errors="replace")

            return html_text, current_url

        raise ScrapingError("Too many redirects encountered while fetching website.", status_code=400)

    except requests.exceptions.SSLError as e:
        raise ScrapingError(f"SSL/TLS Certificate verification failed for {url}: {str(e)}", status_code=502)
    except requests.exceptions.ConnectTimeout:
        raise ScrapingError("Connection timed out while connecting to the website server.", status_code=504)
    except requests.exceptions.ReadTimeout:
        raise ScrapingError("Website took too long to send data (read timeout).", status_code=504)
    except requests.exceptions.ConnectionError as e:
        raise ScrapingError(f"Failed to connect to website. Server may be down or unreachable.", status_code=502)
    except ScrapingError:
        raise
    except Exception as e:
        logger.exception("Unexpected error fetching webpage")
        raise ScrapingError(f"Error fetching webpage: {str(e)}", status_code=500)


def extract_website_content(url: str) -> dict:
    """
    Fetches and extracts clean, structured text and metadata from a webpage.

    Returns:
        dict containing title, description, favicon, domain, cleaned text,
        stats, and headings.
    """
    html_content, final_url = fetch_webpage(url)

    if not html_content.strip():
        raise ScrapingError("Webpage returned empty content.", status_code=400)

    soup = BeautifulSoup(html_content, "html.parser")

    # Extract Title
    title = ""
    if soup.title and soup.title.string:
        title = soup.title.string.strip()
    if not title:
        og_title = soup.find("meta", property="og:title")
        if og_title and og_title.get("content"):
            title = og_title["content"].strip()
    if not title:
        h1 = soup.find("h1")
        if h1:
            title = h1.get_text().strip()
    if not title:
        parsed = urlsplit(final_url)
        title = parsed.hostname or "Untitled Website"

    # Extract Meta Description
    description = ""
    meta_desc = (
        soup.find("meta", attrs={"name": "description"})
        or soup.find("meta", property="og:description")
        or soup.find("meta", attrs={"name": "twitter:description"})
    )
    if meta_desc and meta_desc.get("content"):
        description = meta_desc["content"].strip()

    # Extract Favicon
    parsed_final = urlsplit(final_url)
    domain = parsed_final.hostname or ""
    favicon_url = f"https://www.google.com/s2/favicons?domain={domain}&sz=64"
    icon_tag = soup.find("link", rel=lambda r: r and any(i in str(r).lower() for i in ("icon", "shortcut icon")))
    if icon_tag and icon_tag.get("href"):
        favicon_url = urljoin(final_url, icon_tag["href"])

    # Remove irrelevant and non-content elements
    unwanted_tags = [
        "script", "style", "nav", "header", "footer", "aside",
        "iframe", "noscript", "svg", "canvas", "form", "button",
        "menu", "dialog", "select", "textarea", "video", "audio",
        "map", "object", "embed"
    ]
    for tag in soup.find_all(unwanted_tags):
        tag.decompose()

    # Remove common clutter classes/ids (cookie banners, social share, ads)
    clutter_patterns = re.compile(
        r"(cookie|gdpr|advertisement|banner-ad|popup|modal-dialog|share-buttons|footer-links)",
        re.IGNORECASE
    )
    for element in soup.find_all(attrs={"class": clutter_patterns}):
        element.decompose()
    for element in soup.find_all(attrs={"id": clutter_patterns}):
        element.decompose()

    # Target primary content container if available
    content_root = (
        soup.find("main")
        or soup.find("article")
        or soup.find(attrs={"role": "main"})
        or soup.find(id=re.compile(r"(content|main|article|body)", re.I))
        or soup.find(class_=re.compile(r"(content|main|article|body)", re.I))
        or soup.body
        or soup
    )

    # Collect headings for structured summary
    headings = []
    for h in content_root.find_all(["h1", "h2", "h3"]):
        h_text = h.get_text().strip()
        if h_text and len(h_text) > 2 and len(h_text) < 120:
            headings.append(f"{h.name.upper()}: {h_text}")

    # Extract text with section breaks
    lines = []
    for elem in content_root.descendants:
        if elem.name in ("h1", "h2", "h3", "h4", "h5", "h6"):
            text = elem.get_text().strip()
            if text:
                lines.append(f"\n\n### {text}\n")
        elif elem.name in ("p", "li", "blockquote", "td", "th"):
            text = elem.get_text().strip()
            if text and len(text) > 10:
                lines.append(text)

    # Fallback to general get_text if paragraphs were sparse
    raw_text = "\n".join(lines).strip()
    if len(raw_text) < 100:
        raw_text = content_root.get_text(separator="\n", strip=True)

    # Clean text: collapse multiple newlines, strip excessive whitespace
    cleaned_text = re.sub(r"\n{3,}", "\n\n", raw_text)
    cleaned_text = re.sub(r"[ \t]+", " ", cleaned_text).strip()

    if not cleaned_text or len(cleaned_text) < 30:
        raise ScrapingError(
            "Could not extract meaningful text from this website. "
            "It may require JavaScript rendering or is an empty page.",
            status_code=422
        )

    words = cleaned_text.split()
    word_count = len(words)
    reading_time = max(1, round(word_count / 200))

    return {
        "url": final_url,
        "domain": domain,
        "title": title,
        "description": description,
        "favicon": favicon_url,
        "text": cleaned_text,
        "word_count": word_count,
        "reading_time_minutes": reading_time,
        "headings": headings[:15],
    }
