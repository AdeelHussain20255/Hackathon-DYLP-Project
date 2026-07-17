import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text
from sqlalchemy.sql import func
from .database import Base


def gen_id():
    return str(uuid.uuid4())


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    role = Column(String, nullable=False)
    department = Column(String, nullable=False)
    applied_date = Column(String, nullable=False)  # store as ISO date string, matches frontend
    match_score = Column(Integer, nullable=True)
    status = Column(String, default="Applied")          # Applied/Screening/Interviewing/Offered/Rejected
    current_stage = Column(String, default="Awaiting Parsing")  # Awaiting Parsing/Awaiting Ranking/Ready for Outreach/Invite Sent/Done
    summary = Column(Text, nullable=True)
    cv_file_url = Column(String, nullable=True)   
    cv_text = Column(Text, nullable=True)          # extracted CV text
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Agent(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True)   # fetcher/parser/ranker/scheduler
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    description = Column(String, nullable=False)
    is_running = Column(Boolean, default=False)


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(String, primary_key=True, default=gen_id)
    title = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
