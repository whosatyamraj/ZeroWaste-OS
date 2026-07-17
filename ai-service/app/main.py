"""
ZeroWaste OS AI Service — FastAPI Application Entry Point.

Sets up:
  • CORS middleware (restricted to configured origins)
  • SlowAPI rate limiting
  • Global exception handlers
  • Health-check endpoint
  • All AI service routes under /api/ai
  • Structured logging
"""

from __future__ import annotations

import logging
import sys
import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.routes import limiter, router as ai_router
from app.core.config import get_settings

# ── Logging ───────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("zerowaste.main")


# ── Lifespan ──────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application startup / shutdown lifecycle."""
    settings = get_settings()
    logger.info("=" * 60)
    logger.info("  ZeroWaste OS — AI Micro-service starting")
    logger.info("  CORS origins : %s", settings.cors_origin_list)
    logger.info("  Rate limit   : %s", settings.rate_limit_string)
    logger.info("  Gemini API   : %s", "configured" if settings.gemini_configured else "NOT configured (demo mode)")
    logger.info("  Debug mode   : %s", settings.debug)
    logger.info("=" * 60)
    yield
    logger.info("ZeroWaste OS — AI Micro-service shutting down")


# ── App Factory ───────────────────────────────────────────────────

def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="ZeroWaste OS — AI Service",
        description=(
            "AI-powered micro-service for food waste reduction. "
            "Provides demand forecasting, food safety classification, "
            "waste-action decision engine, business insights, and "
            "inventory shortage prediction."
        ),
        version="1.0.0",
        docs_url="/docs" if settings.debug else "/docs",
        redoc_url="/redoc" if settings.debug else None,
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
    )

    # ── Rate Limiting ─────────────────────────────────────────────
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # ── Global Exception Handlers ─────────────────────────────────

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error(
            "Unhandled exception on %s %s: %s",
            request.method,
            request.url.path,
            exc,
            exc_info=True,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An internal error occurred. Please try again later."},
        )

    # ── Request Logging Middleware ────────────────────────────────

    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start = time.time()
        response = await call_next(request)
        elapsed = time.time() - start
        logger.info(
            "%s %s → %d (%.3fs)",
            request.method,
            request.url.path,
            response.status_code,
            elapsed,
        )
        return response

    # ── Health Check ──────────────────────────────────────────────

    @app.get(
        "/health",
        tags=["System"],
        summary="Health check",
    )
    async def health_check():
        return {
            "status": "healthy",
            "service": "zerowaste-ai",
            "version": "1.0.0",
            "gemini_configured": settings.gemini_configured,
        }

    @app.get(
        "/",
        tags=["System"],
        summary="Service info",
    )
    async def root():
        return {
            "service": "ZeroWaste OS — AI Service",
            "version": "1.0.0",
            "endpoints": [
                "/api/ai/demand-forecast",
                "/api/ai/food-safety",
                "/api/ai/decide-action",
                "/api/ai/insights",
                "/api/ai/inventory-predict",
            ],
            "docs": "/docs",
            "health": "/health",
        }

    # ── Register Routes ───────────────────────────────────────────
    app.include_router(ai_router)

    return app


# ── Module-level app instance (for uvicorn) ───────────────────────
app = create_app()


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info",
    )
