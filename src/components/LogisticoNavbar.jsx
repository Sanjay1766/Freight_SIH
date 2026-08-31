import React, { useState, useEffect } from 'react';
import {
  Ship,
  LayoutDashboard,
  Clock3,
  Map,
  Scale,
  ShieldAlert,
  CalendarDays,
  FileText,
  Bot,
  ArrowRightLeft,
  FlaskConical,
  Sparkles,
  Activity,
  FileSpreadsheet,
  Globe,
  Radio,
  Waves
} from 'lucide-react';

export default function LogisticoNavbar({
  activeTab,
  onTabChange,
  appMode,
  onModeChange,
  onOpenQuoteModal,
  onOpenReportModal,
  onOpenCopilot
}) {
  const [utcTime, setUtcTime] = useState('');
  const [istTime, setIstTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
      setIstTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const executiveItems = [
    { key: 'dashboard', label: 'Overview Cockpit', icon: LayoutDashboard },
    { key: 'timing', label: 'Charter Timing', icon: Clock3, badge: '90D' },
    { key: 'maritime', label: 'Sea Lanes & Vessel Choice', icon: Map },
    { key: 'arbitrage', label: 'Origin Comparison', icon: Scale },
    { key: 'turnaround', label: 'Port Turnaround', icon: ArrowRightLeft },
    { key: 'risk', label: 'Risk Monitor', icon: ShieldAlert },
    { key: 'scheduler', label: 'Voyage Planner', icon: CalendarDays },
    { key: 'stress', label: 'Market Stress Test', icon: FlaskConical },
    { key: 'validation', label: 'Historical Benchmarks', icon: FileText },
    { key: 'shap', label: 'Rate Drivers', icon: Sparkles }
  ];

  const operationsItems = [
    { key: 'arrivals', label: 'Vessel Arrivals Desk', icon: Ship, badge: '7 PORTS' },
    { key: 'pricing', label: 'Landed Rate Checker', icon: Scale },
    { key: 'scheduling', label: '7-Day Berth Schedule', icon: CalendarDays, badge: 'LIVE' },
    { key: 'alerts', label: 'Operational Alerts', icon: ShieldAlert, badge: '4' },
    { key: 'reports', label: 'Shift Handover Report', icon: FileText }
  ];

  const items = appMode === 'operations' ? operationsItems : executiveItems;

  const selectMode = (mode) => {
    onModeChange(mode);
    onTabChange(mode === 'operations' ? 'arrivals' : 'dashboard');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#D6E4EE] bg-white/95 backdrop-blur-md shadow-xs">
      {/* Top Telemetry & Command Bar */}
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        
        {/* Left: Improvised Premium Maritime Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onTabChange(appMode === 'operations' ? 'arrivals' : 'dashboard')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            {/* Sleek Gradient Maritime Icon */}
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#077DB3] via-[#299FE0] to-[#64BAE8] text-white shadow-sm shadow-cyan-500/20 group-hover:scale-105 transition-all">
              <Ship className="h-5 w-5 drop-shadow-sm" />
              <Waves className="absolute -bottom-1 h-3 w-5 opacity-60 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-black tracking-tight text-[#0F2942]">
                  OceanPulse
                </span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-[#E1EFF8] text-[#077DB3] border border-[#BED9EB]">
                  MARITIME SUITE
                </span>
              </div>
              <span className="block text-[11px] font-medium text-[#627D98]">
                Indian East Coast Freight & Logistics Platform
              </span>
            </div>
          </button>

          {/* Clean Operational Feed Status */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F0F6FA] border border-[#DCE8F0] text-xs font-medium text-[#334E68]">
            <span className="live-dot live-dot-emerald" />
            <span>LIVE RATES:</span>
            <span className="text-[#077DB3] font-bold">7 East Coast Ports Active</span>
          </div>
        </div>

        {/* Center: Live Dual Clock (Soothing Style) */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-lg bg-[#F0F6FA] border border-[#DCE8F0] text-xs font-mono text-[#334E68]">
          <div className="flex items-center gap-1.5 text-[#627D98]">
            <Radio className="w-3.5 h-3.5 text-[#299FE0] animate-pulse" />
            <span>UTC:</span>
            <span className="text-[#0F2942] font-bold tabular-nums">{utcTime || '00:00:00 UTC'}</span>
          </div>
          <span className="text-[#CBDCE8]">|</span>
          <div className="flex items-center gap-1.5 text-[#627D98]">
            <span>IST:</span>
            <span className="text-[#077DB3] font-bold tabular-nums">{istTime || '00:00:00 IST'}</span>
          </div>
        </div>

        {/* Right: Mode Switcher & Quick Actions */}
        <div className="flex items-center gap-2.5">
          
          {/* Segmented Persona Switch */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#EDF4F9] border border-[#D6E4EE] text-xs font-semibold">
            <button
              onClick={() => selectMode('executive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                appMode === 'executive'
                  ? 'bg-white text-[#077DB3] shadow-xs font-bold'
                  : 'text-[#627D98] hover:text-[#0F2942]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#299FE0]" />
              <span>Charter Desk</span>
            </button>
            <button
              onClick={() => selectMode('operations')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                appMode === 'operations'
                  ? 'bg-white text-[#077DB3] shadow-xs font-bold'
                  : 'text-[#627D98] hover:text-[#0F2942]'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#299FE0]" />
              <span>Port Ops</span>
            </button>
          </div>

          {/* AI Maritime Copilot (No Groq wording) */}
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E1EFF8] hover:bg-[#D4E8F5] border border-[#BED9EB] text-xs font-semibold text-[#077DB3] transition-all"
            title="Open Maritime Freight Assistant"
          >
            <Bot className="w-3.5 h-3.5 text-[#077DB3]" />
            <span className="hidden sm:inline">Freight Assistant</span>
          </button>

          {/* Weekly Summary Report */}
          <button
            onClick={onOpenReportModal}
            className="btn-terminal-secondary text-xs hidden md:inline-flex"
            title="Download Market Summary Report"
          >
            <FileText className="w-3.5 h-3.5 text-[#077DB3]" />
            <span>Weekly Summary</span>
          </button>

          {/* Quick Quote */}
          <button
            onClick={onOpenQuoteModal}
            className="btn-terminal-primary text-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Quote</span>
          </button>
        </div>
      </div>

      {/* Soothing High-Density Tab Navigation Strip */}
      <nav className="border-t border-[#E8F0F6] bg-[#F9FBFC]">
        <div className="mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto px-4 py-1.5 sm:px-6">
          {items.map(({ key, label, icon: Icon, badge }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => onTabChange(key)}
                className={`flex shrink-0 items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-[#077DB3] border border-[#BED9EB] shadow-xs'
                    : 'text-[#627D98] hover:bg-[#EDF5FA] hover:text-[#0F2942]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#077DB3]' : 'text-[#829AB1]'}`} />
                <span>{label}</span>
                {badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold tracking-tight ${
                      isActive
                        ? 'bg-[#E1EFF8] text-[#077DB3]'
                        : 'bg-[#E2EDF5] text-[#627D98]'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
