"""
ZeroWaste OS AI Service — Pydantic schemas for food-safety classification.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, field_validator


# ── Request ───────────────────────────────────────────────────────


class FoodSafetyRequest(BaseModel):
    """Request body for POST /api/ai/food-safety."""

    image_base64: Optional[str] = Field(
        None,
        description="Base64-encoded image of the food item",
    )
    image_url: Optional[str] = Field(
        None,
        description="Public URL of the food image",
    )
    food_type: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Type of food, e.g. 'cooked rice', 'raw chicken'",
    )
    preparation_time: Optional[str] = Field(
        None,
        description="When the food was prepared (ISO-format datetime or relative, e.g. '2 hours ago')",
    )

    @field_validator("food_type")
    @classmethod
    def validate_food_type(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("food_type must not be blank")
        return v.strip()


# ── Response ──────────────────────────────────────────────────────


class FoodSafetyResponse(BaseModel):
    """Response body for POST /api/ai/food-safety."""

    classification: str = Field(
        ...,
        description="One of: Safe, Consume Soon, Unsafe",
    )
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    explanation: str
    shelf_life_estimate: Optional[str] = Field(
        None, description="Estimated remaining shelf life"
    )
    recommendations: list[str] = Field(default_factory=list)
    analysis_source: str = Field(
        default="demo",
        description="'gemini' when Gemini API was used, 'demo' for fallback",
    )
