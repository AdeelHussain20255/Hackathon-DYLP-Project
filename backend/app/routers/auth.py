import os
from datetime import datetime, timedelta, timezone

import bcrypt
import requests
from fastapi import APIRouter, Depends, HTTPException, Header
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("JWT_SECRET", "change-me-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 72

INSFORGE_URL = os.getenv("INSFORGE_URL", "https://6uvfcvui.us-east.insforge.app")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": user_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def verify_insforge_token(token: str) -> dict:
    try:
        resp = requests.get(
            f"{INSFORGE_URL}/api/auth/v1/user",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
        if resp.status_code != 200:
            raise HTTPException(401, "Invalid or expired InsForge token")
        return resp.json()
    except requests.RequestException as e:
        raise HTTPException(502, f"InsForge auth unreachable: {str(e)}")


def get_or_create_user_from_insforge(insforge_user: dict, db: Session) -> models.User:
    email = insforge_user.get("email")
    if not email:
        raise HTTPException(400, "Email not provided in InsForge token")

    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        return user

    metadata = insforge_user.get("user_metadata") or {}
    user = models.User(
        email=email,
        password_hash="__INSFORGE_AUTH__",
        name=metadata.get("name", email.split("@")[0]),
        role=metadata.get("role", "HR Recruiter"),
        avatar_url=metadata.get("avatar_url"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_current_user(
    authorization: str = Header(...),
    db: Session = Depends(get_db),
) -> models.User:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(401, "Invalid authorization header")

    # Try InsForge token first
    try:
        insforge_user = verify_insforge_token(token)
        return get_or_create_user_from_insforge(insforge_user, db)
    except HTTPException:
        pass

    # Fall back to legacy JWT
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(401, "Invalid token payload")
    except JWTError:
        raise HTTPException(401, "Invalid or expired token")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(401, "User not found")
    return user


@router.post("/register", response_model=schemas.AuthOut)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(400, "Email already registered")
    user = models.User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        name=payload.name,
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return schemas.AuthOut(token=create_token(user.id), user=user)


@router.post("/login", response_model=schemas.AuthOut)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return schemas.AuthOut(token=create_token(user.id), user=user)


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.post("/google", response_model=schemas.AuthOut)
def google_auth(payload: schemas.GoogleAuthRequest, db: Session = Depends(get_db)):
    from google.oauth2 import id_token as google_id_token
    from google.auth.transport import requests as google_requests

    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(500, "GOOGLE_CLIENT_ID not configured")

    try:
        request = google_requests.Request()
        google_payload = google_id_token.verify_oauth2_token(
            payload.credential, request, GOOGLE_CLIENT_ID
        )
    except Exception as e:
        raise HTTPException(401, f"Google token verification failed: {str(e)}")

    email = google_payload["email"]
    name = google_payload.get("name", email.split("@")[0])
    avatar_url = google_payload.get("picture")

    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        if avatar_url and not user.avatar_url:
            user.avatar_url = avatar_url
            db.commit()
            db.refresh(user)
    else:
        user = models.User(
            email=email,
            password_hash="__GOOGLE_AUTH__",
            name=name,
            role="HR Recruiter",
            avatar_url=avatar_url,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return schemas.AuthOut(token=create_token(user.id), user=user)


@router.post("/logout")
def logout():
    return {"ok": True}
