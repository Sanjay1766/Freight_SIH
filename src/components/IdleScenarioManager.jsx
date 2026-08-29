import React, { useState, useMemo } from 'react';
import { Timer, ArrowRightLeft, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, Gauge, Fuel, Leaf, DollarSign } from 'lucide-react';
import { BACKHAUL_OPPORTUNITIES, EAST_COAST_PORT_MATRIX, calculateVirtualArrival } from '../services/optimizerEngine';

export default function IdleScenarioManager({ bestSolution, selectedPortKey, cargoQuantity, bunkerPrice = 629.0, backendTurnaround }) {
  const [selectedBackhaul, setSelectedBackhaul] = useState(BACKHAUL_OPPORTUNITIES[0]);
  const [slowSteamingSpeed, setSlowSteamingSpeed] = useState(11.2);

  const activePort = EAST_COAST_PORT_MATRIX[selectedPortKey] || EAST_COAST_PORT_MATRIX.Dhamra;
  const turnaroundDays = bestSolution ? (bestSolution.totalTurnaroundDays || bestSolution.totalVoyageDays || 18.5) : 18.5;
  const sailingDays = bestSolution ? (bestSolution.sailingDays || bestSolution.seaDaysOneWay || 8.0) : 8.0;
  const dischargeDays = Number((cargoQuantity / activePort.dailyDischargeRate).toFixed(1));
  const waitingDays = activePort.avgWaitingDays;
  const demurrageExposure = Math.round(waitingDays * activePort.demurrageRatePerDay);

  // Turnaround Breakdown Percentages
  const seaPct = Math.round((sailingDays / turnaroundDays) * 100);
  const dischargePct = Math.round((dischargeDays / turnaroundDays) * 100);
  const waitPct = Math.round((waitingDays / turnaroundDays) * 100);
  const loadPct = Math.max(5, 100 - (seaPct + dischargePct + waitPct));

  // Virtual Arrival Calculation
  const virtualArrival = useMemo(() => {
    if (backendTurnaround && backendTurnaround.virtualArrival) {
      const va = backendTurnaround.virtualArrival;
      return {
        baseSpeedKnots: va.baseSpeedKnots,
        slowSpeedKnots: va.optimalSpeedKnots,
        distanceNM: 2520,
        standardSailingDays: va.baseTransitDays,
        slowSailingDays: va.virtualArrivalDays,
        additionalSailingDays: Number((va.virtualArrivalDays - va.baseTransitDays).toFixed(1)),
        berthQueueDays: waitingDays,
        absorbedDemurrageDays: va.waitingDaysAbsorbed,
        remainingWaitingDays: Number((waitingDays - va.waitingDaysAbsorbed).toFixed(1)),
        fuelSavedDollars: va.fuelSavingsUSD,
        fuelSavedTons: va.fuelSavedTons,
        demurrageAvoidedDollars: va.demurrageAvoidedUSD,
        netVoyageSavingsDollars: va.netEconomicBenefitUSD,
        co2AvoidedTons: va.co2ReductionTons,
        standardTotalCost: va.fuelSavingsUSD * 3,
        slowTotalCost: va.fuelSavingsUSD * 2
      };
    }

    const baseSpeed = bestSolution ? (bestSolution.vessel?.speedKnots || 13.5) : 13.5;
    const distanceNM = bestSolution ? (bestSolution.distanceNM || 2550) : 2550;
    const dailyRate = bestSolution ? (bestSolution.costBreakdown?.dailyRate || bestSolution.dailyCharterRate || 22000) : 22000;
    const baseBunkerTons = bestSolution ? (bestSolution.vessel?.bunkerConsumptionTonsPerDay || 42) : 42;

    return calculateVirtualArrival({
      baseSpeedKnots: baseSpeed,
      slowSpeedKnots: slowSteamingSpeed,
      distanceNM,
      dailyCharterRate: dailyRate,
      bunkerPrice,
      baseDailyBunkerTons: baseBunkerTons,
      berthQueueDays: waitingDays,
      demurrageRatePerDay: activePort.demurrageRatePerDay
    });
  }, [backendTurnaround, bestSolution, slowSteamingSpeed, waitingDays, activePort.demurrageRatePerDay, bunkerPrice]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="card-clean p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="badge-coral bg-orange-500/20 text-[#FF3B00] border-orange-500/30 font-mono">
                Objective C • Turnaround & Idle Risk Engine
              </span>
              <span className="text-slate-400 text-xs">• Virtual Arrival & Backhaul Matching</span>
            </div>
            <h2 className="text-2xl font-extrabold font-heading text-white">
              Vessel Idle Turnaround & Virtual Arrival Speed Optimizer
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Eliminate uncompensated waiting time and empty deadheading. Use <strong>Virtual Arrival slow-steaming</strong> to absorb anchorage queues while saving thousands in bunker fuel, and match discharging bulkers with Indian export backhaul parcels.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-right min-w-[220px]">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Roundtrip Turnaround</div>
            <div className="text-2xl font-mono font-extrabold text-white">{turnaroundDays} Days</div>
            <div className="text-[11px] text-amber-400 font-semibold mt-0.5">
              Demurrage Risk: ${Number(demurrageExposure || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 1. Virtual Arrival Speed & Slow-Steaming Simulator */}
      <div className="card-clean p-6 bg-slate-900 text-white border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FF3B00] text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                <Gauge className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-extrabold text-white font-heading">
                Virtual Arrival Speed & Demurrage Optimizer
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Adjust vessel steaming speed to absorb {waitingDays} days of berth queue at {activePort.name}, cutting fuel burn and eliminating demurrage
            </p>
          </div>

          {/* Speed Indicator */}
          <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Steaming Speed</div>
            <div className="text-xl font-mono font-black text-cyan-300">{slowSteamingSpeed} Knots</div>
          </div>
        </div>

        {/* Speed Slider */}
        <div className="mb-6 bg-slate-800/70 p-4 rounded-xl border border-slate-700 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300">Eco Slow Steaming (10.0 kn)</span>
            <span className="font-mono text-cyan-400 font-black text-sm">Target: {slowSteamingSpeed} kn</span>
            <span className="font-bold text-slate-300">Full Service Speed (14.5 kn)</span>
          </div>
          <input
            type="range"
            min={10.0}
            max={14.5}
            step={0.1}
            value={slowSteamingSpeed}
            onChange={e => setSlowSteamingSpeed(parseFloat(e.target.value))}
            className="w-full cursor-pointer accent-[#FF3B00]"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Standard Speed: {virtualArrival.baseSpeedKnots} kn ({virtualArrival.standardSailingDays} transit days)</span>
            <span>Optimized Transit: {virtualArrival.slowSailingDays} transit days (+{virtualArrival.additionalSailingDays}d absorbed)</span>
          </div>
        </div>

        {/* Optimization Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-1">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Net Voyage Savings</span>
            </div>
            <div className="text-xl font-mono font-black text-emerald-400">
              ${Number(virtualArrival?.netVoyageSavingsDollars || 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">Fuel & Demurrage Combined</span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-bold mb-1">
              <Fuel className="w-4 h-4 text-cyan-300" />
              <span>Bunker Fuel Saved</span>
            </div>
            <div className="text-xl font-mono font-black text-cyan-300">
              {virtualArrival?.fuelSavedTons || 0} MT
            </div>
            <span className="text-[10px] text-slate-400">${Number(virtualArrival?.fuelSavedDollars || 0).toLocaleString()} Saved</span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold mb-1">
              <Timer className="w-4 h-4 text-amber-400" />
              <span>Queue Absorbed</span>
            </div>
            <div className="text-xl font-mono font-black text-amber-400">
              {virtualArrival?.absorbedDemurrageDays || 0} Days
            </div>
            <span className="text-[10px] text-slate-400">${Number(virtualArrival?.demurrageAvoidedDollars || 0).toLocaleString()} Demurrage Cut</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-1">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>CO₂ Mitigated</span>
            </div>
            <div className="text-xl font-mono font-black text-emerald-400">
              {virtualArrival.co2AvoidedTons} MT CO₂
            </div>
            <span className="text-[10px] text-slate-400">IMO GHG Compliance</span>
          </div>
        </div>

        {/* Prescription Summary */}
        <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              By issuing a <strong>Virtual Arrival Notice of Readiness (NOR)</strong>, the vessel slows to <strong>{slowSteamingSpeed} knots</strong>, converting {virtualArrival.absorbedDemurrageDays} days of wasteful idle anchorage waiting into productive eco-steaming.
            </span>
          </div>
          <span className="font-mono font-bold text-emerald-400 shrink-0">
            +${Number(virtualArrival?.netVoyageSavingsDollars || 0).toLocaleString()} ROI
          </span>
        </div>
      </div>

      {/* 2. Turnaround Timeline & Idle Risk Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Turnaround Stages Timeline */}
        <div className="lg:col-span-2 card-clean p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-[#FF3B00] flex items-center justify-center">
                <Timer className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Voyage Turnaround & Time Allocation Model
                </h3>
                <p className="text-xs text-slate-500">Breakdown across loading, transit, anchorage queue, and discharging</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#FF3B00] bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
              {bestSolution ? bestSolution.vessel.name : 'Candidate Fleet'}
            </span>
          </div>

          {/* Progress Multi-Bar */}
          <div className="space-y-2 mb-6">
            <div className="h-6 w-full rounded-xl overflow-hidden flex shadow-inner bg-slate-100 p-1 gap-1">
              <div style={{ width: `${loadPct}%` }} className="bg-blue-500 rounded-lg flex items-center justify-center text-[10px] font-bold text-white transition-all">
                Load {loadPct}%
              </div>
              <div style={{ width: `${seaPct}%` }} className="bg-[#FF3B00] rounded-lg flex items-center justify-center text-[10px] font-bold text-white transition-all">
                Transit {seaPct}%
              </div>
              <div style={{ width: `${waitPct}%` }} className="bg-amber-500 rounded-lg flex items-center justify-center text-[10px] font-bold text-white transition-all">
                Wait {waitPct}%
              </div>
              <div style={{ width: `${dischargePct}%` }} className="bg-emerald-500 rounded-lg flex items-center justify-center text-[10px] font-bold text-white transition-all">
                Disch {dischargePct}%
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-2">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">1. Origin Loading</span>
                <strong className="text-blue-600 text-sm">{(turnaroundDays * (loadPct / 100)).toFixed(1)} Days</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">2. Sea Transit</span>
                <strong className="text-[#FF3B00] text-sm">{sailingDays} Days</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">3. Anchorage Queue</span>
                <strong className="text-amber-600 text-sm">{waitingDays} Days</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">4. Berth Discharge</span>
                <strong className="text-emerald-600 text-sm">{dischargeDays} Days</strong>
              </div>
            </div>
          </div>

          {/* Demurrage Mitigation Prescriptions */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Proactive Demurrage & Idle Mitigation Strategies for {activePort.name}</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 font-medium">
              <li><strong>Virtual Arrival & Speed Optimization:</strong> Reduce steaming speed to absorb the {waitingDays}-day anchorage queue, saving thousands in bunker fuel while meeting Notice of Readiness (NOR) laycan.</li>
              <li><strong>Berth Allocation Priority:</strong> Utilize short-term CoA contracts to secure dedicated berth windows over ad-hoc spot vessels.</li>
              {activePort.key === 'Haldia' && (
                <li><strong>Sandheads Transshipment:</strong> Divert vessel to Sagar-Sandheads anchorage to lighten 50% cargo into barges, eliminating the 5.2-day lock gate backlog.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Demurrage Risk Card */}
        <div className="card-clean p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Demurrage Risk Exposure
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Calculated demurrage cost at ${Number(activePort?.demurrageRatePerDay || 22000).toLocaleString()}/day penalty rate
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Port Waiting Days:</span>
                <strong className="text-slate-900">{waitingDays} Days</strong>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Demurrage Penalty Rate:</span>
                <strong className="text-rose-600">${Number(activePort?.demurrageRatePerDay || 22000).toLocaleString()}/day</strong>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                <span className="font-bold">Total Expected Demurrage:</span>
                <strong className="text-base font-black">${Number(demurrageExposure || 0).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>CoA contracts allow demurrage caps up to 25% lower than spot charter rates.</span>
          </div>
        </div>

      </div>

      {/* 3. Triangular Backhaul Cargo Matching (Deadheading Elimination) */}
      <div className="card-clean p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Triangular Backhaul Matching (Ballast Leg Cost Recovery)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Match discharging vessels with export parcels from East Coast India to eliminate empty deadheading
            </p>
          </div>

          <span className="badge-navy font-mono text-xs">
            {BACKHAUL_OPPORTUNITIES.length} Active Export Opportunities
          </span>
        </div>

        {/* Backhaul Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {BACKHAUL_OPPORTUNITIES.map(bh => {
            const isSelected = selectedBackhaul.id === bh.id;

            return (
              <div
                key={bh.id}
                onClick={() => setSelectedBackhaul(bh)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/30 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    {bh.originPort} Port
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600">
                    +${(bh.potentialNetBenefitDollars / 1000).toFixed(0)}k Benefit
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 mb-1">{bh.cargo}</h4>
                <div className="text-xs text-slate-500 mb-2 font-medium">📍 {bh.destinationRegion}</div>

                <div className="text-[11px] font-mono text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Revenue:</span>
                    <strong>${bh.revenuePerTon}/MT</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ballast Cut:</span>
                    <strong className="text-emerald-600">{bh.ballastReductionPercent}%</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Backhaul Deep-Dive */}
        <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs uppercase font-bold tracking-wider text-purple-300">Selected Triangular Route Proposal</span>
            </div>
            <h4 className="text-base font-bold text-white font-heading">
              {selectedBackhaul.cargo} ({selectedBackhaul.originPort} → {selectedBackhaul.destinationRegion})
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {selectedBackhaul.summary}
            </p>
          </div>

          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-right min-w-[200px] shrink-0">
            <div className="text-[10px] uppercase font-bold text-slate-400">Net Voyage Financial Benefit</div>
            <div className="text-2xl font-mono font-black text-emerald-400">
              +${Number(selectedBackhaul?.potentialNetBenefitDollars || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-purple-300 mt-0.5">
              Reduces empty ballast time by {selectedBackhaul.ballastReductionPercent}%
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
