import React, { useState } from 'react';
import { X, Calculator, AlertCircle, Ship, Leaf } from 'lucide-react';
import { EAST_COAST_PORT_MATRIX, ORIGIN_PORTS_MATRIX, solveVesselAllocation } from '../services/optimizerEngine';

export default function FreightQuoteModal({
  isOpen,
  onClose,
  horizonForecast,
  selectedHorizonForecast,
  decisionTrigger = {},
  bunkerPrice = 629.0
}) {
  const [commodity, setCommodity] = useState('Thermal Coal');
  const [origin, setOrigin] = useState('Indonesia_Samarinda');
  const [targetPort, setTargetPort] = useState('Dhamra');
  const [tonnage, setTonnage] = useState(75000);

  if (!isOpen) return null;

  const activeHorizonForecast = horizonForecast || selectedHorizonForecast || {};

  const result = solveVesselAllocation({
    originPortKey: origin,
    destinationPortKey: targetPort,
    cargoQuantityTons: tonnage,
    bunkerPrice,
    horizonForecast: activeHorizonForecast,
    decisionTrigger,
    contractType: 'RECOMMENDED'
  });

  const { bestSolution } = result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="terminal-card bg-white rounded-2xl w-full max-w-3xl border border-[#BED9EB] shadow-2xl p-6 relative overflow-hidden my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#EDF4F9] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E1EFF8] text-[#077DB3] flex items-center justify-center border border-[#BED9EB]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-[#0F2942]">Instant Freight Rate & Landed Quote Calculator</h2>
              <p className="text-xs text-[#627D98]">Multi-Origin & 7 East Coast Indian Ports Procurement Engine</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg text-[#627D98] hover:text-[#0F2942] hover:bg-[#EDF5FA]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-5 text-xs">
          
          <div>
            <label className="block font-bold text-[#334E68] mb-1">Commodity Type:</label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full p-2.5 bg-[#F5F9FC] border border-[#DCE8F0] rounded-xl text-[#0F2942] font-semibold focus:outline-none focus:border-[#077DB3]"
            >
              <option value="Thermal Coal">Thermal Coal (4800 GAR)</option>
              <option value="Coking Coal">Coking Coal (Prime Hard)</option>
              <option value="Iron Ore Pellets">Iron Ore Pellets (65% Fe)</option>
              <option value="Bauxite">Bauxite / Alumina Ore</option>
              <option value="Limestone">Limestone / Gypsum</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#334E68] mb-1">Origin Port Hub:</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full p-2.5 bg-[#F5F9FC] border border-[#DCE8F0] rounded-xl text-[#0F2942] font-semibold focus:outline-none focus:border-[#077DB3]"
            >
              {Object.entries(ORIGIN_PORTS_MATRIX).map(([k, v]) => (
                <option key={k} value={k}>{v.name.split('(')[0]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#334E68] mb-1">Discharge Port Gate:</label>
            <select
              value={targetPort}
              onChange={(e) => setTargetPort(e.target.value)}
              className="w-full p-2.5 bg-[#F5F9FC] border border-[#DCE8F0] rounded-xl text-[#0F2942] font-semibold focus:outline-none focus:border-[#077DB3]"
            >
              {Object.entries(EAST_COAST_PORT_MATRIX).map(([k, v]) => (
                <option key={k} value={k}>{v.name.split('(')[0]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#334E68] mb-1">Parcel Tonnage (MT):</label>
            <input
              type="number"
              step="5000"
              value={tonnage}
              onChange={(e) => setTonnage(Number(e.target.value))}
              className="w-full p-2.5 bg-[#F5F9FC] border border-[#DCE8F0] rounded-xl text-[#0F2942] font-bold font-mono focus:outline-none focus:border-[#077DB3]"
            />
          </div>

        </div>

        {/* Calculated Result Card */}
        {bestSolution && (
          <div className="terminal-card p-5 bg-gradient-to-br from-[#EBF4FA] to-white border-[#BED9EB] mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#077DB3]">Recommended Optimal Fixture</span>
                <h3 className="text-xl font-bold font-heading text-[#0F2942]">{bestSolution.vessel.name} ({bestSolution.vessel.vesselClass})</h3>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#627D98] block">Total Estimated Landed Cost</span>
                <span className="text-2xl font-bold font-mono text-[#077DB3] tabular-nums">
                  ${bestSolution.costBreakdown.costPerTon.toFixed(2)}
                  <span className="text-xs text-[#627D98] font-normal font-sans"> / MT</span>
                </span>
              </div>
            </div>

            {/* Cost Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-[#DCE8F0] text-xs mb-3">
              <div>
                <span className="text-[#627D98] block text-[10px] uppercase font-bold">Base Sea Freight</span>
                <span className="font-bold font-mono text-[#0F2942]">${(bestSolution.costBreakdown.seaFreightTotal / 1000).toFixed(0)}k</span>
              </div>
              <div>
                <span className="text-[#627D98] block text-[10px] uppercase font-bold">VLSFO Bunker Fuel</span>
                <span className="font-bold font-mono text-[#0F2942]">${(bestSolution.costBreakdown.fuelCostTotal / 1000).toFixed(0)}k</span>
              </div>
              <div>
                <span className="text-[#627D98] block text-[10px] uppercase font-bold">Port Tariff & Charges</span>
                <span className="font-bold font-mono text-[#0F2942]">${(bestSolution.costBreakdown.portTariffTotal / 1000).toFixed(0)}k</span>
              </div>
              <div>
                <span className="text-[#627D98] block text-[10px] uppercase font-bold">Waiting & Demurrage</span>
                <span className="font-bold font-mono text-[#B45309]">${(bestSolution.costBreakdown.waitingCostTotal / 1000).toFixed(0)}k</span>
              </div>
            </div>

            {/* Constraints & Feasibility */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#334E68]">
              <div className="flex items-center gap-3">
                <span>Voyage: <strong>{bestSolution.voyageDays} Days Sea + {bestSolution.portDays} Days Port</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#0D9488]">
                  <Leaf className="w-3.5 h-3.5" /> Grade {bestSolution.carbonMetrics.ciiGrade} ({bestSolution.carbonMetrics.co2GramsPerTonNM} g/t-NM)
                </span>
              </div>

              {bestSolution.requiresLightering && (
                <div className="flex items-center gap-1 text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#FDE68A]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Requires Sagar-Sandheads Offshore Lightering</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#EDF4F9] pt-4">
          <button
            onClick={onClose}
            className="btn-terminal-secondary text-xs"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert(`Quote Fixture Ref #EC-${Math.floor(100000 + Math.random() * 900000)} generated for ${tonnage.toLocaleString()} MT.`);
                onClose();
              }}
              className="btn-terminal-primary text-xs"
            >
              <Ship className="w-3.5 h-3.5" /> Lock & Issue Fixture Quote
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
