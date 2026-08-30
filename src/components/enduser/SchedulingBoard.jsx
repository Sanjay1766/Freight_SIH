import React, { useState } from 'react';
import { Plus, ChevronDown, Layers, Ship, Anchor, AlertCircle } from 'lucide-react';

export default function SchedulingBoard() {
  const [expandedVessel, setExpandedVessel] = useState(null);

  const scheduleData = [
    {
      id: 1,
      vesselName: 'MV Sanjay Express',
      vesselClass: 'Kamsarmax',
      arrival: '2026-08-31 10:30 AM',
      berth: 'Berth 2 (Mechanized)',
      berthKey: 'Berth 2',
      cargoOps: 'Loading (Export Coal)',
      estimatedDuration: '72 hours',
      departure: '2026-09-03 10:30 AM',
      status: 'Confirmed',
      priority: 'High',
      notes: 'Mechanized coal loader #2 booked. Fast turnaround priority.',
      crew: 42,
      tonnage: 75000,
      timelineStart: 10,
      timelineWidth: 35
    },
    {
      id: 2,
      vesselName: 'CT Paradip Master',
      vesselClass: 'Capesize',
      arrival: '2026-09-02 02:15 PM',
      berth: 'Berth 1 (Deep Draft)',
      berthKey: 'Berth 1',
      cargoOps: 'Unloading (Iron Ore)',
      estimatedDuration: '96 hours',
      departure: '2026-09-06 02:15 PM',
      status: 'Confirmed',
      priority: 'Normal',
      notes: 'Lightering at Sandheads completed. Ready for lock gate pilot entry.',
      crew: 38,
      tonnage: 165000,
      timelineStart: 30,
      timelineWidth: 45
    },
    {
      id: 3,
      vesselName: 'Orient Phoenix',
      vesselClass: 'Supramax',
      arrival: '2026-09-04 06:00 AM',
      berth: 'Unassigned (Action Req.)',
      berthKey: 'Unassigned',
      cargoOps: 'Loading (Bauxite)',
      estimatedDuration: '60 hours',
      departure: '2026-09-06 06:00 PM',
      status: 'Pending',
      priority: 'High',
      notes: 'Delayed 12h by Monsoon swell. Requires Berth 3 slot allocation.',
      crew: 35,
      tonnage: 55000,
      timelineStart: 50,
      timelineWidth: 30
    },
    {
      id: 4,
      vesselName: 'Pacific Voyager',
      vesselClass: 'Panamax',
      arrival: '2026-09-06 11:45 AM',
      berth: 'Berth 3 (General Cargo)',
      berthKey: 'Berth 3',
      cargoOps: 'Loading (Thermal Coal)',
      estimatedDuration: '72 hours',
      departure: '2026-09-09 11:45 AM',
      status: 'Tentative',
      priority: 'Normal',
      notes: 'Laycan flexible +/- 24h. Buffer available for emergency rerouting.',
      crew: 40,
      tonnage: 72000,
      timelineStart: 70,
      timelineWidth: 28
    }
  ];

  const berths = ['Berth 1 (Deep Draft)', 'Berth 2 (Mechanized)', 'Berth 3 (General Cargo)'];

  return (
    <div className="space-y-6">
      {/* 1. Cockpit Header KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Confirmed Laycans</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-heading text-emerald-400">2</span>
            <span className="text-xs text-slate-400 font-mono">Vessels Locked</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Berth 1 & 2 Occupied</p>
        </div>

        <div className="glass-panel p-5 border-l-4 border-l-amber-500">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Tentative Slots</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-heading text-amber-400">1</span>
            <span className="text-xs text-slate-400 font-mono">Adjustable</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Pacific Voyager</p>
        </div>

        <div className="glass-panel p-5 border-l-4 border-l-rose-500">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Pending Assignment</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-heading text-rose-400">1</span>
            <span className="text-xs text-rose-300 font-mono font-bold">Action Needed</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Orient Phoenix</p>
        </div>

        <div className="glass-panel p-5 border-l-4 border-l-cyan-500">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal Utilization</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-heading text-cyan-400">67%</span>
            <span className="text-xs text-cyan-300 font-mono">2 / 3 Berths</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">1 Mechanized Slot Open</p>
        </div>
      </div>

      {/* 2. Interactive Berth Gantt Timeline View */}
      <div className="glass-panel p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-lg font-heading font-black text-white">7-Day Berth Gantt Timeline</h2>
              <p className="text-xs font-mono text-slate-400">Real-time berth occupancy, turnaround progress, and overlap collision checks</p>
            </div>
          </div>
          <span className="badge-neon-emerald">NO CLASHES DETECTED</span>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-[11px] font-mono text-slate-400 py-1 border-b border-slate-800/80 text-center">
          <span>AUG 31 (MON)</span>
          <span>SEP 01 (TUE)</span>
          <span>SEP 02 (WED)</span>
          <span>SEP 03 (THU)</span>
          <span>SEP 04 (FRI)</span>
          <span>SEP 05 (SAT)</span>
          <span>SEP 06 (SUN)</span>
        </div>

        {/* Berth Rows */}
        <div className="space-y-3 pt-2">
          {berths.map((berthName, idx) => {
            const assignedVessels = scheduleData.filter(v => v.berth.includes(`Berth ${idx + 1}`));

            return (
              <div key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Anchor className="w-3.5 h-3.5 text-cyan-400" />
                    {berthName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {assignedVessels.length > 0 ? `${assignedVessels.length} Vessel Scheduled` : 'Free Slot'}
                  </span>
                </div>

                <div className="h-10 bg-slate-950/80 rounded-lg relative overflow-hidden border border-slate-800 flex items-center px-1">
                  {assignedVessels.map(v => (
                    <div 
                      key={v.id}
                      className="absolute h-7 rounded-md bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-400/50 flex items-center px-2 text-white text-[11px] font-mono font-bold shadow-md truncate cursor-pointer hover:from-cyan-500 hover:to-blue-500 transition-colors"
                      style={{ left: `${v.timelineStart}%`, width: `${v.timelineWidth}%` }}
                      onClick={() => setExpandedVessel(v.id)}
                    >
                      <Ship className="w-3 h-3 mr-1 shrink-0" />
                      <span className="truncate">{v.vesselName} ({v.tonnage / 1000}k MT)</span>
                    </div>
                  ))}
                  {assignedVessels.length === 0 && (
                    <span className="text-[11px] font-mono text-slate-600 pl-3">Slot Available for Allocation</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Schedule Cards List */}
      <div className="glass-panel p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-heading font-black text-white">Vessel Laycan Manifest</h2>
          <button 
            onClick={() => alert('New vessel laycan registration form')}
            className="btn-coral py-1.5 px-3 text-xs rounded-lg flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Vessel
          </button>
        </div>

        <div className="space-y-3">
          {scheduleData.map((vessel) => {
            const isPending = vessel.status === 'Pending';
            const isExpanded = expandedVessel === vessel.id;

            return (
              <div 
                key={vessel.id}
                className={`p-4 rounded-xl border transition-all ${
                  isPending 
                    ? 'bg-slate-900/90 border-rose-500/50 shadow-md shadow-rose-500/10' 
                    : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div 
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer"
                  onClick={() => setExpandedVessel(isExpanded ? null : vessel.id)}
                >
                  <div className="flex items-center gap-3">
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-cyan-400' : ''}`} />
                    <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                      <Ship className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-sm text-white">{vessel.vesselName}</h3>
                      <p className="text-[11px] font-mono text-slate-400">{vessel.vesselClass} • {vessel.tonnage.toLocaleString()} MT</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block">ETA Arrival:</span>
                      <span className="text-slate-200 font-bold">{vessel.arrival}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Assigned Berth:</span>
                      <span className="text-cyan-400 font-bold">{vessel.berth}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Operations:</span>
                      <span className="text-slate-200 font-bold">{vessel.cargoOps}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Laycan Window:</span>
                      <span className="text-slate-200 font-bold">{vessel.estimatedDuration}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                      vessel.status === 'Confirmed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : vessel.status === 'Pending'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {vessel.status}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 text-xs font-mono">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">Crew Compliment:</span>
                        <span className="text-white font-bold">{vessel.crew} Seamen</span>
                      </div>
                      <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">Estimated ETD Departure:</span>
                        <span className="text-white font-bold">{vessel.departure}</span>
                      </div>
                      <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">Priority Tag:</span>
                        <span className="text-orange-400 font-bold">{vessel.priority} Cargo</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block mb-1">Berth Master Log Notes:</span>
                      <p className="text-slate-300">{vessel.notes}</p>
                    </div>

                    {isPending && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-rose-400">
                          <AlertCircle className="w-4 h-4" />
                          <span>Berth 3 is ready for immediate allocation. Lock slot now?</span>
                        </div>
                        <button 
                          onClick={() => alert(`Assigned Berth 3 to ${vessel.vesselName}`)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          Lock Berth 3
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

