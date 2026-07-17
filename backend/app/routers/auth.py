import os
from datetime import datetime, timedelta, timezone

import bcrypt
import requests
from fastapi import APIRouter, Depends, HTTPException, Header
from jose import JWTError, jwk, jwt
from jose.utils import base64url_decode
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("JWT_SECRET", "change-me-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 72
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": user_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def verify_google_token(id_token: str) -> dict:
    resp = requests.get("https://www.googleapis.com/oauth2/v3/certs", timeout=10)
    certs = resp.json()

    headers = jwt.get_unverified_headers(id_token)
    kid = headers.get("kid")

    key_data = None
    for key in certs["keys"]:
        if key["kid"] == kid:
            key_data = key
            break

    if not key_data:
        raise HTTPException(401, "No matching Google signing key found")

    public_key = jwk.construct(key_data)

    message, encoded_signature = id_token.rsplit(".", 1)
    decoded_signature = base64url_decode(encoded_signature)

    if not public_key.verify(message.encode("utf-8"), decoded_signature):
        raise HTTPException(401, "Invalid Google token signature")

    payload = jwt.get_unverified_claims(id_token)

    if payload.get("aud") != GOOGLE_CLIENT_ID:
        raise HTTPException(401, "Invalid Google token audience")

    if payload.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
        raise HTTPException(401, "Invalid Google token issuer")

    if not payload.get("email_verified", False):
        raise HTTPException(401, "Google email not verified")

    if not payload.get("email"):
        raise HTTPException(400, "Email not provided in Google token")

    return payload


def get_current_user(
    authorization: str = Header(...),
    db: Session = Depends(get_db),
) -> models.User:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(401, "Invalid authorization header")
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
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(500, "GOOGLE_CLIENT_ID not configured")

    google_payload = verify_google_token(payload.credential)

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
