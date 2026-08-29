import React, { useState, useEffect } from 'react';
import { Cpu, ArrowUpRight, ArrowDownRight, HelpCircle } from 'lucide-react';
import { computeShapWaterfall } from '../services/forecastingEngine';
import { fetchShapValues } from '../services/apiClient';

export default function ShapWaterfall({ selectedHorizonForecast, lastHistoryPoint }) {
  const [shapFeatures, setShapFeatures] = useState([]);

  useEffect(() => {
    async function loadShap() {
      if (!selectedHorizonForecast?.horizon) return;
      const data = await fetchShapValues(selectedHorizonForecast.horizon);
      if (data && data.features) {
        setShapFeatures(data.features);
      } else {
        setShapFeatures(computeShapWaterfall(selectedHorizonForecast, lastHistoryPoint));
      }
    }
    loadShap();
  }, [selectedHorizonForecast, lastHistoryPoint]);

  if (!shapFeatures || shapFeatures.length === 0) {
    return null;
  }

  return (
    <div className="card-clean p-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 font-heading">
              SHAP Attribution Waterfall
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Feature contribution breakdown driving point forecast for horizon H={Number(selectedHorizonForecast.horizon || 0)}D
          </p>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Target Rate</div>
          <div className="text-base font-mono font-bold text-[#FF3B00]">
            ${Number(selectedHorizonForecast.pointForecast || 0).toLocaleString()}/day
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
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : 'bg-rose-50/70 border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-bold flex items-center gap-1.5 ${isTotal ? 'text-white font-black text-sm' : isBase ? 'text-slate-800' : 'text-slate-900'}`}>
                  {!isBase && !isTotal && (
                    isPositive ? <ArrowUpRight className="w-4 h-4 text-emerald-600 font-bold" /> : <ArrowDownRight className="w-4 h-4 text-rose-600 font-bold" />
                  )}
                  {feat.name}
                </span>

                <span className={`font-mono font-bold ${
                  isTotal ? 'text-[#FF3B00] text-sm' : isBase ? 'text-slate-800' : isPositive ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {isBase || isTotal ? `$${Number(feat.value || 0).toLocaleString()}` : `${isPositive ? '+' : ''}$${Number(feat.value || 0).toLocaleString()}`}
                </span>
              </div>

              {!isBase && !isTotal && (
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative mt-1.5">
                  <div
                    className={`h-full rounded-full ${
                      isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (Math.abs(Number(feat.value || 0)) / 4000) * 100)}%`
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
        <HelpCircle className="w-4 h-4 text-purple-600 shrink-0" />
        <span>Green bars represent upward rate pressure; red bars represent downward pressure.</span>
      </div>
    </div>
  );
}
