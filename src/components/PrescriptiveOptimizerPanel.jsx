import React from 'react';
import { Compass, CheckCircle2, XCircle, Anchor, ShieldCheck } from 'lucide-react';
import { EAST_COAST_PORT_MATRIX, solveVesselAllocation } from '../services/optimizerEngine';

export default function PrescriptiveOptimizerPanel({
  selectedHorizonForecast,
  decisionTrigger,
  bunkerPrice,
  cargoQuantity,
  onPortChange,
  selectedPortKey
}) {
  const optimizationResults = solveVesselAllocation({
    destinationPortKey: selectedPortKey,
    cargoQuantityTons: cargoQuantity,
    bunkerPrice,
    horizonForecast: selectedHorizonForecast,
    decisionTrigger
  });

  const { bestSolution, allSolutions, recommendationCard } = optimizationResults;
  const activePort = EAST_COAST_PORT_MATRIX[selectedPortKey];

  return (
    <div className="space-y-6">
      
      {/* 1. Decision Trigger Status Banner */}
      <div className={`card-clean p-6 border-2 transition-all ${
        decisionTrigger.triggerActivated
          ? 'border-amber-400 bg-amber-50/50 shadow-sm'
          : 'border-emerald-400 bg-emerald-50/50 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl ${
              decisionTrigger.triggerActivated
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-500 text-white'
            }`}>
              {decisionTrigger.triggerActivated ? <ShieldCheck className="w-8 h-8" /> : <Compass className="w-8 h-8" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-500">Prescriptive Decision Trigger Rule</span>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-xs text-[#FF3B00] font-bold">
                  Enter_CoA IF (σ̂²_{selectedHorizonForecast.horizon}D &gt; θ_risk AND ŷ_{selectedHorizonForecast.horizon}D ≥ C_CoA)
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2 font-heading">
                Action Required: 
                <span className={decisionTrigger.triggerActivated ? 'text-amber-700 font-black' : 'text-emerald-700 font-black'}>
                  {decisionTrigger.recommendation === 'ENTER_COA' ? 'LOCK IN MEDIUM-TERM COA' : 'OPERATE ON SPOT MARKET'}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs font-mono shadow-sm">
            <div className="text-center px-2">
              <div className="text-[10px] text-slate-400 font-sans font-bold">Vol Ratio (σ̂ / ŷ)</div>
              <div className={`font-bold ${decisionTrigger.volMetricRatio > decisionTrigger.thetaRisk ? 'text-amber-600' : 'text-slate-700'}`}>
                {decisionTrigger.volMetricRatio} {decisionTrigger.volMetricRatio > decisionTrigger.thetaRisk ? '>' : '≤'} {decisionTrigger.thetaRisk}
              </div>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-[10px] text-slate-400 font-sans font-bold">Rate vs Target</div>
              <div className={`font-bold ${decisionTrigger.predictedRate >= decisionTrigger.targetCoACost ? 'text-amber-600' : 'text-slate-700'}`}>
                ${decisionTrigger.predictedRate.toLocaleString()} {decisionTrigger.predictedRate >= decisionTrigger.targetCoACost ? '≥' : '<'} ${decisionTrigger.targetCoACost.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-700 mt-3 pt-3 border-t border-slate-200 leading-relaxed font-medium">
          {decisionTrigger.reasoning}
        </p>
      </div>

      {/* 2. Executive Recommendation Card */}
      <div className="card-clean p-6 bg-slate-900 text-white border-slate-900 shadow-xl relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[#FF3B00] font-bold text-xs uppercase tracking-wider">
            <Anchor className="w-4 h-4" /> Executive Procurement Recommendation
          </div>
          <span className="badge-navy bg-slate-800 text-slate-300 border-slate-700 font-mono text-[10px]">PuLP Vessel Solver</span>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 font-heading">{recommendationCard.headline}</h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-4 font-medium">
          {recommendationCard.summary}
        </p>
        
        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800 font-mono text-slate-300">
          <span>Target Destination: <strong className="text-white">{activePort.name}</strong></span>
          <span>Risk Savings: <strong className="text-emerald-400 font-bold">{recommendationCard.savingsVsSpot}</strong></span>
        </div>
      </div>

      {/* 3. Port Matrix & Vessel Table */}
      <div className="card-clean p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Anchor className="w-4 h-4 text-[#FF3B00]" />
              East Coast Port Constraints & PuLP Vessel Allocator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Filters candidate fleet against physical draft & LOA limits, minimizing landed cost ($/MT)
            </p>
          </div>

          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {Object.keys(EAST_COAST_PORT_MATRIX).map(portKey => (
              <button
                key={portKey}
                onClick={() => onPortChange(portKey)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
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

        {/* Selected Port Specs */}
        <div className="mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <span className="text-slate-500 block font-sans font-medium">Max Draft:</span>
            <span className="font-bold text-slate-900">{activePort.maxDraft} meters</span>
          </div>
          <div>
            <span className="text-slate-500 block font-sans font-medium">Max LOA:</span>
            <span className="font-bold text-slate-900">{activePort.maxLOA} meters</span>
          </div>
          <div>
            <span className="text-slate-500 block font-sans font-medium">Discharge Rate:</span>
            <span className="font-bold text-slate-900">{(activePort.dailyDischargeRate / 1000).toFixed(0)}k MT/day</span>
          </div>
          <div>
            <span className="text-slate-500 block font-sans font-medium">Avg Waiting:</span>
            <span className="font-bold text-amber-600">{activePort.avgWaitingDays} days</span>
          </div>
        </div>

        {/* Vessel Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Vessel & Class</th>
                <th className="py-2.5 px-3">Draft / LOA</th>
                <th className="py-2.5 px-3">Constraint Validation</th>
                <th className="py-2.5 px-3 text-right">Landed Cost / MT</th>
                <th className="py-2.5 px-3 text-right">Total Voyage Cost</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allSolutions.map((sol) => {
                const isOptimal = bestSolution && bestSolution.vessel.id === sol.vessel.id;

                return (
                  <tr
                    key={sol.vessel.id}
                    className={`transition-colors ${
                      isOptimal
                        ? 'bg-orange-50/70 border-l-4 border-l-[#FF3B00] font-medium'
                        : sol.isFeasible
                        ? 'hover:bg-slate-50'
                        : 'opacity-50 bg-slate-50/50'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {sol.vessel.name}
                        {isOptimal && <span className="px-1.5 py-0.5 rounded bg-[#FF3B00] text-white text-[9px] uppercase font-extrabold">OPTIMAL</span>}
                      </div>
                      <div className="text-[11px] text-slate-500">{sol.vessel.vesselClass} • {sol.vessel.dwt.toLocaleString()} DWT</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-700">
                      <div>Draft: {sol.vessel.draft}m</div>
                      <div className="text-slate-400 text-[11px]">LOA: {sol.vessel.loa}m</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded font-bold ${sol.constraintCheck.draft.pass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          Draft {sol.constraintCheck.draft.pass ? '✓' : '✗'}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-bold ${sol.constraintCheck.loa.pass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          LOA {sol.constraintCheck.loa.pass ? '✓' : '✗'}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-bold ${sol.constraintCheck.vesselClass.pass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          Class {sol.constraintCheck.vesselClass.pass ? '✓' : '✗'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {sol.isFeasible ? `$${sol.costBreakdown.costPerTon}/MT` : 'N/A'}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-[#FF3B00]">
                      {sol.isFeasible ? `$${(sol.costBreakdown.totalCost / 1000000).toFixed(2)}M` : 'Infeasible'}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {sol.isFeasible ? (
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
