"""
ZeroWaste OS AI Service — Pydantic schemas for business insights.
"""

from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


# ── Request ───────────────────────────────────────────────────────


class WasteDataPoint(BaseModel):
    """A single waste-log entry."""

    date: str = Field(..., description="ISO-format date")
    food_type: str = Field(..., min_length=1, max_length=200)
    quantity_kg: float = Field(..., ge=0.0)
    reason: Optional[str] = Field(
        None, max_length=500, description="Why it was wasted: spoiled, overproduced, etc."
    )
    cost: Optional[float] = Field(None, ge=0.0)


class InsightsRequest(BaseModel):
    """Request body for POST /api/ai/insights."""

    business_id: str = Field(
        ..., min_length=1, max_length=100, description="Unique business identifier"
    )
    start_date: str = Field(..., description="Analysis window start (ISO)")
    end_date: str = Field(..., description="Analysis window end (ISO)")
    waste_data: Optional[List[WasteDataPoint]] = Field(
        None, description="Historical waste data"
    )

    @field_validator("business_id")
    @classmethod
    def validate_business_id(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("business_id must not be blank")
        return v.strip()


# ── Response ──────────────────────────────────────────────────────


class Insight(BaseModel):
    """A single actionable insight."""

    category: str = Field(
        ...,
        description="Category: waste_pattern, cost_saving, operational, environmental",
    )
    severity: str = Field(
        ..., description="Severity: info, warning, critical"
    )
    title: str
    description: str
    metric: Optional[str] = None
    recommendation: Optional[str] = None


class InsightsResponse(BaseModel):
    """Response body for POST /api/ai/insights."""

    business_id: str
    period: str
    insights: List[Insight]
    summary_stats: Dict[str, float] = Field(default_factory=dict)
    generated_at: str
