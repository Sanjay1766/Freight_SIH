import React from 'react';
import { Ship, Mail, Phone, Search, ChevronRight } from 'lucide-react';

export default function LogisticoNavbar({ activeTab, onTabChange, onOpenQuoteModal }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      
      {/* Top Enterprise Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 md:px-8 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-6 font-medium">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Mail className="w-3.5 h-3.5 text-[#FF3B00]" />
            <span>support@oceanpulse.io</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-slate-300">
            <Phone className="w-3.5 h-3.5 text-[#FF3B00]" />
            <span>+1 (800) 609-6780</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="hidden md:inline font-mono text-[11px]">
            EAST COAST INDIA MATRIX (DHAMRA / PARADEEP / HALDIA / VIZAG / KRISHNAPATNAM)
          </span>
          <button
            onClick={onOpenQuoteModal}
            className="text-[#FF3B00] hover:text-white font-bold transition-colors flex items-center gap-1 text-[11px] uppercase tracking-wider"
          >
            Get Rate Quote <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Header Navbar */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
            <Ship className="w-5 h-5 text-[#FF3B00]" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 font-heading">OceanPulse</span>
              <span className="text-xl font-extrabold text-[#FF3B00]">Freight</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block -mt-1">
              Intelligence & Procurement
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden md:flex items-center gap-8 font-heading font-semibold text-sm text-slate-600">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`transition-colors py-1 ${activeTab === 'dashboard' ? 'text-[#FF3B00] border-b-2 border-[#FF3B00] font-bold' : 'hover:text-slate-900'}`}
          >
            Dashboard
          </button>
          
          <button
            onClick={() => onTabChange('dashboard')}
            className="hover:text-slate-900 transition-colors py-1 text-slate-600"
          >
            Rate Forecast
          </button>

          <button
            onClick={() => onTabChange('maritime')}
            className={`transition-colors py-1 ${activeTab === 'maritime' ? 'text-[#FF3B00] border-b-2 border-[#FF3B00] font-bold' : 'hover:text-slate-900'}`}
          >
            Port Matrix & Fleet
          </button>

          <button
            onClick={() => onTabChange('shap')}
            className={`transition-colors py-1 ${activeTab === 'shap' ? 'text-[#FF3B00] border-b-2 border-[#FF3B00] font-bold' : 'hover:text-slate-900'}`}
          >
            SHAP Analytics
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenQuoteModal}
            className="btn-coral py-2 px-4 text-xs rounded-lg shadow-sm"
          >
            Get Rate Quote
          </button>
        </div>

      </div>
    </header>
  );
}
