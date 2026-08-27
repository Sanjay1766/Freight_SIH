import React, { useState } from 'react';
import { X, Calculator, AlertCircle, Ship, FileText, Leaf } from 'lucide-react';
import { EAST_COAST_PORT_MATRIX, ORIGIN_PORTS_MATRIX, solveVesselAllocation } from '../services/optimizerEngine';

export default function FreightQuoteModal({
  isOpen,
  onClose,
  horizonForecast,
  decisionTrigger,
  bunkerPrice,
  onOpenReport
}) {
  const [commodity, setCommodity] = useState('Thermal Coal');
  const [origin, setOrigin] = useState('Indonesia_Samarinda');
  const [targetPort, setTargetPort] = useState('Dhamra');
  const [tonnage, setTonnage] = useState(75000);
  const [contractType, setContractType] = useState('RECOMMENDED');

  if (!isOpen) return null;

  const result = solveVesselAllocation({
    originPortKey: origin,
    destinationPortKey: targetPort,
    cargoQuantityTons: tonnage,
    bunkerPrice,
    horizonForecast,
    decisionTrigger,
    contractType
  });

  const { bestSolution, recommendationCard, destPort } = result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl border border-slate-200 shadow-2xl p-6 relative overflow-hidden my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-[#FF3B00] flex items-center justify-center">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-900">Instant Freight Rate & Landed Quote Calculator</h2>
              <p className="text-xs text-slate-500">Multi-Origin & 7 East Coast Port PuLP Optimization Engine</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-5 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">Commodity Type:</label>
            <select
              value={commodity}
              onChange={e => setCommodity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:border-[#FF3B00]"
            >
              <option value="Thermal Coal">Thermal Coal</option>
              <option value="Coking Coal">Coking / Met Coal</option>
              <option value="Iron Ore Pellets">Iron Ore Pellets</option>
              <option value="Limestone">Limestone / Dolomite</option>
              <option value="Bauxite">Bauxite / Alumina</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Origin Terminal:</label>
            <select
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:border-[#FF3B00]"
            >
              {Object.entries(ORIGIN_PORTS_MATRIX).map(([k, o]) => (
                <option key={k} value={k}>{o.country} - {o.name.split('(')[0]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Destination Port (7 Ports):</label>
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

        {/* Contract Structure Selector */}
        <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-700">Contract Structure Mode:</span>
          <div className="flex gap-1.5 font-mono">
            {[
              { key: 'RECOMMENDED', label: 'AI Prescriptive Optimal' },
              { key: 'SPOT', label: 'Prompt Spot' },
              { key: 'COA_SHORT_3V', label: '3-Voyage CoA' },
              { key: 'COA_MID_6M', label: '6-Month CoA' }
            ].map(c => (
              <button
                key={c.key}
                onClick={() => setContractType(c.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  contractType === c.key
                    ? 'bg-[#FF3B00] text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calculated Results Box */}
        {bestSolution ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <Ship className="w-4 h-4 text-[#FF3B00]" /> Recommended Vessel: {bestSolution.vessel.name} ({bestSolution.vessel.vesselClass})
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-emerald-600" /> IMO CII Grade {bestSolution.carbonMetrics.ciiGrade}
                </span>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                  bestSolution.requiresLightering ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {bestSolution.requiresLightering ? 'LIGHTERED AT SAGAR-SANDHEADS' : 'DIRECT BERTH COMPLIANT'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Landed Cost / MT:</span>
                <span className="font-bold text-base text-[#FF3B00]">${bestSolution.costBreakdown.costPerTon}/MT</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Total Voyage Cost:</span>
                <span className="font-bold text-base text-slate-900">${(bestSolution.costBreakdown.totalCost / 1000000).toFixed(2)}M</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">CO₂ Emissions:</span>
                <span className="font-bold text-slate-800">{bestSolution.carbonMetrics.co2EmissionsTons.toLocaleString()} MT CO₂</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Contract Mode:</span>
                <span className={`font-bold ${decisionTrigger.triggerActivated ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {recommendationCard.contractStructure}
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
              Current parcel volume or candidate vessels exceed physical port limits (Max draft: {destPort.maxDraft}m).
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <span className="text-xs text-slate-500 font-mono">OceanPulse GARCH & PuLP Optimization Solver</span>
          
          <div className="flex items-center gap-3">
            {onOpenReport && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReport();
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-cyan-400" /> Export Strategy Report
              </button>
            )}
            <button onClick={onClose} className="btn-coral py-2 px-5 text-xs rounded-lg">
              Confirm Quote
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
