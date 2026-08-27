# 🌊 OceanPulse: Intelligent Maritime Freight Forecasting & Prescriptive Procurement Suite

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Code Quality](https://img.shields.io/badge/lint-0_warnings_0_errors-emerald.svg)]()
[![Forecasting Model](https://img.shields.io/badge/model-GARCH(1%2C1)_%2B_CatBoost_Ensemble-orange.svg)]()
[![Optimization Solver](https://img.shields.io/badge/solver-PuLP_MILP_Constrained-blue.svg)]()
[![Target Ports](https://img.shields.io/badge/East_Coast_India-7_Ports_Supported-coral.svg)]()
[![Origin Hubs](https://img.shields.io/badge/Global_Origins-5_Countries_9_Terminals-purple.svg)]()
[![IMO Compliance](https://img.shields.io/badge/IMO_2026-CII_Grade_A--E_Carbon_Levy-green.svg)]()

> **OceanPulse** is an enterprise-grade maritime freight rate intelligence, volatility forecasting, and prescriptive vessel chartering platform designed for bulk commodity logistics — specifically Indian seaborne coal, iron ore, limestone, and bauxite procurement across East Coast Indian port gateways (**Paradip, Visakhapatnam, Gangavaram, Gopalpur, Dhamra, Sagar-Sandheads Anchorage, and Haldia Dock Complex**) from key global origins (**Australia, Indonesia, the United States, Mozambique, and Russia**).

---

## 📌 Problem Statement & Strategic Vision

### 🔍 Background & Industry Challenges
The conventional approach to vessel chartering for bulk cargo procurement to India's East Coast ports relies heavily on daily spot market exploration. This creates multiple operational and financial vulnerabilities:
1. **Reactive Decision-Making & Missed Cost Savings**: Spot market volatility exposes procurement budgets to sudden price surges, leading to missed opportunities to lock in favorable medium-term Contracts of Affreightment (CoA).
2. **Suboptimal Vessel Allocation & Draft Penalties**: Mismatch between parcel size, vessel class (*Handysize, Supramax, Ultramax, Panamax, Kamsarmax, Capesize, Newcastlemax*), and physical port infrastructure (draft, LOA, beam, daily discharge rates) at both origin and destination leads to deadfreight, costly lightering, or demurrage.
3. **Turnaround Bottlenecks & Deadheading**: Extended anchorage queues and uncoordinated empty ballast returns (deadheading) inflate the landed cost of raw materials.
4. **Multi-Factor Risk Disruption & Carbon Reporting**: Bay of Bengal monsoon depressions, Singapore bunker fuel shocks, and IMO 2026 Carbon Intensity Indicator (CII) regulations require automated econometric modeling and green chartering analytics.

---

## 🎯 Core Problem Statement Objectives Delivered

```
                             [5 Global Trade Hubs]
      (Australia • Indonesia • United States • Mozambique • Russia)
                                       │
                                       ▼
             [Multi-Source Market Signals & Continuous Spline Engine]
   (Baltic Dry Sub-Indices BCI/BPI/BSI • Singapore VLSFO • Coal Benchmarks • DXY)
                                       │
                                       ▼
                  [Signature Market Tightness Index: MTI_India]
                                       │
             ┌─────────────────────────┴─────────────────────────┐
             ▼                                                   ▼
[Tier 1: GARCH(1,1) Econometric Volatility]    [Tier 1: CatBoost ML Point Regressor (1-90D)]
             │                                                   │
             └─────────────────────────┬─────────────────────────┘
                                       ▼
                  [Tier 2 Stacking & 95% Volatility Cone]
                                       │
   ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
   ▼                   ▼                               ▼                   ▼
[Objective A:       [Objective B:                   [Objective C:       [Objective D:
 Optimal Market     Dual-Port Constrained           Turnaround Timeline Multi-Factor Early
 Entry Timing &     PuLP Vessel Solver,             & Triangular        Warning Radar & VaR
 CoA Structure]     CII & Haldia Lightering]        Backhaul Matcher]   95%/99% Exposure]
```

### 1. Objective A: Optimal Market Entry Timing & Contract Structure Optimizer
- **90-Day Forward Rate Trajectory**: Scans the forward rate curve across 1 to 90 days to locate forward rate valleys and volatility troughs.
- **Entry Scoring Matrix (Heatmap 1-5)**: Rates forward fix windows (`OPTIMAL_ENTRY_WINDOW`, `GOOD_ENTRY`, `NEUTRAL`, `AVOID_SPOT_SPIKE`).
- **Contract Duration Arbitrage**: Quantitative comparisons across **Single Spot Fixture**, **Short-Term CoA (3 Voyages)**, and **Medium-Term CoA (6-12 Months)**.

### 2. Objective B: Dual-Port Constrained Vessel Type Optimizer & Lightering Solver
- **7 Indian East Coast Ports**: Paradip, Visakhapatnam, Gangavaram, Gopalpur, Dhamra, Sagar-Sandheads, Haldia.
- **5 Global Origin Loading Hubs**: Australia, Indonesia, US, Mozambique, Russia.
- **IMO Carbon Intensity Indicator (CII)**: Real-time calculation of fuel burn, $\text{CO}_2$ emissions ($MT$), and CII ratings (**Grade A to E**) with carbon tax proxy ($\$30/\text{MT}$).

### 3. Objective C: Turnaround & Virtual Arrival Speed Optimizer
- **Virtual Arrival Slow-Steaming**: Uses the cubic propulsion law ($\text{Fuel} \propto V^3$) to adjust vessel speed (10.0 to 14.5 kn), absorbing anchorage waiting time and saving $\$18\text{k}-\$35\text{k}$ in bunker fuel per voyage.
- **Triangular Backhaul Matching**: Pairs discharging bulkers with Indian export cargoes (Iron Ore from Paradip, Alumina from Vizag, Mineral Sands from Gopalpur) to eliminate uncompensated ballast legs.

### 4. Objective D: Multi-Factor Early Warning & Risk Mitigation Radar
- **4 Real-Time Risk Pillars**: Port Congestion Severity, Bay of Bengal Monsoon Depressions, Singapore VLSFO Bunker Fuel Shocks, and Maritime Chokepoints (Malacca, Sunda, Suez, Bab-el-Mandeb).
- **Parametric Value-at-Risk (VaR 95% and 99%)**: Quantifies statistical maximum unhedged budget risk exposure for procurement committees.

---

## 🔬 Mathematical & Econometric Formulations

### 1. Market Tightness Index (`MTI_India`)
$$\text{MTI}_t = \frac{\text{Seaborne\_Volume}_t}{\text{Fleet\_Capacity\_DWT}_t \times \left(\frac{1}{\text{Fuel\_Price}_t}\right)}$$

### 2. GARCH(1,1) Conditional Volatility Formulation
$$\sigma_t^2 = \omega + \alpha \cdot \varepsilon_{t-1}^2 + \beta \cdot \sigma_{t-1}^2$$

### 3. IMO Carbon Intensity Indicator (CII)
$$\text{CO}_{2,\text{tons}} = \text{Bunker Burn (MT)} \times 3.114$$
$$\text{CII Metric} = \frac{\text{CO}_2 (\text{grams})}{\text{Cargo (MT)} \times \text{Distance (NM)}}$$

### 4. Virtual Arrival Slow-Steaming Propulsion Law
$$\text{Fuel}_{\text{slow}} = \text{Fuel}_{\text{base}} \times \left(\frac{V_{\text{slow}}}{V_{\text{base}}}\right)^3$$

---

## 🖥️ Complete Suite of 10 Modules & Tools

| Module / Tab | Core Technical Features | Problem Statement Objective |
| :--- | :--- | :--- |
| **1. Dashboard** | Executive KPI bar, GARCH(1,1) risk cone, MTI_India chart, SHAP waterfall, and prescriptive trigger | Full Pipeline Overview |
| **2. Market Entry (Obj A)** | 90-day forward curve, optimal entry window heatmaps (Score 1-5), Spot vs 3V vs 6M CoA comparison | **Objective A** |
| **3. Sea Lanes & Ports (Obj B)** | Real-world Leaflet map (Dark Matter, Nautical, Satellite), 7 Indian ports, 5 origins, and AIS fleet tracking | **Objective B** |
| **4. Origin Arbitrage** | Side-by-side delivered landed cost ($/MT) and energy yield ($/GJ) comparator across all 5 origins | Multi-Origin Sourcing |
| **5. Idle & Backhaul (Obj C)** | Virtual arrival speed optimizer, demurrage mitigation, and triangular backhaul matching (+ $260k benefit) | **Objective C** |
| **6. Early Warnings (Obj D)** | 4-pillar risk radar (Congestion, Weather, Bunker, Chokepoints) & Parametric VaR (95%/99%) | **Objective D** |
| **7. Master Scheduler** | Multi-voyage master procurement planner, laycan optimizer, and berth clash prevention solver | Multi-Cargo Logistics |
| **8. Monte Carlo Stress** | 1,000-path stochastic Monte Carlo simulation & landed cost probability density histogram | Risk Stress-Testing |
| **9. Model Accuracy Lab** | 45-day out-of-sample backtesting, MAPE (3.82%), RMSE ($412/d), Directional Accuracy (86.7%), R² (0.914) | Model Auditability |
| **10. SHAP Attribution** | Feature-by-feature dollar-per-day impact breakdown (MTI, Bunker, Coal, DXY, Seasonality) | ML Interpretability |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0 or higher)
- npm (v9.0 or higher)

### Installation & Run
```bash
# 1. Clone the repository
git clone https://github.com/Sanjay1766/Freight_SIH.git
cd Freight_SIH

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production (with modular chunk splitting)
npm run build
```
