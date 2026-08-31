import React from 'react';
import { Ship, Fuel, Gauge, Activity, Leaf, TrendingUp } from 'lucide-react';

export default function KPIOverviewBar({ lastHistoryPoint, selectedHorizonForecast = {} }) {
  const bdiVal = lastHistoryPoint?.bdi ? Number(lastHistoryPoint.bdi).toLocaleString() : '1,850';
  const bunkerVal = Number(lastHistoryPoint?.bunkerFuel || lastHistoryPoint?.bunker_fuel || 784.50).toFixed(1);
  const mtiVal = Number(lastHistoryPoint?.mtiIndia || lastHistoryPoint?.mti_india || 0.319).toFixed(3);
  const spotRateVal = lastHistoryPoint?.spotFreightRate || lastHistoryPoint?.spot_freight_rate 
    ? Number(lastHistoryPoint.spotFreightRate || lastHistoryPoint.spot_freight_rate).toLocaleString() 
    : '22,000';
  const volPct = Number(lastHistoryPoint?.garch_vol_pct || 2.14).toFixed(1);
  const ptFc = selectedHorizonForecast?.pointForecast ? Number(selectedHorizonForecast.pointForecast).toLocaleString() : spotRateVal;
  const upper95 = selectedHorizonForecast?.upper95 ? Number(selectedHorizonForecast.upper95).toLocaleString() : '24,500';

  const kpis = [
    {
      label: 'BALTIC DRY INDEX (BDI)',
      value: bdiVal,
      badge: '+2.4%',
      badgeType: 'emerald',
      subtext: 'Global Bulk Freight Benchmark',
      description: 'Daily Dry Bulk Shipping Index',
      icon: Ship,
      iconColor: 'text-[#077DB3]'
    },
    {
      label: 'SINGAPORE BUNKER FUEL',
      value: `$${bunkerVal}`,
      unit: '/MT',
      badge: '-0.8%',
      badgeType: 'emerald',
      subtext: '0.5% Low-Sulfur Marine Fuel',
      description: 'Platts Singapore Benchmark',
      icon: Fuel,
      iconColor: 'text-[#077DB3]'
    },
    {
      label: 'SPOT CHARTER BENCHMARK',
      value: `$${spotRateVal}`,
      unit: '/day',
      badge: `15D Est: $${ptFc}`,
      badgeType: 'ocean',
      subtext: 'Supramax / Panamax Average',
      description: `Upper Range: $${upper95}/day`,
      icon: TrendingUp,
      iconColor: 'text-[#077DB3]'
    },
    {
      label: 'MARKET TIGHTNESS',
      value: mtiVal,
      badge: 'Balanced',
      badgeType: 'ocean',
      subtext: 'Cargo Volume vs Fleet Capacity',
      description: 'East Coast Vessel Demand',
      icon: Gauge,
      iconColor: 'text-[#077DB3]'
    },
    {
      label: 'MARKET VOLATILITY',
      value: `${volPct}%`,
      unit: ' daily',
      badge: 'Moderate',
      badgeType: 'amber',
      subtext: 'Rate Fluctuation Range',
      description: 'Estimated 30-Day Variance',
      icon: Activity,
      iconColor: 'text-[#D97706]'
    },
    {
      label: 'CARBON EMISSIONS GRADE',
      value: 'GRADE B',
      unit: ' (IMO Compliant)',
      badge: 'Active',
      badgeType: 'emerald',
      subtext: 'Standard Fleet Energy Rating',
      description: 'Complies with 2026 Standards',
      icon: Leaf,
      iconColor: 'text-[#0D9488]'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
      {kpis.map((kpi, idx) => {
        const IconComponent = kpi.icon;

        let badgeClass = 'status-pill-ocean';
        if (kpi.badgeType === 'emerald') badgeClass = 'status-pill-emerald';
        if (kpi.badgeType === 'amber') badgeClass = 'status-pill-amber';
        if (kpi.badgeType === 'coral') badgeClass = 'status-pill-coral';
        if (kpi.badgeType === 'indigo') badgeClass = 'status-pill-indigo';

        return (
          <div
            key={idx}
            className="terminal-card p-4 flex flex-col justify-between hover:border-[#BED9EB] transition-all bg-white"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#627D98] uppercase truncate">
                  {kpi.label}
                </span>
                <span className={`status-pill text-[10px] py-0 px-2 shrink-0 ${badgeClass}`}>
                  {kpi.badge}
                </span>
              </div>

              <div className="flex items-baseline gap-1 my-1">
                <span className="text-2xl font-bold font-heading text-[#0F2942] tracking-tight">
                  {kpi.value}
                </span>
                {kpi.unit && (
                  <span className="text-xs font-medium text-[#627D98]">{kpi.unit}</span>
                )}
              </div>
            </div>

            <div className="pt-2.5 border-t border-[#EDF4F9] mt-2">
              <div className="flex items-center justify-between text-[11px] text-[#627D98]">
                <span className="truncate font-medium">{kpi.subtext}</span>
                <IconComponent className={`w-3.5 h-3.5 shrink-0 ${kpi.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
