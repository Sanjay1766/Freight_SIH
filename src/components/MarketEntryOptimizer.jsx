import React from 'react';
import { Calendar, TrendingDown, DollarSign } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function MarketEntryOptimizer({
  forecastData,
  entryWindows,
  decisionTrigger,
  contractComparison,
  selectedHorizon,
  onSelectHorizon,
  targetCoACost
}) {
  const chartData = forecastData.map(item => ({
    horizon: item.horizon,
    dayLabel: `D+${item.horizon}`,
    date: item.date.slice(5),
    pointForecast: item.pointForecast,
    lower95: item.lower95,
    upper95: item.upper95,
    entryScore: item.entryScore,
    entryRating: item.entryRating
  }));

  const currentRate = forecastData[0] ? forecastData[0].pointForecast : 20000;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="card-clean p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="badge-coral bg-orange-500/20 text-[#FF3B00] border-orange-500/30 font-mono">
                Objective A • Market Entry Timing
              </span>
              <span className="text-slate-400 text-xs">• 90-Day Forward Rate Curve</span>
            </div>
            <h2 className="text-2xl font-extrabold font-heading text-white">
              Optimal Market Entry Timing & Contract Structure Optimizer
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Transition from reactive daily spot contracting to strategic forward entry windows. Our model identifies rate troughs and volatility valleys to lock in short-term (3-voyage) or mid-term (6-month) Contracts of Affreightment (CoA).
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-right min-w-[200px]">
            <div className="text-[10px] uppercase font-bold text-slate-400">Current Spot Rate Benchmark</div>
            <div className="text-2xl font-mono font-extrabold text-[#FF3B00]">${currentRate.toLocaleString()}/day</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
              {decisionTrigger.triggerActivated ? '▲ High Volatility Regime' : '● Stable Spot Regime'}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Optimal Entry Windows Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {entryWindows.map((win, idx) => {
          const isOptimal = win.rating === 'OPTIMAL_ENTRY_WINDOW' || win.rating === 'GOOD_ENTRY';

          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all ${
                idx === 1
                  ? 'bg-orange-500/5 border-orange-500/40 ring-1 ring-orange-500/20 shadow-md'
                  : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FF3B00]" />
                  {win.windowLabel}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isOptimal ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  {isOptimal ? 'PRIME FIX WINDOW' : 'MONITOR'}
                </span>
              </div>

              <div className="mb-2">
                <div className="text-xs font-bold text-slate-900">{win.contractType}</div>
                <div className="text-2xl font-black font-mono text-[#FF3B00] mt-1">
                  ${win.expectedRate.toLocaleString()}
                  <span className="text-xs font-medium text-slate-400 font-sans"> /day</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-600 space-y-1 mb-3 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Fix Day:</span>
                  <strong className="text-slate-900">Day {win.optimalDay} ({win.targetDate})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">95% Range:</span>
                  <span>${win.lower95.toLocaleString()} - ${win.upper95.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                {win.actionAdvice}
              </div>

              <button
                onClick={() => onSelectHorizon(win.optimalDay)}
                className={`w-full mt-3 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedHorizon === win.optimalDay
                    ? 'bg-[#FF3B00] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {selectedHorizon === win.optimalDay ? '✓ Active Forecast Target' : `Simulate Day ${win.optimalDay} Fixture`}
              </button>
            </div>
          );
        })}
      </div>

      {/* 90-Day Forward Rate Curve Chart with Entry Windows Heatmap */}
      <div className="card-clean p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                90-Day Forward Rate Trajectory & Entry Heatmap
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Evaluates rate curves across 1 to 90 days with target budget ceiling (${targetCoACost.toLocaleString()}/day)
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#FF3B00] rounded-sm"></span> Point Forecast</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1 bg-amber-500 rounded-sm"></span> CoA Target Ceiling</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="dayLabel" stroke="#64748B" fontSize={11} tickLine={false} interval={9} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={['auto', 'auto']} tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(val, name) => {
                  if (name === 'pointForecast') return [`$${val.toLocaleString()}/day`, 'Point Rate Forecast'];
                  if (name === 'lower95') return [`$${val.toLocaleString()}/day`, 'Lower 95% Bound'];
                  if (name === 'upper95') return [`$${val.toLocaleString()}/day`, 'Upper 95% Bound'];
                  return [val, name];
                }}
              />
              <Line type="monotone" dataKey="pointForecast" stroke="#FF3B00" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="upper95" stroke="#94A3B8" strokeWidth={1} strokeDasharray="3 3" dot={false} />
              <Line type="monotone" dataKey="lower95" stroke="#94A3B8" strokeWidth={1} strokeDasharray="3 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap Legend */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 font-semibold">Entry Scoring Matrix:</span>
          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">● Optimal Fix Window (Score 5/5)</span>
            <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800">● Good Entry (Score 4/5)</span>
            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700">● Neutral (Score 3/5)</span>
            <span className="px-2.5 py-1 rounded bg-rose-100 text-rose-800">● Volatility Spike / Avoid Spot (Score 1-2/5)</span>
          </div>
        </div>
      </div>

      {/* Contract Duration Financial Tradeoff Analysis */}
      <div className="card-clean p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              Contract Structure Comparison: Spot vs Short-Term vs Mid-Term CoA
            </h3>
            <p className="text-xs text-slate-500">
              Quantitative comparison of freight cost, landed $/MT, and risk mitigation across contract terms
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Option 1: Spot */}
          <div className={`p-4 rounded-xl border ${
            contractComparison.spot.recommendationTag === 'RECOMMENDED'
              ? 'border-emerald-500 bg-emerald-50/40 shadow-sm'
              : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-sm">{contractComparison.spot.label}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">1 VOYAGE</span>
            </div>
            <div className="text-2xl font-mono font-black text-slate-900 my-2">
              ${contractComparison.spot.costPerTon}/MT
            </div>
            <div className="space-y-1 text-xs font-mono text-slate-600 mb-3">
              <div className="flex justify-between">
                <span>Daily Charter:</span>
                <strong>${contractComparison.spot.ratePerDay.toLocaleString()}/d</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Outlay:</span>
                <strong>${(contractComparison.spot.totalCostDollars / 1000000).toFixed(2)}M</strong>
              </div>
              <div className="flex justify-between">
                <span>Volatility Risk:</span>
                <span className="text-rose-600 font-bold">{contractComparison.spot.volatilityExposure}</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 leading-snug">
              Exposes procurement fully to day-to-day market swings and port waiting demurrage penalties.
            </div>
          </div>

          {/* Option 2: 3-Voyage CoA */}
          <div className={`p-4 rounded-xl border ${
            contractComparison.coaShortTerm3V.recommendationTag === 'RECOMMENDED'
              ? 'border-orange-500 bg-orange-500/5 ring-2 ring-orange-500/30 shadow-md'
              : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-sm">{contractComparison.coaShortTerm3V.label}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FF3B00] text-white">RECOMMENDED</span>
            </div>
            <div className="text-2xl font-mono font-black text-[#FF3B00] my-2">
              ${contractComparison.coaShortTerm3V.costPerTon}/MT
            </div>
            <div className="space-y-1 text-xs font-mono text-slate-600 mb-3">
              <div className="flex justify-between">
                <span>Daily Rate:</span>
                <strong>${contractComparison.coaShortTerm3V.ratePerDay.toLocaleString()}/d</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Outlay:</span>
                <strong>${(contractComparison.coaShortTerm3V.totalCostDollars / 1000000).toFixed(2)}M</strong>
              </div>
              <div className="flex justify-between">
                <span>Hedge Savings:</span>
                <strong className="text-emerald-600 font-bold">~${(contractComparison.coaShortTerm3V.savingsVsSpot || 120000).toLocaleString()}</strong>
              </div>
            </div>
            <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 leading-snug">
              Locks 3 consecutive liftings with guaranteed rate ceiling and priority loading at origin terminal.
            </div>
          </div>

          {/* Option 3: 6-Month Term CoA */}
          <div className={`p-4 rounded-xl border ${
            contractComparison.coaMidTerm6M.recommendationTag === 'HIGH_PRIORITY'
              ? 'border-blue-500 bg-blue-50/40 shadow-md'
              : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-sm">{contractComparison.coaMidTerm6M.label}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">TERM HEDGE</span>
            </div>
            <div className="text-2xl font-mono font-black text-blue-700 my-2">
              ${contractComparison.coaMidTerm6M.costPerTon}/MT
            </div>
            <div className="space-y-1 text-xs font-mono text-slate-600 mb-3">
              <div className="flex justify-between">
                <span>Daily Rate:</span>
                <strong>${contractComparison.coaMidTerm6M.ratePerDay.toLocaleString()}/d</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Outlay:</span>
                <strong>${(contractComparison.coaMidTerm6M.totalCostDollars / 1000000).toFixed(2)}M</strong>
              </div>
              <div className="flex justify-between">
                <span>Demurrage Clause:</span>
                <strong className="text-blue-600 font-bold">{contractComparison.coaMidTerm6M.demurrageRiskScore}</strong>
              </div>
            </div>
            <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 leading-snug">
              Maximum supply security for baseline thermal/coking coal requirements across seasonal monsoon quarters.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

