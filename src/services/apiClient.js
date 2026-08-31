/**
 * OceanPulse Enterprise Backend API Client
 * Connects directly to FastAPI Python Backend (http://localhost:8000)
 * Connects the UI to GARCH, CatBoost, PuLP, and simulation endpoints.
 * Virtual Arrival, Triangular Backhauls, Multi-Origin Arbitrage, and Monte Carlo simulations.
 */

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { method: 'GET', signal: AbortSignal.timeout(2500) });
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, ...data };
  } catch {
    return { online: false };
  }
}

export function normalizeRecord(r, idx = 0) {
  return {
    dayIndex: r.dayIndex ?? idx,
    date: r.date,
    bdi: Number(r.bdi || 3186),
    bciCapesize: Number(r.bciCapesize || r.bci || Math.round((r.bdi || 3186) * 1.38)),
    bpiPanamax: Number(r.bpiPanamax || r.bpi || Math.round((r.bdi || 3186) * 0.94)),
    bsiSupramax: Number(r.bsiSupramax || r.bsi || Math.round((r.bdi || 3186) * 0.78)),
    spotFreightRate: Number(r.spotFreightRate || r.spot_freight_rate || 33161),
    garchVolPct: Number(r.garchVolPct || r.garch_vol_pct || 1.61),
    garchUpper95: Number(r.garchUpper95 || r.garch_upper_95 || Math.round(Number(r.spotFreightRate || r.spot_freight_rate || 33161) * 1.032)),
    garchLower95: Number(r.garchLower95 || r.garch_lower_95 || Math.round(Number(r.spotFreightRate || r.spot_freight_rate || 33161) * 0.968)),
    bunkerFuel: Number(r.bunkerFuel || r.bunker_fuel || 629.0),
    coalIndex: Number(r.coalIndex || r.coal_index || 139.75),
    indoCoalIndex: Number(r.indoCoalIndex || r.indo_coal_index || 58.7),
    dxy: Number(r.dxy || 99.16),
    seaborneVolumeDaily: Number(r.seaborneVolumeDaily || r.seaborne_volume || 746460),
    mtiIndia: Number(r.mtiIndia || r.mti_india || 0.319),
    isDisaggregated: true
  };
}

export async function fetchMarketHistory(limit = 90) {
  try {
    const res = await fetch(`${API_BASE}/api/market-data/history?limit=${limit}`, { method: 'GET', signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const json = await res.json();
    const raw = json.data || [];
    return raw.map((item, idx) => normalizeRecord(item, idx));
  } catch (err) {
    console.warn('Falling back to default series:', err.message);
    return null;
  }
}

export async function fetchForecastFromBackend(params = {}) {
  try {
    const res = await fetch(`${API_BASE}/api/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        horizon: params.horizon || 90,
        bunkerOffset: params.bunkerOffset || 0,
        regime: params.regime || 'normal',
        originPortKey: params.originPortKey || 'Indonesia_Samarinda',
        destinationPortKey: params.destinationPortKey || 'Paradip',
        thetaRisk: params.thetaRisk ?? 0.20,
        targetCoACost: params.targetCoACost ?? 21500
      }),
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Error fetching backend forecast:', err.message);
    return null;
  }
}

export async function fetchVesselOptimization(params = {}) {
  try {
    const res = await fetch(`${API_BASE}/api/optimize/vessel-allocation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originPortKey: params.originPortKey || 'Indonesia_Samarinda',
        destinationPortKey: params.destinationPortKey || 'Paradip',
        cargoQuantityTons: params.cargoQuantityTons || 75000,
        bunkerPrice: params.bunkerPrice || 629.0,
        selectedHorizon: params.selectedHorizon || 15,
        thetaRisk: params.thetaRisk ?? 0.20,
        targetCoACost: params.targetCoACost ?? 21500
      }),
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const raw = await res.json();
    if (!raw) return null;

    const normalizeSol = (sol) => {
      if (!sol) return sol;
      const cii = sol.ciiGrade || sol.carbonMetrics?.ciiGrade || 'B';
      const ciiGrams = sol.ciiGramsPerTonNM || sol.carbonMetrics?.co2GramsPerTonNM || 4.2;
      const co2Tons = sol.co2Tons || sol.carbonMetrics?.co2EmissionsTons || 1250;
      const costPerTon = sol.costPerTon ?? sol.costBreakdown?.costPerTon ?? 15.30;
      const totalCost = sol.totalCost ?? sol.costBreakdown?.totalCost ?? 1150000;

      return {
        ...sol,
        ciiGrade: cii,
        costPerTon,
        totalCost,
        carbonMetrics: sol.carbonMetrics || {
          ciiGrade: cii,
          co2GramsPerTonNM: ciiGrams,
          co2EmissionsTons: co2Tons
        },
        costBreakdown: sol.costBreakdown || {
          dailyRate: sol.dailyCharterRate || 22000,
          freightCost: sol.charterCost || 396000,
          bunkerCost: sol.fuelCost || 350000,
          portTariffCost: sol.portTariffs || 290000,
          demurrageCost: sol.demurrageCost || 48000,
          lighteringSurcharge: sol.lighteringCost || 0,
          totalCost,
          costPerTon
        },
        constraintCheck: sol.constraintCheck || {
          destDraft: { pass: sol.isFeasible || sol.requiresLightering, lightered: sol.requiresLightering },
          destLOA: { pass: true },
          vesselClass: { pass: true }
        }
      };
    };

    const bestSolution = normalizeSol(raw.bestSolution);
    const allSolutions = (raw.allEvaluatedVessels || raw.allSolutions || []).map(normalizeSol);

    return {
      ...raw,
      bestSolution,
      allSolutions,
      allEvaluatedVessels: allSolutions,
      originPort: raw.originPort || { name: 'Indonesia (Samarinda)', country: 'Indonesia', maxDraft: 14.5, dailyLoadingRate: 35000 },
      destPort: raw.destinationPort || { name: 'Paradip Port', maxDraft: 14.5, dailyDischargeRate: 50000, portTariffPerTon: 3.8, demurrageRatePerDay: 22000, avgWaitingDays: 2.4 },
      recommendationCard: raw.recommendationCard || {
        headline: `${bestSolution?.vessel?.name || 'MV Bharat Glory'} Selected for Maximum Voyage Efficiency`,
        summary: `PuLP MILP optimizer allocated ${bestSolution?.vessel?.name || 'MV Bharat Glory'} (${bestSolution?.vessel?.vesselClass || 'Kamsarmax'}) delivering landed cost of $${bestSolution?.costPerTon || '15.30'}/MT.`,
        contractStructure: raw.decisionTrigger?.action === 'FIX_COA_NOW' ? 'Short-Term 3-Voyage CoA' : 'Prompt Spot Fixture',
        savingsVsSpot: `~$180,000 Volume Rebate`
      }
    };
  } catch (err) {
    console.warn('Error fetching vessel optimization:', err.message);
    return null;
  }
}

export async function fetchTurnaroundOptimization(params = {}) {
  try {
    const res = await fetch(`${API_BASE}/api/optimize/turnaround-backhaul`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destinationPortKey: params.destinationPortKey || 'Paradip',
        originPortKey: params.originPortKey || 'Indonesia_Samarinda',
        cargoQuantityTons: params.cargoQuantityTons || 75000,
        bunkerPrice: params.bunkerPrice || 629.0
      }),
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Error fetching turnaround optimization:', err.message);
    return null;
  }
}

