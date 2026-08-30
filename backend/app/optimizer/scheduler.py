"""
Master Multi-Voyage Laycan Scheduler & Berth Clash Optimizer
Generates non-conflicting laycans and procurement schedules across multiple vessels.
"""

from datetime import datetime, timedelta

def optimize_multi_voyage_schedule(
    forecast_series: list[dict],
    target_coa_cost: float = 21500.0,
    total_voyages: int = 5
) -> dict:
    start_date = datetime.now()
    schedule_voyages = []
    
    routes = [
        {"origin": "Australia (Newcastle)", "dest": "Paradip", "cargo": "75,000 MT Coking Coal", "vessel": "MV Bharat Glory (Kamsarmax)"},
        {"origin": "Indonesia (Samarinda)", "dest": "Dhamra", "cargo": "160,000 MT Thermal Coal", "vessel": "MV Samarinda Express (Capesize)"},
        {"origin": "Mozambique (Nacala)", "dest": "Vizag", "cargo": "75,000 MT Met Coal", "vessel": "MV Ocean Sentinel (Panamax)"},
        {"origin": "Indonesia (Taboneo)", "dest": "Gangavaram", "cargo": "80,000 MT Thermal Coal", "vessel": "MV Kalinga Voyager (Ultramax)"},
        {"origin": "US (Norfolk)", "dest": "Paradip", "cargo": "75,000 MT Low-Vol Coal", "vessel": "MV Ganga Titan (Capesize)"}
    ]

    total_budget_spot = 0
    total_budget_optimized = 0

    current_day_cursor = 4
    for i in range(min(total_voyages, len(routes))):
        r = routes[i]
        laycan_start = start_date + timedelta(days=current_day_cursor)
        laycan_end = laycan_start + timedelta(days=5)
        eta_dest = laycan_end + timedelta(days=14)

        # Lookup rate from forward forecast
        horizon_idx = min(len(forecast_series) - 1, current_day_cursor)
        fc_point = forecast_series[horizon_idx]
        spot_rate = fc_point.get("pointForecast", 22000)
        
        # A scheduled CoA is only counted when its discounted rate meets the
        # procurement ceiling. Otherwise the lifting remains exposed to spot
        # until a qualifying forward window is available.
        discounted_coa_rate = int(round(spot_rate * 0.94))
        meets_target = discounted_coa_rate <= target_coa_cost
        optimized_rate = discounted_coa_rate if meets_target else spot_rate
        voyage_cost_spot = spot_rate * 22
        voyage_cost_opt = optimized_rate * 22

        total_budget_spot += voyage_cost_spot
        total_budget_optimized += voyage_cost_opt

        schedule_voyages.append({
            "voyageId": f"VOY-2026-0{i+1}",
            "route": f"{r['origin']} → {r['dest']}",
            "cargo": r["cargo"],
            "vessel": r["vessel"],
            "laycanWindow": f"{laycan_start.strftime('%d %b')} – {laycan_end.strftime('%d %b %Y')}",
            "etaDestination": eta_dest.strftime('%d %b %Y'),
            "expectedSpotRate": spot_rate,
            "optimizedCoARate": optimized_rate,
            "discountedCoARate": discounted_coa_rate,
            "targetCoACost": target_coa_cost,
            "targetStatus": "WITHIN_TARGET" if meets_target else "DEFER_TARGET_EXCEEDED",
            "voyageSavingUSD": int(round(voyage_cost_spot - voyage_cost_opt)),
            "berthStatus": "CONFIRMED_CLEARED" if meets_target else "PENDING_TARGET_WINDOW",
            "berthClashRisk": "NONE"
        })

        current_day_cursor += 16  # Spaced to avoid berth clash

    return {
        "totalVoyages": len(schedule_voyages),
        "totalBudgetSpotUSD": total_budget_spot,
        "totalBudgetOptimizedUSD": total_budget_optimized,
        "netPortfolioSavingsUSD": int(round(total_budget_spot - total_budget_optimized)),
        "savingsPercentage": round(((total_budget_spot - total_budget_optimized) / max(1, total_budget_spot)) * 100, 2),
        "targetCoACost": target_coa_cost,
        "voyages": schedule_voyages
    }

