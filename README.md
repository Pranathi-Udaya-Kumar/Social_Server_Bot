# Social Saver Bot - Hackathon Project

A WhatsApp bot that turns your Instagram saves into a searchable knowledge base.

## 🎯 The Challenge
Transform fleeting social media content into a permanent, searchable collection by simply forwarding links to a WhatsApp bot.

## 🏗️ Architecture
```
WhatsApp User → Twilio API → FastAPI Backend → AI Processing → SQLite Database → React Dashboard
```

## 🚀 Tech Stack
- **Bot Interface**: WhatsApp (Twilio Sandbox)
- **Backend**: FastAPI (Python)
- **Frontend**: React with TailwindCSS
- **Database**: SQLite
- **AI**: OpenAI API for categorization and summarization
- **Content Extraction**: Custom Instagram scraper

## 📁 Project Structure
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
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
└── docs/
    └── architecture-diagram.md
```

## 🎯 Core Features
1. **WhatsApp Integration**: Forward Instagram links to save
2. **AI Categorization**: Auto-tag content (Fitness, Coding, Food, Travel, etc.)
3. **Smart Summarization**: Generate 1-sentence summaries
4. **Searchable Dashboard**: Clean card-based interface
5. **Multi-Platform Support**: Instagram, Twitter/X, Blog articles

## 🏆 Evaluation Criteria
- ✅ WhatsApp → Insta Flow (40%)
- ✅ AI Smarts (30%)
- ✅ User Experience (20%)
- ✅ "Wow" Factor (10%)

## 🚀 Getting Started
1. Clone and set up backend
2. Configure Twilio WhatsApp sandbox
3. Set up OpenAI API key
4. Run frontend and backend
5. Test with Instagram links

## 📱 Demo Flow
1. User forwards Instagram link to WhatsApp bot
2. Bot extracts content and metadata
3. AI categorizes and summarizes
4. Content appears in searchable dashboard
5. User receives confirmation message
