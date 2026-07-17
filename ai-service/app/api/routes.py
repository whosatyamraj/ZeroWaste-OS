"""
ZeroWaste OS AI Service — API Route Definitions.

All five AI endpoints with rate limiting, API-key auth, input validation,
and structured error handling.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import get_settings
from app.core.security import key_func, verify_api_key
from app.schemas.decision import DecideActionRequest, DecideActionResponse
from app.schemas.demand_forecast import DemandForecastRequest, DemandForecastResponse
from app.schemas.food_safety import FoodSafetyRequest, FoodSafetyResponse
from app.schemas.insights import InsightsRequest, InsightsResponse
from app.schemas.inventory import InventoryPredictRequest, InventoryPredictResponse
from app.services.decision_engine import DecisionEngine
from app.services.demand_forecasting import DemandForecaster
from app.services.food_safety import FoodSafetyClassifier
from app.services.insights_engine import InsightsEngine
from app.services.inventory_predictor import InventoryPredictor

logger = logging.getLogger("zerowaste.routes")

# ── Rate Limiter ──────────────────────────────────────────────────
limiter = Limiter(key_func=key_func)

# ── Router ────────────────────────────────────────────────────────
router = APIRouter(prefix="/api/ai", tags=["AI Services"])

# ── Service singletons ───────────────────────────────────────────
_demand_forecaster = DemandForecaster()
_food_safety_classifier = FoodSafetyClassifier()
_decision_engine = DecisionEngine()
_insights_engine = InsightsEngine()
_inventory_predictor = InventoryPredictor()


def _rate_limit_string() -> str:
    return get_settings().rate_limit_string


# ── 1. Demand Forecast ───────────────────────────────────────────


@router.post(
    "/demand-forecast",
    response_model=DemandForecastResponse,
    summary="Predict customer demand and recommended quantities",
    description=(
        "Uses an ensemble of time-series decomposition and gradient boosting "
        "to forecast customer demand over a specified date range."
    ),
)
@limiter.limit(lambda: _rate_limit_string())
async def demand_forecast(
    request: Request,
    body: DemandForecastRequest,
    _api_key: str = Depends(verify_api_key),
) -> DemandForecastResponse:
    start_time = time.time()
    try:
        result = await _demand_forecaster.forecast(body)
        elapsed = time.time() - start_time
        logger.info(
            "Demand forecast for %s completed in %.2fs",
            body.business_id,
            elapsed,
        )
        return result
    except ValueError as exc:
        logger.warning("Validation error in demand forecast: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid input for demand forecast",
        )
    except Exception as exc:
        logger.error("Demand forecast error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred processing the demand forecast",
        )


# ── 2. Food Safety ───────────────────────────────────────────────


@router.post(
    "/food-safety",
    response_model=FoodSafetyResponse,
    summary="Classify food safety using AI vision",
    description=(
        "Analyses a food image (base64 or URL) using Google Gemini Vision API "
        "to classify safety status. Falls back to rule-based classification "
        "when Gemini is unavailable."
    ),
)
@limiter.limit(lambda: _rate_limit_string())
async def food_safety(
    request: Request,
    body: FoodSafetyRequest,
    _api_key: str = Depends(verify_api_key),
) -> FoodSafetyResponse:
    start_time = time.time()
    try:
        result = await _food_safety_classifier.classify(body)
        elapsed = time.time() - start_time
        logger.info(
            "Food safety classification (%s) completed in %.2fs [source=%s]",
            body.food_type,
            elapsed,
            result.analysis_source,
        )
        return result
    except ValueError as exc:
        logger.warning("Validation error in food safety: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid input for food safety analysis",
        )
    except Exception as exc:
        logger.error("Food safety error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred processing the food safety analysis",
        )


# ── 3. Decide Action ─────────────────────────────────────────────


@router.post(
    "/decide-action",
    response_model=DecideActionResponse,
    summary="Recommend optimal action for surplus food",
    description=(
        "Multi-criteria weighted decision model that recommends the best "
        "action for surplus or near-expiry food items."
    ),
)
@limiter.limit(lambda: _rate_limit_string())
async def decide_action(
    request: Request,
    body: DecideActionRequest,
    _api_key: str = Depends(verify_api_key),
) -> DecideActionResponse:
    start_time = time.time()
    try:
        result = await _decision_engine.decide(body)
        elapsed = time.time() - start_time
        logger.info(
            "Decision for '%s' → %s (%.3f) in %.2fs",
            body.food_item,
            result.recommended_action,
            result.confidence,
            elapsed,
        )
        return result
    except ValueError as exc:
        logger.warning("Validation error in decide-action: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid input for decision engine",
        )
    except Exception as exc:
        logger.error("Decision engine error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred processing the action decision",
        )


# ── 4. Insights ──────────────────────────────────────────────────


@router.post(
    "/insights",
    response_model=InsightsResponse,
    summary="Generate waste-reduction insights",
    description=(
        "Analyses waste data to produce actionable, natural-language insights "
        "with severity ratings and recommendations."
    ),
)
@limiter.limit(lambda: _rate_limit_string())
async def insights(
    request: Request,
    body: InsightsRequest,
    _api_key: str = Depends(verify_api_key),
) -> InsightsResponse:
    start_time = time.time()
    try:
        result = await _insights_engine.analyse(body)
        elapsed = time.time() - start_time
        logger.info(
            "Insights for %s: %d insights generated in %.2fs",
            body.business_id,
            len(result.insights),
            elapsed,
        )
        return result
    except ValueError as exc:
        logger.warning("Validation error in insights: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid input for insights generation",
        )
    except Exception as exc:
        logger.error("Insights error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred generating insights",
        )


# ── 5. Inventory Predict ─────────────────────────────────────────


@router.post(
    "/inventory-predict",
    response_model=InventoryPredictResponse,
    summary="Predict inventory shortages and purchase needs",
    description=(
        "Analyses current inventory and consumption patterns to predict "
        "shortages and generate prioritised purchase recommendations."
    ),
)
@limiter.limit(lambda: _rate_limit_string())
async def inventory_predict(
    request: Request,
    body: InventoryPredictRequest,
    _api_key: str = Depends(verify_api_key),
) -> InventoryPredictResponse:
    start_time = time.time()
    try:
        result = await _inventory_predictor.predict(body)
        elapsed = time.time() - start_time
        logger.info(
            "Inventory prediction for %s: %d shortages, %d recommendations in %.2fs",
            body.business_id,
            len(result.shortage_predictions),
            len(result.purchase_recommendations),
            elapsed,
        )
        return result
    except ValueError as exc:
        logger.warning("Validation error in inventory-predict: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid input for inventory prediction",
        )
    except Exception as exc:
        logger.error("Inventory prediction error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred processing the inventory prediction",
        )
