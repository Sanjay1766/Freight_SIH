import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Gauge, Layers, Info } from 'lucide-react';

export default function MTIChart({ historySeries = [] }) {
  const chartData = (historySeries || []).slice(-45).map(item => ({
    date: item.date ? String(item.date).slice(5) : '',
    mtiIndia: Number(item.mtiIndia || item.mti_india || 0.319),
    seaborneVolumeDaily: Math.round(Number(item.seaborneVolumeDaily || item.seaborne_volume_proxy || 85000) / 1000),
    bunkerFuel: Number(item.bunkerFuel || item.bunker_fuel || 629.0)
  }));

  const latestPoint = historySeries && historySeries.length > 0 ? historySeries[historySeries.length - 1] : {};
  const latestMTI = Number(latestPoint.mtiIndia || latestPoint.mti_india || 0.319).toFixed(3);

  return (
    <div className="terminal-card p-5 relative border-[#D6E4EE] bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E1EFF8] text-[#077DB3] flex items-center justify-center border border-[#BED9EB]">
              <Gauge className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold font-heading text-[#0F2942]">
              Market Demand & Fleet Capacity Balance
            </h2>
          </div>
          <p className="text-xs text-[#627D98] mt-1 font-medium">
            Daily ratio of Indian seaborne import volumes compared against active dry bulk fleet supply.
          </p>
        </div>

        {/* Current Index Badge */}
        <div className="bg-[#F0F6FA] border border-[#DCE8F0] px-3.5 py-1.5 rounded-lg text-right">
          <div className="text-[10px] font-bold text-[#627D98] uppercase tracking-wider">Demand Ratio</div>
          <div className="text-base font-extrabold text-[#077DB3] font-mono tabular-nums">{latestMTI}</div>
        </div>
      </div>

      {/* Overview Note */}
      <div className="mb-4 p-3 rounded-xl bg-[#F4F9FC] border border-[#E2EDF5] text-xs text-[#334E68] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <Layers className="w-3.5 h-3.5 text-[#077DB3]" />
          <span>Active Import Volume tracking combined with Bunker Fuel pricing sensitivity</span>
        </div>
        <div className="text-[11px] text-[#627D98] flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-[#077DB3]" />
          <span>Continuous daily update</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6EFF5" />
            <XAxis dataKey="date" stroke="#829AB1" fontSize={11} tickLine={false} />
            <YAxis
              yAxisId="left"
              stroke="#077DB3"
              fontSize={11}
              tickLine={false}
              domain={['auto', 'auto']}
              tickFormatter={v => v.toFixed(2)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#299FE0"
              fontSize={11}
              tickLine={false}
              tickFormatter={v => `${v}k`}
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
                if (name === 'mtiIndia') return [val, 'Market Demand Index'];
                if (name === 'seaborneVolumeDaily') return [`${Number(val || 0).toLocaleString()} kMT/day`, 'Daily Import Volume'];
                return [val, name];
              }}
            />
            <Line yAxisId="left" type="monotone" dataKey="mtiIndia" stroke="#077DB3" strokeWidth={2.5} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="seaborneVolumeDaily" stroke="#299FE0" strokeWidth={2.0} strokeDasharray="3 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-[#627D98] pt-2.5 border-t border-[#EDF4F9]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-semibold text-[#077DB3]">
            <span className="w-3 h-1 bg-[#077DB3] rounded inline-block"></span> Market Demand Index (Left Axis)
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-[#299FE0]">
            <span className="w-3 h-1 bg-[#299FE0] rounded inline-block"></span> Seaborne Volume (kMT/d, Right Axis)
          </span>
        </div>
        <span className="text-[#829AB1]">Continuous Daily Signal</span>
      </div>
    </div>
  );
}
