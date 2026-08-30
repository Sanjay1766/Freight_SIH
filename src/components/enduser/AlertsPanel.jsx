import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, X, Bell, Check, Phone, Mail } from 'lucide-react';

export default function AlertsPanel() {
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('all');

  const alerts = [
    {
      id: 1,
      type: 'critical',
      title: 'MV Orient Phoenix — Arrival Delayed',
      message: 'Due to rough sea conditions, MV Orient Phoenix will arrive 14 hours late. New expected arrival: 4 Sep, 6:00 PM. Please check if Berth 3 can accommodate the new timing.',
      time: '18 mins ago',
      icon: AlertTriangle,
      action: 'Check Berth 3'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Shipping Rates Are High Right Now',
      message: "Current freight rates are above average at $33,161/day. This is a good time to confirm your export bookings at today's rate before they change.",
      time: '45 mins ago',
      icon: AlertCircle,
      action: null
    },
    {
      id: 3,
      type: 'warning',
      title: 'Ships Are Hard to Find This Week',
      message: 'Vessel availability is tight across East Coast ports. If you need to book a ship, do it at least 5 days in advance to avoid delays.',
      time: '1.5 hours ago',
      icon: AlertCircle,
      action: null
    },
    {
      id: 4,
      type: 'info',
      title: 'Fuel Costs Are Slightly Lower Today',
      message: 'Bunker fuel price has dropped to $629/MT, which is slightly cheaper than last week. This reduces shipping costs marginally.',
      time: '3 hours ago',
      icon: Info,
      action: null
    },
    {
      id: 5,
      type: 'success',
      title: 'MV Sanjay Express — Berth Confirmed',
      message: 'Berth 2 at Paradip has been officially allocated for MV Sanjay Express arriving on Aug 31 at 10:30 AM. No action needed.',
      time: '4 hours ago',
      icon: CheckCircle2,
      action: null
    }
  ];

  const activeAlerts = alerts
    .filter(a => !dismissedAlerts.includes(a.id))
    .filter(a => filterSeverity === 'all' || a.type === filterSeverity);

  const dismissAlert = (id) => setDismissedAlerts(prev => [...prev, id]);

  const counts = {
    critical: alerts.filter(a => a.type === 'critical').length,
    warning: alerts.filter(a => a.type === 'warning').length,
    info: alerts.filter(a => a.type === 'info').length,
    success: alerts.filter(a => a.type === 'success').length,
  };

  return (
    <div className="space-y-5">

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 border-l-4 border-l-rose-500">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Urgent</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-heading text-rose-400">{counts.critical}</span>
            <span className="text-xs text-rose-300 font-mono">Need Action</span>
          </div>
        </div>
        <div className="glass-panel p-5 border-l-4 border-l-amber-500">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Warnings</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-heading text-amber-400">{counts.warning}</span>
            <span className="text-xs text-slate-400 font-mono">Review</span>
          </div>
        </div>
        <div className="glass-panel p-5 border-l-4 border-l-cyan-500">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Updates</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-heading text-cyan-400">{counts.info}</span>
            <span className="text-xs text-slate-400 font-mono">Info</span>
          </div>
        </div>
        <div className="glass-panel p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Good News</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-heading text-emerald-400">{counts.success}</span>
            <span className="text-xs text-slate-400 font-mono">Confirmed</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-400">SHOW:</span>
          {[
            { key: 'all', label: 'All' },
            { key: 'critical', label: 'Urgent' },
            { key: 'warning', label: 'Warnings' },
            { key: 'info', label: 'Updates' },
            { key: 'success', label: 'Confirmed' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterSeverity(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                filterSeverity === f.key
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {activeAlerts.length > 0 && (
          <button
            onClick={() => setDismissedAlerts(alerts.map(a => a.id))}
            className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 self-end sm:self-center"
          >
            <Check className="w-3.5 h-3.5 text-cyan-400" /> Mark All as Read
          </button>
        )}
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {activeAlerts.length === 0 ? (
          <div className="glass-panel p-12 text-center border border-slate-800 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-heading font-black text-white">All Clear!</h3>
            <p className="text-sm text-slate-400">No active alerts right now. Everything is running smoothly.</p>
          </div>
        ) : (
          activeAlerts.map(alert => {
            const AlertIcon = alert.icon;
            const isCritical = alert.type === 'critical';

            return (
              <div
                key={alert.id}
                className={`glass-panel p-5 border transition-all ${
                  isCritical
                    ? 'border-rose-500/50 shadow-lg shadow-rose-500/10'
                    : alert.type === 'warning'
                      ? 'border-amber-500/30'
                      : 'border-slate-800/80'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isCritical ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : alert.type === 'warning' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : alert.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                  }`}>
                    <AlertIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="font-heading font-black text-base text-white">{alert.title}</h4>
                      <span className="text-xs font-mono text-slate-500">{alert.time}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{alert.message}</p>
                    {isCritical && alert.action && (
                      <div className="pt-2">
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="btn-coral py-1.5 px-4 text-xs rounded-lg"
                        >
                          {alert.action}
                        </button>
                      </div>
                    )}
                  </div>

                  <button onClick={() => dismissAlert(alert.id)} className="text-slate-500 hover:text-slate-300 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Contact Box */}
      <div className="glass-panel p-5 border border-slate-800 space-y-4">
        <h3 className="font-heading font-black text-white text-base flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" /> Need Help? Contact Port Operations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
          <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-400 text-xs block">Harbor Master (24/7)</span>
              <span className="text-white font-bold">+91-674-260-8400</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <Mail className="w-4 h-4 text-orange-400 shrink-0" />
            <div>
              <span className="text-slate-400 text-xs block">Operations Email</span>
              <span className="text-white font-bold">operations@oceanpulse.io</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
