import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, CheckCircle2, Zap, Gauge, Scale,
  Sparkles, Calculator, BarChart3
} from 'lucide-react';

export default function PricingStatus() {
  const [calcCargoQty, setCalcCargoQty] = useState(75000);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);

  const marketData = [
    {
      name: 'Spot Freight Index',
      value: '$33,161',
      unit: '/ day TCE',
      trend: 'up',
      change: '+2.4%',
      status: 'Bullish Momentum',
      statusColor: 'emerald',
      recommendation: 'Spot rates are +12% above 30-day baseline. Optimal window for 3-Voyage CoA hedging.',
      icon: DollarSign
    },
    {
      name: 'Baltic Dry Index (BDI)',
      value: '3,186',
      unit: 'Points',
      trend: 'up',
      change: '+42 pts (+1.3%)',
      status: 'Expansionary',
      statusColor: 'cyan',
      recommendation: 'Capesize (BCI) leading dry bulk rally. Lock long-term tonnage commitments.',
      icon: BarChart3
    },
    {
      name: 'Singapore VLSFO 0.5%',
      value: '$629.00',
      unit: '/ Metric Ton',
      trend: 'down',
      change: '-$5.20 (-0.8%)',
      status: 'Cost Favorable',
      statusColor: 'emerald',
      recommendation: 'Bunker fuel spread softening. Virtual Arrival speed reduction maximizes margin.',
      icon: Gauge
    },
    {
      name: 'Market Tightness (MTI)',
      value: '0.319',
      unit: 'Supply Index',
      trend: 'up',
      change: '+0.015 (Tight)',
      status: 'High Demand',
      statusColor: 'amber',
      recommendation: 'Indian East Coast berth queue tightness is elevated. Pre-book laycans 14+ days ahead.',
      icon: Scale
    }
  ];

  const routes = [
    {
      name: 'Indonesia (Samarinda) ➔ Paradip',
      cargoType: 'Thermal Coal (5,500 kcal/kg)',
      currentRate: '$22,450/day',
      averageRate: '$21,200/day',
      costPerTon: '$11.85/MT',
      recommendation: 'Optimal spot arbitrage window; favorable bunker burn.',
      profitability: 'High Yield',
      profitColor: 'emerald',
      seaDays: '7.8 Days'
    },
    {
      name: 'Australia (Newcastle) ➔ Visakhapatnam',
      cargoType: 'Coking / Met Coal',
      currentRate: '$34,800/day',
      averageRate: '$32,400/day',
      costPerTon: '$18.40/MT',
      recommendation: 'Consider 6-Month Term CoA to lock 11% volume rebate.',
      profitability: 'Strategic Buffer',
      profitColor: 'cyan',
      seaDays: '16.2 Days'
    },
    {
      name: 'Mozambique (Maputo) ➔ Gangavaram',
      cargoType: 'Thermal Coal',
      currentRate: '$26,900/day',
      averageRate: '$25,800/day',
      costPerTon: '$15.20/MT',
      recommendation: 'Weather-stable lane; competitive landed energy yield.',
      profitability: 'Moderate',
      profitColor: 'amber',
      seaDays: '14.5 Days'
    },
    {
      name: 'US Atlantic (Norfolk) ➔ Paradip',
      cargoType: 'Premium Hard Coking Coal',
      currentRate: '$41,200/day',
      averageRate: '$39,500/day',
      costPerTon: '$28.60/MT',
      recommendation: 'High Cape freight; combine with triangular iron ore backhaul.',
      profitability: 'High Volatility',
      profitColor: 'purple',
      seaDays: '28.0 Days'
    }
  ];

  const currentRoute = routes[selectedRouteIdx];
  const estimatedFreightExpense = (calcCargoQty * parseFloat(currentRoute.costPerTon.replace('$', ''))).toLocaleString('en-US', {
    maximumFractionDigits: 0
  });

  return (
    <div className="space-y-6">
      {/* 1. Metric Cockpit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketData.map((metric, idx) => {
          const MetricIcon = metric.icon;
          const isUp = metric.trend === 'up';

          return (
            <div key={idx} className="glass-panel p-5 relative overflow-hidden border border-slate-800 hover:border-slate-700">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{metric.name}</span>
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
                  <MetricIcon className="w-4 h-4 text-cyan-400" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black font-heading text-white">{metric.value}</span>
                <span className="text-xs font-mono text-slate-400">{metric.unit}</span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className={`px-2 py-0.5 rounded font-bold ${
                  metric.statusColor === 'emerald' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : metric.statusColor === 'cyan'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {metric.status}
                </span>
                
                <span className={`flex items-center gap-1 font-bold ${isUp ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {metric.change}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mt-2 font-mono line-clamp-2 leading-relaxed">
                {metric.recommendation}
              </p>
            </div>
          );
        })}
      </div>

      {/* 2. Interactive Route Matrix & Cost Estimator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Popular Routes Table */}
        <div className="lg:col-span-8 glass-panel p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-heading font-black text-white">East Coast Lane Benchmark Rates</h2>
              <p className="text-xs font-mono text-slate-400 mt-0.5">Real-time daily spot and per-ton landed rates</p>
            </div>
            <span className="badge-neon-cyan">LIVE FIXTURES</span>
          </div>

          <div className="space-y-3">
            {routes.map((route, idx) => {
              const isSelected = selectedRouteIdx === idx;

              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedRouteIdx(idx)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    isSelected 
                      ? 'bg-slate-900/90 border-cyan-500/60 shadow-lg shadow-cyan-500/10' 
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-extrabold text-sm text-white">{route.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {route.seaDays}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">{route.cargoType}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs font-mono text-slate-400 block">Daily TCE</span>
                        <span className="font-mono font-bold text-white text-sm">{route.currentRate}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono text-slate-400 block">Landed Cost</span>
                        <span className="font-mono font-bold text-cyan-400 text-sm">{route.costPerTon}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-md">
                      💡 {route.recommendation}
                    </span>
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                      route.profitColor === 'emerald'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : route.profitColor === 'cyan'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      {route.profitability}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Instant Parcel Cost Calculator */}
        <div className="lg:col-span-4 glass-panel p-6 border border-slate-800 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calculator className="w-5 h-5 text-orange-400" />
              <h3 className="font-heading font-black text-white text-base">Quick Parcel Cost Estimator</h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1.5">Selected Shipping Lane:</label>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-slate-200 font-bold text-xs truncate">
                  {currentRoute.name}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-slate-400">Cargo Parcel Size:</label>
                  <span className="text-cyan-400 font-bold">{calcCargoQty.toLocaleString()} MT</span>
                </div>
                <input 
                  type="range"
                  min="25000"
                  max="180000"
                  step="5000"
                  value={calcCargoQty}
                  onChange={(e) => setCalcCargoQty(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-slate-400 text-xs">
                  <span>Unit Landed Freight:</span>
                  <span className="text-white font-bold">{currentRoute.costPerTon}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-xs">
                  <span>Estimated Transit Time:</span>
                  <span className="text-white font-bold">{currentRoute.seaDays}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-bold text-xs">Est. Total Ocean Freight:</span>
                  <span className="text-lg font-black text-orange-400 font-heading">${estimatedFreightExpense}</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => alert(`Generating formal fixture recommendation for ${calcCargoQty.toLocaleString()} MT on ${currentRoute.name}`)}
            className="btn-coral w-full justify-center py-3 text-xs rounded-xl shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Fixture Plan</span>
          </button>
        </div>

      </div>

      {/* 3. Decision Guidance Panel */}
      <div className="glass-panel p-6 border border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/40">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-black text-white text-base">Prescriptive Chartering Guidance</h3>
            <p className="text-xs font-mono text-slate-400">Algorithmic spot vs term contract recommendation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 bg-slate-900/90 rounded-xl border-l-4 border-l-emerald-500 border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>OPTIMAL 3-VOYAGE COA ENTRY</span>
            </div>
            <p className="text-slate-300 mt-2 leading-relaxed">
              With spot freight trending at $33,161/day and bunker fuel steady at $629/MT, locking a 3-voyage contract secures an average <strong>$1,850/day (6.2%) discount</strong> vs single spot exposure.
            </p>
          </div>

          <div className="p-4 bg-slate-900/90 rounded-xl border-l-4 border-l-cyan-500 border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Gauge className="w-4 h-4" />
              <span>BERTH SCHEDULING ADVISORY</span>
            </div>
            <p className="text-slate-300 mt-2 leading-relaxed">
              Market Tightness is high (0.319). Paradip and Vizag mechanized coal berths indicate 2.8-day average pre-berthing queues. Prioritize Virtual Arrival slow-steaming to eliminate demurrage.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

