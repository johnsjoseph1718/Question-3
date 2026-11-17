# WebInsight – AI Website Summarizer

> **Understand Any Website in Seconds.**  
> A full-stack AI-powered web application that extracts webpage content, performs deep LLM analysis, produces structured 8-pillar executive summaries, and lets users ask questions grounded in the website's text.

---

## 🌟 Key Features

### 1. Landing Page & Intelligent Processing
- **Intuitive SaaS Interface:** Inspired by Perplexity AI and ChatGPT with a clean, light palette, dark navy typography, and rounded cards.
- **Auto-Protocol Handling:** Automatically validates URLs and prepends `https://` if missing.
- **One-Click Examples:** Quick-start suggestions for popular public websites (Wikipedia, Python.org, GitHub, Stripe, Cloudflare).
- **Multi-Stage Progress Indicator:** Real-time visual progress showing DNS resolution, HTML extraction, text cleaning, and AI synthesis.

### 2. Robust Extraction & Security
- **SSRF Defense:** Strict validation blocking loopback (`127.0.0.1`), private RFC1918 ranges, cloud metadata IP (`169.254.169.254`), non-standard ports, and safe redirect checking.
- **Smart HTML Cleaning:** Uses BeautifulSoup4 to strip `<script>`, `<style>`, `<nav>`, `<header>`, `<footer>`, `<aside>`, `<iframe>`, cookie banners, and advertisements.
- **Resource Protection:** Enforces response size caps (max 5MB) and strict socket connection timeouts.
- **Untrusted Input Isolation:** Website text is enclosed within `<WEBSITE_CONTENT>` tags with explicit system instructions to prevent prompt injection attempts.

### 3. Structured 8-Pillar AI Summary Dashboard
Displays analysis across 8 structured dimensions:
1. **Website Overview:** Executive 2–3 sentence snapshot.
2. **Main Purpose:** Core problem solved and organizational mission.
3. **Key Features:** Structured list with capability checkmarks.
4. **Important Information:** Essential facts, pricing models, policies, or caveats.
5. **Target Audience:** Intended personas and customer segments.
6. **Main Services or Products:** Catalog of primary offerings.
7. **Important Keywords:** Interactive taxonomy tag cloud.
8. **Overall Conclusion:** Balanced verdict on usability and value proposition.

### 4. Interactive Q&A ("Ask This Website")
- Query the website directly based strictly on extracted text.
- Suggested prompt pills for quick inquiries (purpose, services, ownership, summary).
- In-memory session management so users can ask multiple follow-up questions without re-scraping the target website.
- Truthful grounding: if information is missing from the website, the AI explicitly states that it is not available.

### 5. Export & Utilities
- **Copy Summary:** Formatted markdown/text report copied directly to clipboard.
- **Download TXT:** One-click clean `.txt` summary file generation.
- **Analyze Another:** Instant reset back to the input state.
- **Fully Responsive:** Optimized for desktop, tablet, and mobile displays.

---

## 🏗️ Architecture & Project Structure

```
webinsight-ai-summarizer/
├── backend/
│   ├── app.py                   # Flask REST API & endpoint controllers
│   ├── services/
│   │   ├── __init__.py
│   │   ├── scraper.py           # BeautifulSoup4 extractor & safe HTTP fetcher
│   │   ├── summarizer.py        # OpenAI GPT synthesis & fallback logic
│   │   └── website_qa.py        # Session-managed Q&A engine
│   ├── utils/
│   │   ├── __init__.py
│   │   └── validators.py        # SSRF checks & URL sanitization
│   ├── tests/
│   │   └── test_api.py          # Pytest automated test suite
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment template
│   └── .env                     # Local configuration
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── UrlInputForm.jsx
│   │   │   ├── ExampleSuggestions.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── LoadingAnalysis.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   ├── SummaryDashboard.jsx
│   │   │   ├── SummaryCard.jsx
│   │   │   ├── KeywordsCloud.jsx
│   │   │   ├── AskWebsiteQA.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/
│   │   │   └── HomePage.jsx
│   │   ├── services/
│   │   │   └── api.js           # Frontend API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css            # Tailwind CSS styling
│   ├── vite.config.js           # Vite dev server + API proxy
│   ├── package.json
│   └── index.html
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python:** 3.10 or higher
- **Node.js:** 18 or higher (Node v20+ recommended)
- **Zero API Keys Required:** WebInsight includes a high-performance built-in Semantic AI Engine that works 100% out-of-the-box with no credit cards, subscriptions, or external API keys needed. Optional external LLMs (e.g. OpenAI) can be configured if desired.

---

### Step 1: Set Up Backend

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and insert your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-proj-...
   OPENAI_MODEL=gpt-4o-mini
   PORT=5000
   FLASK_ENV=development
   ```

