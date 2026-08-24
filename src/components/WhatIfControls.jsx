import React from 'react';
import { Sliders, RefreshCw, DollarSign, Fuel, Shield, Calendar, Scale } from 'lucide-react';

export default function WhatIfControls({
  selectedHorizon,
  onHorizonChange,
  thetaRisk,
  onThetaRiskChange,
  targetCoACost,
  onTargetCoACostChange,
  bunkerOffset,
  onBunkerOffsetChange,
  cargoQuantity,
  onCargoQuantityChange,
  onResetControls
}) {
  return (
    <div className="card-clean p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-[#FF3B00] flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900 font-heading">
            Scenario & Market Parameter Simulator
          </h2>
        </div>
        <button
          onClick={onResetControls}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#FF3B00] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Parameters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 text-xs">
        
        {/* 1. Horizon */}
        <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-slate-700 font-semibold">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#FF3B00]" /> Horizon:
            </span>
            <span className="font-mono text-[#FF3B00] font-bold">{selectedHorizon} Days</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={selectedHorizon}
            onChange={e => onHorizonChange(Number(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>1D (Spot)</span>
            <span>30D (Term)</span>
          </div>
        </div>

        {/* 2. Risk Threshold */}
        <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-slate-700 font-semibold">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-600" /> Risk θ_risk:
            </span>
            <span className="font-mono text-amber-600 font-bold">{thetaRisk.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.45"
            step="0.01"
            value={thetaRisk}
            onChange={e => onThetaRiskChange(Number(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>0.05 (Risk-Averse)</span>
            <span>0.45 (Aggressive)</span>
          </div>
        </div>

        {/* 3. Target CoA Budget */}
        <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-slate-700 font-semibold">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Target C_CoA:
            </span>
            <span className="font-mono text-emerald-600 font-bold">${(targetCoACost / 1000).toFixed(1)}k/d</span>
          </div>
          <input
            type="range"
            min="12000"
            max="32000"
            step="500"
            value={targetCoACost}
            onChange={e => onTargetCoACostChange(Number(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>$12k/day</span>
            <span>$32k/day</span>
          </div>
        </div>

        {/* 4. Bunker Offset */}
        <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-slate-700 font-semibold">
            <span className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-purple-600" /> Fuel Delta:
            </span>
            <span className="font-mono text-purple-600 font-bold">{bunkerOffset >= 0 ? `+$${bunkerOffset}` : `-$${Math.abs(bunkerOffset)}`}/MT</span>
          </div>
          <input
            type="range"
            min="-150"
            max="250"
            step="10"
            value={bunkerOffset}
            onChange={e => onBunkerOffsetChange(Number(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>-$150/MT</span>
            <span>+$250/MT</span>
          </div>
        </div>

        {/* 5. Shipment Volume */}
        <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-slate-700 font-semibold">
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-blue-600" /> Cargo Volume:
            </span>
            <span className="font-mono text-blue-600 font-bold">{(cargoQuantity / 1000).toFixed(0)}k MT</span>
          </div>
          <input
            type="range"
            min="30000"
            max="180000"
            step="5000"
            value={cargoQuantity}
            onChange={e => onCargoQuantityChange(Number(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>30k MT</span>
            <span>180k MT</span>
          </div>
        </div>

      </div>
    </div>
  );
}
