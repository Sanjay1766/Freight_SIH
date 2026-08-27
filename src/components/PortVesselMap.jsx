import React from 'react';
import { Anchor, Ship, Navigation, Globe, ArrowRight } from 'lucide-react';
import { EAST_COAST_PORT_MATRIX, ORIGIN_PORTS_MATRIX, CANDIDATE_VESSELS, getNauticalDistance } from '../services/optimizerEngine';

export default function PortVesselMap({ selectedPortKey, onPortChange, selectedOriginKey, onOriginChange }) {
  const ports = Object.entries(EAST_COAST_PORT_MATRIX).map(([key, spec]) => ({
    key,
    ...spec,
  }));

  const origins = Object.entries(ORIGIN_PORTS_MATRIX).map(([key, spec]) => ({
    key,
    ...spec,
  }));

  const activePort = EAST_COAST_PORT_MATRIX[selectedPortKey] || EAST_COAST_PORT_MATRIX.Dhamra;
  const activeOrigin = ORIGIN_PORTS_MATRIX[selectedOriginKey || 'Indonesia_Samarinda'] || ORIGIN_PORTS_MATRIX.Indonesia_Samarinda;
  const activeDistance = getNauticalDistance(activeOrigin.key, activePort.key);

  return (
    <div className="card-clean p-6 relative">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 font-heading">
              Global Origins & East Coast India Port Fleet Radar
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Physical port limitations across all 7 Indian East Coast ports & 5 global origin loading hubs
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>7 Indian Ports + 5 Global Origins Monitored</span>
        </div>
      </div>

      {/* 1. Interactive Visual Maritime Route Simulator Graphic */}
      <div className="mb-6 rounded-2xl bg-slate-950 p-6 text-white border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-[#FF3B00] border border-orange-500/30">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Sea Lane Simulator</span>
              <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                {activeOrigin.name} <ArrowRight className="w-4 h-4 text-[#FF3B00]" /> {activePort.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px]">Distance:</span>
              <strong className="text-[#FF3B00] text-sm">{activeDistance.toLocaleString()} NM</strong>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-slate-400 block text-[10px]">Sailing Time (13.5 kn):</span>
              <strong className="text-cyan-400 text-sm">{Number((activeDistance / (13.5 * 24)).toFixed(1))} Days</strong>
            </div>
          </div>
        </div>

        {/* Global Trade Lane Visual SVG */}
        <div className="h-44 w-full bg-slate-900/60 rounded-xl border border-slate-800 p-4 relative flex items-center justify-between">
          
          {/* Origin Node */}
          <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 max-w-[200px] z-10 space-y-1">
            <div className="text-[10px] text-cyan-400 font-bold uppercase flex items-center gap-1">
              <Anchor className="w-3.5 h-3.5" /> Loading Origin
            </div>
            <div className="font-bold text-white text-xs truncate">{activeOrigin.name}</div>
            <div className="text-[10px] text-slate-400 font-mono">Max Draft: {activeOrigin.maxDraft}m • {activeOrigin.country}</div>
          </div>

          {/* Animated Sea Lane Middle */}
          <div className="flex-1 px-6 relative flex flex-col items-center justify-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-cyan-500 via-[#FF3B00] to-emerald-500 relative flex items-center justify-center">
              <div className="absolute px-3 py-1 rounded-full bg-slate-950 border border-slate-700 font-mono text-[10px] text-slate-300 flex items-center gap-1.5 shadow-md">
                <Ship className="w-3.5 h-3.5 text-[#FF3B00] animate-pulse" />
                <span>{activeDistance} NM Maritime Transit</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 mt-4 font-mono">
              Chokepoints: {activeOrigin.chokepoints ? activeOrigin.chokepoints[0] : 'Open Sea Passage'}
            </div>
          </div>

          {/* Destination Node */}
          <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 max-w-[220px] z-10 space-y-1 text-right">
            <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center justify-end gap-1">
              Discharge Port <Anchor className="w-3.5 h-3.5" />
            </div>
            <div className="font-bold text-white text-xs truncate">{activePort.name}</div>
            <div className="text-[10px] text-slate-400 font-mono">Max Draft: {activePort.maxDraft}m • {activePort.dailyDischargeRate / 1000}k MT/d</div>
          </div>

        </div>
      </div>

      {/* 2. Global Origin Terminals Selector */}
      <div className="mb-6">
        <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-blue-600" /> Select Global Procurement Origin Terminal (5 Countries):
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {origins.map(orig => {
            const isSelected = (selectedOriginKey || 'Indonesia_Samarinda') === orig.key;

            return (
              <div
                key={orig.key}
                onClick={() => onOriginChange && onOriginChange(orig.key)}
                className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                  isSelected
                    ? 'bg-blue-500/10 border-blue-600 shadow-sm ring-1 ring-blue-500/30'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 truncate">{orig.country}</span>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">{orig.region}</span>
                </div>
                <div className="text-[11px] text-slate-600 truncate font-medium">{orig.name.split('(')[0]}</div>
                <div className="text-[10px] font-mono text-blue-700 font-semibold mt-1">
                  Load: {(orig.dailyLoadingRate / 1000).toFixed(0)}k MT/d
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. East Coast India Port Matrix (7 Ports) */}
      <div className="mb-6">
        <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <Anchor className="w-4 h-4 text-[#FF3B00]" /> Select Destination East Coast Indian Port (7 Ports):
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          {ports.map(p => {
            const isSelected = selectedPortKey === p.key;

            return (
              <div
                key={p.key}
                onClick={() => onPortChange(p.key)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-orange-500/10 border-[#FF3B00] shadow-md ring-1 ring-orange-500/30'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-bold text-xs flex items-center gap-1 truncate ${isSelected ? 'text-[#FF3B00]' : 'text-slate-900'}`}>
                    {p.key}
                  </span>
                  <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${
                    p.avgWaitingDays > 3.0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {p.avgWaitingDays > 3.0 ? 'BUSY' : 'CLEAR'}
                  </span>
                </div>

                <div className="text-[10px] space-y-0.5 font-mono text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Draft:</span>
                    <strong className="text-slate-900">{p.maxDraft}m</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">LOA:</span>
                    <span>{p.maxLOA}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Disch:</span>
                    <span>{(p.dailyDischargeRate / 1000).toFixed(0)}k MT</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Active Port Deep-Dive Specs */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
        <div>
          <span className="text-slate-400 block font-sans font-medium">Selected Port & State:</span>
          <strong className="text-slate-900 font-sans text-sm">{activePort.name}</strong>
          <span className="text-slate-500 block text-[11px]">{activePort.state}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-sans font-medium">Draft / LOA / Beam:</span>
          <strong className="text-slate-900">Draft {activePort.maxDraft}m • LOA {activePort.maxLOA}m • Beam {activePort.maxBeam}m</strong>
          <span className="text-slate-500 block text-[11px] font-sans">{activePort.allowedClasses.join(', ')}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-sans font-medium">Discharge Rate & Tariff:</span>
          <strong className="text-slate-900">{(activePort.dailyDischargeRate / 1000).toFixed(0)}k MT/day • ${activePort.portTariffPerTon}/MT</strong>
          <span className="text-amber-600 block text-[11px]">Demurrage: ${activePort.demurrageRatePerDay.toLocaleString()}/day</span>
        </div>
        <div>
          <span className="text-slate-400 block font-sans font-medium">Tidal & Navigation Profile:</span>
          <span className="text-slate-700 block text-[11px] font-sans font-medium">{activePort.tidalRestriction}</span>
        </div>
      </div>

      {/* 5. Candidate AIS Fleet Queue for Selected Port */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <h3 className="text-xs uppercase font-bold tracking-wider text-slate-600 mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Ship className="w-4 h-4 text-[#FF3B00]" />
            Candidate Fleet AIS Queue ({CANDIDATE_VESSELS.length} Vessels Monitored)
          </span>
          <span className="font-mono text-slate-500 font-normal">Auto-validating against {activePort.key} & {activeOrigin.country}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {CANDIDATE_VESSELS.map(v => {
            const draftPass = v.draft <= activePort.maxDraft;
            const loaPass = v.loa <= activePort.maxLOA;
            const classPass = activePort.allowedClasses.includes(v.vesselClass);
            
            let isFeasible = draftPass && loaPass && classPass;
            let lighteringNotice = false;
            if (activePort.key === 'Haldia' && v.draft > 8.5) {
              isFeasible = true;
              lighteringNotice = true;
            }

            return (
              <div
                key={v.id}
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                  isFeasible
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-rose-50/60 border-rose-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 truncate">
                    <Ship className="w-3.5 h-3.5 text-[#FF3B00]" />
                    {v.name}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                    lighteringNotice
                      ? 'bg-amber-100 text-amber-800'
                      : isFeasible
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {lighteringNotice ? 'LIGHTERED' : isFeasible ? 'FEASIBLE' : 'BREACH'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 font-mono flex justify-between">
                  <span>{v.vesselClass} ({v.dwt.toLocaleString()} DWT)</span>
                  <span>Draft: {v.draft}m</span>
                </div>

                <div className="text-[10px] text-slate-600 truncate">
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
