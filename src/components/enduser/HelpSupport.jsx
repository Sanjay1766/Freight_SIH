import React, { useState } from 'react';
import { MessageSquare, Zap, ChevronDown, Sparkles, Compass } from 'lucide-react';

export default function HelpSupport() {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [searchFAQ, setSearchFAQ] = useState('');

  const faqs = [
    {
      id: 1,
      question: 'What is the mathematical formulation behind the GARCH(1,1) Volatility Cone?',
      answer: 'OceanPulse fits an autoregressive conditional heteroskedasticity GARCH(1,1) model with Student-t distributed errors to the loaded rate history. It calculates conditional volatility σ_t = sqrt(ω + α*ε_{t-1}^2 + β*σ_{t-1}^2) and projects 95% confidence cones over 1 to 90 forward days. Review the current API metrics before relying on any forecast.'
    },
    {
      id: 2,
      question: 'How does PuLP MILP resolve Haldia draft restrictions vs Sandheads lightering?',
      answer: 'Haldia Dock Complex has an estuarine lock gate draft restriction of 8.5m. When Capesize vessels (17.8m draft) are scheduled for Haldia, the PuLP MILP optimizer automatically routes them to Sagar-Sandheads Anchorage (16.0m draft) for lightering via daughter barges ($7.50/MT transshipment fee) before locking into Haldia.'
    },
    {
      id: 3,
      question: 'How does Virtual Arrival slow-steaming save bunker fuel and CO2 emissions?',
      answer: 'By applying the hydrodynamic cubic propulsion law (Fuel Burn ∝ Speed^3), when the system detects a 2.5-day pre-berthing waiting queue at Indian ports, it recommends reducing vessel speed from 13.5 knots to 11.2 knots at sea. This absorbs the waiting delay at sea, saves $35,000 to $56,000 in VLSFO fuel per voyage, and mitigates port demurrage queues.'
    },
    {
      id: 4,
      question: 'What is the Market Tightness Index (MTI_India)?',
      answer: 'MTI_India measures the ratio between daily East Coast seaborne commodity import volumes (MT) and available regional deadweight bulk carrier tonnage capacity. Values > 0.30 indicate a tight chartering market where spot rates spike, signaling charterers to lock in 3-voyage or 6-month term contracts.'
    },
    {
      id: 5,
      question: 'How are IMO 2026 CII Carbon Grades (A through E) assigned?',
      answer: 'The operational Carbon Intensity Indicator is computed as (Total CO2 Grams) / (Vessel DWT × Nautical Miles Traveled). Vessels are benchmarked against official IMO reduction trajectory baselines and assigned letter grades A, B, C, D, or E, with a $30/MT carbon levy proxy applied to freight economics.'
    },
    {
      id: 6,
      question: 'How does Triangular Backhaul matching work?',
      answer: 'To eliminate empty uncompensated ballast returns after discharging imported thermal/coking coal at Paradip, Vizag, or Gopalpur, OceanPulse pairs bulkers with outbound Indian mineral export flows (e.g. Paradip Iron Ore to SE Asia or Vizag Calcined Alumina to the Persian Gulf).'
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchFAQ.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchFAQ.toLowerCase())
  );

  const guides = [
    {
      id: 1,
      title: 'Executive Cockpit Navigation',
      icon: Compass,
      topics: [
        '90-Day Forward Trajectory & Cones',
        'CatBoost SHAP Waterfall Interpretation',
        'What-If Scenario Stress Testing',
        '1,000-Path Monte Carlo VaR Analysis'
      ]
    },
    {
      id: 2,
      title: 'Port Master & Laycan Operations',
      icon: Zap,
      topics: [
        'Berth Gantt Collision Prevention',
        'Handling Monsoonal Weather Delays',
        'Sagar-Sandheads Transshipment Lightering',
        'Vessel Pilotage Clearance Protocols'
      ]
    },
    {
      id: 3,
      title: 'Prescriptive Freight Procurement',
      icon: Sparkles,
      topics: [
        'Spot Single Voyage vs 3V CoA Arbitrage',
        '6–12 Month Term Volume Rebates',
        'Delivered Landed Energy ($/GJ) Ranking',
        'Singapore Bunker Fuel Hedging'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="glass-panel p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-heading font-black text-white">Maritime Knowledge & SOP Center</h2>
            <span className="badge-neon-purple">OPERATIONAL GUIDANCE</span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Standard Operating Procedures (SOP), econometric model documentation, and 24/7 port hotline support.
          </p>
        </div>
      </div>

      {/* 2. Interactive SOP Guides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {guides.map((guide) => {
          const GuideIcon = guide.icon;

          return (
            <div key={guide.id} className="glass-panel p-5 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center">
                  <GuideIcon className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-sm text-white">{guide.title}</h3>
              </div>

              <ul className="space-y-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                {guide.topics.map((t, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* 3. Searchable FAQ Accordion */}
      <div className="glass-panel p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-heading font-black text-white">Frequently Answered Maritime Questions</h3>
            <p className="text-xs font-mono text-slate-400">Mathematical models, port rules, lightering, and chartering logic</p>
          </div>

          <input 
            type="text"
            value={searchFAQ}
            onChange={(e) => setSearchFAQ(e.target.value)}
            placeholder="Search FAQs (e.g. GARCH, Lightering, CII)..."
            className="px-3.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedFAQ === faq.id;

            return (
              <div 
                key={faq.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer transition-all hover:border-slate-700"
                onClick={() => setExpandedFAQ(isExpanded ? null : faq.id)}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-heading font-bold text-sm text-white">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-cyan-400' : ''}`} />
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Dispatch Support Form */}
      <div className="glass-panel p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <h3 className="font-heading font-black text-white text-base">Direct Maritime Operational Inquiry</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1">Your Name / Title:</label>
            <input 
              type="text"
              placeholder="e.g. Capt. Rajesh Sharma, Port Operations"
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Terminal / Department:</label>
            <input 
              type="text"
              placeholder="e.g. Paradip Port Authority - Berth Control"
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-slate-400 block mb-1">Inquiry / Dispatch Request Details:</label>
            <textarea 
              rows={3}
              placeholder="Describe berth scheduling issues, chartering queries, or lightering approvals..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            onClick={() => alert('Operational inquiry submitted to OceanPulse Port Command.')}
            className="btn-coral py-2.5 px-6 text-xs rounded-xl shadow-lg"
          >
            Submit Inquiry
          </button>
        </div>
      </div>
    </div>
  );
}
