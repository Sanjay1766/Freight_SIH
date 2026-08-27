import React from 'react';
import { Sliders, RefreshCw, DollarSign, Fuel, Shield, Calendar, Scale, Zap } from 'lucide-react';

export default function WhatIfControls({
  selectedPreset,
  onPresetChange,
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
  const presets = [
    { key: 'normal', label: 'Normal Market', desc: 'Baseline global trade & weather' },
    { key: 'monsoon', label: 'Monsoon Bottleneck', desc: '+25% Indian port delays & swell' },
    { key: 'bunker', label: 'Bunker Fuel Surge', desc: '+50% Singapore VLSFO price shock' },
    { key: 'disruption', label: 'Supply Disruption', desc: '+40% Volume surge & chokepoint tightness' }
  ];

  return (
    <div className="card-clean p-6">
      
      {/* Top Header & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF3B00] text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Sliders className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 font-heading">
              Interactive Scenario & What-If Simulation Studio
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Test custom freight horizons (up to 90 days), risk thresholds, fuel shocks, and origin trade lanes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {presets.map(p => (
            <button
              key={p.key}
              onClick={() => onPresetChange(p.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedPreset === p.key
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
              }`}
              title={p.desc}
            >
              <Zap className={`w-3.5 h-3.5 ${selectedPreset === p.key ? 'text-[#FF3B00]' : 'text-amber-500'}`} />
              {p.label}
            </button>
          ))}

          <button
            onClick={onResetControls}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#FF3B00] transition-colors ml-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#FF3B00]" /> Reset
          </button>
        </div>
      </div>

      {/* Sliders Grid with High Contrast Icon Containers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
        
        {/* 1. Forecast Horizon (1-90 Days) */}
        <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-slate-800 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-orange-100 text-[#FF3B00] flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5" />
              </span>
              <span>Horizon:</span>
            </span>
            <span className="font-mono text-[#FF3B00] font-black">{selectedHorizon} Days</span>
          </div>
          <input
            type="range"
            min="1"
            max="90"
            step="1"
            value={selectedHorizon}
            onChange={e => onHorizonChange(Number(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
            <span>1D (Spot)</span>
            <span>45D (Term)</span>
            <span>90D (Forward)</span>
          </div>
        </div>

        {/* 2. Risk Threshold θ_risk */}
        <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-slate-800 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5" />
              </span>
              <span>Risk θ_risk:</span>
            </span>
            <span className="font-mono text-amber-700 font-black">{thetaRisk.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.45"
            step="0.01"
            value={thetaRisk}
            onChange={e => onThetaRiskChange(Number(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
            <span>0.05 (Risk-Averse)</span>
            <span>0.45 (Aggressive)</span>
          </div>
        </div>

        {/* 3. Target CoA Budget Ceiling */}
        <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-slate-800 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </span>
              <span>Target C_CoA:</span>
            </span>
            <span className="font-mono text-emerald-700 font-black">${(targetCoACost / 1000).toFixed(1)}k/d</span>
          </div>
          <input
            type="range"
            min="12000"
            max="32000"
            step="500"
            value={targetCoACost}
            onChange={e => onTargetCoACostChange(Number(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
            <span>$12k/day</span>
            <span>$32k/day</span>
          </div>
        </div>

        {/* 4. Bunker Fuel Price Offset */}
        <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-slate-800 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center">
                <Fuel className="w-3.5 h-3.5" />
              </span>
              <span>Fuel Delta:</span>
            </span>
            <span className="font-mono text-purple-700 font-black">{bunkerOffset >= 0 ? `+$${bunkerOffset}` : `-$${Math.abs(bunkerOffset)}`}/MT</span>
          </div>
          <input
            type="range"
            min="-150"
            max="250"
            step="10"
            value={bunkerOffset}
            onChange={e => onBunkerOffsetChange(Number(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
            <span>-$150/MT</span>
            <span>+$250/MT</span>
          </div>
        </div>

        {/* 5. Cargo Parcel Size */}
        <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-slate-800 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                <Scale className="w-3.5 h-3.5" />
              </span>
              <span>Volume:</span>
            </span>
            <span className="font-mono text-blue-700 font-black">{(cargoQuantity / 1000).toFixed(0)}k MT</span>
          </div>
          <input
            type="range"
            min="25000"
            max="210000"
            step="5000"
            value={cargoQuantity}
            onChange={e => onCargoQuantityChange(Number(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
            <span>25k (Handy)</span>
            <span>80k (Panamax)</span>
            <span>210k (Cape)</span>
          </div>
        </div>

      </div>
    </div>
  );
}
