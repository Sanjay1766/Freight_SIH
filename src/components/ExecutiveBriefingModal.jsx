import React, { useState } from 'react';
import { ShieldCheck, ChevronRight, ChevronLeft, X, CheckCircle, Database, Gauge, TrendingUp, Anchor, Clock, ArrowRightLeft, ShieldAlert } from 'lucide-react';

export default function ExecutiveBriefingModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: '1. Multi-Source Ingestion & Denton-Cholette Disaggregation',
      icon: Database,
      tag: 'Data Pipeline Layer',
      bullets: [
        'Real-world freight rate proxies (Baltic Dry BDI, Cape BCI, Panamax BPI, Supramax BSI) integrated with Singapore VLSFO bunker, Newcastle coal, Indonesian coal (ICI4), and DXY.',
        'Solves mixed-frequency data alignment: Monthly Indian coal import tonnage is disaggregated into daily continuous signals using natural cubic spline interpolation.',
        'Eliminates step-function edge artifacts that disrupt econometric and ML risk models.'
      ],
      codeSnippet: `// Denton-Cholette Cubic Spline Disaggregation
const dailySeaborneVolume = cubicSplineInterpolate(monthlyImports, 90);`
    },
    {
      title: '2. Market Tightness Index (MTI_India)',
      icon: Gauge,
      tag: 'Feature Engineering',
      bullets: [
        'Signature OceanPulse domain feature modeling real-time supply/demand tightness in Indian ocean logistics.',
        'Mathematical Formula: MTI_t = Seaborne_Volume_t / (Fleet_DWT_t * (1 / Fuel_Price_t)).',
        'Reflects active vessel capacity relative to import demand, driving predictive accuracy for East Coast India routes.'
      ],
      codeSnippet: `// MTI_India Computation Engine
const mtiIndia = (seaborneDailyTons / fleetCapacityDWT) * (bunkerPrice / 100);`
    },
    {
      title: '3. Dual-Branch GARCH(1,1) + CatBoost Stacking Engine (1-90 Days)',
      icon: TrendingUp,
      tag: 'Forecasting Engine',
      bullets: [
        'Tier 1 Econometric Branch: GARCH(1,1) estimates conditional variance σ̂²_t and 95% volatility risk cones across 1-90 day horizons.',
        'Tier 1 ML Branch: CatBoost regressor outputs point rate estimate ŷ_t taking MTI, fuel, DXY, route multipliers, and seasonality as inputs.',
        'Tier 2 Stacking Layer: Horizon-weighted blend yielding point rate + confidence bands.'
      ],
      codeSnippet: `// Stacking Blend & Volatility Risk Cone
const upper95 = blendedPoint + 1.96 * horizonVolDollars;
const lower95 = blendedPoint - 1.96 * horizonVolDollars;`
    },
    {
      title: '4. Optimal Market Entry Timing & Contract Structure (Obj A)',
      icon: Clock,
      tag: 'Objective A • Market Entry',
      bullets: [
        'Identifies ideal forward market entry windows (1-15D spot prompt, 16-45D short-term 3V CoA, 46-90D mid-term CoA) by locating forward rate valleys and volatility troughs.',
        'Facilitates shift from daily reactive spot charters to multi-voyage contracts with ~6-12% landed cost savings.',
        'Financial comparison module computes exact dollar savings vs unhedged spot volatility.'
      ],
      codeSnippet: `// Optimal Entry Window Detection
const bestEntry = findOptimalMarketEntryWindows(forecast, currentRate);`
    },
    {
      title: '5. Dual-Port Vessel Type Optimizer & Lightering Solver (Obj B)',
      icon: Anchor,
      tag: 'Objective B • Vessel Optimization',
      bullets: [
        'Encodes all 7 Indian East Coast Ports (Paradip, Vizag, Gangavaram, Gopalpur, Dhamra, Sandheads, Haldia) + 5 Global Origins (Australia, Indonesia, US, Mozambique, Russia).',
        'Evaluates Handysize, Supramax, Ultramax, Panamax, Kamsarmax, Capesize, and Newcastlemax against draft, LOA, beam, handling speed, and tariffs.',
        'Automated lightering logic for Haldia utilizing Sagar-Sandheads anchorage transshipment to prevent draft overflow.'
      ],
      codeSnippet: `// PuLP Vessel Allocation Landed Cost Function
TotalCost = Freight + BunkerFuel + PortTariffs + Demurrage + LighteringSurcharge;`
    },
    {
      title: '6. Idle Time Minimization & Backhaul Route Matching (Obj C)',
      icon: ArrowRightLeft,
      tag: 'Objective C • Deadheading Reduction',
      bullets: [
        'Full turnaround timeline analysis (loading, sea transit, anchorage queue, discharging).',
        'Virtual arrival speed optimization strategies to absorb waiting time and cut bunker consumption.',
        'Triangular backhaul matching pairs discharging vessels with Indian exports (Iron ore from Paradip, Alumina from Vizag) to eliminate uncompensated ballast runs.'
      ],
      codeSnippet: `// Triangular Backhaul Matching
const netBenefit = backhaulRevenue - incrementalBallastCost; // +$260k-$380k/voyage`
    },
    {
      title: '7. Multi-Factor Early Warning & Value-at-Risk Radar (Obj D)',
      icon: ShieldAlert,
      tag: 'Objective D • Risk Mitigation',
      bullets: [
        'Real-time risk scoring across 4 pillars: Port Congestion queues, Bay of Bengal monsoon depressions, Singapore bunker fuel price shocks, and maritime chokepoints.',
        'Parametric Value-at-Risk (VaR 95% and 99%) calculations quantify maximum unhedged procurement budget exposure.',
        'Generates actionable mitigation advisories including speed adjustment, port diversion, or CoA hedging.'
      ],
      codeSnippet: `// Parametric Value-at-Risk Calculation
const var95Dollars = totalBudget * (1.645 * dailyVol * Math.sqrt(turnaroundDays));`
    }
  ];

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl w-full max-w-3xl p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 border border-orange-500/30 text-[#FF3B00]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-heading">OceanPulse System Architecture Briefing</h2>
                <span className="px-2 py-0.5 rounded bg-orange-500/20 text-[#FF3B00] text-xs font-semibold font-mono">
                  Module {currentStep + 1} of {steps.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">Complete architectural walkthrough aligned with SIH Problem Statement</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4 my-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-[#FF3B00]">
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#FF3B00]">{step.tag}</span>
              <h3 className="text-xl font-bold text-white font-heading">{step.title}</h3>
            </div>
          </div>

          <ul className="space-y-2.5 text-sm text-slate-200">
            {step.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700/80">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300">
            <div className="text-[10px] text-slate-500 uppercase font-sans font-bold mb-1">Algorithm Execution Engine:</div>
            <code>{step.codeSnippet}</code>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-6">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentStep ? 'bg-[#FF3B00] scale-125' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF3B00] text-white hover:bg-orange-600 shadow-md"
            >
              Next Module <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            >
              Close Briefing <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
