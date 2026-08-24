import React, { useState } from 'react';
import { X, Calculator, CheckCircle2, AlertCircle, Ship, DollarSign, Anchor } from 'lucide-react';
import { EAST_COAST_PORT_MATRIX, solveVesselAllocation } from '../services/optimizerEngine';

export default function FreightQuoteModal({ isOpen, onClose, horizonForecast, decisionTrigger, bunkerPrice }) {
  const [origin, setOrigin] = useState('Samarinda (Indonesia)');
  const [targetPort, setTargetPort] = useState('Dhamra');
  const [tonnage, setTonnage] = useState(75000);

  if (!isOpen) return null;

  const result = solveVesselAllocation({
    destinationPortKey: targetPort,
    cargoQuantityTons: tonnage,
    bunkerPrice,
    horizonForecast,
    decisionTrigger
  });

  const { bestSolution, recommendationCard } = result;
  const portSpec = EAST_COAST_PORT_MATRIX[targetPort];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-2xl p-6 relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-[#FF3B00] flex items-center justify-center">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-900">Instant Freight Rate & Quote Calculator</h2>
              <p className="text-xs text-slate-500">Real-time GARCH forecast & PuLP vessel allocation engine</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Origin Terminal:</label>
            <select
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:border-[#FF3B00]"
            >
              <option value="Samarinda (Indonesia)">Samarinda (Indonesia)</option>
              <option value="Newcastle (Australia)">Newcastle (Australia)</option>
              <option value="Richards Bay (South Africa)">Richards Bay (South Africa)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Destination Port:</label>
            <select
              value={targetPort}
              onChange={e => setTargetPort(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:border-[#FF3B00]"
            >
              {Object.keys(EAST_COAST_PORT_MATRIX).map(p => (
                <option key={p} value={p}>{p} Port</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Shipment Volume (MT):</label>
            <input
              type="number"
              step="5000"
              value={tonnage}
              onChange={e => setTonnage(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 font-mono text-slate-900 focus:outline-none focus:border-[#FF3B00]"
            />
          </div>
        </div>

        {/* Calculated Results Box */}
        {bestSolution ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs mb-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <Ship className="w-4 h-4 text-[#FF3B00]" /> Recommended Vessel: {bestSolution.vessel.name}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">DRAFT & LOA COMPLIANT</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div>
                <span className="text-slate-500 block">Landed Cost / MT:</span>
                <span className="font-bold text-base text-[#FF3B00]">${bestSolution.costBreakdown.costPerTon}/MT</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Voyage Cost:</span>
                <span className="font-bold text-base text-slate-900">${(bestSolution.costBreakdown.totalCost / 1000000).toFixed(2)}M</span>
              </div>
              <div>
                <span className="text-slate-500 block">Sailing + Discharge:</span>
                <span className="font-bold text-slate-800">{bestSolution.vessel.availableFromDay + 5} Days</span>
              </div>
              <div>
                <span className="text-slate-500 block">CoA Trigger Status:</span>
                <span className={`font-bold ${decisionTrigger.triggerActivated ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {decisionTrigger.recommendation}
                </span>
              </div>
            </div>

            <p className="text-slate-600 border-t border-slate-200 pt-2 leading-relaxed">
              {recommendationCard.summary}
            </p>
          </div>
        ) : (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs mb-6 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <strong className="block text-sm">Draft or LOA Limit Exceeded for {targetPort} Port</strong>
              Current cargo volume or candidate vessels exceed physical port limits (Max draft: {portSpec.maxDraft}m).
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="text-xs text-slate-500 font-mono">Powered by OceanPulse PuLP Solver</span>
          <button onClick={onClose} className="btn-coral py-2.5 px-6 text-xs rounded-lg">
            Confirm Freight Quote
          </button>
        </div>

      </div>
    </div>
  );
}
