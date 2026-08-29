"""
Monte Carlo Stochastic Stress-Testing Engine (1,000 Iterations)
Computes probability density function and Value-at-Risk under freight volatility and bunker shocks.
"""

import numpy as np

def run_monte_carlo_stress_test(
    spot_rate: float = 22000.0,
    daily_vol: float = 0.0155,
    cargo_qty_tons: int = 75000,
    bunker_price: float = 629.0,
    iterations: int = 1000
) -> dict:
    np.random.seed(42)

    voyage_days = 22
    # Simulate 1,000 geometric Brownian motion rate paths over voyage duration
    dt = 1.0 / 365.0
    drift = 0.02
    sigma = daily_vol * np.sqrt(365.0)

    # Final rates across 1,000 paths
    z = np.random.normal(0, 1, iterations)
    simulated_rates = spot_rate * np.exp((drift - 0.5 * sigma**2) * (voyage_days / 365.0) + sigma * np.sqrt(voyage_days / 365.0) * z)

    # Bunker fuel shock variations (+- 15%)
    bunker_shocks = bunker_price * (1.0 + np.random.normal(0, 0.08, iterations))

    # Landed freight cost per ton for each iteration
    landed_costs_per_ton = []
    for r, b in zip(simulated_rates, bunker_shocks):
        voyage_cost = (r * voyage_days) + (b * 28.0 * voyage_days * 0.5) + (4.0 * cargo_qty_tons)
        cost_per_ton = voyage_cost / cargo_qty_tons
        landed_costs_per_ton.append(cost_per_ton)

    arr = np.array(landed_costs_per_ton)
    mean_cost = float(np.mean(arr))
    p5 = float(np.percentile(arr, 5))
    p50 = float(np.median(arr))
    p95 = float(np.percentile(arr, 95))
    p99 = float(np.percentile(arr, 99))

    # Generate 15-bin histogram for probability density chart
    hist, bin_edges = np.histogram(arr, bins=15, density=True)
    histogram_bins = []
    for i in range(len(hist)):
        bin_center = (bin_edges[i] + bin_edges[i+1]) / 2.0
        histogram_bins.append({
            "binRange": f"${bin_edges[i]:.1f}–${bin_edges[i+1]:.1f}",
            "costPerTon": round(bin_center, 1),
            "density": round(float(hist[i]), 4),
            "frequencyPct": round(float(hist[i] * (bin_edges[i+1] - bin_edges[i]) * 100), 1)
        })

    return {
        "iterations": iterations,
        "meanLandedCostPerTon": round(mean_cost, 2),
        "medianCostPerTon": round(p50, 2),
        "var95CostPerTon": round(p95, 2),
        "var99CostPerTon": round(p99, 2),
        "bestCaseP5": round(p5, 2),
        "worstCaseBudgetExposureUSD": int(round(p99 * cargo_qty_tons)),
        "meanBudgetExposureUSD": int(round(mean_cost * cargo_qty_tons)),
        "histogram": histogram_bins
    }

