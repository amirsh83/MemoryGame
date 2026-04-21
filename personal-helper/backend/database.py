import os
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from cryptography.fernet import Fernet, InvalidToken
from config import get_settings

settings = get_settings()

os.makedirs("data", exist_ok=True)

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Field-level encryption helpers ───────────────────────────────────
def _get_fernet() -> Fernet | None:
    key = settings.field_encryption_key
    if not key:
        return None
    try:
        return Fernet(key.encode())
    except Exception:
        return None


def encrypt_field(value: str) -> str:
    f = _get_fernet()
    if f is None or not value:
        return value
    return f.encrypt(value.encode()).decode()


def decrypt_field(value: str) -> str:
    f = _get_fernet()
    if f is None or not value:
        return value
    try:
        return f.decrypt(value.encode()).decode()
    except (InvalidToken, Exception):
        return value
