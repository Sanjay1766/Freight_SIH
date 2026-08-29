import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from backend.app.models.garch_model import GarchVolatilityModel
from backend.app.models.ml_regressor import CatBoostFreightRegressor, ROUTE_RISK_FACTORS

class Tier2StackedEnsemble:
    def __init__(self, garch_model: GarchVolatilityModel, ml_regressor: CatBoostFreightRegressor):
        self.garch_model = garch_model
        self.ml_regressor = ml_regressor

    def generate_full_forecast(
        self,
        latest_features: pd.Series,
        last_row: dict,
        max_horizon: int = 90,
        scenario_modifiers: dict = None
    ) -> dict:
        modifiers = scenario_modifiers or {}
        origin_key = modifiers.get("originPortKey", "Indonesia_Samarinda")
        dest_key = modifiers.get("destinationPortKey", "Paradip")
        regime = modifiers.get("regime", "normal")
        bunker_offset = modifiers.get("bunkerOffset", 0.0)

        route_profile = ROUTE_RISK_FACTORS.get(origin_key, ROUTE_RISK_FACTORS["Indonesia_Samarinda"])
        vol_beta = route_profile["volBeta"]

        current_rate = float(last_row.get("spot_freight_rate", 22000.0))
        last_date_str = str(last_row.get("date", "2026-08-28"))
        if "T" in last_date_str:
            last_date_str = last_date_str.split("T")[0]
        try:
            last_date = datetime.strptime(last_date_str, "%Y-%m-%d")
        except ValueError:
            last_date = datetime.now()

        ml_points = self.ml_regressor.predict_multi_horizon(
            latest_features=latest_features,
            last_row=last_row,
            max_horizon=max_horizon,
            scenario_modifiers=modifiers
        )

        vol_cones = self.garch_model.forecast_volatility_cone(
            max_horizon=max_horizon,
            current_rate=current_rate,
            vol_beta=vol_beta
        )

        forecast_series = []
        for h in range(1, max_horizon + 1):
            ml_pred = ml_points[h - 1]
            vol_info = vol_cones[h - 1]
            vol_dollars = vol_info["volatility_dollars"]

            garch_weight = max(0.12, 0.70 - (h / max_horizon) * 0.58)
            ml_weight = 1.0 - garch_weight

            blended_point = int(round(garch_weight * current_rate + ml_weight * ml_pred))
            upper_95 = int(round(blended_point + 1.96 * vol_dollars))
            lower_95 = max(7500, int(round(blended_point - 1.96 * vol_dollars)))

            target_date = (last_date + timedelta(days=h)).strftime("%Y-%m-%d")

            if blended_point < current_rate * 0.96 and vol_dollars < current_rate * 0.15:
                entry_rating = "OPTIMAL_ENTRY_WINDOW"
                entry_score = 5
            elif blended_point < current_rate * 0.98:
                entry_rating = "GOOD_ENTRY"
                entry_score = 4
            elif blended_point > current_rate * 1.08 or vol_dollars > current_rate * 0.28:
                entry_rating = "HIGH_RISK_SPIKE"
                entry_score = 1
            elif blended_point > current_rate * 1.03:
                entry_rating = "ELEVATED_RATE"
                entry_score = 2
            else:
                entry_rating = "NEUTRAL"
                entry_score = 3

            forecast_series.append({
                "horizon": h,
                "date": target_date,
                "pointForecast": blended_point,
                "upper95": upper_95,
                "lower95": lower_95,
                "volatilityDollars": int(round(vol_dollars)),
                "garchWeight": round(garch_weight, 2),
                "mlWeight": round(ml_weight, 2),
                "entryRating": entry_rating,
                "entryScore": entry_score
            })

        entry_windows = self._find_optimal_market_entry_windows(forecast_series, current_rate)

        garch_summary = self.garch_model.get_summary()
        daily_vol = np.sqrt(self.garch_model.last_conditional_variance)
        risk_analysis = self._compute_early_warning_risk_matrix(
            forecast_series=forecast_series,
            last_row=last_row,
            regime=regime,
            origin_key=origin_key,
            dest_key=dest_key,
            daily_vol=daily_vol,
            bunker_offset=bunker_offset
        )

        return {
            "forecast": forecast_series,
            "volatilityStats": {
                "dailyVol": garch_summary["daily_vol_pct"],
                "annualVol": garch_summary["annual_vol_pct"],
                "conditionalVariance": garch_summary["last_conditional_variance"],
                "omega": garch_summary["omega"],
                "alpha": garch_summary["alpha"],
                "beta": garch_summary["beta"],
                "persistence": garch_summary["persistence"]
            },
            "entryWindows": entry_windows,
            "riskAnalysis": risk_analysis
        }

    def _find_optimal_market_entry_windows(self, forecast: list[dict], current_rate: float) -> list[dict]:
        windows = []
        short_term = forecast[:15]
        mid_term = forecast[15:45]
        long_term = forecast[45:90]

        def find_best_slice(slice_data, label, contract_type):
            if not slice_data:
                return None
            sorted_slice = sorted(slice_data, key=lambda x: x["pointForecast"] + x["volatilityDollars"] * 0.4)
            best = sorted_slice[0]
            savings = int(round(current_rate - best["pointForecast"]))
            return {
                "windowLabel": label,
                "contractType": contract_type,
                "optimalDay": best["horizon"],
                "targetDate": best["date"],
                "expectedRate": best["pointForecast"],
                "lower95": best["lower95"],
                "upper95": best["upper95"],
                "volatility": best["volatilityDollars"],
                "savingsVsCurrentRate": savings,
                "rating": best["entryRating"],
                "actionAdvice": f"Wait until Day {best['horizon']} ({best['date']}) to fix; save ~${savings:,}/day vs today's spot." if savings > 0 else f"Fix within next 3 days before rates drift higher towards ${best['upper95']:,}/day."
            }

        w1 = find_best_slice(short_term, "Short-Term Window (1-15 Days)", "Spot / 1-Voyage Prompt")
        w2 = find_best_slice(mid_term, "Mid-Term Window (16-45 Days)", "3-Voyage CoA Fixture")
        w3 = find_best_slice(long_term, "Long-Term Forward Window (46-90 Days)", "6-12 Month Term CoA")

        if w1: windows.append(w1)
        if w2: windows.append(w2)
        if w3: windows.append(w3)
        return windows

    def _compute_early_warning_risk_matrix(
        self,
        forecast_series: list[dict],
        last_row: dict,
        regime: str,
        origin_key: str,
        dest_key: str,
        daily_vol: float,
        bunker_offset: float
    ) -> dict:
        current_bunker = float(last_row.get("bunker_fuel", 635.0)) + bunker_offset

        congestion_severity = "LOW"
        congestion_score = 24
        congestion_advice = "Normal berthing queue across East Coast terminals."

        if dest_key == "Haldia":
            congestion_severity = "CRITICAL"
            congestion_score = 88
            congestion_advice = "Haldia estuarine lock gate backlog; mandatory Sagar-Sandheads lightering advised."
        elif dest_key == "Paradip" and regime == "monsoon":
            congestion_severity = "HIGH"
            congestion_score = 78
            congestion_advice = "Monsoon swell causing 3.8-day waiting time. Divert Capesize to Dhamra or Gangavaram."
        elif regime == "monsoon":
            congestion_severity = "ELEVATED"
            congestion_score = 65
            congestion_advice = "Monsoon delays active in Bay of Bengal; prepare for 2-3 extra waiting days."

        weather_risk_level = "MODERATE"
        weather_score = 42
        if regime == "monsoon":
            weather_risk_level = "SEVERE"
            weather_score = 85
        elif regime == "disruption":
            weather_risk_level = "HIGH"
            weather_score = 72

        bunker_risk_level = "MODERATE"
        bunker_score = min(95, max(15, int(round(((current_bunker - 500.0) / 400.0) * 100))))
        if current_bunker > 750:
            bunker_risk_level = "CRITICAL"
        elif current_bunker > 670:
            bunker_risk_level = "HIGH"

        chokepoint_risk = "LOW"
        chokepoint_score = 20
        if "Russia_Taman" in origin_key:
            chokepoint_risk = "HIGH"
            chokepoint_score = 82
        elif "US_Norfolk" in origin_key:
            chokepoint_risk = "MODERATE"
            chokepoint_score = 55

        avg_rate = forecast_series[14]["pointForecast"] if len(forecast_series) > 14 else float(last_row.get("spot_freight_rate", 22000.0))
        turnaround_days = 20
        total_budget = int(round(avg_rate * turnaround_days))

        var95_pct = round(float(1.645 * daily_vol * np.sqrt(turnaround_days) * 100.0), 1)
        var99_pct = round(float(2.326 * daily_vol * np.sqrt(turnaround_days) * 100.0), 1)
        var95_dollars = int(round(total_budget * (var95_pct / 100.0)))
        var99_dollars = int(round(total_budget * (var99_pct / 100.0)))

        composite_score = int(round(
            (congestion_score * 0.30) + (weather_score * 0.25) + (bunker_score * 0.25) + (chokepoint_score * 0.20)
        ))

        overall_status = "NORMAL"
        if composite_score > 75:
            overall_status = "CRITICAL_RISK"
        elif composite_score > 55:
            overall_status = "ELEVATED_RISK"
        elif composite_score > 35:
            overall_status = "MODERATE_RISK"

        return {
            "compositeRiskScore": composite_score,
            "overallRiskStatus": overall_status,
            "congestion": {
                "score": congestion_score,
                "severity": congestion_severity,
                "advice": congestion_advice
            },
            "weather": {
                "score": weather_score,
                "level": weather_risk_level,
                "advisory": "Tropical depressions active in Bay of Bengal; expect speed reductions." if weather_risk_level == "SEVERE" else "Sea state normal; winds <15 knots."
            },
            "bunker": {
                "score": bunker_score,
                "level": bunker_risk_level,
                "currentPrice": round(current_bunker, 1),
                "impact": f"+${int(round((current_bunker - 600.0) * 14.5))}/day rate sensitivity"
            },
            "chokepoint": {
                "score": chokepoint_score,
                "level": chokepoint_risk,
                "lane": origin_key
            },
            "varMetrics": {
                "totalBudgetExposure": total_budget,
                "var95Percent": var95_pct,
                "var95Dollars": var95_dollars,
                "var99Percent": var99_pct,
                "var99Dollars": var99_dollars
            }
        }
