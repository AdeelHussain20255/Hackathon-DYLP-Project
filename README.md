# Agentix AI — HR Manager

An AI-powered HR recruitment platform with real-time candidate scoring, job board scraping, auto-pipeline, interview scheduling, and vector-based semantic search.

## Features

- **AI Resume Scoring** — Upload CVs (.pdf/.docx), Mistral AI extracts name, skills, experience, gender, shift preference, age, and scores match against a job description
- **Job Board Auto-Fetch** — Scrapes Rozee.pk (via Apify) and LinkedIn (via SerpAPI), fixes names with AI, auto-runs pipeline
- **4-Agent AI Pipeline** — Parse → Screen → Deep Rank → Finalize (Mistral-powered)
- **Vector Embeddings** — Job descriptions embedded via Mistral `mistral-embed` for semantic candidate search
- **Candidate Enrichment** — Auto-extract gender, shift preference, age, remote preference, skills from CVs
- **Auto-Email** — Sends screening results and interview invites to best-match candidates (SMTP)
- **Background Scheduler** — Auto-fetches from job boards every 6 hours
- **Leaderboard & Analytics** — Real AI-extracted skills distribution, real metrics (hours saved, pipeline scores)
- **Google OAuth** — Sign in with Google
- **Export** — Pipeline results exportable as TXT, XLSX, PDF

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Vite, Zustand, Motion, Recharts |
| Backend | Python FastAPI, SQLAlchemy, PostgreSQL |
| AI | Mistral AI (mistral-small-latest, mistral-embed) |
| Database | PostgreSQL (InsForge) |
| Hosting | Backend: Fly.io, Frontend: Vercel / InsForge Static |
| Scraping | Apify (Rozee.pk), SerpAPI (LinkedIn) |

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── routers/       # API endpoints (candidates, agents, pipeline, jobs, auth, etc.)
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── database.py     # DB connection
│   │   ├── pipeline_agents.py  # 4-agent pipeline logic
│   │   ├── apify_scraper.py    # Rozee.pk + LinkedIn scraping
│   │   ├── email_service.py    # SMTP email sending
│   │   ├── vectorizer.py       # Mistral embeddings + cosine similarity
│   │   └── ...
│   ├── main.py             # FastAPI entry point
│   ├── seed.py             # Database seeder
│   ├── requirements.txt
│   ├── Dockerfile
│   └── fly.toml
├── src/
│   ├── App.tsx             # Main app with all tabs
│   ├── api/index.ts        # API client
│   ├── store/useAppStore.ts    # Zustand state
│   └── components/         # UI components
├── .env.example
├── .gitignore
├── vite.config.ts
└── README.md
```

## Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL (or InsForge connection string)

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

Create `backend/.env`:
```
DATABASE_URL="postgresql://..."
MISTRAL_API_KEY="your_mistral_key"
FRONTEND_ORIGIN="http://localhost:3000"
JWT_SECRET="your_jwt_secret"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
APIFY_API_TOKEN="..."
SERPAPI_API_KEY="..."
```

Run:
```bash
uvicorn main:app --reload --port 8080
```

### Frontend

```bash
npm install
```

Create `.env`:
```
VITE_GOOGLE_CLIENT_ID="..."
VITE_API_URL="http://localhost:8080"
```

Run:
```bash
npm run dev
```

## Deployment

### Backend (Fly.io)
```bash
cd backend
flyctl deploy
```

### Frontend (Vercel)
```bash
vercel --prod
```

Or deploy to InsForge Static hosting.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/candidates` | GET | List all candidates |
| `/api/candidates` | POST | Create candidate |
| `/api/candidates/upload` | POST | Upload CV file for AI scoring |
| `/api/candidates/fetch-from-boards` | POST | Fetch from Rozee.pk + LinkedIn |
| `/api/candidates/enrich` | POST | Retroactively enrich candidates missing gender/shift/age |
| `/api/candidates/deduplicate` | POST | Remove name duplicates |
| `/api/candidates/bulk` | DELETE | Delete all candidates |
| `/api/candidates/{id}/screen` | POST | Screen a candidate against JD |
| `/api/candidates/{id}/stage` | PATCH | Update stage |
| `/api/pipeline/run` | POST | Run 4-agent pipeline |
| `/api/jobs` | GET/POST | List/save job descriptions with embeddings |
| `/api/jobs/{jd_id}/similar-candidates` | GET | Semantic candidate search |
| `/api/agents` | GET | List AI agents |
| `/api/agents/fetcher/run-now` | POST | Trigger fetcher bot |
| `/api/agents/scheduler/send-interviews` | POST | Trigger scheduler bot |
| `/api/auth/*` | - | Authentication (register, login, google) |
| `/api/diagnostics` | GET | System health check |
