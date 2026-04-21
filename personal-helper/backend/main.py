import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import get_settings
from database import Base, engine, get_db
from middleware.auth import get_current_user
from models.user import User
from routers import auth, calendar, mail, finance, ai, telegram_webhook

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
settings = get_settings()

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    os.makedirs("data/statements", exist_ok=True)
    logger.info("Database tables created.")
    yield
    logger.info("Shutting down.")


app = FastAPI(
    title="Personal Helper API",
    description="Private personal finance + calendar + AI assistant",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(calendar.router)
app.include_router(mail.router)
app.include_router(finance.router)
app.include_router(ai.router)
app.include_router(telegram_webhook.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "Personal Helper API"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
        "telegram_linked": bool(user.telegram_chat_id),
        "created_at": user.created_at.isoformat(),
        "last_login": user.last_login.isoformat() if user.last_login else None,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.app_host, port=settings.app_port, reload=True)
