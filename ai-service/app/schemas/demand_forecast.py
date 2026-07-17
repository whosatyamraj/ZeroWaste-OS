"""
ZeroWaste OS AI Service — Pydantic schemas for demand forecasting.
"""

from __future__ import annotations

from datetime import date
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


# ── Request ───────────────────────────────────────────────────────


class HistoricalDataPoint(BaseModel):
    """A single historical data point for demand forecasting."""

    date: str = Field(..., description="ISO-format date (YYYY-MM-DD)")
    customers: int = Field(..., ge=0, description="Customer count for that day")
    revenue: Optional[float] = Field(None, ge=0, description="Revenue for that day")
    items_sold: Optional[int] = Field(None, ge=0, description="Total items sold")


class DemandForecastRequest(BaseModel):
    """Request body for POST /api/ai/demand-forecast."""

    business_id: str = Field(
        ..., min_length=1, max_length=100, description="Unique business identifier"
    )
    start_date: str = Field(..., description="Forecast start date (ISO-format)")
    end_date: str = Field(..., description="Forecast end date (ISO-format)")
    historical_data: Optional[List[HistoricalDataPoint]] = Field(
        None, description="Optional historical data for better predictions"
    )

    @field_validator("business_id")
    @classmethod
    def validate_business_id(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("business_id must not be blank")
        return v.strip()


# ── Response ──────────────────────────────────────────────────────


class ForecastDataPoint(BaseModel):
    """A single forecasted data point."""

    date: str
    expected_customers: int
    recommended_quantities: Dict[str, int] = Field(
        default_factory=dict,
        description="Recommended production quantities by category",
    )
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    lower_bound: Optional[int] = None
    upper_bound: Optional[int] = None


class DemandForecastResponse(BaseModel):
    """Response body for POST /api/ai/demand-forecast."""

    business_id: str
    forecast: List[ForecastDataPoint]
    model_used: str = "ensemble-demo"
    generated_at: str
    summary: str
