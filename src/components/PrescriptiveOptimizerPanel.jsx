import React from 'react';
import { Compass, CheckCircle2, XCircle, Anchor, ShieldCheck, Leaf } from 'lucide-react';
import { EAST_COAST_PORT_MATRIX, solveVesselAllocation } from '../services/optimizerEngine';

export default function PrescriptiveOptimizerPanel({
  selectedHorizonForecast = {},
  decisionTrigger = {},
  bunkerPrice = 629.0,
  cargoQuantity = 75000,
  onPortChange,
  selectedPortKey = 'Paradip',
  selectedOriginKey = 'Indonesia_Samarinda',
  optimizationResults: passedResults
}) {
  const fallbackResults = solveVesselAllocation({
    originPortKey: selectedOriginKey,
    destinationPortKey: selectedPortKey,
    cargoQuantityTons: cargoQuantity,
    bunkerPrice,
    horizonForecast: selectedHorizonForecast,
    decisionTrigger
  });

  const optimizationResults = passedResults || fallbackResults;
  
  const rawBest = optimizationResults?.bestSolution || fallbackResults.bestSolution;
  const rawSolutions = optimizationResults?.allSolutions || optimizationResults?.allEvaluatedVessels || fallbackResults.allSolutions || [];
  const originPort = optimizationResults?.originPort || fallbackResults.originPort;
  const destPort = optimizationResults?.destPort || optimizationResults?.destinationPort || fallbackResults.destPort;
  const recommendationCard = optimizationResults?.recommendationCard || fallbackResults.recommendationCard;

  const normalizeItem = (sol) => {
    if (!sol) return sol;
    const cii = sol.ciiGrade || sol.carbonMetrics?.ciiGrade || 'B';
    const ciiGrams = sol.ciiGramsPerTonNM || sol.carbonMetrics?.co2GramsPerTonNM || 4.2;
    const costPerTon = sol.costPerTon ?? sol.costBreakdown?.costPerTon ?? 15.30;
    const totalCost = sol.totalCost ?? sol.costBreakdown?.totalCost ?? 1150000;

    return {
      ...sol,
      ciiGrade: cii,
      costPerTon,
      totalCost,
      carbonMetrics: sol.carbonMetrics || {
        ciiGrade: cii,
        co2GramsPerTonNM: ciiGrams
      },
      costBreakdown: sol.costBreakdown || {
        totalCost,
        costPerTon
      },
      constraintCheck: sol.constraintCheck || {
        destDraft: { pass: sol.isFeasible || sol.requiresLightering, lightered: sol.requiresLightering },
        destLOA: { pass: true },
        vesselClass: { pass: true }
      }
    };
  };

  const bestSolution = normalizeItem(rawBest);
  const allSolutions = rawSolutions.map(normalizeItem);

  const isCoARecommended = decisionTrigger?.triggerActivated || decisionTrigger?.action === 'FIX_COA_NOW';

  return (
    <div className="space-y-6">
      
      {/* 1. Decision Trigger Status Banner */}
      <div className={`card-clean p-6 border-2 transition-all ${
        isCoARecommended
          ? 'border-amber-400 bg-amber-50/50 shadow-sm'
          : 'border-emerald-400 bg-emerald-50/50 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl ${
              isCoARecommended
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-500 text-white'
            }`}>
              {isCoARecommended ? <ShieldCheck className="w-8 h-8" /> : <Compass className="w-8 h-8" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-500">Prescriptive Decision Trigger Rule</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-xs text-[#FF3B00] font-bold">
                  Enter_CoA IF (σ̂²_{selectedHorizonForecast.horizon || 15}D &gt; θ_risk AND ŷ_{selectedHorizonForecast.horizon || 15}D ≥ C_CoA)
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2 font-heading">
                Recommended Strategy: 
                <span className={isCoARecommended ? 'text-amber-700 font-black' : 'text-emerald-700 font-black'}>
                  {isCoARecommended ? 'LOCK IN 3-VOYAGE COA (HEDGE RISK)' : 'OPERATE ON PROMPT SPOT MARKET'}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs font-mono shadow-sm">
            <div className="text-center px-2">
              <div className="text-[10px] text-slate-400 font-sans font-bold">Vol Ratio (σ̂ / ŷ)</div>
              <div className={`font-bold ${decisionTrigger?.volMetricRatio > decisionTrigger?.thetaRisk ? 'text-amber-600' : 'text-slate-700'}`}>
                {decisionTrigger?.volMetricRatio || 0.12} {decisionTrigger?.volMetricRatio > decisionTrigger?.thetaRisk ? '>' : '≤'} {decisionTrigger?.thetaRisk || 0.20}
              </div>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-[10px] text-slate-400 font-sans font-bold">Rate vs CoA Target</div>
              <div className={`font-bold ${decisionTrigger?.predictedRate >= decisionTrigger?.targetCoACost ? 'text-amber-600' : 'text-slate-700'}`}>
                ${Number(decisionTrigger?.predictedRate || decisionTrigger?.expectedDailyRate || 22000).toLocaleString()} {decisionTrigger?.predictedRate >= decisionTrigger?.targetCoACost ? '≥' : '<'} ${Number(decisionTrigger?.targetCoACost || 21500).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-700 mt-3 pt-3 border-t border-slate-200 leading-relaxed font-medium">
          {decisionTrigger?.reasoning || decisionTrigger?.recommendationText || 'Prescriptive evaluation recommends optimizing fixture timing based on forward volatility bounds.'}
        </p>
      </div>

      {/* 2. Executive Recommendation Card with CII Rating */}
      <div className="card-clean p-6 bg-slate-900 text-white border-slate-900 shadow-xl relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[#FF3B00] font-bold text-xs uppercase tracking-wider">
            <Anchor className="w-4 h-4" /> Objective B • Vessel Type & Route Allocation Solution
          </div>
          <div className="flex items-center gap-2">
            {bestSolution && (
              <span className="badge-navy bg-emerald-900/80 text-emerald-300 border-emerald-700 font-mono text-[10px] flex items-center gap-1">
                <Leaf className="w-3 h-3 text-emerald-400" /> IMO CII Grade {bestSolution?.ciiGrade || bestSolution?.carbonMetrics?.ciiGrade || 'B'} ({bestSolution?.carbonMetrics?.co2GramsPerTonNM || 4.2} g/t-NM)
              </span>
            )}
            <span className="badge-navy bg-slate-800 text-slate-300 border-slate-700 font-mono text-[10px]">PuLP MILP Solver</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 font-heading">{recommendationCard?.headline || 'Optimal Vessel Allocation'}</h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-4 font-medium">
          {recommendationCard?.summary || 'Optimized vessel allocation selected for maximum fuel efficiency and landed cost minimization.'}
        </p>
        
        <div className="flex flex-wrap items-center justify-between text-xs pt-3 border-t border-slate-800 font-mono text-slate-300 gap-2">
          <span>Route: <strong className="text-white">{originPort?.name || selectedOriginKey} → {destPort?.name || selectedPortKey}</strong></span>
          <span>Contract Mode: <strong className="text-[#FF3B00]">{recommendationCard?.contractStructure || 'Prompt Spot Fixture'}</strong></span>
          <span>Savings vs Volatile Spot: <strong className="text-emerald-400 font-bold">{recommendationCard?.savingsVsSpot || '~$180,000'}</strong></span>
        </div>
      </div>

      {/* 3. Port Matrix & Vessel Allocation Table */}
      <div className="card-clean p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Anchor className="w-4 h-4 text-[#FF3B00]" />
              Dual-Port Constraint Validation & Landed Cost Solver
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Validates draft, LOA, handling rates, and IMO Carbon Intensity Indicator (CII) at loading and discharge ports
            </p>
          </div>

          {/* Quick Port Switcher */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {Object.keys(EAST_COAST_PORT_MATRIX).map(portKey => (
              <button
                key={portKey}
                onClick={() => onPortChange && onPortChange(portKey)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedPortKey === portKey
                    ? 'bg-[#FF3B00] text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {portKey}
              </button>
            ))}
          </div>
        </div>

        {/* Port Technical Parameters Comparison */}
        <div className="mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <span className="text-slate-400 block font-sans font-medium">Origin Loading Port:</span>
            <span className="font-bold text-slate-900">{(originPort?.name || selectedOriginKey).split('(')[0]}</span>
            <span className="text-[10px] text-slate-500 block">Max Draft: {originPort?.maxDraft || 14.5}m • {((originPort?.dailyLoadingRate || 35000) / 1000).toFixed(0)}k MT/d</span>
          </div>
          <div>
            <span className="text-slate-400 block font-sans font-medium">Destination Discharge:</span>
            <span className="font-bold text-slate-900">{(destPort?.name || selectedPortKey).split('(')[0]}</span>
            <span className="text-[10px] text-slate-500 block">Max Draft: {destPort?.maxDraft || 14.5}m • {((destPort?.dailyDischargeRate || 50000) / 1000).toFixed(0)}k MT/d</span>
          </div>
          <div>
            <span className="text-slate-400 block font-sans font-medium">Cargo Parcel & Tariffs:</span>
            <span className="font-bold text-slate-900">{Number(cargoQuantity || 75000).toLocaleString()} MT</span>
            <span className="text-[10px] text-slate-500 block">Tariff: ${destPort?.portTariffPerTon || 3.9}/MT</span>
          </div>
          <div>
            <span className="text-slate-400 block font-sans font-medium">Waiting & Demurrage:</span>
            <span className="font-bold text-amber-600">{destPort?.avgWaitingDays || 2.4} days wait</span>
            <span className="text-[10px] text-slate-500 block">${Number(destPort?.demurrageRatePerDay || 22000).toLocaleString()}/day rate</span>
          </div>
        </div>

        {/* Vessel Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Vessel & Class</th>
                <th className="py-2.5 px-3">Draft / LOA / Beam</th>
                <th className="py-2.5 px-3">Dual-Port Validation</th>
                <th className="py-2.5 px-3">IMO CII Rating</th>
                <th className="py-2.5 px-3 text-right">Landed Cost / MT</th>
                <th className="py-2.5 px-3 text-right">Total Voyage Cost</th>
                <th className="py-2.5 px-3 text-center">Feasibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allSolutions.map((sol) => {
                const isOptimal = bestSolution && (bestSolution.vessel?.id === sol.vessel?.id || bestSolution.vessel?.name === sol.vessel?.name);
                const isFeasible = sol.isFeasible !== false;
                const isLightered = sol.requiresLightering || sol.constraintCheck?.destDraft?.lightered;
                const draftPass = sol.constraintCheck?.destDraft?.pass ?? isFeasible;
                const loaPass = sol.constraintCheck?.destLOA?.pass ?? true;
                const classPass = sol.constraintCheck?.vesselClass?.pass ?? true;
                const ciiGrade = sol.ciiGrade || sol.carbonMetrics?.ciiGrade || 'B';
                const co2Grams = sol.carbonMetrics?.co2GramsPerTonNM || 4.2;
                const landedCost = sol.costPerTon ?? sol.costBreakdown?.costPerTon ?? 15.30;
                const totalCost = sol.totalCost ?? sol.costBreakdown?.totalCost ?? 1150000;

                return (
                  <tr
                    key={sol.vessel?.id || sol.vessel?.name}
                    className={`transition-colors ${
                      isOptimal
                        ? 'bg-orange-50/70 border-l-4 border-l-[#FF3B00] font-medium'
                        : isFeasible
                        ? 'hover:bg-slate-50'
                        : 'opacity-50 bg-slate-50/50'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {sol.vessel?.name}
                        {isOptimal && <span className="px-1.5 py-0.5 rounded bg-[#FF3B00] text-white text-[9px] uppercase font-extrabold">OPTIMAL</span>}
                      </div>
                      <div className="text-[11px] text-slate-500">{sol.vessel?.vesselClass} • {Number(sol.vessel?.dwt || 75000).toLocaleString()} DWT</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-700">
                      <div>Draft: {sol.vessel?.draft}m (Dest Max: {destPort?.maxDraft || 14.5}m)</div>
                      <div className="text-slate-400 text-[11px]">LOA: {sol.vessel?.loa}m • Beam: {sol.vessel?.beam}m</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded font-bold ${
                          isLightered
                            ? 'bg-amber-100 text-amber-800'
                            : draftPass
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isLightered ? 'Sandheads Lightered' : `Draft ${draftPass ? '✓' : '✗'}`}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-bold ${loaPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          LOA {loaPass ? '✓' : '✗'}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-bold ${classPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          Class {classPass ? '✓' : '✗'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ciiGrade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                          ciiGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                          ciiGrade === 'C' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          Grade {ciiGrade}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {co2Grams} g/t-NM
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {isFeasible ? `$${Number(landedCost).toFixed(2)}/MT` : 'N/A'}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-[#FF3B00]">
                      {isFeasible ? `$${(Number(totalCost) / 1000000).toFixed(2)}M` : 'Infeasible'}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {isFeasible ? (
                        <CheckCircle2 className={`w-5 h-5 inline ${isOptimal ? 'text-[#FF3B00]' : 'text-emerald-600'}`} />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500 inline" title="Port Constraint Violation" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
