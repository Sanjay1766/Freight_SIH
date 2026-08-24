# OceanPulse: Intelligent Freight Rate Forecasting & Prescriptive Procurement Engine

**OceanPulse** is an enterprise-grade freight intelligence and chartering optimization platform designed for bulk commodity logistics — specifically Indian seaborne coal imports across East Coast port gateways (**Dhamra, Paradeep, Haldia, Visakhapatnam, and Krishnapatnam**).

The platform addresses the critical challenge of ocean freight rate volatility, port congestion delays, and physical vessel/port constraint mismatches by combining GARCH econometric risk modeling, CatBoost machine learning forecasting, Denton-Cholette mixed-frequency disaggregation, SHAP feature explainability, and PuLP-style constrained vessel allocation.

---

## 🎯 What the Prototype Does

OceanPulse operates an end-to-end analytical and prescriptive pipeline:

```
[Public Market Proxies & Import Tonnage]
                  │
                  ▼
[Denton-Cholette Spline Disaggregation] ──► [Market Tightness Index: MTI_India]
                                                           │
          ┌────────────────────────────────────────────────┴────────────────────────────────┐
          ▼                                                                                 ▼
[Tier 1: Econometric GARCH(1,1) Volatility σ̂²_t]                           [Tier 1: CatBoost ML Point Forecast ŷ_t]
          │                                                                                 │
          └────────────────────────────────────────────────┬────────────────────────────────┘
                                                           ▼
                                         [Tier 2 Stacking & Risk Cone]
                                                           │
                                                           ▼
                                      [SHAP Waterfall Explainability Breakdown]
                                                           │
                                                           ▼
                                     [Prescriptive CoA Decision Trigger Rule]
                                                           │
                                                           ▼
                                [PuLP Vessel Allocator & Port Matrix Solver]
```

### 1. Multi-Source Ingestion & Mixed-Frequency Fusion
- **Time-Aligned Market Proxies**: Integrates Baltic Dry Index (BDI), Singapore VLSFO Bunker Fuel ($/MT), Newcastle Coal Index ($/MT), and USD Index (DXY).
- **Denton-Cholette Disaggregation Signal**: Disaggregates monthly Indian coal import tonnage into a smooth daily continuous signal using cubic spline interpolation. This eliminates step-function edge artifacts that destabilize econometric and machine learning models.

### 2. Market Tightness Index (`MTI_India`)
Calculates OceanPulse's signature domain metric modeling active supply/demand pressure in Indian ocean logistics:
$$\text{MTI}_t = \frac{\text{Seaborne\_Volume}_t}{\text{Fleet\_DWT}_t \times (1 / \text{Fuel\_Price}_t)}$$
Reflects vessel availability relative to import demand and fuel cost dynamics.

### 3. Dual-Branch Forecasting Engine & Volatility Risk Cone
- **Tier 1 Econometric Branch**: EWMA / GARCH(1,1) estimates conditional variance ($\hat{\sigma}^2_t$) and 95% volatility confidence risk cones ($\pm 1.96 \hat{\sigma}_{t+h}$) across 1–30 day horizons.
- **Tier 1 ML Branch**: CatBoost gradient-boosted point rate regressor ($\hat{y}_{t+h}$) using MTI, fuel price, coal index, DXY, and seasonality flags.
- **Tier 2 Stacking Layer**: Horizon-weighted blend yielding expected point rates and volatility confidence bands.

### 4. SHAP TreeExplainer Waterfall Attribution
Decomposes exact dollar-per-day feature attributions ($/day) driving each forecast point:
$$\text{Forecast Rate} = \text{Baseline Rate} + \Delta\text{MTI} + \Delta\text{Fuel} + \Delta\text{Coal} + \Delta\text{DXY} + \Delta\text{Seasonality}$$

### 5. Prescriptive Decision Trigger Rule
Evaluates whether to lock in a Medium-Term Contract of Affreightment (CoA) or operate on the spot market:
$$\text{Enter\_CoA IF } (\hat{\sigma}^2_{t+h} > \theta_{\text{risk}} \text{ AND } \hat{y}_{t+h} \ge C_{\text{CoA}}) \text{ ELSE Spot Market}$$
Protects procurement budgets during high-volatility, high-rate regimes while avoiding unnecessary CoA lock-ins during low-volatility periods.

