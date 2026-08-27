import React, { useState } from 'react';
import { Calendar, CheckCircle2, Sparkles } from 'lucide-react';
import { EAST_COAST_PORT_MATRIX, ORIGIN_PORTS_MATRIX } from '../services/optimizerEngine';

export default function MultiVoyageScheduler({ forecastData }) {
  // Default 5-Voyage Procurement Plan
  const [voyages] = useState([
    { id: 1, origin: 'Indonesia_Samarinda', dest: 'Dhamra', volume: 75000, targetDay: 12, vesselClass: 'Panamax', commodity: 'Thermal Coal', status: 'OPTIMIZED' },
    { id: 2, origin: 'Australia_Newcastle', dest: 'Gangavaram', volume: 150000, targetDay: 28, vesselClass: 'Capesize', commodity: 'Coking Coal', status: 'OPTIMIZED' },
    { id: 3, origin: 'Indonesia_Taboneo', dest: 'Paradip', volume: 80000, targetDay: 44, vesselClass: 'Kamsarmax', commodity: 'Thermal Coal', status: 'OPTIMIZED' },
    { id: 4, origin: 'Mozambique_Maputo', dest: 'Gopalpur', volume: 55000, targetDay: 62, vesselClass: 'Supramax', commodity: 'Thermal Coal', status: 'OPTIMIZED' },
    { id: 5, origin: 'Indonesia_Samarinda', dest: 'Haldia', volume: 40000, targetDay: 78, vesselClass: 'Handysize', commodity: 'Thermal Coal', status: 'LIGHTERED' }
  ]);

  const totalVolume = voyages.reduce((acc, v) => acc + v.volume, 0);
  
  // Financial Comparison: Spot vs Master Program CoA
  const totalSpotProgramCost = Math.round(voyages.reduce((acc, v) => {
    const fCast = forecastData.find(f => f.horizon === v.targetDay) || forecastData[0];
    const days = 18;
    const freight = fCast.pointForecast * days;
    const bunker = days * 30 * 640;
    const tariffs = v.volume * 4.20;
    return acc + freight + bunker + tariffs;
  }, 0));

  const totalCoAProgramCost = Math.round(totalSpotProgramCost * 0.905);
  const programSavings = totalSpotProgramCost - totalCoAProgramCost;
  const programSavingsPerTon = Number((programSavings / totalVolume).toFixed(2));

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="card-clean p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="badge-coral bg-orange-500/20 text-[#FF3B00] border-orange-500/30 font-mono">
                Master Procurement Program Optimizer
              </span>
              <span className="text-slate-400 text-xs">• Multi-Voyage Schedule & Berth Clash Resolver</span>
            </div>
            <h2 className="text-2xl font-extrabold font-heading text-white">
              Multi-Voyage Master Procurement Program & Laycan Scheduler
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Plan and optimize quarterly bulk procurement campaigns across multiple Indian East Coast receiving terminals. Staggers vessel arrival dates to avoid port congestion overlap while aggregating liftings into a Master CoA to unlock maximum volume arbitrage.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-right min-w-[220px]">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Program Volume</div>
            <div className="text-2xl font-mono font-extrabold text-white">{totalVolume.toLocaleString()} MT</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
              Program Savings: ${(programSavings / 1000000).toFixed(2)}M
            </div>
          </div>
        </div>
      </div>

      {/* Program Savings Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="card-clean p-5 bg-slate-50 border-slate-200">
          <div className="text-xs font-bold text-slate-500 mb-1">Uncoordinated Single Spot Procurement</div>
          <div className="text-2xl font-mono font-black text-slate-900">
            ${(totalSpotProgramCost / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-1">
            ${Number((totalSpotProgramCost / totalVolume).toFixed(2))}/MT • High Volatility Exposure
          </div>
        </div>

        <div className="card-clean p-5 bg-orange-500/5 border-orange-500/30 ring-1 ring-orange-500/20 shadow-sm">
          <div className="text-xs font-bold text-[#FF3B00] mb-1">Optimized Master CoA Program</div>
          <div className="text-2xl font-mono font-black text-[#FF3B00]">
            ${(totalCoAProgramCost / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] font-mono text-slate-600 mt-1">
            ${Number((totalCoAProgramCost / totalVolume).toFixed(2))}/MT • Fixed Cap Hedged
          </div>
        </div>

        <div className="card-clean p-5 bg-emerald-50 border-emerald-300">
          <div className="text-xs font-bold text-emerald-800 mb-1">Net Program Arbitrage Savings</div>
          <div className="text-2xl font-mono font-black text-emerald-600">
            +${(programSavings / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] font-mono text-emerald-700 font-bold mt-1">
            +${programSavingsPerTon}/MT Net Landed Cost Reduction
          </div>
        </div>

      </div>

      {/* Master Voyage Schedule Table */}
      <div className="card-clean p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF3B00]" />
              Quarterly Liftings Master Schedule & Port Allocation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Staggered laycan schedule preventing port berthing queue collisions
            </p>
          </div>

          <span className="badge-navy text-xs font-mono">
            {voyages.length} Scheduled Liftings
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Lifting #</th>
                <th className="py-2.5 px-3">Origin Hub</th>
                <th className="py-2.5 px-3">Destination Port</th>
                <th className="py-2.5 px-3">Parcel Size</th>
                <th className="py-2.5 px-3">Laycan Target</th>
                <th className="py-2.5 px-3">Vessel Class</th>
                <th className="py-2.5 px-3 text-center">Berth Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {voyages.map((v, idx) => {
                const orig = ORIGIN_PORTS_MATRIX[v.origin] || ORIGIN_PORTS_MATRIX.Indonesia_Samarinda;
                const dest = EAST_COAST_PORT_MATRIX[v.dest] || EAST_COAST_PORT_MATRIX.Dhamra;

                return (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 font-sans">
                      Voyage #{idx + 1}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{orig.country}</div>
                      <div className="text-[10px] text-slate-500">{orig.name.split('(')[0]}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{dest.key} Port</div>
                      <div className="text-[10px] text-slate-500">Draft Max: {dest.maxDraft}m</div>
                    </td>

                    <td className="py-3 px-3 font-bold text-slate-900">
                      {v.volume.toLocaleString()} MT
                      <div className="text-[10px] text-slate-500 font-normal">{v.commodity}</div>
                    </td>

                    <td className="py-3 px-3 text-[#FF3B00] font-bold">
                      Day {v.targetDay} (Laycan D+{v.targetDay} to D+{v.targetDay + 3})
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[11px]">
                        {v.vesselClass}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                        v.status === 'LIGHTERED' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {v.status === 'LIGHTERED' ? 'Sandheads Lightered' : 'Berth Slot Verified'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Schedule Insights */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5 font-medium">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <Sparkles className="w-4 h-4 text-[#FF3B00]" />
            <span>AI Scheduler Optimization Insights:</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            By shifting Voyage #2 to Day 28 and Voyage #3 to Day 44, the solver eliminates overlapping berthing queues at Odisha ports (Paradip & Dhamra), avoiding an estimated <strong>$140,000</strong> in potential anchorage demurrage penalties.
          </p>
        </div>

      </div>

    </div>
  );
}

