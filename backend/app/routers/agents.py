from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("", response_model=list[schemas.AgentOut])
def list_agents(db: Session = Depends(get_db)):
    return db.query(models.Agent).all()


@router.patch("/{agent_id}", response_model=schemas.AgentOut)
def toggle_agent(agent_id: str, payload: schemas.AgentToggle, db: Session = Depends(get_db)):
    agent = db.query(models.Agent).filter(models.Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(404, "No Agent found ")
    agent.is_running = payload.is_running
    db.commit()
    db.refresh(agent)
    return agent
