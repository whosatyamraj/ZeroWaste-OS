"""
ZeroWaste OS AI Service — Pydantic schemas for inventory prediction.
"""

from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


# ── Request ───────────────────────────────────────────────────────


class InventoryItem(BaseModel):
    """Current stock information for a single item."""

    item_name: str = Field(..., min_length=1, max_length=200)
    current_stock_kg: float = Field(..., ge=0.0)
    unit_cost: Optional[float] = Field(None, ge=0.0)
    category: Optional[str] = Field(None, max_length=100)
    shelf_life_days: Optional[int] = Field(None, ge=0)


class ConsumptionRecord(BaseModel):
    """Historical daily consumption for an item."""

    item_name: str = Field(..., min_length=1, max_length=200)
    date: str = Field(..., description="ISO-format date")
    consumed_kg: float = Field(..., ge=0.0)


class InventoryPredictRequest(BaseModel):
    """Request body for POST /api/ai/inventory-predict."""

    business_id: str = Field(
        ..., min_length=1, max_length=100, description="Unique business identifier"
    )
    inventory_data: List[InventoryItem] = Field(
        ..., min_length=1, description="Current inventory snapshot"
    )
    consumption_patterns: Optional[List[ConsumptionRecord]] = Field(
        None, description="Historical consumption records for prediction"
    )

    @field_validator("business_id")
    @classmethod
    def validate_business_id(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("business_id must not be blank")
        return v.strip()


# ── Response ──────────────────────────────────────────────────────


class ShortagePrediction(BaseModel):
    """Prediction for a single item running out of stock."""

    item_name: str
    days_until_shortage: int
    predicted_date: str
    urgency: str = Field(
        ..., description="low, medium, high, critical"
    )
    current_stock_kg: float
    daily_consumption_rate: float


class PurchaseRecommendation(BaseModel):
    """Purchase suggestion for a single item."""

    item_name: str
    recommended_quantity_kg: float
    estimated_cost: Optional[float] = None
    reason: str
    priority: str = Field(..., description="low, medium, high")


class InventoryPredictResponse(BaseModel):
    """Response body for POST /api/ai/inventory-predict."""

    business_id: str
    shortage_predictions: List[ShortagePrediction]
    purchase_recommendations: List[PurchaseRecommendation]
    summary: str
    generated_at: str
