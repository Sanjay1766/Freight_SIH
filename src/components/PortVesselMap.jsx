import React from 'react';
import { Anchor, Ship, Navigation } from 'lucide-react';
import { EAST_COAST_PORT_MATRIX, CANDIDATE_VESSELS } from '../services/optimizerEngine';

export default function PortVesselMap({ selectedPortKey, onPortChange }) {
  const ports = Object.entries(EAST_COAST_PORT_MATRIX).map(([key, spec]) => ({
    key,
    ...spec,
  }));

  const activePortSpec = EAST_COAST_PORT_MATRIX[selectedPortKey];

  return (
    <div className="card-clean p-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 font-heading">
              East Coast India Port Constraints & Fleet Radar
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Physical port limitations (Draft / LOA / Capacity) across major Indian coal import gateways
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>5 Active Ports Monitored</span>
        </div>
      </div>

      {/* Port Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        {ports.map(p => {
          const isSelected = selectedPortKey === p.key;

          return (
            <div
              key={p.key}
              onClick={() => onPortChange(p.key)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-orange-500/10 border-[#FF3B00] shadow-md'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-bold text-sm flex items-center gap-1.5 ${isSelected ? 'text-[#FF3B00]' : 'text-slate-900'}`}>
                  <Anchor className="w-4 h-4" />
                  {p.key}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  p.avgWaitingDays > 3.0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {p.avgWaitingDays > 3.0 ? 'CONGESTED' : 'CLEAR'}
                </span>
              </div>

              <div className="text-[11px] space-y-1 font-mono text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Max Draft:</span>
                  <span className="font-bold text-slate-900">{p.maxDraft}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Max LOA:</span>
                  <span>{p.maxLOA}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Discharge:</span>
                  <span>{(p.dailyDischargeRate / 1000).toFixed(0)}k MT/d</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AIS Vessel List */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <h3 className="text-xs uppercase font-bold tracking-wider text-slate-600 mb-3 flex items-center gap-2">
          <Ship className="w-4 h-4 text-[#FF3B00]" />
          Candidate Fleet Options in Queue for {activePortSpec.name}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CANDIDATE_VESSELS.map(v => {
            const draftPass = v.draft <= activePortSpec.maxDraft;
            const loaPass = v.loa <= activePortSpec.maxLOA;
            const classPass = activePortSpec.allowedClasses.includes(v.vesselClass);
            const isFeasible = draftPass && loaPass && classPass;

            return (
              <div
                key={v.id}
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                  isFeasible
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-rose-50 border-rose-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Ship className="w-3.5 h-3.5 text-[#FF3B00]" />
                    {v.name}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    isFeasible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {isFeasible ? 'FEASIBLE' : 'BREACH'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 font-mono flex justify-between">
                  <span>{v.vesselClass} ({v.dwt.toLocaleString()} DWT)</span>
                  <span>ETA: Day {v.availableFromDay}</span>
                </div>

                <div className="text-[11px] text-slate-700 truncate font-medium">
                  📍 {v.currentLocation}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
