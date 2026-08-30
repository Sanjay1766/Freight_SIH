import React, { useState } from 'react';
import { FileText, Download, Mail, Printer } from 'lucide-react';

export default function QuickReports() {
  const [selectedReport, setSelectedReport] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const reports = [
    {
      id: 1,
      name: 'Daily Port Summary',
      description: 'Today\'s vessel arrivals, berth usage, and any important issues',
      lastGenerated: 'Today, 9:00 AM',
      badge: 'DAILY',
      badgeColor: 'cyan'
    },
    {
      id: 2,
      name: 'Weekly Performance',
      description: 'How well the port performed this week — cargo handled, delays, turnaround time',
      lastGenerated: 'Aug 28, 5:00 PM',
      badge: 'WEEKLY',
      badgeColor: 'emerald'
    },
    {
      id: 3,
      name: 'Shipping Rates Summary',
      description: 'Current freight rates in plain terms — whether rates are good or bad for you today',
      lastGenerated: 'Today, 2:30 PM',
      badge: 'MARKET',
      badgeColor: 'amber'
    },
    {
      id: 4,
      name: 'Compliance & Safety Checklist',
      description: 'Vessel inspection status, document compliance, and any pending certifications',
      lastGenerated: 'Aug 29, 4:00 PM',
      badge: 'COMPLIANCE',
      badgeColor: 'purple'
    }
  ];

  const reportContent = {
    1: {
      title: 'Daily Port Summary — 30 August 2026',
      content: `PORT STATUS: FULLY OPERATIONAL

TODAY'S VESSELS:
• MV Sanjay Express — Arriving tomorrow (Aug 31) at 10:30 AM
  Cargo: 75,000 tonnes of Coal | Berth: 2 (Confirmed)

• CT Paradip Master — Arriving Sep 2 at 2:15 PM
  Cargo: Iron Ore | Berth: 1 (Confirmed)

ALERTS TO ACTION:
⚠ Orient Phoenix delayed by 14 hours — needs Berth 3 confirmed.

QUICK NUMBERS:
• Berths in use today: 2 out of 3
• Vessels expected this week: 4
• On-time performance: 95%

STATUS: All confirmed vessels on track. One needs berth action.`
    },
    2: {
      title: 'Weekly Port Performance — Aug 24-30, 2026',
      content: `HOW DID WE DO THIS WEEK?

VESSELS HANDLED: 12 ships processed successfully
CARGO MOVED: 850,000 tonnes (coal, iron ore, bauxite)
AVERAGE TURNAROUND: 3.2 days per vessel (Target: 4 days) ✓ BETTER THAN TARGET
ON-TIME ARRIVALS: 92% of ships arrived within their window

WHAT WENT WELL:
✓ Exceeded cargo target by 8%
✓ Fuel costs came in under budget
✓ Zero safety incidents this week

WHAT NEEDS ATTENTION:
⚠ One vessel (Orient Phoenix) delayed due to weather
⚠ Labor scheduling costs slightly over plan

NEXT WEEK OUTLOOK:
4 vessels confirmed. Berth 3 needs to be assigned for Orient Phoenix.`
    },
    3: {
      title: 'Shipping Rates — Is Today a Good Day to Ship?',
      content: `TODAY'S MARKET IN PLAIN TERMS:

CURRENT FREIGHT RATE: $33,161/day
→ This is ABOVE AVERAGE. Good time to confirm export bookings.

IS IT EXPENSIVE TO SHIP RIGHT NOW?
→ Rates are higher than usual — GOOD FOR EXPORTERS, costs more for importers.

FUEL COST TODAY: $629 per tonne of ship fuel
→ Slightly cheaper than last week. Ships are cheaper to run today.

SHIP AVAILABILITY: TIGHT
→ Not many ships available. Book early — at least 5 days ahead.

WHAT SHOULD YOU DO?
1. If you need to EXPORT: Lock in today's rate — it's favorable.
2. If you need to IMPORT: Negotiate harder, rates may ease next month.
3. Book your next vessel NOW — availability is tight.`
    },
    4: {
      title: 'Compliance & Safety Checklist — Aug 30, 2026',
      content: `OVERALL STATUS: ✓ COMPLIANT

VESSEL INSPECTION STATUS:
✓ MV Sanjay Express — All documents valid
✓ CT Paradip Master — Inspected Aug 20, all clear
✓ Pacific Voyager — All certifications current
⏰ Orient Phoenix — Inspection due Sep 15 (schedule it soon)

CARGO DOCUMENTATION:
✓ Coal export paperwork: Complete
✓ Iron ore import customs: Complete
✓ Hazardous materials: Properly classified

SAFETY THIS WEEK:
✓ No accidents or incidents reported
✓ Safety drill completed on Aug 28
✓ All equipment certificates are current

THINGS TO DO SOON:
• Schedule Orient Phoenix inspection for Sep 15
• Renew annual equipment certification by Sep 30
• Safety audit scheduled for Sep 22 — prepare documents`
    }
  };

  const handleExport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      window.print();
    }, 800);
  };

  const selectedContent = reportContent[selectedReport];

  const badgeColors = {
    cyan: 'badge-neon-cyan',
    emerald: 'badge-neon-emerald',
    amber: 'badge-neon-amber',
    purple: 'badge-neon-purple'
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="glass-panel p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-black text-white">Quick Reports</h2>
          <p className="text-sm text-slate-400 mt-0.5">Generate and send simple daily or weekly reports for your team.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={isGenerating}
          className="btn-coral py-2 px-5 text-xs rounded-xl flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          {isGenerating ? 'Preparing...' : 'Print / Export PDF'}
        </button>
      </div>

      {/* Report Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map(report => {
          const isSelected = selectedReport === report.id;
          return (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`glass-panel p-5 cursor-pointer transition-all border flex flex-col gap-3 ${
                isSelected
                  ? 'border-cyan-500/70 shadow-lg shadow-cyan-500/10 scale-[1.02]'
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={badgeColors[report.badgeColor]}>{report.badge}</span>
                <FileText className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-white">{report.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{report.description}</p>
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-auto">
                Last: {report.lastGenerated}
              </p>
            </div>
          );
        })}
      </div>

      {/* Report Viewer */}
      <div className="glass-panel p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-heading font-black text-white">{selectedContent?.title}</h3>
            <p className="text-xs font-mono text-slate-400 mt-0.5">Click a report above to switch views</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => alert('Report sent to your registered email.')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email
            </button>
            <button
              onClick={handleExport}
              className="btn-coral py-1.5 px-3.5 text-xs rounded-lg flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>
        </div>

        {/* Plain text report content */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 font-mono text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
          {selectedContent?.content}
        </div>

        <p className="text-[11px] font-mono text-slate-500 text-right">
          OceanPulse Port Suite • Generated: 2026-08-30
        </p>
      </div>

    </div>
  );
}
