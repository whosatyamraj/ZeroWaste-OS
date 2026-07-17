# ─────────────────────────────────────────────────────────────────
#  ZeroWaste OS — AI Micro-service  │  Multi-stage Docker Build
# ─────────────────────────────────────────────────────────────────

# ── Stage 1: Builder ──────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Stage 2: Runtime ─────────────────────────────────────────────
FROM python:3.11-slim

# Security: run as non-root user
RUN groupadd -r zerowaste && useradd -r -g zerowaste -d /app -s /sbin/nologin zerowaste

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY . .

# Set ownership
RUN chown -R zerowaste:zerowaste /app

# Switch to non-root user
USER zerowaste

# Environment defaults (override via docker-compose or -e flags)
ENV HOST=0.0.0.0 \
    PORT=8000 \
    DEBUG=false \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
