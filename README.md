# Nigehban AI — Multilingual AI Emergency Assistant

An AI-powered multilingual emergency assistant that helps users during emergencies through text and voice interactions. Supports **English**, **Urdu**, and **Sindhi**.

---

## Features

| Feature | Description |
|---------|------------|
| AI Chat Assistant | Real-time emergency guidance via text and voice |
| Language Detection | Auto-detects English, Urdu, and Sindhi |
| Emergency Classification | AI-powered classification into 9 emergency categories |
| First Aid Guidance | Structured step-by-step first-aid instructions |
| Nearby Hospitals | Find hospitals via OpenStreetMap with Google Maps links |
| Weather Alerts | Real-time weather data with emergency alerts |
| Air Quality | AQI monitoring with health recommendations |
| Incident Reports | Generate and export PDF incident reports |
| Dashboard | Live overview of all emergency metrics |
| Voice I/O | Speech-to-Text and Text-to-Speech support |
| Dark Mode | Full dark mode with glassmorphism UI |
| Responsive | Mobile-first responsive design |

---
## Live Preview
https://nigehban-ai-dmnh-nu.vercel.app/
---

## Tech Stack

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** (custom theme with glassmorphism)
- **React Router** (client-side routing)
- **Axios** (HTTP client)
- **Framer Motion** (animations)
- **React Icons** (icon library)
- **Web Speech API** (Speech-to-Text / Text-to-Speech)

### Backend
- **Python FastAPI**
- **SQLAlchemy** (ORM)
- **PostgreSQL** (database)
- **Pydantic** (validation)
- **httpx** (async HTTP client)

### AI
- **OpenAI GPT** (primary) or **Google Gemini** (via env var)
- Prompt engineering for classification, first-aid, and chat

### External APIs
- OpenStreetMap + Overpass API (hospitals)
- OpenWeatherMap (weather + air quality)

---

## Project Structure

```
aman-ai/
├── backend/
│   ├── app/
│   │   ├── ai/              # Prompt templates
│   │   ├── models/          # SQLAlchemy models
│   │   ├── routes/          # API endpoints
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic (AI, weather, hospitals)
│   │   ├── utils/           # Language detection helpers
│   │   ├── config.py        # Environment config
│   │   ├── database.py      # DB engine & session
│   │   └── main.py          # FastAPI application
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React context (AppContext)
│   │   ├── hooks/           # Custom hooks (speech)
│   │   ├── pages/           # Route pages
│   │   ├── services/        # API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
└── README.md
```

---

## Quick Start

### Prerequisites
- **Node.js** 18+
- **Python** 3.11+
- **PostgreSQL** 14+ (or Docker)
- OpenAI API key (or Gemini API key)

### Option 1: Docker (Recommended)

```bash
# 1. Clone and navigate
cd aman-ai

# 2. Create backend .env
cp backend/.env.example backend/.env
# Edit backend/.env and add your API keys

# 3. Start everything
docker-compose up --build
```

Visit: http://localhost:5173

### Option 2: Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env from example
cp .env.example .env
# Edit .env with your API keys

# Start the server
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install

# Start dev server
npm run dev
```

#### Database (PostgreSQL)

```sql
CREATE USER aman_user WITH PASSWORD 'aman_pass';
CREATE DATABASE aman_ai OWNER aman_user;
```

Tables are auto-created on first startup via SQLAlchemy `create_all`.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send a chat message and get AI response |
| POST | `/api/classify` | Classify emergency type and severity |
| POST | `/api/first-aid` | Generate first-aid guidance |
| GET | `/api/weather?city=Karachi` | Get weather and alerts |
| GET | `/api/air-quality?lat=24.86&lon=67.00` | Get air quality index |
| GET | `/api/hospitals?lat=24.86&lon=67.00` | Find nearby hospitals |
| POST | `/api/incident` | Create incident report |
| GET | `/api/incident/{id}` | Get incident by ID |
| GET | `/api/reports` | List all incident reports |
| GET | `/health` | Health check |

---

## Emergency Categories

The AI classifies emergencies into:
- Medical
- Fire
- Road Accident
- Flood
- Earthquake
- Gas Leak
- Violence
- Missing Person
- Other

Each classification includes: **category**, **confidence** (0-1), and **severity** (Low/Medium/High/Critical).

---

## Configuration

### AI Provider

Set `AI_PROVIDER=openai` or `AI_PROVIDER=gemini` in `backend/.env`.

### Supported Languages

- `en` — English
- `ur` — Urdu
- `sd` — Sindhi

Language is auto-detected from user input using Unicode heuristics.

---

## Security

- All API keys stored in environment variables (never exposed to frontend)
- Pydantic validation on all request schemas
- Graceful error handling on all external API calls
- CORS configured for specific origins
- Rate limiting recommended for production

---

## Disclaimer

Aman AI is an **assistive tool** and does **not** replace professional emergency responders. Always call local emergency services (1122, 15, 112) for serious emergencies. AI-generated guidance may not be medically accurate.

---

## License

MIT License — free for personal and commercial use.
