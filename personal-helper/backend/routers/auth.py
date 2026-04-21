import secrets
from datetime import datetime
from typing import Optional
import google.auth.transport.requests
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from google.oauth2 import id_token as google_id_token
from google_auth_oauthlib.flow import Flow
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from database import get_db, encrypt_field, decrypt_field
from models.user import User
from middleware.auth import create_access_token, create_refresh_token, get_current_user
from config import get_settings

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/gmail.readonly",
]

_pending_states: dict[str, str] = {}


def _build_flow() -> Flow:
    return Flow.from_client_config(
        {
            "web": {
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.google_redirect_uri],
            }
        },
        scopes=GOOGLE_SCOPES,
        redirect_uri=settings.google_redirect_uri,
    )


@router.get("/google/login")
def google_login():
    flow = _build_flow()
    state = secrets.token_urlsafe(32)
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=state,
    )
    _pending_states[state] = state
    return {"auth_url": auth_url}


@router.get("/google/callback")
def google_callback(code: str, state: str, db: Session = Depends(get_db)):
    if state not in _pending_states:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")
    _pending_states.pop(state, None)

    flow = _build_flow()
    flow.fetch_token(code=code)
    credentials = flow.credentials

    id_info = google_id_token.verify_oauth2_token(
        credentials.id_token,
        google.auth.transport.requests.Request(),
        settings.google_client_id,
    )

    google_id = id_info["sub"]
    email = id_info["email"]
    name = id_info.get("name", email)
    picture = id_info.get("picture", "")

    user = db.query(User).filter(User.google_id == google_id).first()
    if user is None:
        user = User(google_id=google_id, email=email, name=name, picture=picture)
        db.add(user)
    else:
        user.name = name
        user.picture = picture
        user.last_login = datetime.utcnow()

    user._access_token = encrypt_field(credentials.token or "")
    user._refresh_token = encrypt_field(credentials.refresh_token or "")
    user.token_expiry = credentials.expiry
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    redirect_url = (
        f"{settings.frontend_url}/auth/callback"
        f"?access_token={access_token}&refresh_token={refresh_token}"
    )
    return RedirectResponse(url=redirect_url)


@router.post("/refresh")
async def refresh_token(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    token = body.get("refresh_token", "")
    if not token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    try:
        payload = jwt.decode(token, settings.app_secret_key, algorithms=[settings.jwt_algorithm])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Wrong token type")
        user_id = int(payload["sub"])
    except (JWTError, Exception):
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
    }
