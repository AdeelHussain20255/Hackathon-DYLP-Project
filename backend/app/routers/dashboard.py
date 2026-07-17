from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from .. import models

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/config")
def get_dashboard_config(db: Session = Depends(get_db)):
    total = db.query(func.count(models.Candidate.id)).scalar() or 0
    high_match = db.query(func.count(models.Candidate.id)).filter(
        models.Candidate.match_score >= 90
    ).scalar() or 0

    pipeline_counts = {}
    for status in ["Applied", "Screening", "Interviewing", "Offered", "Rejected"]:
        pipeline_counts[status] = db.query(func.count(models.Candidate.id)).filter(
            models.Candidate.status == status
        ).scalar() or 0

    return {
        "totalCandidates": total,
        "highMatchCount": high_match,
        "highMatchThreshold": 90,
        "pipelineStatusData": pipeline_counts,
    }
