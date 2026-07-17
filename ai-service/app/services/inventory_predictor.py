"""
ZeroWaste OS AI Service — Inventory Prediction Engine.

Predicts stock shortages and generates purchase recommendations using
consumption pattern analysis.  When historical consumption data is
provided, the engine calculates rolling averages and trend-adjusted
depletion rates.  Without consumption data, it uses category-based
heuristic consumption rates.

Output:
  • Shortage predictions with urgency levels and dates
  • Purchase recommendations with priority and estimated cost
"""

from __future__ import annotations

import logging
from collections import defaultdict
from datetime import date, datetime, timedelta
from typing import Dict, List, Optional, Tuple

import numpy as np

from app.schemas.inventory import (
    ConsumptionRecord,
    InventoryItem,
    InventoryPredictRequest,
    InventoryPredictResponse,
    PurchaseRecommendation,
    ShortagePrediction,
)
from app.utils.helpers import parse_date, safe_round

logger = logging.getLogger("zerowaste.inventory_predictor")

# ── Default daily consumption rates by category (kg/day) ──────────
_DEFAULT_RATES: Dict[str, float] = {
    "dairy": 5.0,
    "vegetables": 8.0,
    "fruits": 4.0,
    "grains": 6.0,
    "meat": 3.5,
    "seafood": 2.5,
    "bakery": 4.0,
    "beverages": 7.0,
    "spices": 0.5,
    "oils": 1.0,
    "frozen": 3.0,
    "default": 4.0,
}

# ── Reorder buffer days by urgency ────────────────────────────────
_BUFFER_DAYS = 3  # days of safety stock to maintain


def _get_default_rate(category: Optional[str]) -> float:
    """Look up the default consumption rate for a category."""
    if not category:
        return _DEFAULT_RATES["default"]
    cat_lower = category.lower()
    for key, rate in _DEFAULT_RATES.items():
        if key in cat_lower:
            return rate
    return _DEFAULT_RATES["default"]


def _urgency_level(days: int) -> str:
    """Determine urgency based on days until shortage."""
    if days <= 1:
        return "critical"
    if days <= 3:
        return "high"
    if days <= 7:
        return "medium"
    return "low"


def _purchase_priority(days: int) -> str:
    """Determine purchase priority based on days until shortage."""
    if days <= 2:
        return "high"
    if days <= 5:
        return "medium"
    return "low"


