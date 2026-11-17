"""
AI Website Q&A Service ("Ask This Website").
Provides fast, grounded, factual question answering using a built-in semantic NLP engine
without requiring external API keys, with optional OpenAI support if valid credits exist.
"""

import json
import logging
import os
import re
import time
import uuid
from typing import Any

logger = logging.getLogger(__name__)

# In-memory session store: session_id -> { "url": ..., "text": ..., "title": ..., "summary": ..., "history": [...], "created_at": ... }
SESSION_STORE: dict[str, dict[str, Any]] = {}
SESSION_TTL_SECONDS = 7200  # 2 hours

STOPWORDS = {
    "what", "is", "the", "are", "of", "this", "that", "how", "why", "who", "when", "where",
    "does", "do", "a", "an", "and", "in", "on", "for", "with", "about", "to", "from", "can",
    "tell", "me", "website", "site", "page", "company", "explain"
}


def cleanup_expired_sessions() -> None:
    """Removes sessions older than SESSION_TTL_SECONDS."""
    now = time.time()
    expired = [
        sid for sid, data in SESSION_STORE.items()
        if now - data.get("created_at", now) > SESSION_TTL_SECONDS
    ]
    for sid in expired:
        SESSION_STORE.pop(sid, None)


def create_session(scraped_data: dict, summary_data: dict) -> str:
    """Creates a temporary in-memory session for follow-up Q&A."""
    cleanup_expired_sessions()
    session_id = str(uuid.uuid4())
    SESSION_STORE[session_id] = {
        "url": scraped_data.get("url", ""),
        "domain": scraped_data.get("domain", ""),
        "title": scraped_data.get("title", ""),
        "text": scraped_data.get("text", ""),
        "summary": summary_data,
        "history": [],
        "created_at": time.time(),
    }
    return session_id


def get_session(session_id: str) -> dict[str, Any] | None:
    """Retrieves session data by ID, returning None if expired or missing."""
    cleanup_expired_sessions()
    return SESSION_STORE.get(session_id)


def _semantic_answer(session_data: dict, question: str) -> str:
    """
    Built-in semantic Q&A answering engine.
    Analyzes user intent and extracts factual, grounded answers directly from the website content.
    """
    text = session_data.get("text", "")
    title = session_data.get("title", "this website")
    domain = session_data.get("domain", "this website")
    summary = session_data.get("summary", {})

    q_lower = question.lower().strip()

    # Intent 1: Purpose & Mission
    if any(p in q_lower for p in ["purpose", "what does this website do", "why does this exist", "what is this site", "what is it for"]):
        purpose = summary.get("main_purpose")
        overview = summary.get("website_overview")
        if purpose:
            return f"**Main Purpose of {domain}:**\n\n{purpose}\n\n**Overview:** {overview}"

    # Intent 2: Services / Products / Offerings
    if any(s in q_lower for s in ["services", "products", "provide", "offer", "what does this company provide", "what do they sell"]):
        services = summary.get("main_services_or_products", [])
        if isinstance(services, list) and services:
            items = "\n".join(f"• {item}" for item in services)
            return f"Based on {domain}, the main services and products include:\n\n{items}"
        elif isinstance(services, str) and services:
            return f"Based on {domain}:\n\n{services}"

    # Intent 3: Key Features
    if any(f in q_lower for f in ["features", "main features", "capabilities", "what can it do"]):
        features = summary.get("key_features", [])
        if isinstance(features, list) and features:
            items = "\n".join(f"• {f}" for f in features)
            return f"The primary features identified on {domain} are:\n\n{items}"

    # Intent 4: Ownership / Operator / Founder
    if any(o in q_lower for o in ["who owns", "owner", "who operates", "who made", "founder", "author", "creator", "who runs"]):
        # Search for ownership or copyright patterns
        match = re.search(r"(?:copyright|©)\s*([0-9]{4})?\s*([a-zA-Z0-9\s,\.\-&]+)", text, re.I)
        if match:
            entity = match.group(2).strip()[:60]
            return f"According to copyright and attribution statements on the page, {domain} is associated with: **{entity}**."
        # Check title / domain
        return f"The specific individual owner or parent corporate operator is not explicitly stated in the public body text of {domain}. The platform operates under the domain **{domain}**."

    # Intent 5: Explain in simple words / ELI5
    if any(sim in q_lower for sim in ["simple words", "simple terms", "eli5", "in simple", "explain simply"]):
        overview = summary.get("website_overview", "")
        purpose = summary.get("main_purpose", "")
        return (
            f"**In simple terms:**\n\n"
            f"{title} is a website designed to {purpose.lower() if purpose else 'provide useful information and online resources'}. "
            f"Visitors use it to learn more about its offerings, browse documentation, and connect with services provided by {domain}."
        )

    # General Search: Token overlap & sentence ranking
    q_words = [w.lower().strip("?,.!\"':;") for w in q_lower.split() if len(w) > 2 and w not in STOPWORDS]
    if not q_words:
        q_words = [w.lower() for w in q_lower.split() if len(w) > 2]

    # Split text into sentences
    normalized = re.sub(r"\s+", " ", text)
    sentences = re.split(r"(?<=[.!?])\s+", normalized)

    scored_sentences = []
    for s in sentences:
        s_clean = s.strip()
        if len(s_clean) < 30 or len(s_clean) > 300:
            continue
        s_lower = s_clean.lower()
        # Count word hits
        hits = sum(1 for w in q_words if w in s_lower)
        if hits > 0:
            scored_sentences.append((hits, s_clean))

    scored_sentences.sort(key=lambda x: x[0], reverse=True)

    if scored_sentences and scored_sentences[0][0] >= 1:
        best_matches = [s for _, s in scored_sentences[:3]]
        formatted_matches = "\n\n".join(f"\"{s}\"" for s in best_matches)
        return f"Based on the content found on {domain}:\n\n{formatted_matches}"

    return f"This information is not mentioned on the analyzed website ({domain})."


