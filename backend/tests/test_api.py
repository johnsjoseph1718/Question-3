"""
Automated Integration and Unit Tests for WebInsight Backend API.
Tests endpoints, SSRF protections, scraping fallbacks, and Q&A sessions.
"""

import json
import pytest
from app import app
from utils.validators import validate_and_sanitize_url, is_safe_ip
from services.website_qa import create_session, get_session, answer_question


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


# --- Validator & SSRF Tests ---

def test_is_safe_ip():
    assert is_safe_ip("127.0.0.1") is False
    assert is_safe_ip("::1") is False
    assert is_safe_ip("10.0.0.1") is False
    assert is_safe_ip("192.168.1.1") is False
    assert is_safe_ip("172.16.0.1") is False
    assert is_safe_ip("169.254.169.254") is False
    assert is_safe_ip("8.8.8.8") is True
    assert is_safe_ip("1.1.1.1") is True


def test_validate_and_sanitize_url_empty():
    is_valid, _, err = validate_and_sanitize_url("")
    assert is_valid is False
    assert "empty" in err.lower()


def test_validate_and_sanitize_url_ssrf_localhost():
    is_valid, _, err = validate_and_sanitize_url("http://127.0.0.1:8080/admin")
    assert is_valid is False
    assert "restricted" in err.lower() or "security" in err.lower()


def test_validate_and_sanitize_url_disallowed_protocol():
    is_valid, _, err = validate_and_sanitize_url("ftp://example.com/file")
    assert is_valid is False
    assert "unsupported protocol" in err.lower()


# --- Endpoint Tests ---

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
    assert "openai_configured" in data
    assert "model" in data


def test_analyze_empty_request(client):
    response = client.post("/api/analyze", json={})
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False


def test_analyze_ssrf_blocked(client):
    # Test standard port with localhost
    response = client.post("/api/analyze", json={"url": "http://127.0.0.1:8080"})
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False
    assert "restricted" in data["error"].lower() or "security" in data["error"].lower()

    # Test non-standard port rejection
    response_port = client.post("/api/analyze", json={"url": "http://127.0.0.1:5000"})
    assert response_port.status_code == 400
    data_port = response_port.get_json()
    assert "not permitted" in data_port["error"].lower() or "restricted" in data_port["error"].lower()


def test_qa_session_workflow(client):
    # 1. Manually create a session to simulate an analyzed website
    scraped_data = {
        "url": "https://example.com",
        "domain": "example.com",
        "title": "Example Domain",
        "text": (
            "This domain is for use in documentation examples without needing permission. "
            "You may use this domain in literature without prior coordination."
        ),
    }
    summary_data = {
        "website_overview": "Example domain overview",
        "main_purpose": "Documentation illustrative example",
        "key_features": ["No permission needed", "Standardized documentation"],
        "important_information": ["Owned by IANA"],
        "target_audience": "Technical authors and developers",
        "main_services_or_products": ["Documentation reserve domain"],
        "important_keywords": ["example", "domain", "documentation"],
        "overall_conclusion": "Standard reserve domain.",
    }

    session_id = create_session(scraped_data, summary_data)
    assert session_id is not None
    assert get_session(session_id) is not None

    # 2. Test Q&A with valid question
    qa_resp = client.post("/api/ask", json={
        "session_id": session_id,
        "question": "What is this domain used for?"
    })
    assert qa_resp.status_code == 200
    qa_data = qa_resp.get_json()
    assert qa_data["success"] is True
    assert "documentation" in qa_data["answer"].lower() or "example" in qa_data["answer"].lower()

    # 3. Test Q&A with invalid session
    bad_qa_resp = client.post("/api/ask", json={
        "session_id": "non-existent-session-12345",
        "question": "What is this?"
    })
    assert bad_qa_resp.status_code == 400
    bad_qa_data = bad_qa_resp.get_json()
    assert bad_qa_data["success"] is False
    assert "expired" in bad_qa_data["answer"].lower() or "not found" in bad_qa_data["answer"].lower()


def test_ask_missing_fields(client):
    resp = client.post("/api/ask", json={"session_id": ""})
    assert resp.status_code == 400
    data = resp.get_json()
    assert data["success"] is False
