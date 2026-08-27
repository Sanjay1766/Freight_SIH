import React from 'react';
import { ArrowRight, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function LogisticoHero({ onOpenQuoteModal, onOpenBriefing, onOpenReportModal }) {
  return (
    <div className="relative bg-slate-900 text-white overflow-hidden border-b border-slate-800">
      {/* Subtle Maritime Background Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity z-0"
        style={{ backgroundImage: `url('/maritime_hero.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-950/90 z-0" />

      <div className="relative z-10 max-w-[1650px] mx-auto px-4 md:px-8 py-12 md:py-16 flex flex-col items-start justify-between gap-6">
        
        <div className="max-w-4xl space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B00] animate-pulse"></span>
            <span>SMART MARITIME FREIGHT FORECASTING & PRESCRIPTIVE CHARTERING PLATFORM</span>
          </div>

          <h1 
            className="text-3xl md:text-5xl font-black tracking-tight font-heading leading-tight text-[#7DD3FC] !text-[#7DD3FC]"
            style={{ color: '#7DD3FC' }}
          >
            Transforming Spot Chartering into Strategic Medium-Term Procurement
          </h1>

          <p className="text-slate-200 text-sm md:text-base leading-relaxed max-w-3xl font-medium">
            AI-driven predictive freight rate modeling and prescriptive fleet allocation for Indian East Coast bulk imports (<strong className="text-white">Paradip, Vizag, Gangavaram, Gopalpur, Dhamra, Sandheads, Haldia</strong>) from <strong className="text-white">Australia, Indonesia, US, Mozambique, and Russia</strong>.
          </p>
        </div>

        {/* Action Buttons & Fast Links */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onOpenQuoteModal}
            className="btn-coral py-3 px-6 text-xs rounded-lg shadow-lg flex items-center gap-2"
          >
            <span>Calculate Freight Quote</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
          
          <button
            onClick={onOpenReportModal}
            className="px-5 py-3 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition-colors inline-flex items-center gap-2 shadow-md"
          >
            <FileText className="w-4 h-4 text-cyan-300" /> Generate Strategy Dossier
          </button>

          <button
            onClick={onOpenBriefing}
            className="px-4 py-3 rounded-lg text-xs font-bold bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors inline-flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Architecture Briefing
          </button>
        </div>

        {/* Feature Badges with High Contrast Icons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 w-full text-xs text-slate-300 font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong className="text-emerald-400">Obj A:</strong> Optimal Market Timing</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong className="text-emerald-400">Obj B:</strong> Dual-Port Vessel Optimizer</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong className="text-emerald-400">Obj C:</strong> Turnaround & Backhauls</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong className="text-emerald-400">Obj D:</strong> Early Warning Risk Radar</span>
          </div>
        </div>

      </div>
    </div>
  );
}
