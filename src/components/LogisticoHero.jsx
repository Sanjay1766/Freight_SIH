import React from 'react';
import { ArrowRight, ShieldCheck, Ship, Anchor, Database } from 'lucide-react';

export default function LogisticoHero({ onTabChange, onOpenQuoteModal, onOpenBriefing }) {
  return (
    <div className="relative bg-slate-900 text-white overflow-hidden border-b border-slate-800">
      {/* Subtle Maritime Background Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity z-0"
        style={{ backgroundImage: `url('/maritime_hero.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-950/90 z-0" />

      <div className="relative z-10 max-w-[1500px] mx-auto px-4 md:px-8 py-16 md:py-20 flex flex-col items-start justify-between gap-6">
        
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#FF3B00]"></span>
            <span>ENTERPRISE FREIGHT LOGISTICS SUITE</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-tight text-white">
            Ocean Freight Analytics & Prescriptive Chartering
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-3xl font-medium">
            Predictive freight rate engine combining GARCH(1,1) volatility risk bounds, CatBoost ML point forecasts, Denton-Cholette disaggregated import signals, and PuLP vessel allocation over the East Coast India Port Matrix.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={onOpenQuoteModal}
            className="btn-coral py-3 px-6 text-xs rounded-lg shadow-md"
          >
            Get Freight Quote <ArrowRight className="w-4 h-4 ml-1" />
          </button>
          
          <button
            onClick={onOpenBriefing}
            className="px-5 py-3 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors inline-flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> Architecture Briefing
          </button>
        </div>

      </div>
    </div>
  );
}
