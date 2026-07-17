"""
ZeroWaste OS AI Service — Multi-Criteria Decision Engine.

Determines the optimal action for surplus / near-expiry food using a
weighted scoring model across five possible actions:

  1. Discount Sale   — sell at reduced price while still safe
  2. NGO Donation    — donate to food banks / shelters
  3. Repurposing     — transform into a different product
  4. Animal Feed     — redirect to animal-feed programs
  5. Composting      — last resort, return nutrients to soil

Each action is scored on a 0-1 scale across multiple criteria:
  • Freshness appropriateness
  • Time urgency
  • Quantity suitability
  • Demand alignment
  • Logistics feasibility
  • Environmental benefit

The action with the highest weighted score is recommended.
"""

from __future__ import annotations

import logging
from typing import List

import numpy as np

from app.schemas.decision import (
    ActionScore,
    DecideActionRequest,
    DecideActionResponse,
)
from app.utils.helpers import clip_confidence, safe_round

logger = logging.getLogger("zerowaste.decision_engine")

# ── Criteria Weights ──────────────────────────────────────────────
_WEIGHTS = {
    "freshness": 0.25,
    "time_urgency": 0.20,
    "quantity": 0.10,
    "demand": 0.20,
    "logistics": 0.10,
    "environmental": 0.15,
}


def _score_discount_sale(
    freshness: float,
    hours_left: float,
    quantity: float,
    demand: float,
    distance_ngo: float,
) -> dict[str, float]:
    """Score the Discount Sale action across all criteria."""
    # Best when food is still fairly fresh and there's demand
    freshness_score = min(1.0, freshness / 70.0) if freshness >= 30 else freshness / 100.0
    time_score = min(1.0, hours_left / 24.0) if hours_left >= 4 else hours_left / 12.0
    qty_score = 0.8 if quantity < 20 else 0.5  # easier to sell smaller amounts
    demand_score = demand
    logistics_score = 0.9  # no transport needed
    env_score = 0.7  # prevents waste

    return {
        "freshness": freshness_score,
        "time_urgency": time_score,
        "quantity": qty_score,
        "demand": demand_score,
        "logistics": logistics_score,
        "environmental": env_score,
    }


def _score_ngo_donation(
    freshness: float,
    hours_left: float,
    quantity: float,
    demand: float,
    distance_ngo: float,
) -> dict[str, float]:
    """Score the NGO Donation action."""
    freshness_score = min(1.0, freshness / 50.0) if freshness >= 20 else 0.2
    time_score = min(1.0, hours_left / 12.0) if hours_left >= 2 else 0.1
    qty_score = min(1.0, quantity / 5.0)  # NGOs prefer larger quantities
    demand_score = 0.8  # always social demand
    logistics_score = max(0.1, 1.0 - (distance_ngo / 30.0))  # closer is better
    env_score = 0.9  # high social & environmental value

    return {
        "freshness": freshness_score,
        "time_urgency": time_score,
        "quantity": qty_score,
        "demand": demand_score,
        "logistics": logistics_score,
        "environmental": env_score,
    }


def _score_repurposing(
    freshness: float,
    hours_left: float,
    quantity: float,
    demand: float,
    distance_ngo: float,
) -> dict[str, float]:
    """Score the Repurposing action (e.g., bread → croutons, fruit → jam)."""
    freshness_score = min(1.0, freshness / 40.0) if freshness >= 15 else 0.3
    time_score = min(1.0, hours_left / 8.0) if hours_left >= 2 else 0.2
    qty_score = min(1.0, quantity / 10.0) * 0.9  # moderate quantities ideal
    demand_score = demand * 0.6 + 0.3  # some baseline demand for repurposed goods
    logistics_score = 0.6  # requires kitchen facilities
    env_score = 0.85  # good waste reduction

    return {
        "freshness": freshness_score,
        "time_urgency": time_score,
        "quantity": qty_score,
        "demand": demand_score,
        "logistics": logistics_score,
        "environmental": env_score,
    }


def _score_animal_feed(
    freshness: float,
    hours_left: float,
    quantity: float,
    demand: float,
    distance_ngo: float,
) -> dict[str, float]:
    """Score the Animal Feed action."""
    freshness_score = 0.7 if freshness >= 10 else 0.4  # less strict
    time_score = 0.6 if hours_left >= 1 else 0.3
    qty_score = min(1.0, quantity / 15.0)  # larger quantities preferred
    demand_score = 0.5  # moderate, depends on local farms
    logistics_score = max(0.2, 1.0 - (distance_ngo / 50.0))  # farm distance
    env_score = 0.75

    return {
        "freshness": freshness_score,
        "time_urgency": time_score,
        "quantity": qty_score,
        "demand": demand_score,
        "logistics": logistics_score,
        "environmental": env_score,
    }


