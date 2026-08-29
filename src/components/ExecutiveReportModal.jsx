import React from 'react';
import { X, Printer, ShieldCheck, Ship, Leaf } from 'lucide-react';
import { EAST_COAST_PORT_MATRIX, ORIGIN_PORTS_MATRIX } from '../services/optimizerEngine';

export default function ExecutiveReportModal({
  isOpen,
  onClose,
  bestSolution,
  decisionTrigger = {},
  selectedHorizonForecast = {},
  selectedPortKey = 'Paradip',
  originPortKey = 'Indonesia_Samarinda',
  cargoQuantity = 75000,
  targetCoACost = 21500
}) {
  if (!isOpen) return null;

  const activePort = EAST_COAST_PORT_MATRIX[selectedPortKey] || EAST_COAST_PORT_MATRIX.Paradip;
  const originPort = ORIGIN_PORTS_MATRIX[originPortKey] || ORIGIN_PORTS_MATRIX.Indonesia_Samarinda;
  const currentDateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Safe normalized vessel and cost metrics
  const vesselName = bestSolution?.vessel?.name || 'MV Bharat Glory';
  const vesselClass = bestSolution?.vessel?.vesselClass || 'Kamsarmax';
  const vesselDwt = bestSolution?.vessel?.dwt || 82000;
  const ciiGrade = bestSolution?.ciiGrade || bestSolution?.carbonMetrics?.ciiGrade || 'B';
  const co2Tons = bestSolution?.co2Tons || bestSolution?.carbonMetrics?.co2EmissionsTons || 1250;

  const dailyRate = bestSolution?.dailyCharterRate || bestSolution?.costBreakdown?.dailyRate || 22000;
  const turnaroundDays = bestSolution?.totalVoyageDays || bestSolution?.totalTurnaroundDays || 18.5;
  const seaDays = bestSolution?.seaDaysOneWay || bestSolution?.sailingDays || 8.0;
  const fuelBurnPerDay = bestSolution?.vessel?.bunkerConsumptionTonsPerDay || 28;

  const freightCost = bestSolution?.charterCost || bestSolution?.costBreakdown?.freightCost || (dailyRate * turnaroundDays);
  const bunkerCost = bestSolution?.fuelCost || bestSolution?.costBreakdown?.bunkerCost || 350000;
  const portTariffCost = bestSolution?.portTariffs || bestSolution?.costBreakdown?.portTariffCost || 290000;
  const demurrageCost = bestSolution?.demurrageCost || bestSolution?.costBreakdown?.demurrageCost || 48000;
  const lighteringCost = bestSolution?.lighteringCost || bestSolution?.costBreakdown?.lighteringSurcharge || 0;
  const totalCost = bestSolution?.totalCost || bestSolution?.costBreakdown?.totalCost || (freightCost + bunkerCost + portTariffCost + demurrageCost + lighteringCost);
  const costPerTon = bestSolution?.costPerTon || bestSolution?.costBreakdown?.costPerTon || (totalCost / cargoQuantity);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl border border-slate-200 shadow-2xl p-8 relative my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#FF3B00]" />
            <span className="font-extrabold font-heading text-lg text-slate-900">Executive Chartering Strategy Memorandum</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="space-y-6 text-slate-800 font-sans">
          
          {/* Memorandum Title Box */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black font-heading text-slate-900 tracking-tight">OCEANPULSE FREIGHT INTELLIGENCE</h1>
                <p className="text-xs text-slate-500 font-mono">Prescriptive Vessel Chartering & Port Optimization Engine</p>
              </div>
              <div className="text-right text-xs font-mono text-slate-500">
                <div>Date: <strong>{currentDateStr}</strong></div>
                <div>Classification: <strong>STRICTLY CONFIDENTIAL</strong></div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200 text-xs font-mono">
              <div>
                <span className="text-slate-400 block">Origin Terminal:</span>
                <strong className="text-slate-900">{originPort.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Destination Port:</span>
                <strong className="text-slate-900">{activePort.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Parcel Volume:</span>
                <strong className="text-slate-900">{Number(cargoQuantity).toLocaleString()} MT</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Forecast Horizon:</span>
                <strong className="text-[#FF3B00]">{selectedHorizonForecast.horizon || 15} Days Forward</strong>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Action Recommendation */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF3B00]">Prescriptive Action Trigger</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/80 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-emerald-400" /> IMO CII Grade {ciiGrade}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                  {decisionTrigger.triggerActivated || decisionTrigger.action === 'FIX_COA_NOW' ? 'COA HEDGE RECOMMENDED' : 'SPOT MARKET RECOMMENDED'}
                </span>
              </div>
            </div>

            <h2 className="text-lg font-bold text-white font-heading">
              {decisionTrigger.triggerActivated || decisionTrigger.action === 'FIX_COA_NOW'
                ? `Execute 3-Voyage CoA at Target Cap ≤ $${Number(targetCoACost).toLocaleString()}/day`
                : `Procure on Prompt Spot Market at ~$${Number(selectedHorizonForecast.pointForecast || 22000).toLocaleString()}/day`}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {decisionTrigger.reasoning || decisionTrigger.recommendation || 'Optimize forward market entry in accordance with econometric volatility boundaries.'}
            </p>
          </div>

          {/* Section 2: Vessel & Landed Cost Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Ship className="w-4 h-4 text-[#FF3B00]" /> 1. Recommended Vessel Allocation & Financial Analysis
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">Selected Vessel:</span>
                <strong className="text-slate-900 text-sm">{vesselName}</strong>
                <div className="text-[10px] text-slate-400">{vesselClass} ({Number(vesselDwt).toLocaleString()} DWT)</div>
              </div>
              <div>
                <span className="text-slate-500 block">Landed Cost / MT:</span>
                <strong className="text-base text-[#FF3B00]">${Number(costPerTon).toFixed(2)}/MT</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Total Outlay:</span>
                <strong className="text-base text-slate-900">${(Number(totalCost) / 1000000).toFixed(2)}M</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Est. Turnaround:</span>
                <strong className="text-base text-blue-600">{turnaroundDays} Days</strong>
              </div>
            </div>

            {/* Table of Cost Components */}
            <table className="w-full text-xs text-left border-collapse border border-slate-200 rounded-lg overflow-hidden font-mono">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Cost Component</th>
                  <th className="py-2 px-3">Basis / Rate</th>
                  <th className="py-2 px-3 text-right">Subtotal ($)</th>
                  <th className="py-2 px-3 text-right">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-3 font-sans font-medium">Time Charter Freight</td>
                  <td className="py-2 px-3">${Number(dailyRate).toLocaleString()}/day × {turnaroundDays}d</td>
                  <td className="py-2 px-3 text-right font-bold">${Number(freightCost).toLocaleString()}</td>
                  <td className="py-2 px-3 text-right">{Math.round((freightCost / Math.max(1, totalCost)) * 100)}%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-medium">Bunker Fuel (VLSFO + Port Aux)</td>
                  <td className="py-2 px-3">{seaDays} sea days @ {fuelBurnPerDay} MT/d ({co2Tons} MT CO₂)</td>
                  <td className="py-2 px-3 text-right font-bold">${Number(bunkerCost).toLocaleString()}</td>
                  <td className="py-2 px-3 text-right">{Math.round((bunkerCost / Math.max(1, totalCost)) * 100)}%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-medium">Port Tariffs & Pilotage</td>
                  <td className="py-2 px-3">Origin ${originPort.portTariffPerTon} + Dest ${activePort.portTariffPerTon}/MT</td>
                  <td className="py-2 px-3 text-right font-bold">${Number(portTariffCost).toLocaleString()}</td>
                  <td className="py-2 px-3 text-right">{Math.round((portTariffCost / Math.max(1, totalCost)) * 100)}%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-medium">Anchorage Waiting Demurrage</td>
                  <td className="py-2 px-3">{activePort.avgWaitingDays} days @ ${Number(activePort.demurrageRatePerDay).toLocaleString()}/d</td>
                  <td className="py-2 px-3 text-right font-bold text-amber-600">${Number(demurrageCost).toLocaleString()}</td>
                  <td className="py-2 px-3 text-right">{Math.round((demurrageCost / Math.max(1, totalCost)) * 100)}%</td>
                </tr>
                {lighteringCost > 0 && (
                  <tr className="bg-amber-50/50">
                    <td className="py-2 px-3 font-sans font-medium text-amber-900">Sagar-Sandheads Lightering Surcharge</td>
                    <td className="py-2 px-3">Barge transshipment for Haldia arrival</td>
                    <td className="py-2 px-3 text-right font-bold text-amber-900">${Number(lighteringCost).toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">{Math.round((lighteringCost / Math.max(1, totalCost)) * 100)}%</td>
                  </tr>
                )}
                <tr className="bg-slate-100 font-bold">
                  <td className="py-2.5 px-3 font-sans font-extrabold" colSpan="2">TOTAL ESTIMATED LANDED PROCUREMENT COST</td>
                  <td className="py-2.5 px-3 text-right text-sm text-[#FF3B00] font-black">${Number(totalCost).toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-sm font-black">100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Port Operations & Approvals */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <div>
              <span>Model Version: <strong>OceanPulse Tier-2 Ensemble (GARCH + LightGBM + PuLP)</strong></span>
            </div>
            <div className="flex items-center gap-6 mt-2 sm:mt-0">
              <span>Prepared by: Logistics Optimization Desk</span>
              <span>Approved by: Chief Procurement Officer</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
