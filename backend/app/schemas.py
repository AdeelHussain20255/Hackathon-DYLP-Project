from typing import Optional
from pydantic import BaseModel


class CandidateBase(BaseModel):
    name: str
    email: str
    role: str
    department: str
    applied_date: str
    match_score: Optional[int] = None
    status: str = "Applied"
    current_stage: str = "Awaiting Parsing"
    summary: Optional[str] = None


class CandidateCreate(CandidateBase):
    pass


class CandidateOut(CandidateBase):
    id: str
    cv_file_url: Optional[str] = None

    class Config:
        from_attributes = True


class CandidateStageUpdate(BaseModel):
    current_stage: str


class CandidateStatusUpdate(BaseModel):
    status: str


class AgentOut(BaseModel):
    id: str
    name: str
    role: str
    description: str
    is_running: bool

    class Config:
        from_attributes = True


class AgentToggle(BaseModel):
    is_running: bool


class JobDescriptionCreate(BaseModel):
    title: str
    text: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str = "HR Recruiter"


class LoginRequest(BaseModel):
    email: str
    password: str


class GoogleAuthRequest(BaseModel):
    credential: str


class AuthOut(BaseModel):
    token: str
    user: UserOut
