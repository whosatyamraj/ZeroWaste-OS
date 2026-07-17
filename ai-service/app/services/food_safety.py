"""
ZeroWaste OS AI Service — Food Safety Classification Engine.

Primary path:  Google Gemini Vision API for real image analysis.
Fallback path: Rule-based heuristic model when Gemini is unavailable.

The Gemini integration sends a structured prompt asking for JSON output
with classification, confidence, explanation, and shelf-life estimate.
If the API key is missing or the call fails, the service gracefully
falls back to a deterministic rule-based classifier.
"""

from __future__ import annotations

import base64
import json
import logging
import re
from typing import Optional

import httpx

from app.core.config import get_settings
from app.schemas.food_safety import FoodSafetyRequest, FoodSafetyResponse
from app.utils.helpers import clip_confidence, sanitize_string

logger = logging.getLogger("zerowaste.food_safety")

# ── Shelf-life heuristics by food type keyword ────────────────────
_SHELF_LIFE_RULES: dict[str, dict] = {
    "rice": {"safe_hours": 4, "consume_soon_hours": 8, "shelf_life": "4–6 hours at room temperature"},
    "curry": {"safe_hours": 3, "consume_soon_hours": 6, "shelf_life": "3–5 hours unrefrigerated"},
    "bread": {"safe_hours": 48, "consume_soon_hours": 72, "shelf_life": "2–3 days at room temperature"},
    "milk": {"safe_hours": 2, "consume_soon_hours": 4, "shelf_life": "2 hours unrefrigerated"},
    "dairy": {"safe_hours": 2, "consume_soon_hours": 4, "shelf_life": "2 hours unrefrigerated"},
    "chicken": {"safe_hours": 2, "consume_soon_hours": 3, "shelf_life": "2 hours (cooked, unrefrigerated)"},
    "meat": {"safe_hours": 2, "consume_soon_hours": 3, "shelf_life": "2 hours (cooked, unrefrigerated)"},
    "fish": {"safe_hours": 1, "consume_soon_hours": 2, "shelf_life": "1–2 hours unrefrigerated"},
    "seafood": {"safe_hours": 1, "consume_soon_hours": 2, "shelf_life": "1–2 hours unrefrigerated"},
    "salad": {"safe_hours": 2, "consume_soon_hours": 4, "shelf_life": "2–4 hours unrefrigerated"},
    "fruit": {"safe_hours": 24, "consume_soon_hours": 48, "shelf_life": "1–3 days at room temperature"},
    "vegetable": {"safe_hours": 12, "consume_soon_hours": 24, "shelf_life": "12–24 hours at room temperature"},
    "egg": {"safe_hours": 2, "consume_soon_hours": 4, "shelf_life": "2 hours (cooked, unrefrigerated)"},
    "soup": {"safe_hours": 2, "consume_soon_hours": 4, "shelf_life": "2–4 hours unrefrigerated"},
    "pasta": {"safe_hours": 4, "consume_soon_hours": 8, "shelf_life": "4–6 hours at room temperature"},
    "sandwich": {"safe_hours": 3, "consume_soon_hours": 5, "shelf_life": "3–5 hours unrefrigerated"},
    "cake": {"safe_hours": 24, "consume_soon_hours": 48, "shelf_life": "1–2 days at room temperature"},
    "default": {"safe_hours": 4, "consume_soon_hours": 8, "shelf_life": "4–8 hours (general estimate)"},
}

# ── Gemini prompt template ────────────────────────────────────────
_GEMINI_PROMPT = """You are a food safety expert AI. Analyze the provided food image and information.

Food type: {food_type}
Preparation time: {preparation_time}

Evaluate the food and respond ONLY with valid JSON (no markdown, no code fences):
{{
  "classification": "<Safe | Consume Soon | Unsafe>",
  "confidence_score": <0.0 to 1.0>,
  "explanation": "<detailed explanation of the assessment>",
  "shelf_life_estimate": "<estimated remaining safe consumption window>",
  "recommendations": ["<recommendation 1>", "<recommendation 2>"]
}}

Consider:
- Visual signs of spoilage (color changes, mold, texture)
- Time since preparation relative to food type
- Food safety temperature danger zone (4°C–60°C)
- Type-specific risks (raw vs cooked, dairy vs grain)
"""


def _match_food_type(food_type: str) -> dict:
    """Find the best matching shelf-life rule for the given food type."""
    food_lower = food_type.lower()
    for keyword, rules in _SHELF_LIFE_RULES.items():
        if keyword == "default":
            continue
        if keyword in food_lower:
            return rules
    return _SHELF_LIFE_RULES["default"]


def _parse_hours_from_prep_time(preparation_time: Optional[str]) -> Optional[float]:
    """Try to extract hours since preparation from a free-text string."""
    if not preparation_time:
        return None
    text = preparation_time.lower().strip()

    # Match patterns like "2 hours ago", "3.5 hrs", "30 minutes"
    hour_match = re.search(r"(\d+\.?\d*)\s*(?:hours?|hrs?)", text)
    if hour_match:
        return float(hour_match.group(1))

    min_match = re.search(r"(\d+\.?\d*)\s*(?:minutes?|mins?)", text)
    if min_match:
        return float(min_match.group(1)) / 60.0

    day_match = re.search(r"(\d+\.?\d*)\s*(?:days?)", text)
    if day_match:
        return float(day_match.group(1)) * 24.0

    return None


