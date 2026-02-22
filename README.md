

---

# 📦 Social Saver

### WhatsApp-Powered Content Intelligence Engine

Save, categorize, and summarize social media links directly from WhatsApp using multi-layer scraping + AI enrichment.

---

## 🚀 Overview

**Social Saver** is a production-ready backend system that:

* Accepts social media URLs via WhatsApp
* Extracts real content using platform-aware scraping
* Uses AI to summarize and categorize content
* Supports manual category override via hashtags
* Stores structured content in a database
* Responds instantly inside WhatsApp

---

## 🏗 High-Level Architecture

```mermaid
flowchart TD

A[User - WhatsApp] --> B[Twilio Webhook]
B --> C[FastAPI API Layer]

C --> D[URL and Category Extraction]
D --> E[Process Link Service]

E --> F[Platform Detection]
F --> G[Scraping Engine]
G --> H[AI Engine]
H --> I[Manual Category Override]
I --> J[Database Layer]
J --> K[Response Formatter]

K --> L[Twilio XML Response]
L --> A
```

---

# 🔎 Scraping Engine (Multi-Tier Fallback Design)

The scraping layer is platform-aware and uses cascading fallbacks to ensure resilience.

---

## 📸 Instagram Scraping Flow

```mermaid
flowchart TD

A[Instagram URL]

A --> B[Apify API]
B -->|Success| RETURN1[Full Caption + Hashtags]
B -->|Fail| C[Instaloader]

C -->|Success| RETURN2[Full Caption + Hashtags]
C -->|Fail| D[Instagram oEmbed]

D -->|Success| RETURN3[Title Only]
D -->|Fail| E[Return None → AI Infers]
```

### Fallback Logic

* Missing API token → Skip Apify
* Apify free limit hit → Instaloader
* Instaloader rate-limit → oEmbed
* All fail → AI infers from URL

Instagram intentionally does **not** use generic scraping due to login wall restrictions.

---

## 🎥 YouTube Scraping Flow

```mermaid
flowchart TD

A[YouTube URL]

A --> B[oEmbed API]
B -->|Success| RETURN1[Title + Thumbnail]
B -->|Fail| C[Jina Reader]

C -->|Success| RETURN2[Parsed Content]
C -->|Fail| D[Generic OG Scraper]

D -->|Success| RETURN3[Meta Tags]
D -->|Fail| E[Return None → AI Infers]
```

---

## 🐦 Twitter / Articles / Other

```mermaid
flowchart TD

A[URL]

A --> B[Jina Reader]
B -->|Success| RETURN1[Parsed Content]
B -->|Fail| C[Generic OG Scraper]

C -->|Success| RETURN2[Meta Content]
C -->|Fail| D[Return None → AI Infers]
```

---

# 🤖 AI Engine (Primary + Fallback)

After scraping, AI enrichment begins.

```mermaid
flowchart TD

A[Scraped Data] --> B{Gemini Available?}

B -->|Yes| C[Gemini analyze_url]
C --> D[Enriched Data<br/>Title<br/>Summary<br/>Tags<br/>Category]

B -->|No| E[Simple AI Engine]
E --> F[Keyword Categorization<br/>Summary<br/>Tag Extraction]
```

### AI Failure Handling

* Gemini unavailable → SimpleAI
* Invalid AI category → Default `OTHER`
* Scraping empty → AI infers from URL

---

# 🔁 End-to-End Sequence Diagram

```mermaid
sequenceDiagram

participant U as User
participant T as Twilio
participant API as FastAPI
participant APP as process_link
participant SCR as Scraper
participant AI as AI Engine
participant DB as Database

U->>T: Send WhatsApp Message (URL)
T->>API: POST /whatsapp
API->>APP: process_link()

APP->>SCR: scrape(url)
SCR-->>APP: scraped content

APP->>AI: analyze content
AI-->>APP: enriched data

APP->>DB: save content
DB-->>APP: success

APP-->>API: formatted response
API-->>T: Twilio XML
T-->>U: WhatsApp Reply
```

---

# 🛡 System Fault Tolerance Map

```mermaid
flowchart TD

A[External API Failure]

A --> B{Layer?}

B -->|Apify| C[Fallback → Instaloader]
B -->|Instaloader| D[Fallback → oEmbed]
B -->|oEmbed| E[Fallback → AI Inference]

B -->|Jina| F[Fallback → Generic Scraper]
B -->|Gemini| G[Fallback → Simple AI]

C --> H[System Continues]
D --> H
E --> H
F --> H
G --> H
```

---

# 🏗 Layered Architecture View

```mermaid
flowchart TD

subgraph Client Layer
A[WhatsApp User]
end

subgraph Integration Layer
B[Twilio Webhook]
end

subgraph API Layer
C[FastAPI Router]
end

subgraph Application Layer
D[process_link]
E[Scraping Engine]
F[AI Engine]
G[Manual Override]
end

subgraph Data Layer
H[ContentService]
I[(Database)]
end

A --> B --> C --> D
D --> E --> F --> G --> H --> I
H --> D
D --> C --> B --> A
```

---

# 🏷 Manual Category Override

Users can force categorization:

```
https://youtube.com/... #coding
https://instagram.com/... #fitness
```

Supported tags:

* #fitness
* #coding
* #food
* #travel
* #design
* #fashion
* #business
* #education
* #entertainment

Manual override always takes priority over AI classification.

---

# 📂 Project Structure

```
```
social-saver-bot/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── services/
│   │   └── api/
│   ├── requirements.txt
│   └── .env
├── frontend/
    ├── src/
    ├── public/
    ├── package.json
    └── tailwind.config.js

```
```

---

# 🔧 Environment Variables

Create a `.env` file:

```
APIFY_API_TOKEN=your_apify_token
GEMINI_API_KEY=your_gemini_key
DATABASE_URL=your_database_url
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
```

---

# ▶ Running the Server

Install dependencies:

```
pip install -r requirements.txt
```

Run locally:

```
uvicorn app.main:app --reload
```

Expose via ngrok:

```
ngrok http 8000
```

Set Twilio webhook to:

```
https://your-ngrok-url/whatsapp
```

---

# 📈 Production Characteristics

* Platform-specific scraping strategy
* Multi-tier fallback chains
* AI fallback system
* Graceful degradation
* Manual override support
* Modular service architecture
* Logging-based debugging
* Async-compatible processing

---

# 🧱 Architectural Classification

Layered Monolithic Architecture
Strategy-Based Scraping Engine
Multi-Level Fault Tolerance Design

---

