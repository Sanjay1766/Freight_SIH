import React from 'react';
import { ArrowRight, FileText, Ship, TrendingUp, Sparkles, Anchor, ShieldCheck } from 'lucide-react';

export default function LogisticoHero({ onOpenQuoteModal, onOpenBriefing, onOpenReportModal }) {
  return (
    <section className="border-b border-[#D6E4EE] bg-gradient-to-b from-[#EBF4FA] via-[#F4F9FC] to-[#F5F9FC]">
      <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-6 md:py-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* Main Hero Content */}
          <div className="max-w-3xl space-y-3.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E1EFF8] px-3 py-1 text-xs font-bold text-[#077DB3] border border-[#BED9EB]">
              <Ship className="h-3.5 w-3.5" />
              <span>Indian East Coast Maritime Logistics Suite</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F2942] sm:text-4xl md:text-5xl font-heading leading-tight">
              Freight procurement made <span className="text-[#077DB3]">clear & simple</span>.
            </h1>

            <p className="max-w-2xl text-sm md:text-base leading-relaxed text-[#334E68] font-medium">
              Real-time spot freight tracking, vessel routing, berth readiness, and landed costs across Paradip, Vizag, Dhamra, and Haldia in one practical, unified view.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenQuoteModal}
                className="btn-terminal-primary py-2.5 px-5 text-sm"
              >
                <span>Calculate Landed Quote</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onOpenReportModal}
                className="btn-terminal-secondary py-2.5 px-5 text-sm"
              >
                <FileText className="h-4 w-4 text-[#077DB3]" />
                <span>Executive Weekly Summary</span>
              </button>

              <button
                onClick={onOpenBriefing}
                className="inline-flex items-center gap-2 rounded-xl bg-[#E1EFF8] hover:bg-[#D4E8F5] px-4 py-2.5 text-sm font-semibold text-[#077DB3] border border-[#BED9EB] transition-all"
              >
                <Sparkles className="h-4 w-4 text-[#077DB3]" />
                <span>Quick Intelligence Briefing</span>
              </button>
            </div>
          </div>

          {/* Quick Snapshot Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md w-full shrink-0">
            <div className="terminal-card p-4 border-[#D9E8F3] bg-white">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#627D98]">
                <TrendingUp className="w-4 h-4 text-[#077DB3]" />
                <span>Prompt Spot Benchmark</span>
              </div>
              <p className="text-xl font-bold font-mono text-[#0F2942] mt-1.5 tabular-nums">$22,450<span className="text-xs text-[#627D98] font-normal">/day</span></p>
              <span className="text-[11px] font-semibold text-[#0D9488] mt-1 inline-block">▲ Steady Demand</span>
            </div>

            <div className="terminal-card p-4 border-[#D9E8F3] bg-white">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#627D98]">
                <Anchor className="w-4 h-4 text-[#077DB3]" />
                <span>Active East Coast Ports</span>
              </div>
              <p className="text-xl font-bold font-mono text-[#0F2942] mt-1.5">7 Gateways</p>
              <span className="text-[11px] font-semibold text-[#077DB3] mt-1 inline-block">Paradip • Vizag • Dhamra</span>
            </div>

            <div className="terminal-card p-4 border-[#D9E8F3] bg-white">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#627D98]">
                <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                <span>Weather & Swell Risk</span>
              </div>
              <p className="text-xl font-bold font-mono text-[#0D9488] mt-1.5">Normal</p>
              <span className="text-[11px] text-[#627D98] mt-1 inline-block">Bay of Bengal Calm</span>
            </div>

            <div className="terminal-card p-4 border-[#D9E8F3] bg-white">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#627D98]">
                <Ship className="w-4 h-4 text-[#077DB3]" />
                <span>Vessels Scheduled</span>
              </div>
              <p className="text-xl font-bold font-mono text-[#077DB3] mt-1.5">4 Inbound</p>
              <span className="text-[11px] text-[#627D98] mt-1 inline-block">Next 7 Days</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
