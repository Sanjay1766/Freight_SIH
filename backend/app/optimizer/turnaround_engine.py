"""
Objective C: Turnaround Timeline, Virtual Arrival Speed Engine & Triangular Backhaul Matcher
"""

def compute_virtual_arrival_optimization(
    best_vessel: dict,
    dest_port_key: str,
    distance_nm: int,
    bunker_price: float = 784.50
) -> dict:
    """
    Virtual Arrival Slow-Steaming Propulsion Law:
        Fuel_slow = Fuel_base * (V_slow / V_base)^3
    Absorbs anchorage waiting delays and reduces fuel burn and CO2 emissions.
    """
    base_speed = best_vessel.get("vessel", {}).get("speedKnots", 13.5)
    base_fuel_per_day = best_vessel.get("vessel", {}).get("bunkerConsumptionTonsPerDay", 35.0)
    waiting_days = 3.4 if dest_port_key == "Paradip" else (5.2 if dest_port_key == "Haldia" else 2.2)

    # Base sea transit
    base_sea_days = distance_nm / (base_speed * 24.0)
    base_fuel_burn = base_sea_days * base_fuel_per_day
    base_fuel_cost = base_fuel_burn * bunker_price
    demurrage_incurred = waiting_days * 22000.0

    # Calculate optimal slow speed to absorb 70% of waiting days
    target_sea_days = base_sea_days + (waiting_days * 0.70)
    optimal_speed = round(distance_nm / (target_sea_days * 24.0), 2)
    optimal_speed = max(10.2, min(base_speed, optimal_speed))

    # Slow steaming fuel burn via cubic propulsion law
    slow_fuel_per_day = base_fuel_per_day * ((optimal_speed / base_speed) ** 3)
    slow_fuel_burn = target_sea_days * slow_fuel_per_day
    slow_fuel_cost = slow_fuel_burn * bunker_price

    fuel_saved_tons = round(base_fuel_burn - slow_fuel_burn, 1)
    fuel_savings_usd = round(base_fuel_cost - slow_fuel_cost, 2)
    demurrage_avoided_usd = round(demurrage_incurred * 0.85, 2)
    net_economic_benefit = round(fuel_savings_usd + demurrage_avoided_usd, 2)
    co2_reduction_tons = round(fuel_saved_tons * 3.114, 1)

    # Speed curve comparison table
    speed_curve = []
    for spd in [10.5, 11.5, 12.5, 13.5, 14.2]:
        days = distance_nm / (spd * 24.0)
        daily_burn = base_fuel_per_day * ((spd / base_speed) ** 3)
        total_burn = days * daily_burn
        f_cost = total_burn * bunker_price
        co2 = total_burn * 3.114
        speed_curve.append({
            "speedKnots": spd,
            "transitDays": round(days, 1),
            "fuelBurnTons": round(total_burn, 1),
            "fuelCostUSD": round(f_cost, 0),
            "co2EmissionsTons": round(co2, 1)
        })

    return {
        "baseSpeedKnots": base_speed,
        "optimalSpeedKnots": optimal_speed,
        "baseTransitDays": round(base_sea_days, 1),
        "virtualArrivalDays": round(target_sea_days, 1),
        "waitingDaysAbsorbed": round(waiting_days * 0.70, 1),
        "fuelSavedTons": fuel_saved_tons,
        "fuelSavingsUSD": fuel_savings_usd,
        "demurrageAvoidedUSD": demurrage_avoided_usd,
        "netEconomicBenefitUSD": net_economic_benefit,
        "co2ReductionTons": co2_reduction_tons,
        "speedCurve": speed_curve
    }

def match_triangular_backhaul(
    dest_port_key: str,
    vessel_class: str = "Panamax"
) -> dict:
    """
    Pairs discharging vessel at Indian East Coast ports with Indian export cargoes
    to eliminate uncompensated ballast legs (deadheading).
    """
    backhaul_catalog = {
        "Paradip": {
            "originPort": "Paradip Port",
            "destinationPort": "Qingdao / Rizhao (China)",
            "commodity": "Indian High-Grade Iron Ore Pellets (64% Fe)",
            "cargoParcelTons": 75000 if vessel_class in ["Panamax", "Kamsarmax"] else 150000,
            "freightRatePerTon": 13.50,
            "grossRevenueUSD": 1012500,
            "ballastAvoidedNM": 2400,
            "netBenefitUSD": 265000,
            "status": "IMMEDIATE_MATCH_AVAILABLE",
            "laycanWindow": "48 Hours post discharge",
            "shipper": "Essar / Vedanta Bulk Logistics"
        },
        "Vizag": {
            "originPort": "Visakhapatnam Port",
            "destinationPort": "Jebel Ali / Bahrain (Middle East)",
            "commodity": "Calcined Alumina / Bauxite Residue",
            "cargoParcelTons": 55000,
            "freightRatePerTon": 16.20,
            "grossRevenueUSD": 891000,
            "ballastAvoidedNM": 1950,
            "netBenefitUSD": 185000,
            "status": "CONFIRMED_EN_ROUTE",
            "laycanWindow": "72 Hours post discharge",
            "shipper": "NALCO / Hindalco Alumina"
        },
        "Gopalpur": {
            "originPort": "Gopalpur Port",
            "destinationPort": "Penang / Singapore (SE Asia)",
            "commodity": "Ilmenite & Heavy Mineral Sands",
            "cargoParcelTons": 45000,
            "freightRatePerTon": 12.80,
            "grossRevenueUSD": 576000,
            "ballastAvoidedNM": 1600,
            "netBenefitUSD": 140000,
            "status": "STANDBY_CARGO",
            "laycanWindow": "24 Hours post discharge",
            "shipper": "IREL India Rare Earths"
        },
        "Dhamra": {
            "originPort": "Dhamra Port",
            "destinationPort": "Chittagong / Yangon",
            "commodity": "Finished Steel Coils & Slag",
            "cargoParcelTons": 60000,
            "freightRatePerTon": 11.50,
            "grossRevenueUSD": 690000,
            "ballastAvoidedNM": 1450,
            "netBenefitUSD": 210000,
            "status": "IMMEDIATE_MATCH_AVAILABLE",
            "laycanWindow": "36 Hours post discharge",
            "shipper": "Tata Steel / Jindal Logistics"
        }
    }

    match = backhaul_catalog.get(dest_port_key, backhaul_catalog["Paradip"])
    return match

