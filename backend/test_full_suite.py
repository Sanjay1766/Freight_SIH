import os
import sys

backend_dir = os.path.dirname(os.path.abspath(__file__))

PROJECT_ROOT = os.path.dirname(backend_dir)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.optimizer.vessel_solver import MixedIntegerVesselSolver
from backend.app.optimizer.turnaround_engine import compute_virtual_arrival_optimization, match_triangular_backhaul
from backend.app.optimizer.arbitrage import compute_multi_origin_arbitrage
from backend.app.optimizer.scheduler import optimize_multi_voyage_schedule
from backend.app.optimizer.monte_carlo import run_monte_carlo_stress_test
from backend.app.optimizer.ports_matrix import EAST_COAST_PORT_MATRIX, ORIGIN_PORTS_MATRIX, CANDIDATE_VESSELS

def test_full_suite():
    print("=== TEST 1: PuLP Mixed-Integer Vessel Allocation Solver ===")
    solver = MixedIntegerVesselSolver()
    
    # Test Normal Paradip allocation
    res_paradip = solver.solve(
        origin_port_key="Indonesia_Samarinda",
        dest_port_key="Paradip",
        cargo_qty_tons=75000,
        bunker_price=629.0,
        horizon_forecast={"pointForecast": 22000, "volatilityDollars": 850}
    )
    print("Paradip Optimal Vessel:", res_paradip["bestSolution"]["vessel"]["name"], "Class:", res_paradip["bestSolution"]["vessel"]["vesselClass"])
    print("Cost per ton:", f"${res_paradip['bestSolution']['costPerTon']}/MT")
    print("CII Grade:", res_paradip["bestSolution"]["ciiGrade"])
    assert res_paradip["bestSolution"]["isFeasible"] == True

    # Test Haldia Draft Lightering
    res_haldia = solver.solve(
        origin_port_key="Indonesia_Samarinda",
        dest_port_key="Haldia",
        cargo_qty_tons=75000,
        bunker_price=629.0,
        horizon_forecast={"pointForecast": 22000, "volatilityDollars": 850}
    )
    print("Haldia Lightering Required:", res_haldia["bestSolution"]["requiresLightering"])
    print("Haldia Lightering Tons:", res_haldia["bestSolution"]["lighteringTons"])
    print("Contract comparison structures:", len(res_haldia["contractComparison"]))
    assert len(res_haldia["contractComparison"]) == 3

    print("\n=== TEST 2: Virtual Arrival Slow-Steaming & Cubic Propulsion Law ===")
    v_arr = compute_virtual_arrival_optimization(
        best_vessel=res_paradip["bestSolution"],
        dest_port_key="Paradip",
        distance_nm=2520,
        bunker_price=629.0
    )
    print("Base Speed:", v_arr["baseSpeedKnots"], "knots -> Optimal Slow Speed:", v_arr["optimalSpeedKnots"], "knots")
    print("Fuel Saved:", v_arr["fuelSavedTons"], "tons -> Net Benefit:", f"${v_arr['netEconomicBenefitUSD']:,.2f}")
    assert v_arr["netEconomicBenefitUSD"] > 0

    print("\n=== TEST 3: Triangular Backhaul Route Matcher ===")
    backhaul = match_triangular_backhaul("Paradip", "Panamax")
    print("Paradip Backhaul Commodity:", backhaul["commodity"])
    print("Gross Revenue:", f"${backhaul['grossRevenueUSD']:,}")
    print("Net Benefit:", f"${backhaul['netBenefitUSD']:,}")
    assert backhaul["netBenefitUSD"] > 100000

    print("\n=== TEST 4: Multi-Origin Landed Cost & Energy Yield Arbitrage ===")
    arbitrage = compute_multi_origin_arbitrage(dest_port_key="Paradip", cargo_qty_tons=75000, bunker_price=629.0)
    print(f"Evaluated {len(arbitrage)} global origins:")
    for a in arbitrage:
        print(f"  - {a['country']} ({a['commodity']}): FOB ${a['fobPriceUSD']}/MT | Freight ${a['freightCostPerTon']}/MT | Landed ${a['landedCostPerTon']}/MT | Energy ${a['energyCostPerGJ']}/GJ")
    assert len(arbitrage) >= 5

    print("\n=== TEST 5: Master Multi-Voyage Laycan Scheduler ===")
    sample_fc = [{"pointForecast": 22000 + i * 50} for i in range(90)]
    schedule = optimize_multi_voyage_schedule(sample_fc, target_coa_cost=21500.0)
    print("Total Scheduled Voyages:", schedule["totalVoyages"])
    print("Portfolio Savings vs Spot:", f"${schedule['netPortfolioSavingsUSD']:,} ({schedule['savingsPercentage']}%)")
    assert schedule["totalVoyages"] == 5
    assert schedule["targetCoACost"] == 21500.0
    assert all(v["targetStatus"] in {"WITHIN_TARGET", "DEFER_TARGET_EXCEEDED"} for v in schedule["voyages"])

    print("\n=== TEST 6: 1,000-Path Monte Carlo Stochastic Simulation ===")
    mc = run_monte_carlo_stress_test(spot_rate=22000, daily_vol=0.0155, cargo_qty_tons=75000, bunker_price=629.0, iterations=1000)
    print(f"Monte Carlo Mean Cost: ${mc['meanLandedCostPerTon']}/MT | 95% VaR: ${mc['var95CostPerTon']}/MT | 99% VaR: ${mc['var99CostPerTon']}/MT")
    print(f"Generated {len(mc['histogram'])} probability density histogram bins.")
    assert len(mc['histogram']) == 15
    assert mc['var99CostPerTon'] >= mc['var95CostPerTon'] >= mc['meanLandedCostPerTon']

    print("\nALL BACKEND PRESCRIPTIVE OPTIMIZERS & SOLVERS TESTED AND PASSED!")

if __name__ == "__main__":
    test_full_suite()
