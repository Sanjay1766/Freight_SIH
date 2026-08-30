import React from 'react';
import { ArrowRight, FileText, Ship } from 'lucide-react';

export default function LogisticoHero({ onOpenQuoteModal, onOpenReportModal }) {
  return <section className="border-b border-slate-200 bg-[#eaf1f3]">
    <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-7 md:py-14">
      <div className="max-w-3xl">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#2f7d8c]"><Ship className="h-4 w-4" />East Coast India freight planning</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#17324d] md:text-5xl">Make the next freight decision with confidence.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">See market direction, shipment readiness, and port activity in one practical view—without needing to be a freight-market specialist.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button onClick={onOpenQuoteModal} className="inline-flex items-center gap-2 rounded-xl bg-[#2f7d8c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#246b78]">Start a new quote <ArrowRight className="h-4 w-4" /></button>
          <button onClick={onOpenReportModal} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400"><FileText className="h-4 w-4" />View weekly summary</button>
        </div>
      </div>
    </div>
  </section>;
}
