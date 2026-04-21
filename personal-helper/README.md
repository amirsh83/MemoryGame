# Personal Helper — Your Private AI Life Assistant

A full-stack, self-hosted personal assistant with:
- **Google Calendar** — read, create, edit, delete events
- **Gmail** — read-only inbox & search
- **Finance tracker** — manual expenses + PDF/CSV statement upload + auto-categorization
- **Claude AI chat** — context-aware financial & life assistant (knows your spending + calendar)
- **Telegram bot** — full access via chat commands
- **Mobile-first** responsive web UI
- **Security-first** — encrypted tokens, JWT auth, webhook secrets, no third-party data sharing

---

## Architecture

```
personal-helper/
├── backend/          # FastAPI (Python 3.12)
│   ├── main.py
│   ├── config.py
│   ├── database.py   # SQLite + Fernet field encryption
│   ├── models/       # SQLAlchemy ORM
│   ├── routers/      # Auth, Calendar, Mail, Finance, AI, Telegram
│   ├── services/     # Google APIs, Claude AI, Telegram bot, Statement parser
│   └── middleware/   # JWT auth
└── frontend/         # React 18 + Vite + Tailwind CSS
    └── src/
        ├── components/  # Dashboard, Calendar, Finance, AIChat, Mail, Settings
        ├── pages/       # Login
        ├── api/         # Axios client with auto token refresh
        └── context/     # Auth context
```

---

## Quick Start

### 1. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → **APIs & Services → Enable APIs**:
   - Google Calendar API
   - Gmail API
3. **Credentials → Create OAuth 2.0 Client ID** (Web application)
4. Add Authorized redirect URI: `http://localhost:8000/auth/google/callback`
5. Copy Client ID and Secret

### 2. Anthropic API Key

Get your key at [console.anthropic.com](https://console.anthropic.com)

### 3. Telegram Bot (optional)

1. Message [@BotFather](https://t.me/BotFather) → `/newbot`
2. Copy the token
3. For webhooks: you need a public HTTPS URL (use [ngrok](https://ngrok.com) for local dev)

### 4. Backend Setup

```bash
cd personal-helper/backend

# Copy and fill in environment variables
cp .env.example .env
# Edit .env with your keys

# Generate a Fernet encryption key
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# → paste into FIELD_ENCRYPTION_KEY in .env

# Generate a strong secret key
python -c "import secrets; print(secrets.token_hex(32))"
# → paste into APP_SECRET_KEY in .env

# Install dependencies
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Run
python main.py
# API available at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### 5. Frontend Setup

```bash
cd personal-helper/frontend

npm install
npm run dev
# App available at http://localhost:5173
```

### 6. Docker (Production)

```bash
cd personal-helper

# Fill in backend/.env
docker-compose up -d
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `APP_SECRET_KEY` | Long random secret for JWT signing |
| `FIELD_ENCRYPTION_KEY` | Fernet key for encrypting Google tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret |
| `GOOGLE_REDIRECT_URI` | Must match Google Console config |
| `ANTHROPIC_API_KEY` | Claude API key |
| `TELEGRAM_BOT_TOKEN` | From @BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | Random string, verifies Telegram requests |
| `TELEGRAM_WEBHOOK_URL` | Your public HTTPS URL |

---

## Telegram Bot Commands

| Command | Description |
|---|---|
| `/start` | Welcome + link account |
| `/summary` | AI-generated weekly briefing |
| `/expenses` | Last 30 days spending |
| `/addexpense` | Interactive expense entry |
| `/ask <question>` | Ask the AI assistant |
| `/calendar` | Upcoming 7 events |
| (free text) | Chat directly with AI |

**To link**: Settings page → Generate Link → open in Telegram

---

## Security Design

- **No passwords** — Google OAuth2 only
- **Encrypted tokens** — Google OAuth tokens encrypted with Fernet before DB storage
- **JWT sessions** — short-lived access tokens (60 min) + long-lived refresh tokens (30 days)
- **Webhook verification** — Telegram webhooks verified with HMAC secret token
- **CORS** — restricted to your frontend URL only
- **Rate limiting** — via slowapi
- **File upload** — extension allowlist, 20MB cap, sanitized filenames
- **Read-only Gmail** — cannot send email, only read
- **Local storage** — all data stays on your server, nothing sent to third parties except Google APIs and Claude API

---

## Statement Parsing

Upload your bank or credit card statements as PDF, CSV, XLS, or XLSX.  
The parser will:
1. Extract transactions (date, description, amount)
2. Auto-categorize based on merchant name keywords
3. Import them as individual expenses linked to the statement

Supported institutions: any bank/CC that exports standard PDF tables or CSV.

---

## AI Assistant

Powered by **Claude claude-sonnet-4-6** with prompt caching for efficiency.

The AI has full context of:
- Your spending this month (by category + recent transactions)
- Statement count
- Optional calendar events

Ask anything:
- "How much did I spend on food this month?"
- "Where can I cut $200 from my budget?"
- "Build me a savings plan to save $10k by end of year"
- "Summarize my week"
- "Am I spending too much on subscriptions?"
