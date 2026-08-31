import React, { useState } from 'react';
import { Plus, ChevronDown, Layers, Ship, Anchor } from 'lucide-react';

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
    <div className="space-y-5">
      {/* 1. Cockpit Header KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="terminal-card p-4 border-emerald-500/30">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Confirmed Laycans</span>
          <div className="mt-1 flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-black text-emerald-400 tabular-nums">2</span>
            <span className="text-xs text-slate-400">Vessels Locked</span>
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-1">Berths 1 & 2 Occupied</p>
        </div>

        <div className="terminal-card p-4 border-amber-500/30">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Tentative Slots</span>
          <div className="mt-1 flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-black text-amber-400 tabular-nums">1</span>
            <span className="text-xs text-slate-400">Adjustable</span>
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-1">Pacific Voyager (Panamax)</p>
        </div>

        <div className="terminal-card p-4 border-rose-500/30">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Pending Assignment</span>
          <div className="mt-1 flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-black text-rose-400 tabular-nums">1</span>
            <span className="text-xs text-rose-300 font-bold">Action Needed</span>
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-1">Orient Phoenix (Supramax)</p>
        </div>

        <div className="terminal-card p-4 border-cyan-500/30">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Terminal Utilization</span>
          <div className="mt-1 flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-black text-cyan-400 tabular-nums">67%</span>
            <span className="text-xs text-cyan-300">2 / 3 Active</span>
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-1">1 Mechanized Slot Open</p>
        </div>
      </div>

      {/* 2. Interactive Berth Gantt Timeline View */}
      <div className="terminal-card p-5 border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-heading text-white">7-Day Berth Gantt Timeline & Turnaround Matrix</h2>
              <p className="text-xs font-mono text-slate-400">Real-time berth occupancy, turnaround progress, and overlap collision checks.</p>
            </div>
          </div>
          <span className="status-pill status-pill-emerald text-[10px]">NO CONFLICTS DETECTED</span>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-[10px] font-mono text-slate-400 py-1 border-b border-slate-800 text-center uppercase">
          <span>AUG 31 (MON)</span>
          <span>SEP 01 (TUE)</span>
          <span>SEP 02 (WED)</span>
          <span>SEP 03 (THU)</span>
          <span>SEP 04 (FRI)</span>
          <span>SEP 05 (SAT)</span>
          <span>SEP 06 (SUN)</span>
        </div>

        {/* Berth Rows */}
        <div className="space-y-2.5 pt-1">
          {berths.map((berthName, idx) => {
            const assignedVessels = scheduleData.filter(v => v.berth.includes(`Berth ${idx + 1}`));

            return (
              <div key={idx} className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Anchor className="w-3.5 h-3.5 text-cyan-400" />
                    {berthName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {assignedVessels.length > 0 ? `${assignedVessels.length} Vessel Allocated` : 'Open Ready Slot'}
                  </span>
                </div>

                <div className="h-9 bg-slate-950 rounded-md relative overflow-hidden border border-slate-800 flex items-center px-1">
                  {assignedVessels.map(v => (
                    <div 
                      key={v.id}
                      className="absolute h-6 rounded bg-gradient-to-r from-cyan-700 to-blue-700 border border-cyan-400/60 flex items-center px-2 text-white text-[10px] font-mono font-bold shadow-sm truncate cursor-pointer hover:from-cyan-600 hover:to-blue-600 transition-colors"
                      style={{ left: `${v.timelineStart}%`, width: `${v.timelineWidth}%` }}
                      onClick={() => setExpandedVessel(v.id)}
                    >
                      <Ship className="w-3 h-3 mr-1 shrink-0" />
                      <span className="truncate">{v.vesselName} ({v.tonnage / 1000}k MT)</span>
                    </div>
                  ))}
                  {assignedVessels.length === 0 && (
                    <span className="text-[10px] font-mono text-slate-600 pl-3">Ready for Instant Allocation</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Schedule Cards List */}
      <div className="terminal-card p-5 border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold font-heading text-white">Vessel Laycan Manifest & Handover Log</h2>
          <button 
            onClick={() => alert('Vessel laycan registration window')}
            className="btn-terminal-primary text-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Add Vessel Slot
          </button>
        </div>

        <div className="space-y-2.5">
          {scheduleData.map((vessel) => {
            const isPending = vessel.status === 'Pending';
            const isExpanded = expandedVessel === vessel.id;

            return (
              <div 
                key={vessel.id}
                className={`p-3.5 rounded-lg border transition-all ${
                  isPending 
                    ? 'bg-slate-900 border-amber-500/40' 
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div 
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 cursor-pointer"
                  onClick={() => setExpandedVessel(isExpanded ? null : vessel.id)}
                >
                  <div className="flex items-center gap-3">
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-cyan-400' : ''}`} />
                    <div className="w-8 h-8 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                      <Ship className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold font-mono text-sm text-white">{vessel.vesselName}</h3>
                      <p className="text-[10px] font-mono text-slate-400">{vessel.vesselClass} • {vessel.tonnage.toLocaleString()} MT</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">ETA Arrival</span>
                      <span className="text-slate-200 font-bold tabular-nums">{vessel.arrival}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Berth Allocation</span>
                      <span className="text-cyan-400 font-bold">{vessel.berth}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Operation Mode</span>
                      <span className="text-slate-200 font-bold">{vessel.cargoOps}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Laycan Window</span>
                      <span className="text-slate-200 font-bold">{vessel.estimatedDuration}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`status-pill text-[10px] ${
                      vessel.status === 'Confirmed'
                        ? 'status-pill-emerald'
                        : vessel.status === 'Tentative'
                        ? 'status-pill-cyan'
                        : 'status-pill-amber'
                    }`}>
                      {vessel.status}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800 text-xs font-mono text-slate-300 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">ESTIMATED DEPARTURE</span>
                        <strong className="text-white">{vessel.departure}</strong>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">CREW ONBOARD</span>
                        <strong className="text-white">{vessel.crew} Seafarers</strong>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">OPERATIONAL NOTES</span>
                        <strong className="text-cyan-400">{vessel.notes}</strong>
                      </div>
                    </div>
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
