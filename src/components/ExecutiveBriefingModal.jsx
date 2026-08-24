import React, { useState } from 'react';
import { ShieldCheck, ChevronRight, ChevronLeft, X, CheckCircle, Database, Gauge, TrendingUp, Cpu, Compass, Anchor, FileText } from 'lucide-react';

export default function ExecutiveBriefingModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: '1. Multi-Source Ingestion & Denton-Cholette Disaggregation',
      icon: Database,
      tag: 'Data Pipeline Layer',
      bullets: [
        'Real-world freight rate proxies (Baltic Dry Index) integrated with Singapore VLSFO bunker fuel, Newcastle coal index, and DXY.',
        'Solves mixed-frequency data alignment: Monthly Indian coal import tonnage is disaggregated into daily continuous signals using cubic spline interpolation.',
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
      title: '3. Dual-Branch GARCH(1,1) + CatBoost Stacking Engine',
      icon: TrendingUp,
      tag: 'Forecasting Engine',
      bullets: [
        'Tier 1 Econometric Branch: GARCH(1,1) estimates conditional variance σ̂²_t and 95% volatility risk cones across 1-30 day horizons.',
        'Tier 1 ML Branch: CatBoost regressor outputs point rate estimate ŷ_t taking MTI, fuel, DXY, and seasonality as inputs.',
        'Tier 2 Stacking Layer: Horizon-weighted blend yielding point rate + confidence bands.'
      ],
      codeSnippet: `// Stacking Blend & Volatility Risk Cone
const upper95 = blendedPoint + 1.96 * horizonVolDollars;
const lower95 = blendedPoint - 1.96 * horizonVolDollars;`
    },
    {
      title: '4. SHAP TreeExplainer Waterfall Explainability',
      icon: Cpu,
      tag: 'Explainability & Governance',
      bullets: [
        'No black-box predictions: SHAP TreeExplainer breaks down exact dollar-per-day contributions of each input variable.',
        'Logistics managers can inspect why a specific 20-day forecast spiked (e.g. +$850/day MTI impact vs -$320/day fuel offset).',
        'Crucial for risk committee approval and executive auditability.'
      ],
      codeSnippet: `// SHAP Feature Attribution Breakdown
const mtiShap = (lastPoint.mtiIndia - 1.20) * 3100;`
    },
    {
      title: '5. Prescriptive Decision Trigger Rule',
      icon: Compass,
      tag: 'Prescriptive Analytics',
      bullets: [
        'Mathematical Decision Trigger: Enter_CoA IF (σ̂²_{t+h} > θ_risk AND ŷ_{t+h} ≥ C_CoA) ELSE Spot Market.',
        'Determines optimal chartering strategy (Spot market vs locking in Medium-Term Contract of Affreightment).',
        'Protects enterprise procurement budget from rate spikes while avoiding unnecessary CoA lock-ins during low-volatility regimes.'
      ],
      codeSnippet: `// Prescriptive Decision Rule Check
const triggerActivated = (volMetricRatio > thetaRisk) && (predictedRate >= targetCoACost);`
    },
    {
      title: '6. East Coast Port Matrix & PuLP Vessel Allocator Solver',
      icon: Anchor,
      tag: 'Constrained Optimization',
      bullets: [
        'Encodes East Coast India Port Matrix (Dhamra, Paradeep, Haldia, Vizag, Krishnapatnam) with draft, LOA, daily handling rates, and demurrage penalties.',
        'PuLP-style solver evaluates candidate fleet options and filters out physical port constraint violations (e.g. Capesize draft overflow at Haldia).',
        'Generates natural-language executive recommendation cards with landed cost ($/MT) breakdown.'
      ],
      codeSnippet: `// PuLP Vessel Allocation Cost Function
TotalCost = Freight + BunkerFuel + PortTariffs + DemurragePenalty;`
    }
  ];

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-3xl border-cyan-500/40 p-6 shadow-2xl relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">OceanPulse Architecture Briefing</h2>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
                  Module {currentStep + 1} of {steps.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">System pipeline spec & prescriptive optimization workflow</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4 my-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-400">
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">{step.tag}</span>
              <h3 className="text-xl font-bold text-white">{step.title}</h3>
            </div>
          </div>

          <ul className="space-y-2.5 text-sm text-slate-200">
            {step.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300">
            <div className="text-[10px] text-slate-500 uppercase font-sans font-bold mb-1">Implementation Logic:</div>
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
                  i === currentStep ? 'bg-cyan-400 scale-125' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400"
            >
              Next Module <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
            >
              Close Briefing <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
