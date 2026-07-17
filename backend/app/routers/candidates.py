import os
import json
import re
from datetime import date

import pdfplumber
import docx
import requests
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/candidates", tags=["candidates"])

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions"


def extract_text(file: UploadFile) -> str:
    """extract actual text from PDF/DOCX """
    filename = file.filename.lower()
    content = file.file.read()
    file.file.seek(0)

    if filename.endswith(".pdf"):
        text = ""
        import io
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                text += (page.extract_text() or "") + "\n"
        return text.strip()

    if filename.endswith(".docx"):
        import io
        d = docx.Document(io.BytesIO(content))
        return "\n".join(p.text for p in d.paragraphs).strip()


    try:
        return content.decode("utf-8", errors="ignore")
    except Exception:
        return ""


def score_with_mistral(cv_text: str, job_description: str) -> dict:
    prompt = f"""You are a senior HR recruiter AI. Given the job description and actual CV text below,
produce a JSON object with these fields:
- name: candidate's real full name found in the CV
- role: a fitting job title based on the JD
- score: integer 0-100, how well this candidate matches the JD
- summary: 2-sentence assessment
- email: candidate's real email if found in CV, else a plausible one

Job Description:
{job_description}

CV Text:
{cv_text[:6000]}

Respond with ONLY valid JSON, no markdown, no explanation."""

    try:
        response = requests.post(
            MISTRAL_URL,
            headers={
                "Authorization": f"Bearer {MISTRAL_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "mistral-small-latest",
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"},
            },
            timeout=30,
        )
        response.raise_for_status()
        text = response.json()["choices"][0]["message"]["content"].strip()
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            return json.loads(match.group(0))
    except Exception:
        pass

    return {"name": "Unknown Candidate", "role": "Software Engineer", "score": 75,
            "summary": "Automated scoring fallback - Mistral call failed.", "email": ""}


@router.get("", response_model=list[schemas.CandidateOut])
def list_candidates(db: Session = Depends(get_db)):
    return db.query(models.Candidate).order_by(models.Candidate.created_at.desc()).all()


@router.post("", response_model=schemas.CandidateOut)
def create_candidate(payload: schemas.CandidateCreate, db: Session = Depends(get_db)):
    candidate = models.Candidate(**payload.model_dump())
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate


@router.post("/upload", response_model=schemas.CandidateOut)
async def upload_and_score(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    db: Session = Depends(get_db),
):
    """Real CV file leta hai, text extract karta hai, Mistral se score karta hai (server-side)."""
    cv_text = extract_text(file)
    if not cv_text:
        raise HTTPException(400, "unable to extract text from CV .Only .pdf/.docx  is supported")

    result = score_with_mistral(cv_text, job_description)

    candidate = models.Candidate(
        name=result.get("name", "Unknown"),
        email=result.get("email") or "unknown@example.com",
        role=result.get("role", "Software Engineer"),
        department="Engineering",
        applied_date=date.today().isoformat(),
        match_score=int(result.get("score", 75)),
        status="Screening",
        current_stage="Awaiting Ranking",
        summary=result.get("summary", ""),
        cv_text=cv_text,
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate


@router.patch("/{candidate_id}/stage", response_model=schemas.CandidateOut)
def update_stage(candidate_id: str, payload: schemas.CandidateStageUpdate, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(404, "Couldn't find the Candidate")
    candidate.current_stage = payload.current_stage
    db.commit()
    db.refresh(candidate)
    return candidate


@router.patch("/{candidate_id}/status", response_model=schemas.CandidateOut)
def update_status(candidate_id: str, payload: schemas.CandidateStatusUpdate, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(404, "Couldn't find the Candidate ")
    candidate.status = payload.status
    db.commit()
    db.refresh(candidate)
    return candidate


@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: str, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(404, "Couldn't find the Candidate")
    db.delete(candidate)
    db.commit()
    return {"ok": True}
