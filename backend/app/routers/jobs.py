import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..vectorizer import embed_text, cosine_similarity

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=list[schemas.JobDescriptionOut])
def list_job_descriptions(db: Session = Depends(get_db)):
    rows = db.query(models.JobDescription).order_by(models.JobDescription.created_at.desc()).all()
    return [schemas.JobDescriptionOut(
        id=r.id, title=r.title, text=r.text, embedding=r.embedding,
        created_at=r.created_at.isoformat() if r.created_at else None,
    ) for r in rows]


@router.get("/{jd_id}/similar-candidates", response_model=list[dict])
def find_similar_candidates(jd_id: str, db: Session = Depends(get_db)):
    jd = db.query(models.JobDescription).filter(models.JobDescription.id == jd_id).first()
    if not jd:
        raise HTTPException(404, "JD not found")
    if not jd.embedding:
        return []
    jd_emb = json.loads(jd.embedding)
    candidates = db.query(models.Candidate).all()
    scored = []
    for c in candidates:
        if not c.cv_text:
            continue
        c_emb = embed_text(c.cv_text)
        if c_emb:
            sim = cosine_similarity(jd_emb, c_emb)
            scored.append({"id": c.id, "name": c.name, "similarity": round(sim * 100, 1)})
    scored.sort(key=lambda x: x["similarity"], reverse=True)
    return scored[:20]


@router.post("/{jd_id}/auto-pipeline")
def auto_pipeline_from_jd(jd_id: str, db: Session = Depends(get_db)):
    from .pipeline import run_pipeline
    from ..schemas import PipelineRunCreate
    jd = db.query(models.JobDescription).filter(models.JobDescription.id == jd_id).first()
    if not jd:
        raise HTTPException(404, "JD not found")
    payload = PipelineRunCreate(job_title=jd.title, job_description=jd.text)
    return run_pipeline(payload, db)


@router.post("", response_model=schemas.JobDescriptionOut)
def save_job_description(payload: schemas.JobDescriptionCreate, db: Session = Depends(get_db)):
    jd = models.JobDescription(title=payload.title, text=payload.text)
    db.add(jd)
    db.commit()
    db.refresh(jd)
    emb = embed_text(payload.text)
    if emb:
        jd.embedding = json.dumps(emb)
        db.commit()
        db.refresh(jd)
    return schemas.JobDescriptionOut(
        id=jd.id, title=jd.title, text=jd.text, embedding=jd.embedding,
        created_at=jd.created_at.isoformat() if jd.created_at else None,
    )
