from datetime import datetime
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleRequest
from googleapiclient.discovery import build
from sqlalchemy.orm import Session

from models.user import User
from database import encrypt_field, decrypt_field
from config import get_settings

settings = get_settings()


def get_google_credentials(user: User, db: Session) -> Credentials:
    creds = Credentials(
        token=decrypt_field(user._access_token or ""),
        refresh_token=decrypt_field(user._refresh_token or ""),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
    )
    if creds.expired and creds.refresh_token:
        creds.refresh(GoogleRequest())
        user._access_token = encrypt_field(creds.token or "")
        user.token_expiry = creds.expiry
        db.commit()
    return creds


def get_calendar_service(user: User, db: Session):
    creds = get_google_credentials(user, db)
    return build("calendar", "v3", credentials=creds, cache_discovery=False)


def get_gmail_service(user: User, db: Session):
    creds = get_google_credentials(user, db)
    return build("gmail", "v1", credentials=creds, cache_discovery=False)
