from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_secret_key: str = "change-me"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    frontend_url: str = "http://localhost:5173"

    database_url: str = "sqlite:///./data/personal_helper.db"
    field_encryption_key: str = ""

    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/auth/google/callback"

    anthropic_api_key: str = ""

    telegram_bot_token: str = ""
    telegram_webhook_secret: str = ""
    telegram_webhook_url: str = ""

    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    jwt_refresh_token_expire_days: int = 30

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
