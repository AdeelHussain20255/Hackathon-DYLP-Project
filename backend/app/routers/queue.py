import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models

router = APIRouter(prefix="/queue", tags=["queue"])


@router.get("")
def get_processing_queue(db: Session = Depends(get_db)):
    candidates = db.query(models.Candidate).filter(
        models.Candidate.current_stage.in_(["Awaiting Parsing", "Awaiting Ranking", "Ready for Outreach"])
    ).order_by(models.Candidate.created_at.asc()).all()

    items = []
    for c in candidates:
        ext = ""
        if c.cv_file_url:
            ext = os.path.splitext(c.cv_file_url)[1].replace(".", "").upper()
        if not ext and c.cv_text:
            ext = "PDF"
        items.append({
            "id": c.id,
            "candidate_name": c.name,
            "email": c.email,
            "file_name": f"resume_{c.name.lower().replace(' ', '_')}.{ext.lower() or 'pdf'}",
            "file_type": ext or "PDF",
            "stage": c.current_stage,
            "score": c.match_score,
        })
    return items
