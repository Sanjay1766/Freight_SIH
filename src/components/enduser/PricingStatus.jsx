import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Gauge, Scale,
  Calculator, BarChart3, Zap
} from 'lucide-react';

export default function PricingStatus() {
  const [calcCargoQty, setCalcCargoQty] = useState(75000);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);

  const marketData = [
    {
      name: 'SPOT FREIGHT INDEX',
      value: '$22,450',
      unit: '/ day TCE',
      trend: 'up',
      change: '+2.4%',
      status: 'Firm Momentum',
      statusColor: 'emerald',
      recommendation: 'Spot rates are stable. Favorable entry window for 3-Voyage CoA hedging.',
      icon: DollarSign
    },
    {
      name: 'BALTIC DRY INDEX (BDI)',
      value: '1,850',
      unit: 'Points',
      trend: 'up',
      change: '+42 pts (+2.3%)',
      status: 'Steady',
      statusColor: 'cyan',
      recommendation: 'Capesize (BCI) leading dry bulk tone. Lock volume commitments early.',
      icon: BarChart3
    },
    {
      name: 'SINGAPORE VLSFO 0.5%',
      value: '$629.00',
      unit: '/ Metric Ton',
      trend: 'down',
      change: '-$5.20 (-0.8%)',
      status: 'Favorable Fuel',
      statusColor: 'emerald',
      recommendation: 'Bunker fuel spread softening. Virtual Arrival slow-steaming maximizes margin.',
      icon: Gauge
    },
    {
      name: 'MARKET TIGHTNESS (MTI)',
      value: '0.319',
      unit: 'Index',
      trend: 'up',
      change: '+0.015',
      status: 'Balanced',
      statusColor: 'indigo',
      recommendation: 'East Coast Indian berth tightness is nominal. Pre-book laycans 10+ days ahead.',
      icon: Scale
    }
  ];

  const routes = [
    {
      name: 'Indonesia (Samarinda) ➔ Paradip',
      cargoType: 'Thermal Coal (GAR 4800)',
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
      cargoType: 'Coking / Metallurgical Coal',
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
    <div className="space-y-5">
      {/* 1. Metric Cockpit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {marketData.map((metric, idx) => {
          const MetricIcon = metric.icon;
          const isUp = metric.trend === 'up';

          return (
            <div key={idx} className="terminal-card p-4 border-slate-800 hover:border-slate-700">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">{metric.name}</span>
                <div className="w-7 h-7 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
                  <MetricIcon className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              </div>

              <div className="mt-2.5 flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl font-black text-white tabular-nums">{metric.value}</span>
                <span className="text-xs text-slate-400">{metric.unit}</span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <span className={`status-pill text-[9px] py-0 px-1.5 ${
                  metric.statusColor === 'emerald' ? 'status-pill-emerald' :
                  metric.statusColor === 'cyan' ? 'status-pill-cyan' :
                  metric.statusColor === 'amber' ? 'status-pill-amber' :
                  'status-pill-indigo'
                }`}>
                  {metric.status}
                </span>
                
                <span className={`flex items-center gap-1 font-bold ${isUp ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {metric.change}
                </span>
              </div>

              <p className="text-[10px] font-mono text-slate-400 mt-2 leading-relaxed">
                {metric.recommendation}
              </p>
            </div>
          );
        })}
      </div>

      {/* 2. Interactive Route Matrix & Cost Estimator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Popular Routes Table */}
        <div className="lg:col-span-8 terminal-card p-5 border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold font-heading text-white">East Coast Indian Freight Lane Benchmarks</h2>
              <p className="text-xs font-mono text-slate-400 mt-0.5">Real-time daily spot and landed freight cost matrix</p>
            </div>
            <span className="status-pill status-pill-cyan text-[10px]">LIVE FIXTURES</span>
          </div>

          <div className="space-y-2.5">
            {routes.map((route, idx) => {
              const isSelected = selectedRouteIdx === idx;

              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedRouteIdx(idx)}
                  className={`p-3.5 rounded-lg cursor-pointer transition-all border font-mono ${
                    isSelected 
                      ? 'bg-cyan-950/30 border-cyan-500/60 shadow-sm' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{route.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {route.seaDays}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{route.cargoType}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Daily TCE</span>
                        <span className="font-bold text-white text-xs tabular-nums">{route.currentRate}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Landed Cost</span>
                        <span className="font-extrabold text-cyan-400 text-xs tabular-nums">{route.costPerTon}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Fixture Calculator */}
        <div className="lg:col-span-4 terminal-card p-5 border-slate-800 space-y-4 bg-slate-900/40">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calculator className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold font-heading text-white">Landed Freight Calculator</h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Active Fixture Route</span>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-bold">
                {currentRoute.name}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400">Cargo Parcel Volume</span>
                <span className="text-cyan-400 font-bold tabular-nums">{(calcCargoQty / 1000).toFixed(0)}k MT</span>
              </div>
              <input
                type="range"
                min="25000"
                max="180000"
                step="5000"
                value={calcCargoQty}
                onChange={(e) => setCalcCargoQty(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 pt-3">
              <div className="flex justify-between text-slate-400">
                <span>Unit Freight Rate:</span>
                <strong className="text-white tabular-nums">{currentRoute.costPerTon}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Transit Sea Days:</span>
                <strong className="text-white tabular-nums">{currentRoute.seaDays}</strong>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-slate-300 font-bold">Est. Total Expense:</span>
                <span className="text-base font-extrabold text-cyan-400 tabular-nums">
                  ${estimatedFreightExpense}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-[11px] text-slate-300 flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>{currentRoute.recommendation}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