def _score_composting(
    freshness: float,
    hours_left: float,
    quantity: float,
    demand: float,
    distance_ngo: float,
) -> dict[str, float]:
    """Score the Composting action (last resort)."""
    freshness_score = 0.9  # always applicable
    time_score = 0.9  # no time pressure
    qty_score = 0.7  # any quantity
    demand_score = 0.2  # no commercial value
    logistics_score = 0.7  # needs composting facilities
    env_score = 0.5  # better than landfill, worse than feeding people

    return {
        "freshness": freshness_score,
        "time_urgency": time_score,
        "quantity": qty_score,
        "demand": demand_score,
        "logistics": logistics_score,
        "environmental": env_score,
    }


_SCORERS = {
    "Discount Sale": _score_discount_sale,
    "NGO Donation": _score_ngo_donation,
    "Repurposing": _score_repurposing,
    "Animal Feed": _score_animal_feed,
    "Composting": _score_composting,
}

_REASONING_TEMPLATES = {
    "Discount Sale": (
        "The food is still {freshness:.0f}% fresh with {hours:.1f} hours of shelf life "
        "remaining. A discounted sale recovers value while the item is still consumable "
        "and local demand supports quick turnover."
    ),
    "NGO Donation": (
        "With {freshness:.0f}% freshness and {hours:.1f} hours left, donating to a "
        "nearby NGO ({distance:.1f} km away) maximises social impact while the food "
        "is still safe for consumption."
    ),
    "Repurposing": (
        "At {freshness:.0f}% freshness, the food can be transformed into a different "
        "product (e.g., smoothies, soups, baked goods) extending its useful life and "
        "capturing residual value."
    ),
    "Animal Feed": (
        "The food at {freshness:.0f}% freshness is past its prime for human consumption "
        "but still nutritious as animal feed, diverting it from landfill."
    ),
    "Composting": (
        "With only {freshness:.0f}% freshness and limited remaining shelf life, "
        "composting is the most responsible disposal method, returning nutrients to "
        "the soil rather than sending waste to landfill."
    ),
}

_IMPACT_TEMPLATES = {
    "Discount Sale": "Prevents ~{kg:.1f} kg of food waste; recovers partial revenue.",
    "NGO Donation": "Feeds ~{people} people; diverts {kg:.1f} kg from landfill.",
    "Repurposing": "Transforms {kg:.1f} kg into new products; extends food lifecycle.",
    "Animal Feed": "Redirects {kg:.1f} kg as animal nutrition; zero landfill contribution.",
    "Composting": "Converts {kg:.1f} kg to compost; avoids methane from landfill decomposition.",
}


class DecisionEngine:
    """Multi-criteria food waste action decision engine."""

    async def decide(self, req: DecideActionRequest) -> DecideActionResponse:
        freshness = req.freshness_percentage
        hours_left = req.shelf_life_remaining_hours
        quantity = req.quantity_kg
        demand = req.nearby_demand if req.nearby_demand is not None else 0.5
        distance_ngo = req.distance_to_ngo_km if req.distance_to_ngo_km is not None else 10.0

        all_scores: List[ActionScore] = []

        for action_name, scorer in _SCORERS.items():
            criteria_scores = scorer(freshness, hours_left, quantity, demand, distance_ngo)

            weighted_total = sum(
                criteria_scores[c] * _WEIGHTS[c] for c in _WEIGHTS
            )
            weighted_total = clip_confidence(weighted_total)

            reasoning_template = _REASONING_TEMPLATES[action_name]
            reasoning = reasoning_template.format(
                freshness=freshness,
                hours=hours_left,
                distance=distance_ngo,
                kg=quantity,
            )

            all_scores.append(
                ActionScore(
                    action=action_name,
                    score=safe_round(weighted_total, 3),
                    reasoning=reasoning,
                )
            )

        # Sort by score descending
        all_scores.sort(key=lambda s: s.score, reverse=True)
        best = all_scores[0]

        # Environmental impact message
        estimated_people = max(1, int(quantity * 2.5))
        impact = _IMPACT_TEMPLATES[best.action].format(
            kg=quantity, people=estimated_people
        )

        return DecideActionResponse(
            recommended_action=best.action,
            confidence=best.score,
            reasoning=best.reasoning,
            all_scores=all_scores,
            environmental_impact=impact,
        )