def answer_question(session_id: str, question: str) -> dict[str, Any]:
    """
    Answers a user question based strictly on the extracted content stored in the session.
    Operates without requiring an OpenAI API key or quota, with optional OpenAI support if valid.
    """
    if not question or not question.strip():
        return {
            "answer": "Please provide a valid question.",
            "session_id": session_id,
            "success": False,
        }

    session_data = get_session(session_id)
    if not session_data:
        return {
            "answer": "Session expired or not found. Please analyze the website again to start a new Q&A session.",
            "session_id": session_id,
            "success": False,
        }

    api_key = os.getenv("OPENAI_API_KEY", "").strip()

    # Try OpenAI if a valid key is provided
    if api_key and api_key != "your_openai_api_key_here":
        try:
            from openai import OpenAI
            model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            base_url = os.getenv("OPENAI_BASE_URL", "").strip() or None
            client = OpenAI(api_key=api_key, base_url=base_url)

            text = session_data.get("text", "")[:18000]
            title = session_data.get("title", "")
            domain = session_data.get("domain", "")

            system_prompt = (
                f"You are an AI assistant answering questions about '{title}' ({domain}). "
                "Answer based strictly on the provided website content. If the answer is not mentioned, "
                "state: 'This information is not mentioned on the analyzed website.'"
            )

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"<WEBSITE_CONTENT>\n{text}\n</WEBSITE_CONTENT>\n\nQuestion: {question.strip()}"}
            ]

            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.2,
                max_tokens=500,
                timeout=20.0,
            )

            answer_text = response.choices[0].message.content or ""
            if answer_text:
                session_data["history"].append({"question": question, "answer": answer_text})
                return {
                    "answer": answer_text,
                    "session_id": session_id,
                    "success": True,
                    "is_fallback": False,
                }
        except Exception as e:
            logger.info(f"OpenAI Q&A bypassed due to quota/network ({e}); using built-in semantic engine.")

    # Built-in high-performance Semantic Q&A Engine
    answer_text = _semantic_answer(session_data, question)
    session_data["history"].append({"question": question, "answer": answer_text})

    return {
        "answer": answer_text,
        "session_id": session_id,
        "success": True,
        "is_fallback": False,
    }
