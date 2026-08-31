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
    { key: 'normal', label: 'Normal Baseline', desc: 'Standard market conditions' },
    { key: 'monsoon', label: 'Monsoon Swell', desc: '+25% Indian port delays & sea swell' },
    { key: 'bunker', label: 'Bunker Fuel Surge', desc: '+50% Singapore marine fuel shift' },
    { key: 'disruption', label: 'Supply Bottleneck', desc: '+40% Volume surge & vessel queue tightness' }
  ];

  return (
    <div className="terminal-card p-5 border-[#D6E4EE] bg-white">
      
      {/* Top Header & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-3.5 border-b border-[#EDF4F9]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E1EFF8] text-[#077DB3] flex items-center justify-center border border-[#BED9EB]">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold font-heading text-[#0F2942]">
              Market Scenario & What-If Simulation Studio
            </h2>
          </div>
          <p className="text-xs text-[#627D98] mt-0.5 font-medium">
            Simulate custom planning horizons (up to 90 days), risk buffers, fuel adjustments, and parcel sizes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {presets.map(p => (
            <button
              key={p.key}
              onClick={() => onPresetChange(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedPreset === p.key
                  ? 'bg-[#077DB3] text-white shadow-xs'
                  : 'bg-[#F0F6FA] text-[#334E68] hover:bg-[#E1EFF8] hover:text-[#077DB3] border border-[#DCE8F0]'
              }`}
              title={p.desc}
            >
              <Zap className={`w-3.5 h-3.5 ${selectedPreset === p.key ? 'text-white' : 'text-[#D97706]'}`} />
              {p.label}
            </button>
          ))}

          <button
            onClick={onResetControls}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#627D98] hover:text-[#077DB3] transition-colors ml-1 bg-[#F0F6FA] px-3 py-1.5 rounded-lg border border-[#DCE8F0]"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#077DB3]" /> Reset
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        
        {/* 1. Forecast Horizon (1-90 Days) */}
        <div className="space-y-1.5 bg-[#F5F9FC] p-3 rounded-xl border border-[#E2EDF5]">
          <div className="flex justify-between items-center text-[#334E68] font-semibold">
            <span className="flex items-center gap-1.5 text-[#627D98] text-[11px] uppercase font-bold">
              <Calendar className="w-3.5 h-3.5 text-[#077DB3]" />
              Horizon (Days)
            </span>
            <span className="text-[#077DB3] font-bold font-mono tabular-nums">+{selectedHorizon}D</span>
          </div>
          <input
            type="range"
            min="1"
            max="90"
            step="1"
            value={selectedHorizon}
            onChange={(e) => onHorizonChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[#D6E4EE] rounded-lg appearance-none cursor-pointer accent-[#077DB3]"
          />
          <div className="flex justify-between text-[10px] text-[#829AB1]">
            <span>Prompt (1D)</span>
            <span>Mid (45D)</span>
            <span>Quarter (90D)</span>
          </div>
        </div>

        {/* 2. Risk Buffer */}
        <div className="space-y-1.5 bg-[#F5F9FC] p-3 rounded-xl border border-[#E2EDF5]">
          <div className="flex justify-between items-center text-[#334E68] font-semibold">
            <span className="flex items-center gap-1.5 text-[#627D98] text-[11px] uppercase font-bold">
              <Shield className="w-3.5 h-3.5 text-[#D97706]" />
              Risk Buffer
            </span>
            <span className="text-[#D97706] font-bold font-mono tabular-nums">{(thetaRisk * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.40"
            step="0.01"
            value={thetaRisk}
            onChange={(e) => onThetaRiskChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[#D6E4EE] rounded-lg appearance-none cursor-pointer accent-[#D97706]"
          />
          <div className="flex justify-between text-[10px] text-[#829AB1]">
            <span>Tight (5%)</span>
            <span>Nominal (20%)</span>
            <span>Flexible (40%)</span>
          </div>
        </div>

        {/* 3. Target Freight Rate ($/day) */}
        <div className="space-y-1.5 bg-[#F5F9FC] p-3 rounded-xl border border-[#E2EDF5]">
          <div className="flex justify-between items-center text-[#334E68] font-semibold">
            <span className="flex items-center gap-1.5 text-[#627D98] text-[11px] uppercase font-bold">
              <DollarSign className="w-3.5 h-3.5 text-[#0D9488]" />
              Target Rate
            </span>
            <span className="text-[#0D9488] font-bold font-mono tabular-nums">${Number(targetCoACost).toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="15000"
            max="35000"
            step="500"
            value={targetCoACost}
            onChange={(e) => onTargetCoACostChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[#D6E4EE] rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
          />
          <div className="flex justify-between text-[10px] text-[#829AB1]">
            <span>$15k/day</span>
            <span>$25k/day</span>
            <span>$35k/day</span>
          </div>
        </div>

        {/* 4. Singapore Bunker Offset ($/MT) */}
        <div className="space-y-1.5 bg-[#F5F9FC] p-3 rounded-xl border border-[#E2EDF5]">
          <div className="flex justify-between items-center text-[#334E68] font-semibold">
            <span className="flex items-center gap-1.5 text-[#627D98] text-[11px] uppercase font-bold">
              <Fuel className="w-3.5 h-3.5 text-[#077DB3]" />
              Fuel Offset
            </span>
            <span className="text-[#077DB3] font-bold font-mono tabular-nums">
              {bunkerOffset >= 0 ? `+${bunkerOffset}` : bunkerOffset} $/MT
            </span>
          </div>
          <input
            type="range"
            min="-150"
            max="250"
            step="10"
            value={bunkerOffset}
            onChange={(e) => onBunkerOffsetChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[#D6E4EE] rounded-lg appearance-none cursor-pointer accent-[#077DB3]"
          />
          <div className="flex justify-between text-[10px] text-[#829AB1]">
            <span>-$150/MT</span>
            <span>Baseline ($0)</span>
            <span>+$250/MT</span>
          </div>
        </div>

        {/* 5. Cargo Parcel Size (Tons) */}
        <div className="space-y-1.5 bg-[#F5F9FC] p-3 rounded-xl border border-[#E2EDF5]">
          <div className="flex justify-between items-center text-[#334E68] font-semibold">
            <span className="flex items-center gap-1.5 text-[#627D98] text-[11px] uppercase font-bold">
              <Scale className="w-3.5 h-3.5 text-[#4F46E5]" />
              Parcel Size
            </span>
            <span className="text-[#4F46E5] font-bold font-mono tabular-nums">{Number(cargoQuantity / 1000).toFixed(0)}k MT</span>
          </div>
          <input
            type="range"
            min="25000"
            max="180000"
            step="5000"
            value={cargoQuantity}
            onChange={(e) => onCargoQuantityChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[#D6E4EE] rounded-lg appearance-none cursor-pointer accent-[#4F46E5]"
          />
          <div className="flex justify-between text-[10px] text-[#829AB1]">
            <span>Handy (25k)</span>
            <span>Panamax (75k)</span>
            <span>Cape (180k)</span>
          </div>
        </div>

      </div>
    </div>
  );
}
