import React from 'react';
import { Ship, LayoutDashboard, Clock3, Map, Scale, ShieldAlert, CalendarDays, Brain, FileText, Bot, Menu, ArrowRightLeft, FlaskConical, Sparkles } from 'lucide-react';

export default function LogisticoNavbar({ activeTab, onTabChange, appMode, onModeChange, onOpenQuoteModal, onOpenReportModal, onOpenCopilot }) {
  const executiveItems = [
    { key: 'dashboard', label: 'Overview', icon: LayoutDashboard }, { key: 'timing', label: 'Market outlook', icon: Clock3 },
    { key: 'maritime', label: 'Routes & vessels', icon: Map }, { key: 'arbitrage', label: 'Sourcing', icon: Scale },
    { key: 'turnaround', label: 'Turnaround', icon: ArrowRightLeft }, { key: 'risk', label: 'Alerts', icon: ShieldAlert },
    { key: 'scheduler', label: 'Planning', icon: CalendarDays }, { key: 'stress', label: 'Stress test', icon: FlaskConical },
    { key: 'validation', label: 'Insights', icon: Brain }, { key: 'shap', label: 'Model details', icon: Sparkles },
  ];
  const operationsItems = [
    { key: 'arrivals', label: 'Arrivals', icon: Ship }, { key: 'pricing', label: 'Pricing', icon: Scale },
    { key: 'scheduling', label: 'Berth plan', icon: CalendarDays }, { key: 'alerts', label: 'Alerts', icon: ShieldAlert },
    { key: 'reports', label: 'Reports', icon: FileText },
  ];
  const items = appMode === 'operations' ? operationsItems : executiveItems;
  const selectMode = (mode) => { onModeChange(mode); onTabChange(mode === 'operations' ? 'arrivals' : 'dashboard'); };

  return <header className="sticky top-0 z-40 border-b border-slate-200 bg-[#f8fafb]/95 backdrop-blur">
    <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-7">
      <button onClick={() => onTabChange(appMode === 'operations' ? 'arrivals' : 'dashboard')} className="flex items-center gap-3 text-left">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#17324d] text-white shadow-sm"><Ship className="h-5 w-5" /></span>
        <span><span className="block text-lg font-bold tracking-tight text-slate-800">OceanPulse</span><span className="block text-[11px] font-medium text-slate-500">Freight planning, made clear</span></span>
      </button>
      <div className="hidden rounded-xl bg-slate-100 p-1 sm:flex">
        <button onClick={() => selectMode('executive')} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${appMode === 'executive' ? 'bg-white text-[#17324d] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Executive</button>
        <button onClick={() => selectMode('operations')} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${appMode === 'operations' ? 'bg-white text-[#17324d] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Operations</button>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onOpenCopilot} className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 md:flex"><Bot className="h-4 w-4" />Ask OceanPulse</button>
        <button onClick={onOpenReportModal} className="hidden rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white sm:block">Reports</button>
        <button onClick={onOpenQuoteModal} className="rounded-xl bg-[#2f7d8c] px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#246b78]">New quote</button>
      </div>
    </div>
    <nav className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-[1440px] items-center gap-1 overflow-x-auto px-4 py-2 md:px-7"><Menu className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
      {items.map(({ key, label, icon: Icon }) => <button key={key} onClick={() => onTabChange(key)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${activeTab === key ? 'bg-[#e5f0f2] text-[#17324d]' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}><Icon className="h-4 w-4" />{label}</button>)}
    </div></nav>
  </header>;
}
