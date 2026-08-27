import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Scale, CheckCircle2, TrendingDown, ArrowRight, Zap } from 'lucide-react';
import { solveMultiOriginArbitrage, EAST_COAST_PORT_MATRIX } from '../services/optimizerEngine';

export default function OriginArbitrageComparator({
  selectedPortKey,
  onPortChange,
  cargoQuantity,
  bunkerPrice,
  selectedHorizonForecast,
  decisionTrigger,
  onSelectOrigin
}) {
  const arbitrage = solveMultiOriginArbitrage({
    destinationPortKey: selectedPortKey,
    cargoQuantityTons: cargoQuantity,
    bunkerPrice,
    horizonForecast: selectedHorizonForecast,
    decisionTrigger
  });

  const chartData = arbitrage.originsComparison.map(item => ({
    name: `${item.country} (${item.originKey.split('_')[1]})`,
    originKey: item.originKey,
    fobCost: item.fobPrice,
    freightCost: item.freightPerTon,
    landedCost: item.totalLandedCostPerTon,
    costPerGJ: item.costPerGigajoule,
    ciiGrade: item.ciiGrade
  }));

  return (
    <div className="card-clean p-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 font-heading">
              Multi-Origin Landed Cost Arbitrage Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simultaneous procurement delivered cost ($/MT & $/GJ) across Australia, Indonesia, US, Mozambique, and Russia delivered to <strong className="text-slate-800">{arbitrage.destinationPort.name}</strong>
          </p>
        </div>

        {/* Destination Port Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase px-1">Discharge:</span>
          {Object.keys(EAST_COAST_PORT_MATRIX).map(pKey => (
            <button
              key={pKey}
              onClick={() => onPortChange(pKey)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                selectedPortKey === pKey
                  ? 'bg-[#FF3B00] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {pKey}
            </button>
          ))}
        </div>
      </div>

      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span>Lowest Landed Cost Winner</span>
            </div>
            <div className="text-lg font-black text-slate-900 font-heading mt-1">
              {arbitrage.lowestLandedOrigin.country} ({arbitrage.lowestLandedOrigin.originName.split('(')[0]})
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              FOB: ${arbitrage.lowestLandedOrigin.fobPrice}/MT • Freight: ${arbitrage.lowestLandedOrigin.freightPerTon}/MT
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-black text-emerald-600">
              ${arbitrage.lowestLandedOrigin.totalLandedCostPerTon}
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Landed $/MT</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Best Energy Caloric Value ($/GJ)</span>
            </div>
            <div className="text-lg font-black text-slate-900 font-heading mt-1">
              {arbitrage.lowestEnergyOrigin.country} ({arbitrage.lowestEnergyOrigin.caloricValueKcal.toLocaleString()} kcal/kg)
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              High thermal yield minimizes total fuel volume required by Indian boilers
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-black text-blue-600">
              ${arbitrage.lowestEnergyOrigin.costPerGigajoule}
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Cost $/GJ Delivered</span>
          </div>
        </div>
      </div>

      {/* Stacked Cost Bar Chart */}
      <div className="mb-6">
        <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
          <span>Landed Procurement Cost Component Breakdown ($/MT)</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={10} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(val, name) => {
                  if (name === 'fobCost') return [`$${val}/MT`, 'Commodity FOB Price'];
                  if (name === 'freightCost') return [`$${val}/MT`, 'Ocean Freight & Tariffs'];
                  return [`$${val}`, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="fobCost" name="FOB Commodity Cost ($/MT)" stackId="a" fill="#0284C7" radius={[0, 0, 4, 4]} />
              <Bar dataKey="freightCost" name="Ocean Freight & Demurrage ($/MT)" stackId="a" fill="#FF3B00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Origin Ranking Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Origin Hub</th>
              <th className="py-2.5 px-3">Commodity & Energy</th>
              <th className="py-2.5 px-3">FOB Benchmark</th>
              <th className="py-2.5 px-3">Freight & Transit</th>
              <th className="py-2.5 px-3">Total Landed ($/MT)</th>
              <th className="py-2.5 px-3">IMO CII</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {arbitrage.originsComparison.map((item, idx) => {
              const isLowest = idx === 0;

              return (
                <tr key={item.originKey} className={`hover:bg-slate-50 transition-colors ${isLowest ? 'bg-emerald-50/50' : ''}`}>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      {isLowest && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      <span>{item.country}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{item.originName}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{item.commodity}</div>
                    <div className="text-[10px] font-mono text-blue-600">{item.caloricValueKcal.toLocaleString()} kcal/kg • ${item.costPerGigajoule}/GJ</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-700">
                    ${item.fobPrice}/MT
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-[#FF3B00]">${item.freightPerTon}/MT</div>
                    <div className="text-[10px] text-slate-500">{item.transitDays} Days • {item.distanceNM.toLocaleString()} NM</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-sm text-slate-900">
                    ${item.totalLandedCostPerTon}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.ciiGrade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                      item.ciiGrade === 'B' ? 'bg-blue-100 text-blue-700' :
                      item.ciiGrade === 'C' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      Grade {item.ciiGrade}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectOrigin && onSelectOrigin(item.originKey)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors inline-flex items-center gap-1 shadow-sm"
                    >
                      <span>Route</span>
                      <ArrowRight className="w-3 h-3 text-[#FF3B00]" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
