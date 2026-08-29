import React from 'react';
import { ShieldAlert, CloudRain, Fuel, Globe, Activity } from 'lucide-react';

export default function EarlyWarningRiskPanel({ riskAnalysis = {}, selectedPortKey, onPortChange }) {
  const compositeRiskScore = riskAnalysis?.compositeRiskScore ?? 29;
  const overallRiskStatus = riskAnalysis?.overallRiskStatus || 'NORMAL';
  const congestion = riskAnalysis?.congestion || { score: 24, severity: 'LOW', advice: 'Normal berthing queue across East Coast terminals.' };
  const weather = riskAnalysis?.weather || { score: 42, level: 'MODERATE', advisory: 'Sea state normal; winds <15 knots.' };
  const bunker = riskAnalysis?.bunker || { score: 28, level: 'MODERATE', currentPrice: 629.0, impact: '+$186/day rate sensitivity' };
  const chokepoint = riskAnalysis?.chokepoint || { score: 20, level: 'LOW', lane: selectedPortKey || 'Paradip' };
  const varMetrics = riskAnalysis?.varMetrics || {
    totalBudgetExposure: 466880,
    var95Percent: 11.4,
    var95Dollars: 53224,
    var99Percent: 16.1,
    var99Dollars: 75168
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CRITICAL_RISK':
        return 'text-rose-600 bg-rose-50 border-rose-300';
      case 'ELEVATED_RISK':
        return 'text-amber-600 bg-amber-50 border-amber-300';
      case 'MODERATE_RISK':
        return 'text-blue-600 bg-blue-50 border-blue-300';
      default:
        return 'text-emerald-600 bg-emerald-50 border-emerald-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="card-clean p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="badge-coral bg-orange-500/20 text-[#FF3B00] border-orange-500/30 font-mono">
                Objective D • Early Warning & Risk Mitigation
              </span>
              <span className="text-slate-400 text-xs">• Real-Time Disruption Radar</span>
            </div>
            <h2 className="text-2xl font-extrabold font-heading text-white">
              Multi-Factor Early Warning Radar & Value-at-Risk (VaR)
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Synthesizes port congestion queues, Bay of Bengal monsoon depressions, bunker fuel price shocks, and maritime chokepoints into quantitative risk scores and budget exposure limits.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-right min-w-[220px]">
            <div className="text-[10px] uppercase font-bold text-slate-400">Composite Risk Score</div>
            <div className="text-3xl font-mono font-black text-[#FF3B00]">{compositeRiskScore}/100</div>
            <div className={`text-[11px] font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${getStatusColor(overallRiskStatus)}`}>
              {(overallRiskStatus || 'NORMAL').replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Risk Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pillar 1: Port Congestion */}
        <div className="card-clean p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#FF3B00]" /> Port Congestion
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              congestion.severity === 'CRITICAL' || congestion.severity === 'HIGH'
                ? 'bg-rose-100 text-rose-800'
                : congestion.severity === 'ELEVATED'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {congestion.severity}
            </span>
          </div>

          <div className="text-2xl font-mono font-black text-slate-900">
            {congestion.score}<span className="text-xs font-normal text-slate-400 font-sans"> /100 Risk</span>
          </div>

          <p className="text-xs text-slate-600 leading-snug font-medium">
            {congestion.advice}
          </p>

          <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Monitored Port:</span>
            <strong className="text-slate-900">{selectedPortKey}</strong>
          </div>
        </div>

        {/* Pillar 2: Monsoon & Weather */}
        <div className="card-clean p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-blue-600" /> Weather & Monsoon
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              weather.level === 'SEVERE' ? 'bg-rose-100 text-rose-800' : weather.level === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {weather.level}
            </span>
          </div>

          <div className="text-2xl font-mono font-black text-slate-900">
            {weather.score}<span className="text-xs font-normal text-slate-400 font-sans"> /100 Risk</span>
          </div>

          <p className="text-xs text-slate-600 leading-snug font-medium">
            {weather.advisory}
          </p>

          <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Bay of Bengal:</span>
            <strong className="text-blue-600">SW Monsoon Swell</strong>
          </div>
        </div>

        {/* Pillar 3: Bunker Fuel Volatility */}
        <div className="card-clean p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Fuel className="w-4 h-4 text-purple-600" /> Bunker Fuel Vol
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              bunker.level === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-purple-100 text-purple-800'
            }`}>
              ${Number(bunker.currentPrice || 629.0).toFixed(1)}/MT
            </span>
          </div>

          <div className="text-2xl font-mono font-black text-slate-900">
            {bunker.score}<span className="text-xs font-normal text-slate-400 font-sans"> /100 Risk</span>
          </div>

          <p className="text-xs text-slate-600 leading-snug font-medium">
            Marine fuel fluctuations drive {bunker.impact} on spot charter economics.
          </p>

          <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Singapore VLSFO:</span>
            <strong className="text-purple-600 font-bold">${Number(bunker.currentPrice || 629.0).toFixed(1)}</strong>
          </div>
        </div>

        {/* Pillar 4: Chokepoint & Geopolitical */}
        <div className="card-clean p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-600" /> Chokepoint Risk
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {chokepoint.level}
            </span>
          </div>

          <div className="text-2xl font-mono font-black text-slate-900">
            {chokepoint.score}<span className="text-xs font-normal text-slate-400 font-sans"> /100 Risk</span>
          </div>

          <p className="text-xs text-slate-600 leading-snug font-medium">
            Active monitoring across Malacca Strait, Sunda Strait, Suez Canal, and Bab-el-Mandeb passages.
          </p>

          <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Route Status:</span>
            <strong className="text-emerald-600 font-bold">CLEAR</strong>
          </div>
        </div>

      </div>

      {/* Value-at-Risk (VaR) Analytics & Procurement Exposure */}
      <div className="card-clean p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              Value-at-Risk (VaR) Parametric Procurement Exposure
            </h3>
            <p className="text-xs text-slate-500">
              Maximum unhedged budget loss across 95% and 99% statistical confidence levels for standard 75,000 MT voyage
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500 font-medium mb-1">Baseline Voyage Budget</div>
            <div className="text-2xl font-mono font-black text-slate-900">
              ${(Number(varMetrics.totalBudgetExposure || 466880) / 1000000).toFixed(2)}M
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Expected charter + voyage outlay
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1">
              <span>95% VaR (1.645σ)</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-200/80 font-mono">+{varMetrics.var95Percent || 11.4}%</span>
            </div>
            <div className="text-2xl font-mono font-black text-amber-700">
              +${Number(varMetrics.var95Dollars || 53224).toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-700 mt-1">
              95% probability freight cost will not exceed baseline by more than this amount.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
            <div className="flex items-center justify-between text-xs text-rose-800 font-bold mb-1">
              <span>99% VaR (2.326σ Extreme Tail)</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-200/80 font-mono">+{varMetrics.var99Percent || 16.1}%</span>
            </div>
            <div className="text-2xl font-mono font-black text-rose-700">
              +${Number(varMetrics.var99Dollars || 75168).toLocaleString()}
            </div>
            <div className="text-[11px] text-rose-700 mt-1">
              Worst-case tail risk exposure during extreme geopolitical or weather shocks.
            </div>
          </div>

        </div>

        {/* Actionable Risk Mitigation Advice */}
        <div className="mt-4 p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <strong className="text-emerald-400 block font-heading text-sm">Recommended Risk Mitigation Action:</strong>
            <p className="text-slate-300">
              {overallRiskStatus === 'CRITICAL_RISK' || overallRiskStatus === 'ELEVATED_RISK'
                ? 'Lock in 3-Voyage CoA immediately with demurrage caps. For Haldia deliveries, pre-book Sagar-Sandheads lightering barges.'
                : 'Current volatility is moderate. Execute prompt spot charters while monitoring 15-day forward entry windows.'}
            </p>
          </div>
          <button
            onClick={() => onPortChange && onPortChange('Gangavaram')}
            className="btn-coral py-2 px-4 rounded-lg text-xs shrink-0"
          >
            Check Deep-Water Divert (Gangavaram)
          </button>
        </div>

      </div>

    </div>
  );
}
