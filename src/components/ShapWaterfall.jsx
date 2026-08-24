import React from 'react';
import { Cpu, ArrowUpRight, ArrowDownRight, HelpCircle } from 'lucide-react';
import { computeShapWaterfall } from '../services/forecastingEngine';

export default function ShapWaterfall({ selectedHorizonForecast, lastHistoryPoint }) {
  const shapFeatures = computeShapWaterfall(selectedHorizonForecast, lastHistoryPoint);

  return (
    <div className="card-clean p-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 font-heading">
              SHAP Attribution Waterfall
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Feature contribution breakdown driving point forecast for horizon H={selectedHorizonForecast.horizon}D
          </p>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Target Rate</div>
          <div className="text-base font-mono font-bold text-[#FF3B00]">
            ${selectedHorizonForecast.pointForecast.toLocaleString()}/day
          </div>
        </div>
      </div>

      {/* Waterfall Rows */}
      <div className="space-y-2.5 mt-4">
        {shapFeatures.map((feat, idx) => {
          const isBase = feat.type === 'base';
          const isTotal = feat.type === 'total';
          const isPositive = feat.value >= 0;

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border transition-all ${
                isTotal
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : isBase
                  ? 'bg-slate-50 border-slate-200'
                  : isPositive
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-rose-50/60 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-semibold flex items-center gap-1.5 ${isTotal ? 'text-white font-bold text-sm' : isBase ? 'text-slate-700' : 'text-slate-800'}`}>
                  {!isBase && !isTotal && (
                    isPositive ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  {feat.name}
                </span>

                <span className={`font-mono font-bold ${
                  isTotal ? 'text-[#FF3B00] text-sm' : isBase ? 'text-slate-700' : isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {isBase || isTotal ? `$${feat.value.toLocaleString()}` : `${isPositive ? '+' : ''}$${feat.value.toLocaleString()}`}
                </span>
              </div>

              {!isBase && !isTotal && (
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative mt-1.5">
                  <div
                    className={`h-full rounded-full ${
                      isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (Math.abs(feat.value) / 4000) * 100)}%`
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
        <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
        <span>Green bars represent upward rate pressure; red bars represent downward pressure.</span>
      </div>
    </div>
  );
}