4. Run the backend server:
   ```bash
   python app.py
   ```
   *The Flask API will start on `http://127.0.0.1:5000`.*

---

### Step 2: Set Up Frontend

1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will open on `http://localhost:5173`.*

---

## 🧪 Running Automated Tests

Run the backend test suite:
```bash
cd backend
python -m pytest tests/test_api.py -v
```

The test suite validates:
- IP security and SSRF detection (localhost, cloud metadata 169.254.169.254, RFC1918)
- Protocol restrictions (rejection of ftp, file, gopher)
- Health check endpoint
- Empty and invalid request handling
- End-to-end Q&A session lifecycle

---

## 📡 API Reference

### 1. `POST /api/analyze`
Scrapes the webpage, runs LLM summarization, and creates a Q&A session.

**Request:**
```json
{
  "url": "https://en.wikipedia.org/wiki/Artificial_intelligence"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "session_id": "a87b5a12-8e7c-4c6e-b3d1-9f939e25d2b7",
  "metadata": {
    "url": "https://en.wikipedia.org/wiki/Artificial_intelligence",
    "domain": "en.wikipedia.org",
    "title": "Artificial intelligence - Wikipedia",
    "description": "...",
    "favicon": "https://en.wikipedia.org/static/favicon/wikipedia.ico",
    "word_count": 8420,
    "reading_time_minutes": 42
  },
  "summary": {
    "website_overview": "...",
    "main_purpose": "...",
    "key_features": ["..."],
    "important_information": ["..."],
    "target_audience": "...",
    "main_services_or_products": ["..."],
    "important_keywords": ["artificial intelligence", "machine learning", "..."],
    "overall_conclusion": "..."
  }
}
```

### 2. `POST /api/ask`
Answers follow-up inquiries using the content stored in the active session.

**Request:**
```json
{
  "session_id": "a87b5a12-8e7c-4c6e-b3d1-9f939e25d2b7",
  "question": "What is the definition of AI given on this page?"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "session_id": "a87b5a12-8e7c-4c6e-b3d1-9f939e25d2b7",
  "question": "What is the definition of AI given on this page?",
  "answer": "According to the page, artificial intelligence is intelligence perceiving, synthesizing, and inferring information demonstrated by machines, as opposed to intelligence displayed by non-human animals and humans."
}
```

### 3. `GET /api/health`
Returns system status and model configuration.

---

## 🔒 Security & Defense-in-Depth

1. **SSRF Guard:**
   - Hostname resolution validates all IPv4 and IPv6 addresses against private, link-local, multicast, carrier-grade NAT, and cloud metadata blocks.
   - Redirect destinations are validated recursively before following.
2. **Denial-of-Service Defense:**
   - Enforces a 5MB payload ceiling to prevent memory exhaustion.
   - 5s connect timeout and 10s read timeout prevent hanging processes.
3. **Prompt Injection Mitigation:**
   - Third-party website content is placed inside `<WEBSITE_CONTENT>` tags.
   - System prompts explicitly direct the model to treat content strictly as untrusted raw text data.
4. **Credential Isolation:**
   - The OpenAI API key resides solely in the Flask backend (`.env`).
   - The frontend never receives or handles secret tokens.

---

## 📄 License
MIT License. Built with passion for intelligent web analytics.
