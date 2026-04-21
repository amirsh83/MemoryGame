from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String(128), unique=True, index=True, nullable=False)
    email = Column(String(256), unique=True, index=True, nullable=False)
    name = Column(String(256), nullable=False)
    picture = Column(Text, nullable=True)

    # Encrypted Google OAuth tokens
    _access_token = Column("access_token", Text, nullable=True)
    _refresh_token = Column("refresh_token", Text, nullable=True)
    token_expiry = Column(DateTime, nullable=True)

    # Telegram link
    telegram_chat_id = Column(String(64), unique=True, nullable=True)
    telegram_link_token = Column(String(64), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow)
