import React from 'react';
import { Ship, Mail, Phone, FileText, BarChart3, Clock, Navigation, ArrowRightLeft, ShieldAlert, Cpu, Award, Dice5, Bot, Scale } from 'lucide-react';

export default function LogisticoNavbar({ activeTab, onTabChange, onOpenQuoteModal, onOpenReportModal, onOpenCopilot }) {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'timing', label: 'Market Entry (Obj A)', icon: Clock },
    { key: 'maritime', label: 'Sea Lanes & Ports (Obj B)', icon: Navigation },
    { key: 'arbitrage', label: 'Origin Arbitrage', icon: Scale },
    { key: 'turnaround', label: 'Idle & Backhaul (Obj C)', icon: ArrowRightLeft },
    { key: 'risk', label: 'Early Warnings (Obj D)', icon: ShieldAlert },
    { key: 'scheduler', label: 'Master Scheduler', icon: Ship },
    { key: 'stress', label: 'Monte Carlo Stress', icon: Dice5 },
    { key: 'validation', label: 'Model Accuracy Lab', icon: Award },
    { key: 'shap', label: 'SHAP Attribution', icon: Cpu }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      
      {/* Top Enterprise Utility Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 md:px-8 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-6 font-medium">
          <span className="flex items-center gap-1.5 text-slate-200">
            <Mail className="w-4 h-4 text-[#FF3B00]" />
            <span>procurement@oceanpulse.io</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-slate-200">
            <Phone className="w-4 h-4 text-[#FF3B00]" />
            <span>+91 (0674) 260-8400</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <span className="hidden lg:inline font-mono text-[11px] text-slate-200">
            EAST COAST PORTS: PARADIP • VIZAG • GANGAVARAM • GOPALPUR • DHAMRA • SANDHEADS • HALDIA
          </span>
          <button
            onClick={onOpenReportModal}
            className="text-cyan-400 hover:text-white font-bold transition-colors flex items-center gap-1 text-[11px] uppercase tracking-wider"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" /> Strategy Dossier
          </button>
        </div>
      </div>

      {/* Main Header Navbar */}
      <div className="max-w-[1650px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Brand Logo with Vibrant Icon */}
        <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => onTabChange('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-[#FF3B00] text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
            <Ship className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-black tracking-tight text-slate-900 font-heading">OceanPulse</span>
              <span className="text-xl font-black text-[#FF3B00]">Freight</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block -mt-1 font-mono">
              Enterprise Suite
            </span>
          </div>
        </div>

        {/* Navigation Tabs with High Contrast Icons */}
        <div className="hidden 2xl:flex items-center gap-1 font-heading font-semibold text-xs text-slate-700 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
          {navItems.map(item => {
            const isActive = activeTab === item.key;
            const ItemIcon = item.icon;

            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#FF3B00] font-extrabold shadow-sm border border-slate-200'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <ItemIcon className={`w-4 h-4 ${isActive ? 'text-[#FF3B00]' : 'text-slate-600'}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Action Buttons with High-Visibility Icons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenCopilot}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-sm"
          >
            <Bot className="w-4 h-4 text-white" /> AI Copilot
          </button>

          <button
            onClick={onOpenReportModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-[#FF3B00]" /> Strategy Report
          </button>

          <button
            onClick={onOpenQuoteModal}
            className="btn-coral py-2 px-4 text-xs rounded-lg shadow-md"
          >
            Get Freight Quote
          </button>
        </div>

      </div>

      {/* Mobile/Tablet Secondary Nav Bar */}
      <div className="2xl:hidden overflow-x-auto border-t border-slate-200 px-4 py-2 flex gap-1.5 bg-slate-50 text-xs">
        {navItems.map(item => {
          const ItemIcon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold text-xs transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#FF3B00] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              <ItemIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
              {item.label}
            </button>
          );
        })}
      </div>

    </header>
  );
}
