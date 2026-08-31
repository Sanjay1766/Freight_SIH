import React from 'react';
import { Compass, CheckCircle2, XCircle, Anchor, ShieldCheck, Leaf } from 'lucide-react';
import { EAST_COAST_PORT_MATRIX, solveVesselAllocation } from '../services/optimizerEngine';

export default function PrescriptiveOptimizerPanel({
  selectedHorizonForecast = {},
  decisionTrigger = {},
  bunkerPrice = 784.50,
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
    <div className="space-y-5">
      
      {/* 1. Decision Trigger Status Banner */}
      <div className={`terminal-card p-5 border ${
        isCoARecommended
          ? 'border-[#FDE68A] bg-[#FFFDF5]'
          : 'border-[#BCEAE4] bg-[#F4FCFA]'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-xl ${
              isCoARecommended
                ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                : 'bg-[#E6F7F5] text-[#0D9488] border border-[#BCEAE4]'
            }`}>
              {isCoARecommended ? <ShieldCheck className="w-6 h-6" /> : <Compass className="w-6 h-6" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-bold text-[#627D98] tracking-wider">Strategic Procurement Trigger</span>
                <span className="text-[#CBDCE8]">•</span>
                <span className="text-xs text-[#077DB3] font-semibold">
                  Forecast Window: {selectedHorizonForecast.horizon || 15} Days Forward
                </span>
              </div>

              <h2 className="text-lg font-bold font-heading text-[#0F2942] mt-1 flex items-center gap-2">
                Recommended Strategy: 
                <span className={isCoARecommended ? 'text-[#B45309] font-extrabold' : 'text-[#0D9488] font-extrabold'}>
                  {isCoARecommended ? 'LOCK IN 3-VOYAGE TERM CONTRACT' : 'OPERATE ON PROMPT SPOT MARKET'}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-[#DCE8F0] text-xs font-mono shadow-xs">
            <div className="text-center px-1">
              <div className="text-[10px] text-[#627D98] font-sans font-bold uppercase">Rate Buffer</div>
              <div className={`font-bold tabular-nums ${decisionTrigger?.volMetricRatio > decisionTrigger?.thetaRisk ? 'text-[#B45309]' : 'text-[#334E68]'}`}>
                {decisionTrigger?.volMetricRatio || 0.12} {decisionTrigger?.volMetricRatio > decisionTrigger?.thetaRisk ? '>' : '≤'} {decisionTrigger?.thetaRisk || 0.20}
              </div>
            </div>
            <div className="h-6 w-px bg-[#E2EDF5]" />
            <div className="text-center px-1">
              <div className="text-[10px] text-[#627D98] font-sans font-bold uppercase">Expected vs Target</div>
              <div className={`font-bold tabular-nums ${decisionTrigger?.predictedRate >= decisionTrigger?.targetCoACost ? 'text-[#B45309]' : 'text-[#334E68]'}`}>
                ${Number(decisionTrigger?.predictedRate || decisionTrigger?.expectedDailyRate || 22000).toLocaleString()} {decisionTrigger?.predictedRate >= decisionTrigger?.targetCoACost ? '≥' : '<'} ${Number(decisionTrigger?.targetCoACost || 21500).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#334E68] mt-3 pt-3 border-t border-[#E8F0F6] leading-relaxed font-medium">
          {decisionTrigger?.reasoning || decisionTrigger?.recommendationText || 'Optimizing fixture timing based on current market trends and expected port waiting times.'}
        </p>
      </div>

      {/* 2. Executive Recommendation Card with CII Rating */}
      <div className="terminal-card p-5 border-[#BED9EB] bg-gradient-to-r from-[#EBF4FA] via-[#F4F9FC] to-white">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 text-[#077DB3] font-bold text-xs uppercase tracking-wider">
            <Anchor className="w-4 h-4" /> Recommended Vessel Type & Route Solution
          </div>
          <div className="flex items-center gap-2">
            {bestSolution && (
              <span className="status-pill status-pill-emerald text-xs">
                <Leaf className="w-3.5 h-3.5" /> Energy Rating: Grade {bestSolution?.ciiGrade || 'B'} ({bestSolution?.carbonMetrics?.co2GramsPerTonNM || 4.2} g/t-NM)
              </span>
            )}
            <span className="status-pill status-pill-ocean text-xs font-semibold">
              Optimal Match
            </span>
          </div>
        </div>

        <h3 className="text-base font-bold font-heading text-[#0F2942] mb-1.5">{recommendationCard?.headline || 'Optimal Vessel Allocation'}</h3>
        <p className="text-xs text-[#334E68] leading-relaxed mb-3 font-medium">
          {recommendationCard?.summary || 'Optimized allocation selected for lowest landed cost per ton while satisfying draft and length constraints.'}
        </p>
        
        <div className="flex flex-wrap items-center justify-between text-xs pt-2.5 border-t border-[#DCE8F0] text-[#334E68] gap-2">
          <span>Route: <strong className="text-[#0F2942]">{(originPort?.name || selectedOriginKey).split('(')[0]} ➔ {(destPort?.name || selectedPortKey).split('(')[0]}</strong></span>
          <span>Contract Mode: <strong className="text-[#077DB3]">{recommendationCard?.contractStructure || 'Prompt Spot Fixture'}</strong></span>
          <span>Estimated Savings: <strong className="text-[#0D9488] font-bold tabular-nums font-mono">{recommendationCard?.savingsVsSpot || '~$180,000 / voyage'}</strong></span>
        </div>
      </div>

      {/* 3. Port Matrix & Vessel Allocation Table */}
      <div className="terminal-card p-5 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold font-heading text-[#0F2942] flex items-center gap-2">
              <Anchor className="w-4 h-4 text-[#077DB3]" />
              Port Draft Compatibility & Fleet Economics Matrix
            </h3>
            <p className="text-xs text-[#627D98] mt-0.5 font-medium">
              Validates draft, berth length, lightering at Sagar-Sandheads, and landed costs per ton.
            </p>
          </div>

          {/* Quick Port Switcher */}
          <div className="flex flex-wrap gap-1 bg-[#F0F6FA] p-1 rounded-lg border border-[#DCE8F0]">
            {Object.keys(EAST_COAST_PORT_MATRIX).map(portKey => (
              <button
                key={portKey}
                onClick={() => onPortChange && onPortChange(portKey)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  selectedPortKey === portKey
                    ? 'bg-white text-[#077DB3] shadow-xs border border-[#BED9EB]'
                    : 'text-[#627D98] hover:text-[#0F2942]'
                }`}
              >
                {portKey}
              </button>
            ))}
          </div>
        </div>

        {/* Port Technical Parameters Comparison */}
        <div className="mb-4 p-3.5 rounded-xl bg-[#F5F9FC] border border-[#E2EDF5] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[#627D98] block text-[10px] font-bold uppercase">Loading Port</span>
            <span className="font-bold text-[#0F2942]">{(originPort?.name || selectedOriginKey).split('(')[0]}</span>
            <span className="text-[11px] text-[#627D98] block mt-0.5">Draft: {originPort?.maxDraft || 14.5}m • {((originPort?.dailyLoadingRate || 35000) / 1000).toFixed(0)}k MT/d</span>
          </div>
          <div>
            <span className="text-[#627D98] block text-[10px] font-bold uppercase">Discharge Port</span>
            <span className="font-bold text-[#077DB3]">{(destPort?.name || selectedPortKey).split('(')[0]}</span>
            <span className="text-[11px] text-[#627D98] block mt-0.5">Draft: {destPort?.maxDraft || 14.5}m • {((destPort?.dailyDischargeRate || 50000) / 1000).toFixed(0)}k MT/d</span>
          </div>
          <div>
            <span className="text-[#627D98] block text-[10px] font-bold uppercase">Cargo Parcel & Tariff</span>
            <span className="font-bold text-[#0F2942] font-mono tabular-nums">{Number(cargoQuantity || 75000).toLocaleString()} MT</span>
            <span className="text-[11px] text-[#627D98] block mt-0.5">Tariff: ${destPort?.portTariffPerTon || 3.9}/MT</span>
          </div>
          <div>
            <span className="text-[#627D98] block text-[10px] font-bold uppercase">Expected Waiting</span>
            <span className="font-bold text-[#B45309] font-mono tabular-nums">{destPort?.avgWaitingDays || 2.4} Days Wait</span>
            <span className="text-[11px] text-[#627D98] block mt-0.5">${Number(destPort?.demurrageRatePerDay || 22000).toLocaleString()}/day demurrage</span>
          </div>
        </div>

        {/* Vessel Matrix Table */}
        <div className="overflow-x-auto">
          <table className="terminal-table">
            <thead>
              <tr>
                <th>Vessel Class & Name</th>
                <th>Draft / Dimensions</th>
                <th>Port Compatibility</th>
                <th>Energy Rating</th>
                <th className="text-right">Landed Cost / MT</th>
                <th className="text-right">Total Voyage Cost</th>
                <th className="text-center">Feasibility</th>
              </tr>
            </thead>
            <tbody>
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
                    className={isOptimal ? 'bg-[#EBF4FA] font-semibold' : !isFeasible ? 'opacity-40' : ''}
                  >
                    <td>
                      <div className="font-bold text-[#0F2942] flex items-center gap-1.5">
                        {sol.vessel?.name}
                        {isOptimal && (
                          <span className="status-pill status-pill-ocean text-[10px] py-0 px-1.5">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#627D98]">
                        {sol.vessel?.vesselClass} • {Number(sol.vessel?.dwt || 75000).toLocaleString()} DWT
                      </div>
                    </td>

                    <td className="text-xs text-[#334E68]">
                      <div>Draft: {sol.vessel?.draft}m (Port Max: {destPort?.maxDraft || 14.5}m)</div>
                      <div className="text-[#829AB1] text-[11px]">LOA: {sol.vessel?.loa}m • Beam: {sol.vessel?.beam}m</div>
                    </td>

                    <td>
                      <div className="flex flex-wrap gap-1 text-[11px]">
                        <span className={`status-pill ${
                          isLightered
                            ? 'status-pill-amber'
                            : draftPass
                            ? 'status-pill-emerald'
                            : 'status-pill-coral'
                        }`}>
                          {isLightered ? 'Sandheads Lightered' : `Draft ${draftPass ? '✓' : '✗'}`}
                        </span>
                        <span className={`status-pill ${loaPass ? 'status-pill-emerald' : 'status-pill-coral'}`}>
                          LOA {loaPass ? '✓' : '✗'}
                        </span>
                        <span className={`status-pill ${classPass ? 'status-pill-emerald' : 'status-pill-coral'}`}>
                          Class {classPass ? '✓' : '✗'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className={`status-pill ${
                          ciiGrade === 'A' ? 'status-pill-emerald' :
                          ciiGrade === 'B' ? 'status-pill-ocean' :
                          ciiGrade === 'C' ? 'status-pill-amber' :
                          'status-pill-coral'
                        }`}>
                          Grade {ciiGrade}
                        </span>
                        <span className="text-[11px] text-[#627D98]">
                          {co2Grams} g/t-NM
                        </span>
                      </div>
                    </td>

                    <td className="text-right font-mono font-bold text-[#0F2942] tabular-nums text-xs">
                      {isFeasible ? `$${Number(landedCost).toFixed(2)}/MT` : 'N/A'}
                    </td>

                    <td className="text-right font-mono font-bold text-[#077DB3] tabular-nums text-xs">
                      {isFeasible ? `$${(Number(totalCost) / 1000000).toFixed(2)}M` : 'Infeasible'}
                    </td>

                    <td className="text-center">
                      {isFeasible ? (
                        <CheckCircle2 className={`w-4 h-4 inline ${isOptimal ? 'text-[#077DB3]' : 'text-[#0D9488]'}`} />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 inline" title="Port Constraint Violation" />
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
