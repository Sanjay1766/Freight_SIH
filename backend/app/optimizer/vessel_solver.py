import numpy as np
import pulp
from backend.app.optimizer.ports_matrix import (
    EAST_COAST_PORT_MATRIX,
    ORIGIN_PORTS_MATRIX,
    CANDIDATE_VESSELS,
    get_nautical_distance
)

class MixedIntegerVesselSolver:
    """
    Mixed-Integer Linear Programming (MILP) solver implemented in PuLP.
    Determines optimal vessel class, parcel allocation, draft feasibility,
    Sagar-Sandheads/Haldia lightering requirements, IMO 2026 CII emissions,
    and contract duration comparisons (Spot vs 3V CoA vs 6-12M Term CoA).
    """

    def __init__(self):
        pass

    def solve(
        self,
        origin_port_key: str = "Indonesia_Samarinda",
        dest_port_key: str = "Paradip",
        cargo_qty_tons: int = 75000,
        bunker_price: float = 784.50,
        horizon_forecast: dict = None,
        theta_risk: float = 0.20,
        target_coa_cost: float = 21500.0
    ) -> dict:
        origin = ORIGIN_PORTS_MATRIX.get(origin_port_key, ORIGIN_PORTS_MATRIX["Indonesia_Samarinda"])
        dest = EAST_COAST_PORT_MATRIX.get(dest_port_key, EAST_COAST_PORT_MATRIX["Paradip"])
        distance_nm = get_nautical_distance(origin_port_key, dest_port_key)

        base_spot_rate = horizon_forecast.get("pointForecast", 22000) if horizon_forecast else 22000
        volatility_dollars = horizon_forecast.get("volatilityDollars", 850) if horizon_forecast else 850

        # Evaluate candidate fleet feasibility and logistics economics
        evaluated_vessels = []
        for v in CANDIDATE_VESSELS:
            is_class_allowed = v["vesselClass"] in dest["allowedClasses"]
            is_draft_ok = v["draft"] <= dest["maxDraft"]
            is_loa_ok = v["loa"] <= dest["maxLOA"]
            
            # Special Haldia lightering handling
            requires_lightering = False
            lightering_cost = 0.0
            lightering_tons = 0
            if dest_port_key == "Haldia" and v["draft"] > dest["maxDraft"]:
                requires_lightering = True
                lightering_tons = max(0, min(cargo_qty_tons, v["dwt"] - 22000))
                lightering_cost = lightering_tons * 7.50  # $7.50/ton barge & transshipment fee
                is_draft_ok = True  # Feasible via lightering at Sagar-Sandheads

            is_feasible = is_class_allowed and is_draft_ok and is_loa_ok

            # Voyage economics
            sea_days_one_way = distance_nm / (v["speedKnots"] * 24.0)
            round_trip_sea_days = sea_days_one_way * 2.0  # Ballast return
            load_days = cargo_qty_tons / origin["dailyLoadingRate"]
            discharge_days = cargo_qty_tons / dest["dailyDischargeRate"]
            waiting_days = dest["avgWaitingDays"]

            total_voyage_days = round_trip_sea_days + load_days + discharge_days + waiting_days

            # Charter Hire Cost
            vessel_daily_rate = int(round(base_spot_rate * v["dailyCharterRateMultiplier"]))
            charter_cost = vessel_daily_rate * total_voyage_days

            # Bunker Fuel Cost (Singapore/Origin VLSFO)
            sea_bunker_burn_tons = round_trip_sea_days * v["bunkerConsumptionTonsPerDay"]
            port_bunker_burn_tons = (load_days + discharge_days + waiting_days) * 3.5  # Aux generators
            total_bunker_burn = sea_bunker_burn_tons + port_bunker_burn_tons
            fuel_cost = total_bunker_burn * bunker_price

            # Port Tariffs & Demurrage
            port_tariffs = (origin["portTariffPerTon"] + dest["portTariffPerTon"]) * cargo_qty_tons
            demurrage_cost = waiting_days * dest["demurrageRatePerDay"]

            # IMO 2026 CII Carbon Calculation
            co2_emissions_tons = total_bunker_burn * 3.114
            cii_metric = (co2_emissions_tons * 1e6) / (v["dwt"] * distance_nm)
            carbon_levy_cost = co2_emissions_tons * 30.0  # $30/ton CO2 IMO proxy

            # Determine CII Grade
            if cii_metric < 4.2: cii_grade = "A"
            elif cii_metric < 5.5: cii_grade = "B"
            elif cii_metric < 6.8: cii_grade = "C"
            elif cii_metric < 8.2: cii_grade = "D"
            else: cii_grade = "E"

            total_cost = charter_cost + fuel_cost + port_tariffs + demurrage_cost + lightering_cost + carbon_levy_cost
            cost_per_ton = total_cost / max(1, cargo_qty_tons)

            penalty = 0 if is_feasible else 9999999
            score = cost_per_ton + penalty

            evaluated_vessels.append({
                "vessel": v,
                "isFeasible": is_feasible,
                "requiresLightering": requires_lightering,
                "lighteringTons": lightering_tons,
                "lighteringCost": round(lightering_cost, 2),
                "totalVoyageDays": round(total_voyage_days, 1),
                "seaDaysOneWay": round(sea_days_one_way, 1),
                "dailyCharterRate": vessel_daily_rate,
                "charterCost": round(charter_cost, 2),
                "fuelCost": round(fuel_cost, 2),
                "portTariffs": round(port_tariffs, 2),
                "demurrageCost": round(demurrage_cost, 2),
                "carbonLevyCost": round(carbon_levy_cost, 2),
                "co2Tons": round(co2_emissions_tons, 1),
                "ciiGrade": cii_grade,
                "totalCost": round(total_cost, 2),
                "costPerTon": round(cost_per_ton, 2),
                "score": score
            })

        # Select mathematically optimal vessel using PuLP / MILP formulation
        prob = pulp.LpProblem("Vessel_Allocation", pulp.LpMinimize)
        x = [pulp.LpVariable(f"x_{i}", cat="Binary") for i in range(len(evaluated_vessels))]
        
        # Objective: minimize score (cost + infeasibility penalties)
        prob += pulp.lpSum([evaluated_vessels[i]["score"] * x[i] for i in range(len(evaluated_vessels))])
        
        # Constraint: exactly one vessel must be assigned
        prob += pulp.lpSum(x) == 1

        prob.solve(pulp.PULP_CBC_CMD(msg=0))

        best_idx = 0
        for i in range(len(evaluated_vessels)):
            if pulp.value(x[i]) == 1:
                best_idx = i
                break

        best = evaluated_vessels[best_idx]

        # Prescriptive Decision Trigger (Fix Now vs Float vs CoA)
        # Condition: rate below target + volatility contained
        expected_rate = best["dailyCharterRate"]
        is_favorable_rate = expected_rate <= target_coa_cost
        is_low_vol = (volatility_dollars / max(1, expected_rate)) <= theta_risk

        if is_favorable_rate and is_low_vol:
            trigger_action = "FIX_COA_NOW"
            trigger_status = "OPTIMAL_FIX_WINDOW"
            trigger_color = "emerald"
            recommendation_text = f"Forward rate ${expected_rate:,}/d is below target ${target_coa_cost:,.0f}/d with low volatility ({(volatility_dollars/expected_rate*100):.1f}%). Recommended action: Lock in 3-voyage or 6-month CoA immediately."
        elif is_favorable_rate:
            trigger_action = "MONITOR_DIP"
            trigger_status = "VOLATILITY_ELEVATED"
            trigger_color = "amber"
            recommendation_text = f"Rate is favorable (${expected_rate:,}/d) but market volatility is elevated (±${volatility_dollars:,}/d). Fix prompt single voyage or stagger entry."
        else:
            trigger_action = "AVOID_SPOT_SPIKE"
            trigger_status = "HIGH_RATE_REGIME"
            trigger_color = "rose"
            recommendation_text = f"Spot rates elevated (${expected_rate:,}/d > target ${target_coa_cost:,.0f}/d). Delay fixing or utilize slow-steaming / backhaul pairing."

        # Objective A: Contract Duration Comparison (Spot vs 3-Voyage CoA vs 6-12M CoA)
        spot_voyage_cost = best["totalCost"]
        spot_per_ton = best["costPerTon"]

        coa_3v_discount = 0.055  # 5.5% volume & commitment discount
        coa_3v_per_ton = round(spot_per_ton * (1.0 - coa_3v_discount), 2)
        coa_3v_total_saving = round((spot_per_ton - coa_3v_per_ton) * cargo_qty_tons * 3, 2)

        coa_term_discount = 0.085  # 8.5% 6-12 month term CoA discount
        coa_term_per_ton = round(spot_per_ton * (1.0 - coa_term_discount), 2)
        coa_term_total_saving = round((spot_per_ton - coa_term_per_ton) * cargo_qty_tons * 8, 2)

        contract_comparison = [
            {
                "structure": "Single Spot Fixture (1 Voyage)",
                "ratePerTon": spot_per_ton,
                "voyageTotal": spot_voyage_cost,
                "totalSavings": 0,
                "riskProfile": "Full spot market exposure; high volatility risk",
                "recommended": trigger_action != "FIX_COA_NOW"
            },
            {
                "structure": "Short-Term CoA (3 Consecutive Voyages)",
                "ratePerTon": coa_3v_per_ton,
                "voyageTotal": round(spot_voyage_cost * 3 * (1.0 - coa_3v_discount), 2),
                "totalSavings": coa_3v_total_saving,
                "riskProfile": "Protected forward rates; 5.5% charter discount",
                "recommended": trigger_action == "FIX_COA_NOW"
            },
            {
                "structure": "Medium-Term Term CoA (6-12 Months / 8 Voyages)",
                "ratePerTon": coa_term_per_ton,
                "voyageTotal": round(spot_voyage_cost * 8 * (1.0 - coa_term_discount), 2),
                "totalSavings": coa_term_total_saving,
                "riskProfile": "Locked long-term baseline; 8.5% volume rebate; zero demurrage guarantee",
                "recommended": trigger_action == "FIX_COA_NOW"
            }
        ]

        return {
            "originPort": origin,
            "destinationPort": dest,
            "distanceNM": distance_nm,
            "bestSolution": best,
            "allEvaluatedVessels": evaluated_vessels,
            "decisionTrigger": {
                "action": trigger_action,
                "status": trigger_status,
                "color": trigger_color,
                "recommendation": recommendation_text,
                "expectedDailyRate": expected_rate,
                "volatilityDollars": volatility_dollars,
                "targetCoACost": target_coa_cost,
                "thetaRisk": theta_risk
            },
            "contractComparison": contract_comparison
        }

