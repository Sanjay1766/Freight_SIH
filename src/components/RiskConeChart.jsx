import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Zap } from 'lucide-react';

export default function RiskConeChart({
  historySeries = [],
  forecastData = [],
  volatilityStats = {},
  selectedHorizon = 15,
  onSelectHorizon
}) {
  // 1. Map Historical series with GARCH conditional volatility bounds (±1.96σ_t)
  const historySlice = (historySeries || []).slice(-30);
  const historyPlot = historySlice.map(item => {
    const rate = Number(item.spotFreightRate || item.spot_freight_rate || 22000);
    const volPct = Number(item.garchVolPct || 1.61) / 100.0;
    const up95 = item.garchUpper95 ? Number(item.garchUpper95) : Math.round(rate * (1 + 1.96 * volPct));
    const low95 = item.garchLower95 ? Number(item.garchLower95) : Math.max(7500, Math.round(rate * (1 - 1.96 * volPct)));

    return {
      date: item.date ? item.date.slice(5) : '',
      actualRate: rate,
      forecastRate: null,
      lower95: low95,
      upper95: up95,
      isForecast: false
    };
  });

  const lastHistoryPoint = historySeries && historySeries.length > 0 ? historySeries[historySeries.length - 1] : null;
  const lastRate = lastHistoryPoint ? Number(lastHistoryPoint.spotFreightRate || 22000) : 22000;
  const lastDate = lastHistoryPoint ? (lastHistoryPoint.date ? lastHistoryPoint.date.slice(5) : 'Today') : 'Today';

  // 2. Map Forecast series with forward integrated GARCH volatility cone
  const forecastPlot = (forecastData || []).map(item => ({
    date: item.date ? item.date.slice(5) : `+${item.horizon}d`,
    actualRate: null,
    forecastRate: Number(item.pointForecast || 22000),
    lower95: Number(item.lower95 || 20000),
    upper95: Number(item.upper95 || 24000),
    horizon: item.horizon,
    isForecast: true
  }));

  const bridgePoint = {
    date: lastDate,
    actualRate: lastRate,
    forecastRate: lastRate,
    lower95: historyPlot.length > 0 ? historyPlot[historyPlot.length - 1].lower95 : lastRate,
    upper95: historyPlot.length > 0 ? historyPlot[historyPlot.length - 1].upper95 : lastRate,
    isForecast: false
  };

  const chartData = [...historyPlot.slice(0, -1), bridgePoint, ...forecastPlot];
  const currentForecastAtHorizon = (forecastData || []).find(f => f.horizon === selectedHorizon) || (forecastData && forecastData[0]) || { pointForecast: 22000, lower95: 20000, upper95: 24000 };

  return (
    <div className="card-clean p-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 font-heading">
              GARCH(1,1) Volatility Risk Cone & Rate Forecast
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical conditional volatility envelope ($\sigma_t$) transitioning into 90-day forward ML & GARCH predictive cone
          </p>
        </div>

        {/* Volatility Stats Badge */}
        <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-500">Daily Vol (σ)</div>
            <div className="text-xs font-mono font-bold text-[#FF3B00]">{volatilityStats.dailyVol ?? 1.61}%</div>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-500">Annual Vol</div>
            <div className="text-xs font-mono font-bold text-blue-600">{volatilityStats.annualVol ?? 30.72}%</div>
          </div>
        </div>
      </div>

      {/* Horizon Summary Bar */}
      <div className="mb-4 p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <Zap className="w-4 h-4 text-[#FF3B00]" />
          <span>Active Horizon: <strong className="text-slate-900">{selectedHorizon}-Day Forecast</strong></span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <div>Point Rate: <span className="text-[#FF3B00] font-black">${Number(currentForecastAtHorizon.pointForecast || 22000).toLocaleString()}/day</span></div>
          <div>95% Bound: <span className="text-slate-700 font-bold">${Number(currentForecastAtHorizon.lower95 || 20000).toLocaleString()} - ${Number(currentForecastAtHorizon.upper95 || 24000).toLocaleString()}</span></div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRiskBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF3B00" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#FF3B00" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={['auto', 'auto']} tickFormatter={v => `$${Math.round(v / 1000)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              formatter={(val, name) => {
                if (val === null || val === undefined) return ['-', name];
                const numStr = `$${Number(val).toLocaleString()}`;
                if (name === 'upper95') return [numStr, 'Upper 95% Bound'];
                if (name === 'lower95') return [numStr, 'Lower 95% Bound'];
                if (name === 'forecastRate') return [numStr, 'Point Rate Forecast'];
                if (name === 'actualRate') return [numStr, 'Historical Spot Charter Rate'];
                return [numStr, name];
              }}
            />
            <Area type="monotone" dataKey="upper95" stroke="none" fill="url(#colorRiskBand)" connectNulls />
            <Area type="monotone" dataKey="lower95" stroke="none" fill="#FFFFFF" connectNulls />

            <Area type="monotone" dataKey="actualRate" stroke="#10B981" strokeWidth={2.5} fill="none" connectNulls />
            <Area type="monotone" dataKey="forecastRate" stroke="#FF3B00" strokeWidth={2.5} strokeDasharray="4 4" fill="none" connectNulls />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Horizon Picker */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
        <span className="text-slate-700 font-bold">Quick Horizon Selectors:</span>
        <div className="flex gap-1.5 font-mono">
          {[7, 15, 30, 45, 60, 90].map(h => (
            <button
              key={h}
              onClick={() => onSelectHorizon && onSelectHorizon(h)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedHorizon === h
                  ? 'bg-[#FF3B00] text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {h}D
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
