import React from 'react';
import { Ship, Fuel, Flame, Gauge } from 'lucide-react';

export default function KPIOverviewBar({ lastHistoryPoint }) {
  const bdiVal = lastHistoryPoint?.bdi ? Number(lastHistoryPoint.bdi).toLocaleString() : '3,186';
  const bunkerVal = Number(lastHistoryPoint?.bunkerFuel || lastHistoryPoint?.bunker_fuel || 629.0).toFixed(1);
  const coalVal = Number(lastHistoryPoint?.coalIndex || lastHistoryPoint?.coal_index || 139.75).toFixed(2);
  const mtiVal = Number(lastHistoryPoint?.mtiIndia || lastHistoryPoint?.mti_india || 0.319).toFixed(3);
  const dxyVal = Number(lastHistoryPoint?.dxy || 99.16).toFixed(2);
  const spotRateVal = lastHistoryPoint?.spotFreightRate || lastHistoryPoint?.spot_freight_rate 
    ? Number(lastHistoryPoint.spotFreightRate || lastHistoryPoint.spot_freight_rate).toLocaleString() 
    : '33,161';

  const kpis = [
    {
      label: 'Baltic Dry Index (BDI)',
      value: bdiVal,
      change: '+2.4%',
      isPositive: true,
      subtext: 'TradingEconomics / Handybulk Live',
      icon: Ship,
      iconBg: 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
    },
    {
      label: 'VLSFO Bunker (Singapore)',
      value: `$${bunkerVal}/MT`,
      change: '-0.8%',
      isPositive: false,
      subtext: 'Ship & Bunker Singapore 0.5%',
      icon: Fuel,
      iconBg: 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
    },
    {
      label: 'Newcastle Coal Index',
      value: `$${coalVal}/MT`,
      change: '+1.2%',
      isPositive: true,
      subtext: 'TradingEconomics Global Benchmark',
      icon: Flame,
      iconBg: 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
    },
    {
      label: 'Market Tightness (MTI_India)',
      value: mtiVal,
      change: `Spot: $${spotRateVal}/d`,
      isPositive: true,
      subtext: `DXY: ${dxyVal} • Seaborne vs Fleet Ratio`,
      highlight: true,
      icon: Gauge,
      iconBg: 'bg-[#FF3B00] text-white shadow-md shadow-orange-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi, idx) => {
        const IconComponent = kpi.icon;

        return (
          <div
            key={idx}
            className={`bg-white p-5 rounded-xl border transition-all ${
              kpi.highlight
                ? 'border-orange-500/50 shadow-md ring-2 ring-orange-500/20'
                : 'border-slate-200 shadow-sm hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${kpi.iconBg}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="font-bold">{kpi.label}</span>
              </div>
              <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                kpi.isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {kpi.isPositive ? '▲ ' : '▼ '}{kpi.change}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-extrabold font-heading ${kpi.highlight ? 'text-[#FF3B00]' : 'text-slate-900'}`}>
                {kpi.value}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              {kpi.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
