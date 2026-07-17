"""
ZeroWaste OS AI Service — Utility helpers.

Shared functions used across multiple services:
  • Input sanitisation
  • Date helpers
  • Numeric clipping
  • Safe JSON serialisation
"""

from __future__ import annotations

import hashlib
import re
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional, Union

import numpy as np


# ── Input Sanitisation ────────────────────────────────────────────

_STRIP_PATTERN = re.compile(r"[^\w\s\-.,;:!?@#%()/\\'\"+=$]", re.UNICODE)


def sanitize_string(value: str, max_length: int = 1000) -> str:
    """
    Remove potentially dangerous characters and enforce length limits.
    Keeps alphanumeric, whitespace, and common punctuation.
    """
    if not isinstance(value, str):
        return ""
    cleaned = _STRIP_PATTERN.sub("", value)
    return cleaned.strip()[:max_length]


def sanitize_dict(data: Dict[str, Any], max_depth: int = 5) -> Dict[str, Any]:
    """Recursively sanitise all string values in a dictionary."""
    if max_depth <= 0:
        return {}
    result: Dict[str, Any] = {}
    for key, value in data.items():
        clean_key = sanitize_string(str(key), max_length=200)
        if isinstance(value, str):
            result[clean_key] = sanitize_string(value)
        elif isinstance(value, dict):
            result[clean_key] = sanitize_dict(value, max_depth - 1)
        elif isinstance(value, list):
            result[clean_key] = [
                sanitize_string(v) if isinstance(v, str) else v for v in value
            ]
        else:
            result[clean_key] = value
    return result


# ── Date Helpers ──────────────────────────────────────────────────


def parse_date(value: Union[str, date, datetime]) -> date:
    """
    Parse a date from ISO-format string or passthrough date/datetime objects.
    """
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return date.fromisoformat(str(value))


def date_range_days(start: date, end: date) -> int:
    """Return the number of days between two dates (inclusive)."""
    return max((end - start).days + 1, 1)


def generate_date_series(
    start: Union[str, date], periods: int, freq_days: int = 1
) -> List[str]:
    """Generate a list of ISO-format date strings."""
    start_date = parse_date(start)
    return [
        (start_date + timedelta(days=i * freq_days)).isoformat()
        for i in range(periods)
    ]


# ── Numeric Helpers ───────────────────────────────────────────────


def clip_confidence(value: float) -> float:
    """Clip a confidence score to [0.0, 1.0]."""
    return float(np.clip(value, 0.0, 1.0))


def safe_round(value: float, decimals: int = 2) -> float:
    """Round a float, converting NaN/Inf to 0."""
    if not np.isfinite(value):
        return 0.0
    return round(float(value), decimals)


# ── Hashing ───────────────────────────────────────────────────────


def deterministic_hash(text: str) -> int:
    """Return a deterministic int hash for a string (for seeding RNGs)."""
    return int(hashlib.sha256(text.encode("utf-8")).hexdigest(), 16) % (2**31)


# ── JSON-safe conversion ─────────────────────────────────────────


def numpy_to_python(obj: Any) -> Any:
    """Recursively convert numpy types to native Python for JSON serialisation."""
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, np.floating):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, dict):
        return {k: numpy_to_python(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [numpy_to_python(v) for v in obj]
    return obj
