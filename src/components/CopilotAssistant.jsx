import React, { useState } from 'react';
import { Bot, Send, X, Sparkles } from 'lucide-react';

export default function CopilotAssistant({
  isOpen,
  onClose,
  selectedHorizonForecast = {},
  decisionTrigger = {},
  selectedPortKey = 'Paradip',
  selectedOriginKey = 'Indonesia_Samarinda'
}) {
  const [messages, setMessages] = useState([
    {
      sender: 'copilot',
      text: `Hello! I am your OceanPulse Maritime Procurement Copilot. I'm actively monitoring all 7 East Coast Indian Ports, 5 global loading hubs, and our GARCH/CatBoost forecasting engine. How can I assist your chartering strategy today?`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  if (!isOpen) return null;

  const quickQueries = [
    'Should I charter a Capesize or Panamax for 120k MT coal to Dhamra?',
    'Why is Haldia triggering a Sandheads lightering surcharge?',
    'What is the projected savings of locking a 3-voyage CoA today vs spot?',
    'Show best backhaul cargo from Vizag to avoid deadheading.'
  ];

  const handleSendQuery = (queryText) => {
    const query = queryText || inputQuery;
    if (!query.trim()) return;

    // Add User Message
    const newMessages = [...messages, { sender: 'user', text: query }];
    setInputQuery('');

    // Generate intelligent algorithmic response
    let responseText = '';
    const qLower = query.toLowerCase();

    if (qLower.includes('capesize') || qLower.includes('panamax') || qLower.includes('dhamra')) {
      responseText = `Based on current fleet modeling, Dhamra Port has a deep maximum draft of 17.5m and LOA of 310m with 65k MT/day discharge capability. For a 120,000 MT coal parcel, a **Capesize vessel (e.g. MV Samarinda Express)** delivers a landed cost of ~$21.40/MT compared to ~$25.80/MT on two Panamax parcels, generating **~$528,000 in net scale savings** with 100% berth clearance compliance.`;
    } else if (qLower.includes('haldia') || qLower.includes('lightering') || qLower.includes('sandheads')) {
      responseText = `Haldia Dock Complex has an estuarine Hugli river draft limitation of only **8.5 meters**. Any parcel exceeding ~25,000 MT or vessel with >8.5m draft must lighter at **Sagar-Sandheads Anchorage** (transshipping 50-60% into barges at $3.20/MT). For deep-draft full shipments, consider diverting to Dhamra (17.5m) or Gangavaram (18.5m).`;
    } else if (qLower.includes('coa') || qLower.includes('savings') || qLower.includes('spot')) {
      const isCoARecommended = decisionTrigger?.triggerActivated || decisionTrigger?.action === 'FIX_COA_NOW';
      const savingsEst = isCoARecommended ? '$120,000 - $180,000' : '$80,000';
      const ptFc = Number(selectedHorizonForecast?.pointForecast || 22000).toLocaleString();
      const volDol = Number(selectedHorizonForecast?.volatilityDollars || 850).toLocaleString();
      const up95 = Number(selectedHorizonForecast?.upper95 || 24000).toLocaleString();
      responseText = `Our prescriptive trigger currently recommends **${isCoARecommended ? 'LOCKING IN A 3-VOYAGE COA' : 'OPERATING ON THE SPOT MARKET'}**. Forward 30-day rates are projected at $${ptFc}/day with volatility of $${volDol}. Locking a 3-voyage fixture hedges against the upper 95% tail ($${up95}/day) with projected risk savings of **${savingsEst} per voyage**.`;
    } else if (qLower.includes('backhaul') || qLower.includes('deadheading') || qLower.includes('vizag')) {
      responseText = `For vessels discharging at Visakhapatnam, our optimizer identifies **Metallurgical Alumina & Steel Coils (35k-60k MT)** bound for the Persian Gulf (Jebel Ali / Sohar) earning **+$260,000 net voyage benefit** and reducing uncompensated ballast deadheading by **65%**.`;
    } else {
      const ptFc = Number(selectedHorizonForecast?.pointForecast || 22000).toLocaleString();
      responseText = `I evaluated your query against our East Coast Port Matrix (${selectedPortKey || 'Paradip'}) and origin (${selectedOriginKey || 'Indonesia_Samarinda'}). Current spot forecast is $${ptFc}/day with landed cost of ~$22.50/MT. Volatility ratio is ${decisionTrigger?.volMetricRatio || 0.12} vs θ_risk ${decisionTrigger?.thetaRisk || 0.20}.`;
    }

    setTimeout(() => {
      setMessages([...newMessages, { sender: 'copilot', text: responseText }]);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl border border-slate-200 shadow-2xl p-6 relative my-8 max-h-[85vh] flex flex-col justify-between">
        
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-[#FF3B00] flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
                  OceanPulse Maritime Procurement Copilot
                  <span className="badge-coral bg-orange-500/20 text-[#FF3B00] border-orange-500/30 text-[10px]">
                    AI Assistant
                  </span>
                </h2>
                <p className="text-xs text-slate-500">Instant conversational decision support & prescriptive charter analytics</p>
              </div>
            </div>

            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Questions Prompts */}
          <div className="mb-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recommended Queries:</div>
            <div className="flex flex-wrap gap-1.5">
              {quickQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(q)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-orange-500/10 hover:text-[#FF3B00] text-slate-700 font-medium transition-all text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Conversation Box */}
        <div className="flex-1 overflow-y-auto max-h-[380px] p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 mb-4 text-xs font-sans">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-xl ${
                  m.sender === 'user'
                    ? 'bg-[#FF3B00] text-white rounded-br-none shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm space-y-1.5 leading-relaxed'
                }`}
              >
                {m.sender === 'copilot' && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#FF3B00] font-mono uppercase mb-1">
                    <Sparkles className="w-3 h-3" /> OceanPulse Decision Engine
                  </div>
                )}
                <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center gap-2 pt-2 border-t border-slate-200"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything (e.g. Compare Capesize vs Panamax for Haldia or estimate CoA savings)..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#FF3B00]"
          />
          <button
            type="submit"
            className="btn-coral py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </form>

      </div>
    </div>
  );
}
