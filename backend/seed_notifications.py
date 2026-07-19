import os
import uuid
os.environ['DATABASE_URL'] = 'postgresql://postgres:9a696029d36d9612a6dfcf188749c6f4@6uvfcvui.us-east.database.insforge.app:5432/insforge?sslmode=require'

from sqlalchemy import create_engine, text
from datetime import datetime, timezone

engine = create_engine(os.environ['DATABASE_URL'])

notifications = [
    {"message": "AI screening completed for 3 new candidates today.", "type": "Screening Complete"},
    {"message": "Interview scheduled for Alex Rivera - Tuesday at 10:00 AM.", "type": "Interview Scheduled"},
    {"message": "New candidate Minahil Mir added to pipeline with 92% match.", "type": "High Match Alert"},
]

with engine.connect() as conn:
    for n in notifications:
        nid = str(uuid.uuid4())
        conn.execute(
            text("INSERT INTO notifications (id, message, type, is_read, created_at) VALUES (:id, :msg, :type, false, :ts) ON CONFLICT DO NOTHING"),
            {"id": nid, "msg": n["message"], "type": n["type"], "ts": datetime.now(timezone.utc)}
        )
    conn.commit()
    print(f"Seeded {len(notifications)} notifications")