class InventoryPredictor:
    """Inventory shortage prediction and purchase recommendation engine."""

    async def predict(self, req: InventoryPredictRequest) -> InventoryPredictResponse:
        # Build consumption rates per item
        consumption_rates = self._calculate_rates(
            req.inventory_data, req.consumption_patterns
        )

        shortage_predictions: List[ShortagePrediction] = []
        purchase_recommendations: List[PurchaseRecommendation] = []
        today = date.today()

        for item in req.inventory_data:
            rate = consumption_rates.get(item.item_name, _get_default_rate(item.category))

            if rate <= 0:
                rate = _get_default_rate(item.category)

            # Days until stock runs out
            if rate > 0:
                days_until_empty = max(0, int(item.current_stock_kg / rate))
            else:
                days_until_empty = 999

            predicted_date = (today + timedelta(days=days_until_empty)).isoformat()
            urgency = _urgency_level(days_until_empty)

            shortage_predictions.append(
                ShortagePrediction(
                    item_name=item.item_name,
                    days_until_shortage=days_until_empty,
                    predicted_date=predicted_date,
                    urgency=urgency,
                    current_stock_kg=safe_round(item.current_stock_kg),
                    daily_consumption_rate=safe_round(rate),
                )
            )

            # Purchase recommendation if shortage within threshold
            shelf_life = item.shelf_life_days or 14
            reorder_threshold = min(_BUFFER_DAYS + 2, shelf_life)

            if days_until_empty <= reorder_threshold:
                # Recommend enough stock for 7 days + buffer
                target_days = 7 + _BUFFER_DAYS
                needed = rate * target_days - item.current_stock_kg
                needed = max(needed, rate * 2)  # minimum 2 days' worth

                estimated_cost = None
                if item.unit_cost and item.unit_cost > 0:
                    estimated_cost = safe_round(needed * item.unit_cost)

                reason = self._build_purchase_reason(
                    item.item_name, days_until_empty, rate, item.current_stock_kg
                )

                purchase_recommendations.append(
                    PurchaseRecommendation(
                        item_name=item.item_name,
                        recommended_quantity_kg=safe_round(needed),
                        estimated_cost=estimated_cost,
                        reason=reason,
                        priority=_purchase_priority(days_until_empty),
                    )
                )

        # Sort predictions by urgency (critical first)
        urgency_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        shortage_predictions.sort(key=lambda s: urgency_order.get(s.urgency, 4))
        purchase_recommendations.sort(
            key=lambda p: {"high": 0, "medium": 1, "low": 2}.get(p.priority, 3)
        )

        critical_count = sum(1 for s in shortage_predictions if s.urgency == "critical")
        high_count = sum(1 for s in shortage_predictions if s.urgency == "high")

        summary_parts = [
            f"Analysed {len(req.inventory_data)} inventory items."
        ]
        if critical_count:
            summary_parts.append(f"{critical_count} items at CRITICAL shortage level.")
        if high_count:
            summary_parts.append(f"{high_count} items at HIGH shortage level.")
        summary_parts.append(
            f"{len(purchase_recommendations)} purchase recommendations generated."
        )

        return InventoryPredictResponse(
            business_id=req.business_id,
            shortage_predictions=shortage_predictions,
            purchase_recommendations=purchase_recommendations,
            summary=" ".join(summary_parts),
            generated_at=datetime.utcnow().isoformat() + "Z",
        )

    # ── Consumption rate calculation ──────────────────────────────

    def _calculate_rates(
        self,
        inventory: List[InventoryItem],
        consumption: Optional[List[ConsumptionRecord]],
    ) -> Dict[str, float]:
        """
        Calculate daily consumption rate per item.

        If consumption records are provided, compute a weighted moving average
        (recent days weighted higher).  Otherwise fall back to category defaults.
        """
        rates: Dict[str, float] = {}

        if not consumption:
            for item in inventory:
                rates[item.item_name] = _get_default_rate(item.category)
            return rates

        # Group consumption by item
        item_records: Dict[str, List[Tuple[date, float]]] = defaultdict(list)
        for record in consumption:
            d = parse_date(record.date)
            item_records[record.item_name].append((d, record.consumed_kg))

        for item in inventory:
            records = item_records.get(item.item_name)
            if not records or len(records) < 2:
                rates[item.item_name] = _get_default_rate(item.category)
                continue

            # Sort by date
            records.sort(key=lambda r: r[0])

            # Weighted moving average — recent days get higher weight
            values = np.array([r[1] for r in records])
            n = len(values)
            weights = np.linspace(0.5, 1.5, n)  # older → 0.5, newer → 1.5
            weighted_avg = float(np.average(values, weights=weights))

            # Apply mild trend adjustment
            if n >= 5:
                recent_avg = float(np.mean(values[-3:]))
                older_avg = float(np.mean(values[:-3]))
                if older_avg > 0:
                    trend_ratio = recent_avg / older_avg
                    # Cap trend effect to ±20%
                    trend_ratio = np.clip(trend_ratio, 0.8, 1.2)
                    weighted_avg *= float(trend_ratio)

            rates[item.item_name] = max(0.1, weighted_avg)

        # Fill items without consumption data
        for item in inventory:
            if item.item_name not in rates:
                rates[item.item_name] = _get_default_rate(item.category)

        return rates

    @staticmethod
    def _build_purchase_reason(
        item_name: str, days_left: int, rate: float, stock: float
    ) -> str:
        if days_left <= 1:
            return (
                f"URGENT: '{item_name}' will run out today or tomorrow. "
                f"Current stock ({stock:.1f} kg) at {rate:.1f} kg/day consumption."
            )
        if days_left <= 3:
            return (
                f"'{item_name}' will run out in {days_left} days. "
                f"Order soon to maintain service continuity."
            )
        return (
            f"'{item_name}' is projected to run low in {days_left} days. "
            f"Reorder to maintain {_BUFFER_DAYS}-day safety buffer."
        )
