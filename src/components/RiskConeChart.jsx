import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Zap, Info } from 'lucide-react';

export default function RiskConeChart({
  historySeries = [],
  forecastData = [],
  volatilityStats = {},
  selectedHorizon = 15,
  onSelectHorizon
}) {
  // 1. Map Historical series with volatility bounds
  const historySlice = (historySeries || []).slice(-30);
  const historyPlot = historySlice.map(item => {
    const rate = Number(item.spotFreightRate || item.spot_freight_rate || 22000);
    const volPct = Number(item.garchVolPct || item.garch_vol_pct || 1.61) / 100.0;
    const up95 = item.garchUpper95 || item.garch_upper_95 ? Number(item.garchUpper95 || item.garch_upper_95) : Math.round(rate * (1 + 1.96 * volPct));
    const low95 = item.garchLower95 || item.garch_lower_95 ? Number(item.garchLower95 || item.garch_lower_95) : Math.max(7500, Math.round(rate * (1 - 1.96 * volPct)));

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
  const lastRate = lastHistoryPoint ? Number(lastHistoryPoint.spotFreightRate || lastHistoryPoint.spot_freight_rate || 22000) : 22000;
  const lastDate = lastHistoryPoint ? (lastHistoryPoint.date ? String(lastHistoryPoint.date).slice(5) : 'Today') : 'Today';

  // 2. Map Forecast series with forward confidence envelope
  const forecastPlot = (forecastData || []).map(item => ({
    date: item.date ? String(item.date).slice(5) : `+${item.horizon}d`,
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
    <div className="terminal-card p-5 relative border-[#D6E4EE] bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E1EFF8] text-[#077DB3] flex items-center justify-center border border-[#BED9EB]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold font-heading text-[#0F2942]">
              Freight Rate Forecast & Market Volatility Range
            </h2>
          </div>
          <p className="text-xs text-[#627D98] mt-1 font-medium">
            Observed spot rates transitioning into 90-day forward predictive ranges with 95% confidence bounds.
          </p>
        </div>

        {/* Volatility Stats Badge */}
        <div className="flex items-center gap-3 bg-[#F0F6FA] px-3.5 py-1.5 rounded-lg border border-[#DCE8F0] text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#627D98]">Daily Volatility</div>
            <div className="text-xs font-bold text-[#D97706] font-mono tabular-nums">{volatilityStats.dailyVol ?? 2.14}%</div>
          </div>
          <div className="h-5 w-px bg-[#CBDCE8]" />
          <div>
            <div className="text-[10px] uppercase font-bold text-[#627D98]">Annualized Vol</div>
            <div className="text-xs font-bold text-[#077DB3] font-mono tabular-nums">{volatilityStats.annualVol ?? 40.86}%</div>
          </div>
        </div>
      </div>

      {/* Horizon Summary Bar */}
      <div className="mb-4 p-3 rounded-xl bg-[#E1EFF8] border border-[#BED9EB] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#0F2942] font-semibold">
          <Zap className="w-3.5 h-3.5 text-[#077DB3]" />
          <span>Active Forecast Horizon: <strong className="text-[#077DB3]">+{selectedHorizon} Days Ahead</strong></span>
        </div>
        <div className="flex items-center gap-4 text-[#334E68]">
          <div>Estimated Rate: <span className="text-[#077DB3] font-bold font-mono tabular-nums">${Number(currentForecastAtHorizon.pointForecast || 22000).toLocaleString()}/day</span></div>
          <div className="text-[#627D98]">Expected Range: <span className="text-[#0F2942] font-bold font-mono tabular-nums">${Number(currentForecastAtHorizon.lower95 || 20000).toLocaleString()} – ${Number(currentForecastAtHorizon.upper95 || 24000).toLocaleString()}</span></div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRiskBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#299FE0" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#299FE0" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6EFF5" />
            <XAxis dataKey="date" stroke="#829AB1" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#829AB1"
              fontSize={11}
              tickLine={false}
              domain={['auto', 'auto']}
              tickFormatter={v => `$${Math.round(v / 1000)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#BED9EB',
                borderRadius: '10px',
                color: '#0F2942',
                boxShadow: '0 4px 14px rgba(7, 125, 179, 0.1)',
                fontSize: '12px'
              }}
              formatter={(val, name) => {
                if (val === null || val === undefined) return ['-', name];
                const numStr = `$${Number(val).toLocaleString()}/day`;
                if (name === 'upper95') return [numStr, 'Upper 95% Bound'];
                if (name === 'lower95') return [numStr, 'Lower 95% Bound'];
                if (name === 'forecastRate') return [numStr, 'Projected Rate'];
                if (name === 'actualRate') return [numStr, 'Observed Spot Rate'];
                return [numStr, name];
              }}
            />
            <Area type="monotone" dataKey="upper95" stroke="none" fill="url(#colorRiskBand)" connectNulls />
            <Area type="monotone" dataKey="lower95" stroke="none" fill="#FFFFFF" connectNulls />

            <Area type="monotone" dataKey="actualRate" stroke="#0D9488" strokeWidth={2.5} fill="none" connectNulls />
            <Area type="monotone" dataKey="forecastRate" stroke="#077DB3" strokeWidth={2.5} strokeDasharray="4 4" fill="none" connectNulls />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Horizon Picker Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#EDF4F9] pt-3 text-xs">
        <span className="text-[#627D98] text-xs font-semibold flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#077DB3]" /> Select Planning Horizon:
        </span>
        <div className="flex gap-1.5 font-mono">
          {[7, 15, 30, 45, 60, 90].map(h => (
            <button
              key={h}
              onClick={() => onSelectHorizon && onSelectHorizon(h)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedHorizon === h
                  ? 'bg-[#077DB3] text-white shadow-xs'
                  : 'bg-[#F0F6FA] text-[#486581] hover:bg-[#E1EFF8] hover:text-[#077DB3] border border-[#DCE8F0]'
              }`}
            >
              +{h}D
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