### 6. East Coast Port Matrix & PuLP Vessel Allocator Solver
Solves vessel-to-cargo assignment minimizing total landed procurement cost:
$$\text{Total Cost} = \text{Freight Rate} + \text{Bunker Fuel Cost} + \text{Port Tariffs} + \text{Demurrage Penalty}$$
Enforces physical port limitations across the East Coast India Port Matrix:
- **Dhamra Port**: Max Draft 17.5m, Max LOA 300m, Capesize/Panamax, 60k MT/day handling.
- **Paradeep Port**: Max Draft 14.5m, Max LOA 245m, Panamax/Supramax, 40k MT/day handling.
- **Haldia Dock Complex**: Max Draft 8.5m, Max LOA 190m, Handymax/Supramax, 20k MT/day handling.
- **Visakhapatnam Port**: Max Draft 16.0m, Max LOA 280m, Capesize/Panamax, 50k MT/day handling.
- **Krishnapatnam Port**: Max Draft 18.0m, Max LOA 320m, Capesize/Panamax, 65k MT/day handling.

---

## 🖥️ How to Use the Website

### 1. Enterprise KPI Overview Bar
At the top of the workspace, review live key market indicators at a glance:
- **Baltic Dry Index (BDI)**: Global Cape/Panamax spot rate benchmark.
- **VLSFO Bunker Fuel (Singapore)**: Marine fuel price ($/MT).
- **Newcastle Coal Index**: Thermal coal spot benchmark ($/MT).
- **Market Tightness Index (MTI_India)**: Current Indian seaborne import tightness.

### 2. Market Regime Quick Selectors
In the **Scenario & Parameter Simulator** section, click scenario buttons to simulate market stress regimes:
- **Normal Trade Flow**: Baseline market conditions.
- **Monsoon Bottleneck**: Simulates East Coast port delays and congestion spikes.
- **Bunker Fuel Spike**: Simulates a +50% VLSFO oil price surge.
- **Supply Disruption**: Simulates severe rate spikes and tightness overflow.

### 3. Interactive Parameter Sliders
Use interactive sliders to test custom what-if scenarios:
- **Horizon Slider (1–30 Days)**: Adjust forecast target horizon.
- **Risk Threshold ($\theta_{\text{risk}}$ Slider)**: Set risk tolerance ($0.05$ risk-averse to $0.45$ aggressive).
- **Target CoA Budget Rate ($C_{\text{CoA}}$ Slider)**: Set maximum target budget rate ($12k to $32k/day).
- **Bunker Fuel Offset Slider**: Adjust fuel price offset ($\pm \$150/MT$).
- **Shipment Volume Slider**: Set cargo shipment size ($30,000$ to $180,000$ MT).

### 4. GARCH Volatility Risk Cone Chart
- View historical spot BDI rates alongside 30-day point rate predictions and the 95% volatility ribbon.
- Click horizon buttons (**5D, 10D, 15D, 20D, 30D**) to highlight target horizon rates.

### 5. Market Tightness Index (`MTI_India`) Plot
- Observe daily disaggregated coal import tonnage plotted alongside active MTI tightness.

### 6. SHAP Waterfall Attribution Breakdown
- Inspect exact positive (green, upward pressure) and negative (red, downward pressure) dollar contributions ($/day) driving the point forecast.

### 7. Prescriptive Decision Trigger Banner & Recommendation Card
- Read the real-time **SPOT vs COA** action trigger recommendation.
- Review optimal vessel selection, landed cost per ton ($/MT), total voyage cost ($M), and projected risk savings.

### 8. East Coast Port Matrix & Vessel Allocation Table
- Switch destination port tabs (**Dhamra, Paradeep, Haldia, Vizag, Krishnapatnam**).
- Inspect candidate fleet draft, LOA, and vessel class constraint checks (`✓` Pass / `✗` Breach).
- Identify the **OPTIMAL** candidate vessel highlighted by the PuLP solver.

### 9. Instant Freight Quote Calculator Modal
- Click **"Get Rate Quote"** in the top navigation header to open an interactive quote modal.
- Select Origin Terminal, Destination Port, and Shipment Volume to compute instant landed cost ($/MT), voyage duration, and vessel suitability.

### 10. System Architecture Briefing Modal
- Click **"Architecture Briefing"** in the hero section to open a step-by-step walkthrough detailing all 6 system modules.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Lucide Icons, Recharts, TailwindCSS v4, Logistico Design System.
- **Econometric & ML Engines**: EWMA / GARCH(1,1) Volatility Estimator, CatBoost Point Forecast Model, Cubic Spline Denton-Cholette Disaggregation, SHAP TreeExplainer.
- **Optimization**: PuLP-style Constrained MILP Vessel Allocator & Port Matrix Solver.
