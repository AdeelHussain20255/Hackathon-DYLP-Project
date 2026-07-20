
from app.database import SessionLocal, Base, engine
from app import models

Base.metadata.create_all(bind=engine)
db = SessionLocal()

agents_data = [
    {"id": "fetcher", "name": "Fetcher Bot", "role": "Pulls CVs from external sources",
     "description": "Monitors integrated ATS webhooks, email inboxes, and Shared Folders to auto-ingest candidate CV documents.",
     "is_running": True, "confidence_threshold": 70, "channel": "webhook", "auto_screen": False},
    {"id": "parser", "name": "Parser Bot", "role": "Extracts structured data from CVs",
     "description": "Runs Mistral AI on unparsed candidates to extract skills, experience, location, gender, shift preference, age, and remote preference from CV text.",
     "is_running": False, "confidence_threshold": 75, "channel": "api", "auto_screen": False},
    {"id": "ranker", "name": "Ranker Bot", "role": "Scores candidates against JD",
     "description": "Scores all candidates against the latest saved job description using Mistral AI, updating match scores and enrichment fields.",
     "is_running": False, "confidence_threshold": 80, "channel": "queue", "auto_screen": True},
    {"id": "scheduler", "name": "Scheduler Bot", "role": "Fires emails",
     "description": "Dispatches automated interview invites and updates calendars autonomously for matching candidates.",
     "is_running": False, "confidence_threshold": 85, "channel": "email", "auto_screen": False},
]

for a in agents_data:
    if not db.query(models.Agent).filter(models.Agent.id == a["id"]).first():
        db.add(models.Agent(**a))

db.commit()
db.close()
print("Agents seeded.")
