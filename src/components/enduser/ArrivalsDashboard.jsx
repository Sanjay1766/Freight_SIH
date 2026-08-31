import React, { useState } from 'react';
import { Ship, AlertTriangle, Search, ChevronRight, X, CheckCircle2 } from 'lucide-react';

const vessels = [
  {
    id: 1,
    name: 'MV Sanjay Express',
    type: 'Kamsarmax',
    dwt: '82,500 DWT',
    draft: '14.2m',
    arrivalDate: 'Aug 31',
    arrivalTime: '10:30 AM',
    status: 'on-time',
    cargo: 'Thermal Coal (GAR 4800)',
    quantity: '75,000 MT',
    from: 'Samarinda, Indonesia',
    berth: 'Paradip Berth 2',
    voyageProgress: 85,
    lastSeen: '12 min ago'
  },
  {
    id: 2,
    name: 'CT Paradip Master',
    type: 'Capesize',
    dwt: '180,000 DWT',
    draft: '16.8m',
    arrivalDate: 'Sep 02',
    arrivalTime: '02:15 PM',
    status: 'on-time',
    cargo: 'High-Grade Iron Ore Pellets',
    quantity: '165,000 MT',
    from: 'Newcastle, Australia',
    berth: 'Sagar-Sandheads Anchorage (Lightering)',
    voyageProgress: 60,
    lastSeen: '35 min ago'
  },
  {
    id: 3,
    name: 'Orient Phoenix',
    type: 'Supramax',
    dwt: '58,000 DWT',
    draft: '12.8m',
    arrivalDate: 'Sep 04',
    arrivalTime: '06:00 AM',
    status: 'delayed',
    delayNote: 'Delayed 14h — monsoon depression swell in Bay of Bengal',
    cargo: 'Bauxite & Alumina',
    quantity: '55,000 MT',
    from: 'Maputo, Mozambique',
    berth: 'Vizag Outer Harbour Berth 4',
    voyageProgress: 40,
    lastSeen: '8 min ago'
  },
  {
    id: 4,
    name: 'Pacific Voyager',
    type: 'Panamax',
    dwt: '76,000 DWT',
    draft: '14.0m',
    arrivalDate: 'Sep 06',
    arrivalTime: '11:45 AM',
    status: 'on-time',
    cargo: 'Sub-Bituminous Thermal Coal',
    quantity: '72,000 MT',
    from: 'Taboneo, Indonesia',
    berth: 'Dhamra Bulk Berth 1',
    voyageProgress: 20,
    lastSeen: '1 hr ago'
  }
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
          { label: 'EXPECTED VESSELS', value: vessels.length, sub: 'Next 7 Days', color: 'text-[#0F2942]' },
          { label: 'ON SCHEDULE', value: onTime, sub: 'Berth Ready', color: 'text-[#0D9488]' },
          { label: 'WEATHER DELAYED', value: delayed, sub: 'Bay of Bengal Monsoon', color: 'text-[#B45309]' },
          { label: 'TOTAL INBOUND CARGO', value: '367,000 MT', sub: 'Coal, Ore & Bauxite', color: 'text-[#077DB3]' },
        ].map((s, i) => (
          <div key={i} className="terminal-card p-4 border-[#D6E4EE] bg-white">
            <p className="text-[10px] font-mono font-bold text-[#627D98] uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-xl font-bold font-heading ${s.color} tabular-nums`}>{s.value}</p>
            <p className="text-[11px] text-[#829AB1] mt-1 font-medium">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="terminal-card p-3 flex flex-col sm:flex-row gap-3 border-[#D6E4EE] bg-white">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#829AB1] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by vessel name, cargo type, or loading port..."
            className="w-full pl-9 pr-4 py-2 bg-[#F5F9FC] border border-[#DCE8F0] rounded-lg text-xs font-medium text-[#0F2942] placeholder:text-[#829AB1] focus:outline-none focus:border-[#077DB3]"
          />
        </div>
        <div className="flex gap-1.5 shrink-0 text-xs">
          {[
            { key: 'all', label: 'All Gates' },
            { key: 'on-time', label: 'On Schedule' },
            { key: 'delayed', label: 'Delayed Queue' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f.key
                  ? 'bg-[#077DB3] text-white shadow-xs'
                  : 'bg-[#F0F6FA] text-[#486581] hover:bg-[#E1EFF8] hover:text-[#077DB3] border border-[#DCE8F0]'
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
              className={`terminal-card p-4 cursor-pointer transition-all hover:border-[#BED9EB] bg-white ${
                isDelayed ? 'border-[#FDE68A] bg-[#FFFDF5]' : 'border-[#D6E4EE]'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isDelayed
                    ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#B45309]'
                    : 'bg-[#E1EFF8] border-[#BED9EB] text-[#077DB3]'
                }`}>
                  <Ship className="w-5 h-5" />
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="font-bold text-[#0F2942] text-sm font-heading">{vessel.name}</span>
                    <span className="text-xs text-[#627D98]">({vessel.type} • {vessel.dwt} • Draft {vessel.draft})</span>
                    <span className={`status-pill text-[10px] py-0 px-2 ${
                      isDelayed ? 'status-pill-amber' : 'status-pill-emerald'
                    }`}>
                      {isDelayed ? 'Delayed (+14h)' : 'On Schedule'}
                    </span>
                  </div>
                  <p className="text-xs text-[#486581] truncate font-medium">
                    {vessel.from} ➔ <span className="text-[#077DB3] font-semibold">{vessel.berth}</span> &nbsp;•&nbsp; {vessel.cargo} ({vessel.quantity})
                  </p>
                  {isDelayed && (
                    <p className="text-xs text-[#B45309] mt-1 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      {vessel.delayNote}
                    </p>
                  )}
                </div>

                {/* ETA + Arrow */}
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-xs font-bold text-[#0F2942] tabular-nums font-mono">{vessel.arrivalDate}, {vessel.arrivalTime}</p>
                  <p className="text-[11px] text-[#829AB1]">AIS updated {vessel.lastSeen}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#829AB1] shrink-0" />
              </div>

              {/* Progress Bar */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-[#EDF4F9] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isDelayed ? 'bg-[#D97706]' : 'bg-[#077DB3]'}`}
                    style={{ width: `${vessel.voyageProgress}%` }}
                  />
                </div>
                <span className="text-[11px] text-[#627D98] font-medium shrink-0">{vessel.voyageProgress}% En Route</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="terminal-card w-full max-w-lg border-[#BED9EB] p-6 space-y-4 shadow-xl bg-white">
            <div className="flex items-start justify-between border-b border-[#EDF4F9] pb-3">
              <div>
                <h3 className="text-lg font-heading font-black text-[#0F2942]">{selected.name}</h3>
                <p className="text-xs text-[#627D98] mt-0.5">{selected.type} · {selected.dwt} · Draft {selected.draft}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-[#EDF5FA] text-[#627D98]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {[
                { label: 'Laycan Window ETA', value: `${selected.arrivalDate}, ${selected.arrivalTime}` },
                { label: 'Assigned Berth', value: selected.berth },
                { label: 'Cargo Specification', value: selected.cargo },
                { label: 'Parcel Tonnage', value: selected.quantity },
                { label: 'Loading Port', value: selected.from },
                { label: 'Live Telemetry', value: selected.lastSeen },
              ].map((item, i) => (
                <div key={i} className="bg-[#F5F9FC] rounded-xl p-3 border border-[#E2EDF5]">
                  <p className="text-[10px] text-[#627D98] mb-0.5 uppercase font-bold">{item.label}</p>
                  <p className="font-bold text-[#0F2942]">{item.value}</p>
                </div>
              ))}
            </div>

            {selected.delayNote && (
              <div className="flex items-start gap-2 p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl text-xs font-medium text-[#B45309]">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{selected.delayNote}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-[#EDF4F9]">
              <button
                onClick={() => setSelected(null)}
                className="btn-terminal-secondary flex-1 justify-center text-xs"
              >
                Close
              </button>
              <button
                onClick={() => { alert(`Berth allocation locked for ${selected.name}`); setSelected(null); }}
                className="btn-terminal-primary flex-1 justify-center text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Berth Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
