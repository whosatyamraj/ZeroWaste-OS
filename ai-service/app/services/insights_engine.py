"""
ZeroWaste OS AI Service — Business Insights Engine.

Analyses waste data to generate actionable, natural-language insights
grouped by category and severity.  When real waste data is provided the
engine performs pattern recognition; otherwise it generates realistic
demo insights using business-ID-seeded randomness.

Insight categories:
  • waste_pattern   — recurring waste trends
  • cost_saving     — money-saving opportunities
  • operational     — process improvements
  • environmental   — sustainability metrics
"""

from __future__ import annotations

import logging
from collections import Counter, defaultdict
from datetime import datetime
from typing import Dict, List, Optional

import numpy as np

from app.schemas.insights import (
    Insight,
    InsightsRequest,
    InsightsResponse,
    WasteDataPoint,
)
from app.utils.helpers import deterministic_hash, parse_date, safe_round

logger = logging.getLogger("zerowaste.insights_engine")


class InsightsEngine:
    """Generates actionable waste-reduction insights."""

    async def analyse(self, req: InsightsRequest) -> InsightsResponse:
        if req.waste_data and len(req.waste_data) >= 3:
            insights, stats = self._analyse_real_data(req.waste_data)
        else:
            insights, stats = self._generate_demo_insights(req.business_id)

        return InsightsResponse(
            business_id=req.business_id,
            period=f"{req.start_date} to {req.end_date}",
            insights=insights,
            summary_stats=stats,
            generated_at=datetime.utcnow().isoformat() + "Z",
        )

    # ── Real data analysis ────────────────────────────────────────

    def _analyse_real_data(
        self, data: List[WasteDataPoint]
    ) -> tuple[List[Insight], Dict[str, float]]:
        insights: List[Insight] = []

        # Aggregate by food type
        type_waste: Dict[str, float] = defaultdict(float)
        type_count: Dict[str, int] = defaultdict(int)
        type_cost: Dict[str, float] = defaultdict(float)
        daily_totals: Dict[str, float] = defaultdict(float)
        reasons: List[str] = []

        for dp in data:
            type_waste[dp.food_type] += dp.quantity_kg
            type_count[dp.food_type] += 1
            type_cost[dp.food_type] += dp.cost or 0.0
            daily_totals[dp.date] += dp.quantity_kg
            if dp.reason:
                reasons.append(dp.reason.lower())

        total_waste = sum(type_waste.values())
        total_cost = sum(type_cost.values())
        daily_values = list(daily_totals.values())
        avg_daily = float(np.mean(daily_values)) if daily_values else 0.0

        # ── Top wasted food type ──
        if type_waste:
            worst_type = max(type_waste, key=type_waste.get)  # type: ignore[arg-type]
            worst_pct = (type_waste[worst_type] / total_waste * 100) if total_waste > 0 else 0
            severity = "critical" if worst_pct > 40 else ("warning" if worst_pct > 25 else "info")
            insights.append(
                Insight(
                    category="waste_pattern",
                    severity=severity,
                    title=f"'{worst_type}' is your highest waste category",
                    description=(
                        f"'{worst_type}' accounts for {worst_pct:.1f}% of total waste "
                        f"({type_waste[worst_type]:.1f} kg across {type_count[worst_type]} records). "
                        f"This is your biggest opportunity for waste reduction."
                    ),
                    metric=f"{worst_pct:.1f}% of total waste",
                    recommendation=(
                        f"Review production quantities for '{worst_type}'. "
                        f"Consider reducing batch sizes by 15-20% and monitoring demand more closely."
                    ),
                )
            )

        # ── Cost impact ──
        if total_cost > 0:
            severity = "critical" if total_cost > 5000 else ("warning" if total_cost > 1000 else "info")
            insights.append(
                Insight(
                    category="cost_saving",
                    severity=severity,
                    title=f"Waste costs: ₹{total_cost:,.0f} in this period",
                    description=(
                        f"Total financial loss from food waste is ₹{total_cost:,.0f}. "
                        f"At current rates, annual waste cost could reach ₹{total_cost * 12:,.0f}."
                    ),
                    metric=f"₹{total_cost:,.0f}",
                    recommendation=(
                        "Implement just-in-time preparation for high-waste items. "
                        "A 20% reduction would save ₹{:,.0f} per period.".format(total_cost * 0.2)
                    ),
                )
            )

        # ── Daily trend ──
        if len(daily_values) >= 3:
            trend = np.polyfit(range(len(daily_values)), daily_values, 1)[0]
            direction = "increasing" if trend > 0.1 else ("decreasing" if trend < -0.1 else "stable")
            severity = "warning" if direction == "increasing" else "info"
            insights.append(
                Insight(
                    category="waste_pattern",
                    severity=severity,
                    title=f"Daily waste trend is {direction}",
                    description=(
                        f"Average daily waste is {avg_daily:.1f} kg with a {direction} trend "
                        f"(slope: {trend:+.2f} kg/day). "
                        + (
                            "Action needed to reverse this upward trend."
                            if direction == "increasing"
                            else "Keep up the good work!" if direction == "decreasing"
                            else "Waste levels are consistent."
                        )
                    ),
                    metric=f"{avg_daily:.1f} kg/day avg",
                    recommendation=(
                        "Set daily waste targets and track progress. "
                        "Morning prep adjustments based on reservations can reduce overproduction."
                    ),
                )
            )

        # ── Reason analysis ──
        if reasons:
            reason_counts = Counter(reasons)
            top_reason, top_count = reason_counts.most_common(1)[0]
            insights.append(
                Insight(
                    category="operational",
                    severity="warning",
                    title=f"Most common waste reason: '{top_reason}'",
                    description=(
                        f"'{top_reason}' was cited {top_count} times out of {len(reasons)} records. "
                        f"Addressing this single cause could significantly reduce waste."
                    ),
                    metric=f"{top_count}/{len(reasons)} records",
                    recommendation=self._get_reason_recommendation(top_reason),
                )
            )

        # ── Environmental impact ──
        co2_saved_potential = total_waste * 2.5  # ~2.5 kg CO₂ per kg food waste
        insights.append(
            Insight(
                category="environmental",
                severity="info",
                title="Environmental impact of waste reduction",
                description=(
                    f"Reducing your {total_waste:.1f} kg of waste could prevent "
                    f"{co2_saved_potential:.0f} kg of CO₂ emissions. "
                    f"Food waste in landfills produces methane, a greenhouse gas "
                    f"25× more potent than CO₂."
                ),
                metric=f"{co2_saved_potential:.0f} kg CO₂ potential savings",
                recommendation=(
                    "Partner with local composting facilities for unavoidable waste. "
                    "Track your carbon footprint monthly."
                ),
            )
        )

        stats = {
            "total_waste_kg": safe_round(total_waste),
            "total_cost": safe_round(total_cost),
            "avg_daily_waste_kg": safe_round(avg_daily),
            "unique_food_types": float(len(type_waste)),
            "total_records": float(len(data)),
        }

        return insights, stats

    # ── Demo insights ─────────────────────────────────────────────

    def _generate_demo_insights(
        self, business_id: str
    ) -> tuple[List[Insight], Dict[str, float]]:
        seed = deterministic_hash(business_id)
        rng = np.random.RandomState(seed)

        daily_waste = safe_round(rng.uniform(8, 25))
        monthly_cost = safe_round(rng.uniform(15000, 45000))
        top_waste_pct = safe_round(rng.uniform(25, 50))

        insights = [
            Insight(
                category="waste_pattern",
                severity="critical",
                title="Weekend overproduction detected",
                description=(
                    f"Saturday and Sunday waste is {top_waste_pct:.0f}% higher than weekday "
                    f"average. Overproduction during assumed peak hours is the primary driver."
                ),
                metric=f"{top_waste_pct:.0f}% higher on weekends",
                recommendation=(
                    "Reduce weekend prep quantities by 15-20%. Use real-time demand "
                    "tracking to adjust mid-day."
                ),
            ),
            Insight(
                category="cost_saving",
                severity="warning",
                title=f"Estimated monthly waste cost: ₹{monthly_cost:,.0f}",
                description=(
                    f"Based on industry benchmarks and your business profile, estimated "
                    f"monthly food waste cost is ₹{monthly_cost:,.0f}. This could be "
                    f"reduced by 25-35% with data-driven ordering."
                ),
                metric=f"₹{monthly_cost:,.0f}/month",
                recommendation=(
                    "Implement AI-driven demand forecasting (available in this dashboard) "
                    "to align procurement with actual demand."
                ),
            ),
            Insight(
                category="operational",
                severity="warning",
                title="Morning prep window can be optimised",
                description=(
                    "Industry data suggests that adjusting preparation start times by "
                    "30-60 minutes closer to service can reduce pre-service waste by up to 20%."
                ),
                metric="Up to 20% reduction",
                recommendation=(
                    "Shift bulk preparation 30 min closer to opening. "
                    "Prepare high-waste items in smaller batches throughout the day."
                ),
            ),
            Insight(
                category="environmental",
                severity="info",
                title="Your waste reduction potential",
                description=(
                    f"At ~{daily_waste:.0f} kg/day average waste, your business could prevent "
                    f"{daily_waste * 2.5 * 30:.0f} kg of CO₂ emissions per month by "
                    f"eliminating avoidable waste. That's equivalent to planting "
                    f"{max(1, int(daily_waste * 2.5 * 30 / 22))} trees."
                ),
                metric=f"{daily_waste * 2.5 * 30:.0f} kg CO₂/month",
                recommendation="Start with your top 3 waste items and set a 10% reduction target.",
            ),
            Insight(
                category="waste_pattern",
                severity="info",
                title="Dairy products show shortest viable window",
                description=(
                    "Dairy items (paneer, curd, milk) typically have the shortest usable "
                    "window. Prioritise FIFO (first-in-first-out) rotation for dairy stock."
                ),
                metric="2-4 hour safe window",
                recommendation=(
                    "Order dairy in smaller, more frequent batches. "
                    "Use the food-safety scanner to monitor freshness."
                ),
            ),
        ]

        stats = {
            "total_waste_kg": safe_round(daily_waste * 30),
            "total_cost": safe_round(monthly_cost),
            "avg_daily_waste_kg": daily_waste,
            "unique_food_types": 8.0,
            "total_records": 0.0,
        }

        return insights, stats

    @staticmethod
    def _get_reason_recommendation(reason: str) -> str:
        """Return a targeted recommendation based on the waste reason."""
        reason = reason.lower()
        if "spoil" in reason or "expir" in reason:
            return (
                "Improve FIFO inventory rotation. Check storage temperatures daily. "
                "Consider smaller, more frequent orders."
            )
        if "overproduc" in reason or "excess" in reason:
            return (
                "Use demand forecasting to right-size production. "
                "Implement mid-day production adjustments based on actual sales pace."
            )
        if "plate" in reason or "return" in reason or "leftover" in reason:
            return (
                "Consider reducing portion sizes or offering half-portion options. "
                "Plate waste often indicates oversized servings."
            )
        if "damage" in reason or "broken" in reason:
            return (
                "Review handling and storage procedures. "
                "Inspect deliveries immediately and reject damaged goods."
            )
        return (
            "Investigate this waste category further. "
            "Staff interviews and process mapping can reveal root causes."
        )
