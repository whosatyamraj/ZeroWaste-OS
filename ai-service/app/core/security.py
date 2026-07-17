"""
ZeroWaste OS AI Service — Security utilities.

Provides:
  • API-key header validation dependency
  • Rate limiter factory for SlowAPI
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import HTTPException, Request, Security, status
from fastapi.security import APIKeyHeader

from app.core.config import get_settings

logger = logging.getLogger("zerowaste.security")

# ── API Key Header Scheme ─────────────────────────────────────────
_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(
    api_key: Optional[str] = Security(_api_key_header),
) -> str:
    """
    FastAPI dependency that validates the ``X-API-Key`` header.

    If no ``AI_SERVICE_API_KEY`` is configured in the environment the
    check is skipped (development mode).  In production an invalid or
    missing key returns **403 Forbidden**.
    """
    settings = get_settings()

    # When no key is configured, allow all requests (dev mode)
    if not settings.ai_service_api_key:
        logger.warning("AI_SERVICE_API_KEY is not set — running in OPEN mode")
        return "dev-mode"

    if not api_key:
        logger.warning("Request without API key rejected")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Missing API key",
        )

    if api_key != settings.ai_service_api_key:
        logger.warning("Request with invalid API key rejected")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key",
        )

    return api_key


def key_func(request: Request) -> str:
    """
    Rate-limiter key function.

    Uses the ``X-API-Key`` header when present, otherwise falls back to
    the client IP address so that unauthenticated clients are still
    rate-limited per-IP.
    """
    api_key = request.headers.get("X-API-Key")
    if api_key:
        return api_key
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
