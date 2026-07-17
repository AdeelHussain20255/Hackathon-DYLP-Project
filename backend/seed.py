
from app.database import SessionLocal, Base, engine
from app import models

Base.metadata.create_all(bind=engine)
db = SessionLocal()

agents_data = [
    {"id": "fetcher", "name": "Fetcher Bot", "role": "Pulls CVs from external sources",
     "description": "Monitors integrated ATS webhooks, email inboxes, and Shared Folders to auto-ingest candidate CV documents.",
     "is_running": True},
    {"id": "parser", "name": "Parser Bot", "role": "Extracts JSON data",
     "description": "Parses PDF, DOCX, and unstructured documents into structured JSON AST abstract schemas.",
     "is_running": True},
    {"id": "ranker", "name": "Ranker Bot", "role": "Scores via Gemini",
     "description": "Generates high-dimensional semantic embeddings to match resumes against vectorized job descriptions.",
     "is_running": True},
    {"id": "scheduler", "name": "Scheduler Bot", "role": "Fires emails",
     "description": "Dispatches automated interview invites and updates calendars autonomously for matching candidates.",
     "is_running": False},
]

for a in agents_data:
    if not db.query(models.Agent).filter(models.Agent.id == a["id"]).first():
        db.add(models.Agent(**a))

db.commit()
db.close()
print("Agents seeded.")
