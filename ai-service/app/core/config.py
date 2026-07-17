"""
ZeroWaste OS AI Service — Application Configuration.

Loads all settings from environment variables with sensible defaults.
Uses pydantic-settings for type-safe config with .env file support.
"""

from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralised, type-safe configuration for the AI micro-service."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── API Security ──────────────────────────────────────────────
    ai_service_api_key: str = ""

    # ── CORS ──────────────────────────────────────────────────────
    cors_origins: str = "http://localhost:3000,http://localhost:8080"

    @property
    def cors_origin_list(self) -> List[str]:
        """Parse the comma-separated CORS_ORIGINS string into a list."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    # ── Rate Limiting ─────────────────────────────────────────────
    rate_limit_per_minute: int = 30

    @property
    def rate_limit_string(self) -> str:
        return f"{self.rate_limit_per_minute}/minute"

    # ── Server ────────────────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False

    # ── Google Gemini ─────────────────────────────────────────────
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    gemini_max_tokens: int = 1024
    gemini_temperature: float = 0.3

    @property
    def gemini_configured(self) -> bool:
        return bool(self.gemini_api_key and self.gemini_api_key != "your_gemini_api_key_here")


@lru_cache()
def get_settings() -> Settings:
    """Return a cached Settings singleton so env is read only once."""
    return Settings()
