"""
ZeroWaste OS AI Service — Pydantic schemas for the action-decision engine.
"""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


# ── Request ───────────────────────────────────────────────────────


class DecideActionRequest(BaseModel):
    """Request body for POST /api/ai/decide-action."""

    food_item: str = Field(
        ..., min_length=1, max_length=200, description="Name of the food item"
    )
    food_type: str = Field(
        ..., min_length=1, max_length=100, description="Category: perishable, dairy, grain, etc."
    )
    freshness_percentage: float = Field(
        ..., ge=0.0, le=100.0, description="Remaining freshness 0-100%"
    )
    shelf_life_remaining_hours: float = Field(
        ..., ge=0.0, description="Hours of shelf life remaining"
    )
    quantity_kg: float = Field(
        ..., gt=0.0, description="Quantity in kilograms"
    )
    nearby_demand: Optional[float] = Field(
        None, ge=0.0, le=1.0, description="Nearby demand score 0-1"
    )
    distance_to_ngo_km: Optional[float] = Field(
        None, ge=0.0, description="Distance to nearest NGO in km"
    )
    current_price: Optional[float] = Field(
        None, ge=0.0, description="Current selling price"
    )

    @field_validator("food_item", "food_type")
    @classmethod
    def no_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field must not be blank")
        return v.strip()


# ── Response ──────────────────────────────────────────────────────


class ActionScore(BaseModel):
    """Score breakdown for a single possible action."""

    action: str
    score: float = Field(..., ge=0.0, le=1.0)
    reasoning: str


class DecideActionResponse(BaseModel):
    """Response body for POST /api/ai/decide-action."""

    recommended_action: str = Field(
        ...,
        description="Primary recommendation: Discount Sale, NGO Donation, Repurposing, Animal Feed, Composting",
    )
    confidence: float = Field(..., ge=0.0, le=1.0)
    reasoning: str
    all_scores: List[ActionScore]
    environmental_impact: str = Field(
        ..., description="Short statement about waste-reduction impact"
    )
