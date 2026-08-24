import React from 'react';
import { TrendingUp, TrendingDown, Anchor, Gauge } from 'lucide-react';

export default function KPIOverviewBar({ lastHistoryPoint }) {
  const kpis = [
    {
      label: 'Baltic Dry Index (BDI)',
      value: lastHistoryPoint.bdi.toLocaleString(),
      change: '+2.4%',
      isPositive: true,
      subtext: 'Global Cape/Panamax Benchmark'
    },
    {
      label: 'VLSFO Bunker (Singapore)',
      value: `$${lastHistoryPoint.bunkerFuel}/MT`,
      change: '-0.8%',
      isPositive: false,
      subtext: 'Marine Fuel Benchmark'
    },
    {
      label: 'Newcastle Coal Index',
      value: `$${lastHistoryPoint.coalIndex}/MT`,
      change: '+1.2%',
      isPositive: true,
      subtext: 'Thermal Coal Spot'
    },
    {
      label: 'Market Tightness (MTI_India)',
      value: lastHistoryPoint.mtiIndia,
      change: '+4.1%',
      isPositive: true,
      subtext: 'Seaborne Import vs Fleet Capacity',
      highlight: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className={`bg-white p-5 rounded-xl border transition-all ${
            kpi.highlight
              ? 'border-orange-500/40 shadow-sm ring-1 ring-orange-500/20'
              : 'border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>{kpi.label}</span>
            <span className={`px-2 py-0.5 rounded font-mono font-bold ${
              kpi.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {kpi.isPositive ? '▲ ' : '▼ '}{kpi.change}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-extrabold font-heading ${kpi.highlight ? 'text-[#FF3B00]' : 'text-slate-900'}`}>
              {kpi.value}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            {kpi.subtext}
          </div>
        </div>
      ))}
    </div>
  );
}
