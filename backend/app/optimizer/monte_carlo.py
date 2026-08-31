"""
Monte Carlo Stochastic Stress-Testing Engine (1,000 - 5,000 Iterations)
Fully vectorized NumPy implementation with input guardrails and sub-millisecond execution.
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
    # Input Guardrails & Bounded Validation
    spot_rate = max(1000.0, float(spot_rate))
    daily_vol = max(0.001, min(0.20, float(daily_vol)))
    cargo_qty_tons = max(1000, int(cargo_qty_tons))
    bunker_price = max(100.0, float(bunker_price))
    iterations = max(100, min(10000, int(iterations)))

    np.random.seed(42)

    voyage_days = 22.0
    drift = 0.02
    sigma = daily_vol * np.sqrt(365.0)

    # 1. Vectorized Geometric Brownian Motion rate paths
    z = np.random.normal(0.0, 1.0, iterations)
    time_factor = voyage_days / 365.0
    simulated_rates = spot_rate * np.exp((drift - 0.5 * sigma**2) * time_factor + sigma * np.sqrt(time_factor) * z)

    # 2. Vectorized Bunker fuel shocks (+- 15% log-normal)
    bunker_shocks = bunker_price * (1.0 + np.random.normal(0.0, 0.08, iterations))
    bunker_shocks = np.clip(bunker_shocks, bunker_price * 0.5, bunker_price * 2.0)

    # 3. Vectorized Total Voyage Costs & Landed Cost Per Ton
    voyage_costs = (simulated_rates * voyage_days) + (bunker_shocks * 28.0 * voyage_days * 0.5) + (4.0 * cargo_qty_tons)
    arr = voyage_costs / cargo_qty_tons

    # 4. Percentiles & Parametric Metrics
    mean_cost = float(np.mean(arr))
    p5 = float(np.percentile(arr, 5))
    p50 = float(np.median(arr))
    p95 = float(np.percentile(arr, 95))
    p99 = float(np.percentile(arr, 99))

    # 5. Probability Density Histogram
    hist, bin_edges = np.histogram(arr, bins=15, density=True)
    histogram_bins = []
    for i in range(len(hist)):
        bin_center = (bin_edges[i] + bin_edges[i+1]) / 2.0
        bin_width = bin_edges[i+1] - bin_edges[i]
        histogram_bins.append({
            "binRange": f"${bin_edges[i]:.1f}–${bin_edges[i+1]:.1f}",
            "costPerTon": round(float(bin_center), 1),
            "density": round(float(hist[i]), 4),
            "frequencyPct": round(float(hist[i] * bin_width * 100.0), 1)
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
