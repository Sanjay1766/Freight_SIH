import React, { useState } from 'react';
import { Ship, AlertTriangle, Search, ChevronRight, X } from 'lucide-react';

const vessels = [
  {
    id: 1,
    name: 'MV Sanjay Express',
    type: 'Kamsarmax',
    dwt: '82,500 DWT',
    arrivalDate: 'Aug 31',
    arrivalTime: '10:30 AM',
    status: 'on-time',
    cargo: 'Thermal Coal',
    quantity: '75,000 MT',
    from: 'Samarinda, Indonesia',
    berth: 'Berth 2',
    voyageProgress: 85,
    lastSeen: '12 min ago',
  },
  {
    id: 2,
    name: 'CT Paradip Master',
    type: 'Capesize',
    dwt: '180,000 DWT',
    arrivalDate: 'Sep 2',
    arrivalTime: '2:15 PM',
    status: 'on-time',
    cargo: 'Iron Ore',
    quantity: '165,000 MT',
    from: 'Newcastle, Australia',
    berth: 'Sagar-Sandheads',
    voyageProgress: 60,
    lastSeen: '35 min ago',
  },
  {
    id: 3,
    name: 'Orient Phoenix',
    type: 'Supramax',
    dwt: '58,000 DWT',
    arrivalDate: 'Sep 4',
    arrivalTime: '6:00 AM',
    status: 'delayed',
    delayNote: 'Delayed 14 hrs — monsoon weather in Bay of Bengal',
    cargo: 'Bauxite',
    quantity: '55,000 MT',
    from: 'Maputo, Mozambique',
    berth: 'Berth 4 — needs confirmation',
    voyageProgress: 40,
    lastSeen: '8 min ago',
  },
  {
    id: 4,
    name: 'Pacific Voyager',
    type: 'Panamax',
    dwt: '76,000 DWT',
    arrivalDate: 'Sep 6',
    arrivalTime: '11:45 AM',
    status: 'on-time',
    cargo: 'Thermal Coal',
    quantity: '72,000 MT',
    from: 'Taboneo, Indonesia',
    berth: 'Berth 1',
    voyageProgress: 20,
    lastSeen: '1 hr ago',
  },
];

export default function ArrivalsDashboard() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = vessels.filter(v => {
    const q = search.toLowerCase();
    const matchesSearch = !q || v.name.toLowerCase().includes(q) || v.cargo.toLowerCase().includes(q) || v.from.toLowerCase().includes(q);
    const matchesFilter = filter === 'all' || v.status === filter;
    return matchesSearch && matchesFilter;
  });

  const onTime = vessels.filter(v => v.status === 'on-time').length;
  const delayed = vessels.filter(v => v.status === 'delayed').length;

  return (
    <div className="space-y-5">

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Vessels Expected', value: vessels.length, color: 'text-white' },
          { label: 'On Schedule', value: onTime, color: 'text-emerald-400' },
          { label: 'Delayed', value: delayed, color: 'text-rose-400' },
          { label: 'Total Cargo', value: '367,000 MT', color: 'text-amber-400' },
        ].map((s, i) => (
          <div key={i} className="glass-panel p-4 border border-slate-800">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-heading font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-panel p-3 flex flex-col sm:flex-row gap-3 border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search vessel, cargo or origin..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
          />
        </div>
        <div className="flex gap-1.5 shrink-0">
          {[
            { key: 'all', label: 'All' },
            { key: 'on-time', label: 'On Schedule' },
            { key: 'delayed', label: 'Delayed' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === f.key
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vessel List */}
      <div className="space-y-2.5">
        {filtered.map(vessel => {
          const isDelayed = vessel.status === 'delayed';
          return (
            <div
              key={vessel.id}
              onClick={() => setSelected(vessel)}
              className={`glass-panel p-4 sm:p-5 cursor-pointer border transition-all hover:border-slate-700 ${
                isDelayed ? 'border-rose-500/30' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isDelayed ? 'bg-rose-500/15 text-rose-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  <Ship className="w-5 h-5" />
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="font-heading font-bold text-white text-sm">{vessel.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                      isDelayed
                        ? 'bg-rose-500/15 text-rose-300'
                        : 'bg-emerald-500/15 text-emerald-300'
                    }`}>
                      {isDelayed ? 'Delayed' : 'On Schedule'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {vessel.from} → {vessel.berth} &nbsp;·&nbsp; {vessel.cargo} ({vessel.quantity})
                  </p>
                  {isDelayed && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      {vessel.delayNote}
                    </p>
                  )}
                </div>

                {/* ETA + Arrow */}
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-sm font-semibold text-white">{vessel.arrivalDate}</p>
                  <p className="text-xs text-slate-400">{vessel.arrivalTime}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
              </div>

              {/* Progress bar */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isDelayed ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${vessel.voyageProgress}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 shrink-0">{vessel.voyageProgress}% en route</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg border border-slate-700 p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-heading font-black text-white">{selected.name}</h3>
                <p className="text-sm text-slate-400 mt-0.5">{selected.type} · {selected.dwt}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Arriving', value: `${selected.arrivalDate}, ${selected.arrivalTime}` },
                { label: 'Assigned Berth', value: selected.berth },
                { label: 'Cargo', value: selected.cargo },
                { label: 'Quantity', value: selected.quantity },
                { label: 'Origin', value: selected.from },
                { label: 'Last AIS Update', value: selected.lastSeen },
              ].map((item, i) => (
                <div key={i} className="bg-slate-900 rounded-xl p-3 border border-slate-800">
                  <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                  <p className="font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            {selected.delayNote && (
              <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-sm text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{selected.delayNote}</span>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={() => setSelected(null)} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-300 transition-colors">
                Close
              </button>
              <button
                onClick={() => { alert(`Berth confirmed for ${selected.name}`); setSelected(null); }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white text-sm font-bold transition-all"
              >
                Confirm Berth
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
