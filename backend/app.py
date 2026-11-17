"""
WebInsight - AI Website Summarizer
Flask Backend Application
"""

import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from utils.validators import validate_and_sanitize_url
from services.scraper import extract_website_content, ScrapingError
from services.summarizer import generate_summary, DEFAULT_MODEL
from services.website_qa import create_session, answer_question, get_session

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
)
logger = logging.getLogger("webinsight")

app = Flask(__name__)
# Enable CORS for development frontend
CORS(app, resources={r"/api/*": {"origins": "*"}})


@app.route("/api/health", methods=["GET"])
def health_check():
    """Returns the operational status of the WebInsight backend."""
    api_key_configured = bool(os.getenv("OPENAI_API_KEY", "").strip())
    model = os.getenv("OPENAI_MODEL", DEFAULT_MODEL)
    return jsonify({
        "status": "healthy",
        "service": "WebInsight Backend API",
        "openai_configured": api_key_configured,
        "model": model,
    }), 200


@app.route("/api/analyze", methods=["POST"])
def analyze_website():
    """
    Validates the provided URL, scrapes website content,
    generates an AI summary, and stores a session for follow-up Q&A.
    """
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({
            "success": False,
            "error": "Invalid request. JSON body with 'url' field is required."
        }), 400

    raw_url = data.get("url", "").strip()
    if not raw_url:
        return jsonify({
            "success": False,
            "error": "Please provide a website URL to analyze."
        }), 400

    # 1. Validate & Sanitize URL
    is_valid, sanitized_url, val_err = validate_and_sanitize_url(raw_url)
    if not is_valid:
        return jsonify({
            "success": False,
            "error": val_err or "Invalid or restricted URL."
        }), 400

    logger.info(f"Analyzing URL: {sanitized_url}")

    # 2. Extract Webpage Content
    try:
        scraped_data = extract_website_content(sanitized_url)
    except ScrapingError as se:
        logger.warning(f"Scraping failed for {sanitized_url}: {se.message}")
        return jsonify({
            "success": False,
            "error": se.message
        }), se.status_code
    except Exception as e:
        logger.exception(f"Unexpected scraping error for {sanitized_url}")
        return jsonify({
            "success": False,
            "error": f"An unexpected error occurred while fetching the website: {str(e)}"
        }), 500

    # 3. Generate AI Summary
    try:
        summary = generate_summary(scraped_data)
    except Exception as e:
        logger.exception("Summarization error")
        return jsonify({
            "success": False,
            "error": f"Failed to generate summary: {str(e)}"
        }), 500

    # 4. Create Q&A Session
    session_id = create_session(scraped_data, summary)

    # 5. Return Structured Response
    return jsonify({
        "success": true_bool(True),
        "session_id": session_id,
        "metadata": {
            "url": scraped_data["url"],
            "domain": scraped_data["domain"],
            "title": scraped_data["title"],
            "description": scraped_data["description"],
            "favicon": scraped_data["favicon"],
            "word_count": scraped_data["word_count"],
            "reading_time_minutes": scraped_data["reading_time_minutes"],
        },
        "summary": summary,
    }), 200


@app.route("/api/ask", methods=["POST"])
def ask_website():
    """
    Answers a question about the analyzed website using the stored session content.
    """
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({
            "success": False,
            "error": "Invalid request body."
        }), 400

    session_id = data.get("session_id", "").strip()
    question = data.get("question", "").strip()

    if not session_id:
        return jsonify({
            "success": False,
            "error": "Missing 'session_id'. Please analyze a website first."
        }), 400

    if not question:
        return jsonify({
            "success": False,
            "error": "Please enter a question to ask."
        }), 400

    result = answer_question(session_id, question)
    status_code = 200 if result.get("success") else 400

    return jsonify(result), status_code


@app.route("/api/session/<session_id>", methods=["GET"])
def get_session_info(session_id: str):
    """Retrieves basic session info for an active analysis."""
    session = get_session(session_id)
    if not session:
        return jsonify({"success": False, "error": "Session not found or expired."}), 404

    return jsonify({
        "success": True,
        "session_id": session_id,
        "url": session["url"],
        "domain": session["domain"],
        "title": session["title"],
        "created_at": session["created_at"],
    }), 200


def true_bool(val: bool) -> bool:
    return bool(val)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") == "development"
    logger.info(f"Starting WebInsight backend on port {port} (debug={debug})")
    app.run(host="0.0.0.0", port=port, debug=debug)
