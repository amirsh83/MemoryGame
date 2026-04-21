import hmac
import hashlib
import logging
import secrets
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from telegram import Update

from database import get_db
from middleware.auth import get_current_user
from models.user import User
from config import get_settings

settings = get_settings()
router = APIRouter(prefix="/telegram", tags=["telegram"])
logger = logging.getLogger(__name__)

_bot_app = None


def get_bot_app():
    global _bot_app
    if _bot_app is None and settings.telegram_bot_token:
        from services.telegram_bot import build_application
        _bot_app = build_application()
    return _bot_app


@router.post("/webhook")
async def telegram_webhook(
    request: Request,
    x_telegram_bot_api_secret_token: str = Header(default=""),
):
    if settings.telegram_webhook_secret:
        expected = settings.telegram_webhook_secret
        if not hmac.compare_digest(x_telegram_bot_api_secret_token, expected):
            raise HTTPException(status_code=403, detail="Invalid webhook secret")

    body = await request.json()
    app = get_bot_app()
    if app is None:
        raise HTTPException(status_code=503, detail="Bot not configured")

    update = Update.de_json(body, app.bot)
    await app.process_update(update)
    return {"ok": True}


@router.post("/setup-webhook")
async def setup_webhook(user: User = Depends(get_current_user)):
    if not settings.telegram_bot_token or not settings.telegram_webhook_url:
        raise HTTPException(status_code=400, detail="Telegram not configured")

    app = get_bot_app()
    if app is None:
        raise HTTPException(status_code=503, detail="Bot not initialized")

    webhook_url = f"{settings.telegram_webhook_url}/telegram/webhook"
    await app.bot.set_webhook(
        url=webhook_url,
        secret_token=settings.telegram_webhook_secret or "",
        allowed_updates=["message", "callback_query"],
    )
    return {"message": "Webhook set", "url": webhook_url}


@router.post("/generate-link-token")
def generate_link_token(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    token = secrets.token_urlsafe(24)
    user.telegram_link_token = token
    db.commit()

    bot_username = ""
    try:
        app = get_bot_app()
        if app:
            import asyncio
            bot_info = asyncio.get_event_loop().run_until_complete(app.bot.get_me())
            bot_username = bot_info.username
    except Exception:
        pass

    deep_link = f"https://t.me/{bot_username}?start={token}" if bot_username else f"token:{token}"
    return {"link_url": deep_link, "token": token}


@router.delete("/unlink")
def unlink_telegram(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.telegram_chat_id = None
    user.telegram_link_token = None
    db.commit()
    return {"message": "Telegram unlinked"}