export async function fetchOriginArbitrage(params = {}) {
  try {
    const res = await fetch(`${API_BASE}/api/arbitrage/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destinationPortKey: params.destinationPortKey || 'Paradip',
        cargoQuantityTons: params.cargoQuantityTons || 75000,
        bunkerPrice: params.bunkerPrice || 629.0
      }),
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Error fetching origin arbitrage:', err.message);
    return null;
  }
}

export async function fetchMultiVoyageSchedule(targetCoACost = 21500) {
  try {
    const res = await fetch(`${API_BASE}/api/scheduler/multi-voyage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetCoACost }),
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Error fetching multi-voyage schedule:', err.message);
    return null;
  }
}

export async function fetchMonteCarloSimulation(params = {}) {
  try {
    const res = await fetch(`${API_BASE}/api/stress-test/monte-carlo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spotRate: params.spotRate || 22000,
        dailyVol: params.dailyVol ?? 0.0155,
        cargoQuantityTons: params.cargoQuantityTons || 75000,
        bunkerPrice: params.bunkerPrice || 629.0,
        iterations: params.iterations || 1000
      }),
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Error fetching Monte Carlo simulation:', err.message);
    return null;
  }
}

export async function fetchModelMetrics() {
  try {
    const res = await fetch(`${API_BASE}/api/model/metrics`, { method: 'GET', signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Error fetching model metrics:', err.message);
    return null;
  }
}

export async function fetchShapValues(horizon = 15) {
  try {
    const res = await fetch(`${API_BASE}/api/model/shap?horizon=${horizon}`, { method: 'GET', signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn('SHAP fetch failed:', e);
    return null;
  }
}

export async function fetchMonteCarloStressTest(params = {}) {
  return fetchMonteCarloSimulation(params);
}

export async function triggerLivePipelineUpdate() {
  try {
    const res = await fetch(`${API_BASE}/api/pipeline/update`, { method: 'POST', signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Error triggering live pipeline update:', err.message);
    return null;
  }
}

export async function sendCopilotMessage(message, history = [], context = {}) {
  try {
    const res = await fetch(`${API_BASE}/api/copilot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, context }),
      signal: AbortSignal.timeout(12000)
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.warn('Groq Copilot API error:', err.message);
    return null;
  }
}

export async function generateAIBriefing(marketState = {}) {
  try {
    const res = await fetch(`${API_BASE}/api/ai/briefing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marketState }),
      signal: AbortSignal.timeout(12000)
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();
    return data.memo;
  } catch (err) {
    console.warn('Groq AI Briefing API error:', err.message);
    return null;
  }
}
