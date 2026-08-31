import React, { useState } from 'react';
import { ShieldCheck, ChevronRight, ChevronLeft, X, CheckCircle, Database, Gauge, TrendingUp, Anchor, Clock, ArrowRightLeft, ShieldAlert } from 'lucide-react';

export default function ExecutiveBriefingModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: '1. Multi-Source Market Data Integration',
      icon: Database,
      tag: 'Market Feeds',
      bullets: [
        'Integrates international benchmark spot rates (Baltic Dry Index, Capesize, Panamax, Supramax) with Singapore marine fuel, coal indices, and foreign exchange rates.',
        'Continuous smoothing converts monthly trade volumes into daily continuous market signals.',
        'Eliminates statistical distortions to provide reliable planning metrics for East Coast Indian ports.'
      ],
      codeSnippet: `// Continuous Daily Signal Ingestion
const dailySeaborneVolume = smoothInterpolation(monthlyTradeVolumes, 90);`
    },
    {
      title: '2. Market Demand & Capacity Balance',
      icon: Gauge,
      tag: 'Capacity Tracking',
      bullets: [
        'Evaluates real-time supply and demand tightness across Indian ocean logistics.',
        'Analyzes active vessel fleet capacity relative to scheduled import tonnages.',
        'Anticipates port queues and freight pressure across Paradip, Vizag, and Dhamra.'
      ],
      codeSnippet: `// Market Demand Balance Calculation
const marketDemandIndex = calculateVesselDemand(cargoDemand, availableFleetSupply);`
    },
    {
      title: '3. Predictive Freight Trajectory & Volatility Envelopes',
      icon: TrendingUp,
      tag: '90-Day Trajectory',
      bullets: [
        'Combines historical trend analysis with forward volatility bounds over 1 to 90-day planning horizons.',
        'Outputs a daily central forecast alongside 95% upper and lower expected boundaries.',
        'Enables procurement teams to identify optimal charter windows ahead of market rate surges.'
      ],
      codeSnippet: `// Forward Rate Trajectory & Range
const expectedRateRange = calculateExpectedTrajectory(history, forwardDays);`
    },
    {
      title: '4. Optimal Charter Timing & Contract Strategy',
      icon: Clock,
      tag: 'Procurement Strategy',
      bullets: [
        'Identifies forward entry windows (1-15D prompt spot, 16-45D 3-voyage term contracts, 46-90D term contracts).',
        'Helps transition from reactive spot charters to cost-effective volume contracts saving ~6-12% in freight costs.',
        'Calculates projected dollar savings compared against unhedged spot volatility.'
      ],
      codeSnippet: `// Recommended Fixture Timing
const bestWindow = evaluateProcurementWindows(forwardRates, targetBudget);`
    },
    {
      title: '5. Vessel Type Selection & Port Feasibility Solver',
      icon: Anchor,
      tag: 'Fleet Optimization',
      bullets: [
        'Evaluates vessel types (Handymax, Supramax, Ultramax, Panamax, Kamsarmax, Capesize) against draft limits at 7 Indian ports.',
        'Identifies lightering requirements at Sagar-Sandheads Anchorage for deep-draft vessels entering Haldia or Paradip.',
        'Calculates total landed freight cost per ton including fuel, port tariffs, waiting demurrage, and energy ratings.'
      ],
      codeSnippet: `// Fleet Economics & Draft Validation
const optimalFixture = solveVesselAllocation(originPort, destinationPort, parcelSize);`
    },
    {
      title: '6. Port Turnaround & Return Voyage Optimization',
      icon: ArrowRightLeft,
      tag: 'Voyage Efficiency',
      bullets: [
        'Solves empty deadheading voyages after discharging cargo at Indian East Coast ports.',
        'Identifies outbound iron ore, bauxite, or coastal coal return cargoes from Vizag, Kakinada, or Paradip.',
        'Reduces net voyage landed cost by up to $2.50 per ton through backhaul freight revenue.'
      ],
      codeSnippet: `// Backhaul & Turnaround Calculator
const turnaroundPlan = findBackhaulOpportunities(dischargePort, vesselType);`
    },
    {
      title: '7. Weather Swell & Port Delay Monitoring',
      icon: ShieldAlert,
      tag: 'Risk Management',
      bullets: [
        'Monitors Bay of Bengal sea swell, cyclonic depressions, berth occupancy, and lightering disruptions.',
        'Provides early risk notices to allow proactive laycan adjustment and demurrage prevention.',
        'Protects shipping schedules and prevents costly vessel waiting times.'
      ],
      codeSnippet: `// Port Delay & Weather Radar
const riskLevel = monitorPortDelays(destinationPort, weatherAlerts);`
    }
  ];

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="terminal-card w-full max-w-2xl border-[#BED9EB] p-6 space-y-5 shadow-2xl bg-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#EDF4F9] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E1EFF8] text-[#077DB3] flex items-center justify-center border border-[#BED9EB]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-[#0F2942] text-base">
                OceanPulse Maritime Platform Overview
              </h3>
              <p className="text-xs text-[#627D98]">Architecture & Capabilities Briefing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#EDF5FA] text-[#627D98] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StepIcon className="w-5 h-5 text-[#077DB3]" />
              <h4 className="font-bold text-sm text-[#0F2942]">{step.title}</h4>
            </div>
            <span className="status-pill status-pill-ocean text-[11px]">
              {step.tag}
            </span>
          </div>

          <div className="space-y-2 text-xs text-[#334E68] leading-relaxed">
            {step.bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-[#F5F9FC] border border-[#E2EDF5] font-mono text-xs text-[#077DB3]">
            <pre className="overflow-x-auto whitespace-pre-wrap">{step.codeSnippet}</pre>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between border-t border-[#EDF4F9] pt-3 text-xs">
          <div className="text-[#627D98] font-semibold">
            Step {currentStep + 1} of {steps.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="btn-terminal-secondary py-1.5 px-3 text-xs disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className="btn-terminal-primary py-1.5 px-3 text-xs"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="btn-terminal-primary py-1.5 px-4 text-xs"
              >
                Done
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
