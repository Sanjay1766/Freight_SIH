"""
Multi-Origin Landed Cost & Energy Yield Arbitrage Comparator
Compares landed $/MT and $/GJ delivered across all 5 Global Origins to Indian East Coast Ports.
"""

from backend.app.optimizer.ports_matrix import ORIGIN_PORTS_MATRIX, get_nautical_distance

def compute_multi_origin_arbitrage(
    dest_port_key: str = "Paradip",
    cargo_qty_tons: int = 75000,
    bunker_price: float = 784.50,
    spot_daily_rate: float = 22000.0
) -> list[dict]:
    results = []

    for orig_key, orig in ORIGIN_PORTS_MATRIX.items():
        dist_nm = get_nautical_distance(orig_key, dest_port_key)
        fob_price = orig["fobBenchmarkPriceUSD"]
        caloric_value_kcal = orig["caloricValueKcal"]

        # Freight estimation: speed 13.5 kn, bunker burn 28 MT/day
        sea_days_round_trip = (dist_nm / (13.5 * 24.0)) * 2.0
        load_days = cargo_qty_tons / orig["dailyLoadingRate"]
        disch_days = cargo_qty_tons / 45000.0
        voyage_days = sea_days_round_trip + load_days + disch_days + 2.5

        charter_cost = spot_daily_rate * voyage_days
        bunker_burn = sea_days_round_trip * 28.0 + (load_days + disch_days) * 3.5
        bunker_cost = bunker_burn * bunker_price
        port_tariffs = (orig["portTariffPerTon"] + 4.0) * cargo_qty_tons

        total_freight_cost = charter_cost + bunker_cost + port_tariffs
        freight_per_ton = round(total_freight_cost / cargo_qty_tons, 2)
        landed_cost_per_ton = round(fob_price + freight_per_ton, 2)

        # Energy Yield: $/GJ = (Landed Cost $/MT) / (kcal/kg * 0.004184 GJ/MT)
        gj_per_ton = caloric_value_kcal * 0.004184
        cost_per_gj = round(landed_cost_per_ton / gj_per_ton, 2)

        results.append({
            "originKey": orig_key,
            "originName": orig["name"],
            "country": orig["country"],
            "commodity": orig["primaryCommodity"],
            "fobPriceUSD": fob_price,
            "distanceNM": dist_nm,
            "transitDaysOneWay": round(dist_nm / (13.5 * 24.0), 1),
            "freightCostPerTon": freight_per_ton,
            "landedCostPerTon": landed_cost_per_ton,
            "caloricValueKcal": caloric_value_kcal,
            "energyCostPerGJ": cost_per_gj,
            "chokepoints": orig["chokepoints"]
        })

    # Sort by delivered cost per GJ (energy efficiency)
    results.sort(key=lambda x: x["energyCostPerGJ"])
    return results