class FoodSafetyClassifier:
    """Food safety classification service."""

    def __init__(self) -> None:
        self._gemini_model = None

    async def classify(self, req: FoodSafetyRequest) -> FoodSafetyResponse:
        """
        Classify food safety. Attempts Gemini Vision first, then falls
        back to rule-based classification.
        """
        settings = get_settings()

        if settings.gemini_configured and (req.image_base64 or req.image_url):
            try:
                return await self._classify_with_gemini(req, settings)
            except Exception as exc:
                logger.error("Gemini classification failed: %s", exc)
                logger.info("Falling back to rule-based classifier")

        return self._classify_rule_based(req)

    # ── Gemini Vision path ────────────────────────────────────────

    async def _classify_with_gemini(
        self, req: FoodSafetyRequest, settings
    ) -> FoodSafetyResponse:
        import google.generativeai as genai

        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(settings.gemini_model)

        prompt = _GEMINI_PROMPT.format(
            food_type=sanitize_string(req.food_type),
            preparation_time=sanitize_string(req.preparation_time or "unknown"),
        )

        content_parts = [prompt]

        # Attach image
        if req.image_base64:
            image_bytes = base64.b64decode(req.image_base64)
            content_parts.append(
                {"mime_type": "image/jpeg", "data": image_bytes}
            )
        elif req.image_url:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(str(req.image_url))
                resp.raise_for_status()
                content_type = resp.headers.get("content-type", "image/jpeg")
                content_parts.append(
                    {"mime_type": content_type.split(";")[0], "data": resp.content}
                )

        generation_config = genai.types.GenerationConfig(
            max_output_tokens=settings.gemini_max_tokens,
            temperature=settings.gemini_temperature,
        )

        response = model.generate_content(
            content_parts,
            generation_config=generation_config,
        )

        raw_text = response.text.strip()
        # Strip markdown code fences if present
        if raw_text.startswith("```"):
            raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
            raw_text = re.sub(r"\s*```$", "", raw_text)

        result = json.loads(raw_text)

        return FoodSafetyResponse(
            classification=result.get("classification", "Consume Soon"),
            confidence_score=clip_confidence(result.get("confidence_score", 0.7)),
            explanation=result.get("explanation", "Analysis completed via Gemini Vision."),
            shelf_life_estimate=result.get("shelf_life_estimate"),
            recommendations=result.get("recommendations", []),
            analysis_source="gemini",
        )

    # ── Rule-based fallback ───────────────────────────────────────

    def _classify_rule_based(self, req: FoodSafetyRequest) -> FoodSafetyResponse:
        rules = _match_food_type(req.food_type)
        hours_elapsed = _parse_hours_from_prep_time(req.preparation_time)

        if hours_elapsed is None:
            # Without timing info, give a cautious middle-ground answer
            return FoodSafetyResponse(
                classification="Consume Soon",
                confidence_score=0.60,
                explanation=(
                    f"Without preparation time info, a cautious assessment is provided. "
                    f"'{req.food_type}' typically has a shelf life of {rules['shelf_life']}. "
                    f"Inspect visually and smell before consuming."
                ),
                shelf_life_estimate=rules["shelf_life"],
                recommendations=[
                    "Check for off-odours or discolouration",
                    "When in doubt, discard the food",
                    "Store in refrigerator (below 4°C) to extend shelf life",
                ],
                analysis_source="demo",
            )

        # Classify based on elapsed time vs. thresholds
        if hours_elapsed <= rules["safe_hours"]:
            classification = "Safe"
            remaining = rules["safe_hours"] - hours_elapsed
            confidence = clip_confidence(0.88 - (hours_elapsed / rules["safe_hours"]) * 0.15)
            explanation = (
                f"'{req.food_type}' was prepared {hours_elapsed:.1f} hours ago, "
                f"within the safe window of {rules['safe_hours']} hours. "
                f"Approximately {remaining:.1f} hours of safe consumption remain."
            )
            recommendations = [
                "Consume within the safe window",
                "Keep refrigerated if not serving immediately",
            ]
        elif hours_elapsed <= rules["consume_soon_hours"]:
            classification = "Consume Soon"
            remaining = rules["consume_soon_hours"] - hours_elapsed
            confidence = clip_confidence(0.78 - (hours_elapsed / rules["consume_soon_hours"]) * 0.1)
            explanation = (
                f"'{req.food_type}' was prepared {hours_elapsed:.1f} hours ago, "
                f"past the optimal window of {rules['safe_hours']} hours but within "
                f"the extended limit. Approximately {remaining:.1f} hours remain "
                f"before it should be discarded."
            )
            recommendations = [
                "Consume as soon as possible",
                "Do not leave at room temperature",
                "Consider discounting for quick sale",
            ]
        else:
            classification = "Unsafe"
            confidence = clip_confidence(0.90 + min(0.09, (hours_elapsed - rules["consume_soon_hours"]) * 0.02))
            explanation = (
                f"'{req.food_type}' was prepared {hours_elapsed:.1f} hours ago, "
                f"exceeding the safe limit of {rules['consume_soon_hours']} hours. "
                f"Bacterial growth risk is high."
            )
            recommendations = [
                "Do NOT serve or sell this food",
                "Dispose of safely or compost",
                "Review preparation scheduling to reduce waste",
            ]

        return FoodSafetyResponse(
            classification=classification,
            confidence_score=confidence,
            explanation=explanation,
            shelf_life_estimate=rules["shelf_life"],
            recommendations=recommendations,
            analysis_source="demo",
        )
