import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Gauge, Layers, Info } from 'lucide-react';

export default function MTIChart({ historySeries }) {
  const chartData = historySeries.slice(-45).map(item => ({
    date: item.date.slice(5),
    mtiIndia: item.mtiIndia,
    seaborneVolumeDaily: Math.round(item.seaborneVolumeDaily / 1000), // in kMT
    bunkerFuel: item.bunkerFuel
  }));

  const latestMTI = historySeries[historySeries.length - 1].mtiIndia;

  return (
    <div className="card-clean p-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF3B00] text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Gauge className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 font-heading">
              Market Tightness Index (MTI_India)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ratio of disaggregated Indian seaborne coal imports to active fleet capacity adjusted for fuel price
          </p>
        </div>

        {/* Current MTI Badge */}
        <div className="bg-orange-500/10 border border-orange-500/30 px-3.5 py-1.5 rounded-xl text-right">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Current MTI Index</div>
          <div className="text-lg font-mono font-extrabold text-[#FF3B00]">{latestMTI}</div>
        </div>
      </div>

      {/* Formula Note */}
      <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#FF3B00]" />
          <span className="font-mono text-slate-900 font-bold">
            MTI_t = Seaborne_Volume_t / (Fleet_DWT_t × (1 / Fuel_Price_t))
          </span>
        </div>
        <div className="text-[11px] text-slate-600 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Denton-Cholette daily cubic spline signal</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis yAxisId="left" stroke="#FF3B00" fontSize={11} tickLine={false} domain={['auto', 'auto']} tickFormatter={v => v.toFixed(2)} />
            <YAxis yAxisId="right" orientation="right" stroke="#0284C7" fontSize={11} tickLine={false} tickFormatter={v => `${v}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              formatter={(val, name) => {
                if (name === 'mtiIndia') return [val, 'MTI_India Index'];
                if (name === 'seaborneVolumeDaily') return [`${Number(val || 0).toLocaleString()} kMT/day`, 'Disaggregated Import Volume'];
                return [val, name];
              }}
            />
            <Line yAxisId="left" type="monotone" dataKey="mtiIndia" stroke="#FF3B00" strokeWidth={2.5} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="seaborneVolumeDaily" stroke="#0284C7" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100 font-bold">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-[#FF3B00] rounded inline-block"></span> MTI_India Index (Left)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-[#0284C7] rounded inline-block"></span> Daily Import Volume (Right)</span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">Continuous Spline</span>
      </div>
    </div>
  );
}
