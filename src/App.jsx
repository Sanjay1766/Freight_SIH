import React, { useState, useMemo, useEffect } from 'react';
import LogisticoNavbar from './components/LogisticoNavbar';
import LogisticoHero from './components/LogisticoHero';
import KPIOverviewBar from './components/KPIOverviewBar';
import RiskConeChart from './components/RiskConeChart';
import MTIChart from './components/MTIChart';
import ShapWaterfall from './components/ShapWaterfall';
import PrescriptiveOptimizerPanel from './components/PrescriptiveOptimizerPanel';
import WhatIfControls from './components/WhatIfControls';
import PortVesselMap from './components/PortVesselMap';
import InteractiveGeoMap from './components/InteractiveGeoMap';
import MarketEntryOptimizer from './components/MarketEntryOptimizer';
import IdleScenarioManager from './components/IdleScenarioManager';
import EarlyWarningRiskPanel from './components/EarlyWarningRiskPanel';
import MultiVoyageScheduler from './components/MultiVoyageScheduler';
import MonteCarloStressTest from './components/MonteCarloStressTest';
import ModelValidationLab from './components/ModelValidationLab';
import DataExportCenter from './components/DataExportCenter';
import OriginArbitrageComparator from './components/OriginArbitrageComparator';
import ExecutiveBriefingModal from './components/ExecutiveBriefingModal';
import FreightQuoteModal from './components/FreightQuoteModal';
import ExecutiveReportModal from './components/ExecutiveReportModal';
import CopilotAssistant from './components/CopilotAssistant';

// End-User / Port Operations Views
import ArrivalsDashboard from './components/enduser/ArrivalsDashboard';
import PricingStatus from './components/enduser/PricingStatus';
import SchedulingBoard from './components/enduser/SchedulingBoard';
import AlertsPanel from './components/enduser/AlertsPanel';
import QuickReports from './components/enduser/QuickReports';
import HelpSupport from './components/enduser/HelpSupport';

import { RefreshCw, Bot } from 'lucide-react';

import { generateHistoricalData } from './services/dataPipeline';
import { generateForecast } from './services/forecastingEngine';
import { evaluateDecisionTrigger, solveVesselAllocation } from './services/optimizerEngine';
import {
  checkBackendHealth,
  fetchMarketHistory,
  fetchForecastFromBackend,
  fetchVesselOptimization,
  fetchOriginArbitrage,
  fetchTurnaroundOptimization,
  fetchMultiVoyageSchedule,
  fetchMonteCarloStressTest,
  fetchModelMetrics,
  triggerLivePipelineUpdate
} from './services/apiClient';

export default function App() {
  const [appMode, setAppMode] = useState('executive'); // 'executive' | 'operations'
  const [selectedPreset, setSelectedPreset] = useState('normal');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Backend connection & live data state
  const [backendState, setBackendState] = useState({
    connected: false,
    checking: true,
    records: 972,
    engine: 'GARCH(1,1) + CatBoost + PuLP MILP Solver',
    lastUpdate: null,
    isUpdating: false,
    refreshEnabled: false
  });
  const [backendForecast, setBackendForecast] = useState(null);
  const [backendHistory, setBackendHistory] = useState(null);
  const [backendMetrics, setBackendMetrics] = useState(null);
  const [backendOptimization, setBackendOptimization] = useState(null);
  const [backendArbitrage, setBackendArbitrage] = useState(null);
  const [backendTurnaround, setBackendTurnaround] = useState(null);
  const [backendSchedule, setBackendSchedule] = useState(null);
  const [backendMonteCarlo, setBackendMonteCarlo] = useState(null);

  // Interactive parameter state
  const [selectedHorizon, setSelectedHorizon] = useState(15);
  const [thetaRisk, setThetaRisk] = useState(0.20);
  const [targetCoACost, setTargetCoACost] = useState(21500);
  const [bunkerOffset, setBunkerOffset] = useState(0);
  const [cargoQuantity, setCargoQuantity] = useState(75000);
  const [selectedPortKey, setSelectedPortKey] = useState('Paradip');
  const [selectedOriginKey, setSelectedOriginKey] = useState('Indonesia_Samarinda');

  const scenarioModifiers = useMemo(() => {
    switch (selectedPreset) {
      case 'monsoon':
        return { regime: 'monsoon', importVolumeMultiplier: 1.25, bunkerFuelMultiplier: 1.05, bdiOffset: 350 };
      case 'bunker':
        return { regime: 'bunker', importVolumeMultiplier: 1.0, bunkerFuelMultiplier: 1.50, bdiOffset: 150 };
      case 'disruption':
        return { regime: 'disruption', importVolumeMultiplier: 1.40, bunkerFuelMultiplier: 1.35, bdiOffset: 650 };
      case 'normal':
      default:
        return { regime: 'normal', importVolumeMultiplier: 1.0, bunkerFuelMultiplier: 1.0, bdiOffset: 0 };
    }
  }, [selectedPreset]);

  // Initial backend health check & historical data load
  useEffect(() => {
    let isMounted = true;
    async function initBackend() {
      try {
        const health = await checkBackendHealth();
        if (!isMounted) return;
        if (health.online) {
          setBackendState({
            connected: true,
            checking: false,
            records: health.historical_records || 972,
            engine: health.model_engine || 'GARCH(1,1) + CatBoost + PuLP MILP Solver',
            lastUpdate: health.last_update,
            isUpdating: false,
            refreshEnabled: health.pipeline_refresh_enabled === true
          });

          const metrics = await fetchModelMetrics();
          if (metrics && isMounted) setBackendMetrics(metrics);

          const history = await fetchMarketHistory(90);
          if (history && history.length > 0 && isMounted) {
            setBackendHistory(history);
          }
        } else {
          setBackendState(prev => ({ ...prev, connected: false, checking: false }));
        }
      } catch (e) {
        console.error('Error initializing backend connection:', e);
      }
    }
    initBackend();
    return () => { isMounted = false; };
  }, []);

  // Fetch live forecast from FastAPI backend on parameter change
  useEffect(() => {
    let isMounted = true;
    async function loadBackendForecast() {
      if (!backendState.connected) return;
      const res = await fetchForecastFromBackend({
        horizon: 90,
        bunkerOffset,
        regime: scenarioModifiers.regime,
        originPortKey: selectedOriginKey,
        destinationPortKey: selectedPortKey,
        thetaRisk,
        targetCoACost
      });
      if (res && isMounted) {
        setBackendForecast(res);
      }
    }
    loadBackendForecast();
    return () => { isMounted = false; };
  }, [backendState.connected, bunkerOffset, scenarioModifiers.regime, selectedOriginKey, selectedPortKey, thetaRisk, targetCoACost]);

  // Fetch PuLP MILP optimization from backend on parameter change
  useEffect(() => {
    let isMounted = true;
    async function loadOptimization() {
      if (!backendState.connected) return;
      const opt = await fetchVesselOptimization({
        originPortKey: selectedOriginKey,
        destinationPortKey: selectedPortKey,
        cargoQuantityTons: cargoQuantity,
        bunkerPrice: 629.0 + bunkerOffset,
        selectedHorizon,
        thetaRisk,
        targetCoACost
      });
      if (opt && isMounted) setBackendOptimization(opt);

      const arb = await fetchOriginArbitrage({
        destinationPortKey: selectedPortKey,
        cargoQuantityTons: cargoQuantity,
        bunkerPrice: 629.0 + bunkerOffset,
        spotDailyRate: opt?.bestSolution?.dailyCharterRate || 22000.0
      });
      if (arb && isMounted) setBackendArbitrage(arb);

      const turn = await fetchTurnaroundOptimization({
        destinationPortKey: selectedPortKey,
        originPortKey: selectedOriginKey,
        cargoQuantityTons: cargoQuantity,
        bunkerPrice: 629.0 + bunkerOffset
      });
      if (turn && isMounted) setBackendTurnaround(turn);

      const sch = await fetchMultiVoyageSchedule(targetCoACost);
      if (sch && isMounted) setBackendSchedule(sch);

      const mc = await fetchMonteCarloStressTest({
        spotRate: opt?.bestSolution?.dailyCharterRate || 22000.0,
        dailyVol: 0.0155,
        cargoQuantityTons: cargoQuantity,
        bunkerPrice: 629.0 + bunkerOffset,
        iterations: 1000
      });
      if (mc && isMounted) setBackendMonteCarlo(mc);
    }
    loadOptimization();
    return () => { isMounted = false; };
  }, [backendState.connected, selectedOriginKey, selectedPortKey, cargoQuantity, bunkerOffset, selectedHorizon, thetaRisk, targetCoACost]);

  const handleTriggerUpdate = async () => {
    setBackendState(prev => ({ ...prev, isUpdating: true }));
    await triggerLivePipelineUpdate();
    setTimeout(async () => {
      const health = await checkBackendHealth();
      const metrics = await fetchModelMetrics();
      const history = await fetchMarketHistory(90);
      const res = await fetchForecastFromBackend({
        horizon: 90,
        bunkerOffset,
        regime: scenarioModifiers.regime,
        originPortKey: selectedOriginKey,
        destinationPortKey: selectedPortKey,
        thetaRisk,
        targetCoACost
      });
      if (metrics) setBackendMetrics(metrics);
      if (history) setBackendHistory(history);
      if (res) setBackendForecast(res);
      setBackendState(prev => ({
        ...prev,
        connected: health.online,
        records: health.historical_records || 972,
        isUpdating: false,
        lastUpdate: health.last_update || new Date().toISOString()
      }));
    }, 2500);
  };

  // 1. Ingestion Pipeline
  const historySeries = useMemo(() => {
    if (backendHistory && backendHistory.length > 0) {
      return backendHistory;
    }
    return generateHistoricalData({
      ...scenarioModifiers,
      bunkerFuelMultiplier: scenarioModifiers.bunkerFuelMultiplier * (1 + bunkerOffset / 640)
    });
  }, [backendHistory, scenarioModifiers, bunkerOffset]);

  // 2. Forecast & Risk Engine (1-90 Days)
  const { forecast, volatilityStats, entryWindows, riskAnalysis } = useMemo(() => {
    if (backendForecast && backendForecast.forecast && backendForecast.forecast.length > 0) {
      return {
        forecast: backendForecast.forecast,
        volatilityStats: backendForecast.volatilityStats || { dailyVol: 1.55, annualVol: 29.6, conditionalVariance: 0.00024 },
        entryWindows: backendForecast.entryWindows || [],
        riskAnalysis: backendForecast.riskAnalysis || {}
      };
    }
    return generateForecast(historySeries, 90, {
      fuelPriceOffset: bunkerOffset,
      regime: scenarioModifiers.regime,
      originPortKey: selectedOriginKey,
      destinationPortKey: selectedPortKey
    });
  }, [backendForecast, historySeries, bunkerOffset, scenarioModifiers.regime, selectedOriginKey, selectedPortKey]);

  const selectedHorizonForecast = useMemo(() => {
    return (forecast && forecast.find(f => f.horizon === selectedHorizon)) || (forecast && forecast[0]) || {
      horizon: selectedHorizon || 15,
      date: new Date().toISOString().split('T')[0],
      pointForecast: 22000,
      upper95: 24000,
      lower95: 20000,
      volatilityDollars: 1200,
      garchWeight: 0.5,
      mlWeight: 0.5,
      entryRating: 'NEUTRAL',
      entryScore: 3
    };
  }, [forecast, selectedHorizon]);

  const lastHistoryPoint = (historySeries && historySeries.length > 0) ? historySeries[historySeries.length - 1] : {};

  // 3. Prescriptive Decision Trigger
  const decisionTrigger = useMemo(() => {
    if (backendOptimization && backendOptimization.decisionTrigger) {
      return backendOptimization.decisionTrigger;
    }
    return evaluateDecisionTrigger(selectedHorizonForecast, thetaRisk, targetCoACost);
  }, [backendOptimization, selectedHorizonForecast, thetaRisk, targetCoACost]);

  // 4. PuLP Vessel Solver Solution
  const optimizationResults = useMemo(() => {
    if (backendOptimization && backendOptimization.bestSolution) {
      return backendOptimization;
    }
    const bunkerPrice = (lastHistoryPoint?.bunkerFuel || lastHistoryPoint?.bunker_fuel || 629.0) + bunkerOffset;
    return solveVesselAllocation({
      originPortKey: selectedOriginKey,
      destinationPortKey: selectedPortKey,
      cargoQuantityTons: cargoQuantity,
      bunkerPrice,
      horizonForecast: selectedHorizonForecast,
      decisionTrigger
    });
  }, [backendOptimization, selectedOriginKey, selectedPortKey, cargoQuantity, lastHistoryPoint, bunkerOffset, selectedHorizonForecast, decisionTrigger]);

  const handleResetControls = () => {
    setSelectedPreset('normal');
    setSelectedHorizon(15);
    setThetaRisk(0.20);
    setTargetCoACost(21500);
    setBunkerOffset(0);
    setCargoQuantity(75000);
    setSelectedPortKey('Paradip');
    setSelectedOriginKey('Indonesia_Samarinda');
  };

  const handleSelectArbitrageOrigin = (newOriginKey) => {
    setSelectedOriginKey(newOriginKey);
  };

  return (
    <div className="min-h-screen bg-[#f3f5f7] text-slate-800 font-sans selection:bg-[#dce7ea] selection:text-slate-900">
      
      {/* 1. Logistico Main Header */}
      <LogisticoNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        appMode={appMode}
        onModeChange={setAppMode}
        onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* 2. Enterprise Hero Banner (Executive Mode) */}
      {appMode === 'executive' && activeTab === 'dashboard' && (
        <LogisticoHero
          onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
          onOpenBriefing={() => setIsBriefingOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />
      )}

      {/* Main Workspace Container */}
      <div className="max-w-[1720px] mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Compact market status */}
        <div className={`rounded-2xl border bg-white px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
          backendState.connected ? 'border-emerald-200' : 'border-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              backendState.connected ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />
            <div>
              <div className="flex items-center gap-2 font-bold text-sm">
                <span className="font-heading font-bold text-slate-800">
                  {backendState.connected ? 'Market data is up to date' : 'Using the latest available market snapshot'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {backendState.connected
                  ? `${backendState.records} market observations are informing today's recommendations.`
                  : 'You can still explore forecasts and plans while the live feed reconnects.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {backendState.lastUpdate && (
              <span className="text-xs text-slate-500 hidden lg:inline">
                Updated {new Date(backendState.lastUpdate).toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleTriggerUpdate}
              disabled={backendState.isUpdating || !backendState.refreshEnabled}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-orange-400 ${backendState.isUpdating ? 'animate-spin' : ''}`} />
              {backendState.isUpdating ? 'Updating…' : backendState.refreshEnabled ? 'Refresh data' : 'Refresh disabled'}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW MODE A: PORT OPERATIONS PORTAL                                       */}
        {/* ========================================================================= */}
        {appMode === 'operations' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-black font-heading text-white flex items-center gap-2">
                    <span className="text-cyan-400">⚓</span> East Coast Port Operations Center
                  </h1>
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    Direct terminal management, vessel arrivals telemetry, berth timeline, and instant reporting.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-neon-cyan">PARADIP PORT AUTHORITY</span>
                  <span className="badge-neon-emerald">GOPALPUR • HALDIA • VIZAG</span>
                </div>
              </div>
            </div>

            {activeTab === 'arrivals' && <ArrivalsDashboard />}
            {activeTab === 'pricing' && <PricingStatus />}
            {activeTab === 'scheduling' && <SchedulingBoard />}
            {activeTab === 'alerts' && <AlertsPanel />}
            {activeTab === 'reports' && <QuickReports />}
            {activeTab === 'help' && <HelpSupport />}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE B: EXECUTIVE INTELLIGENCE COCKPIT                               */}
        {/* ========================================================================= */}
        {appMode === 'executive' && (
          <>
            {/* Enterprise KPI Overview Cards */}
            <KPIOverviewBar lastHistoryPoint={lastHistoryPoint} />

            {/* Planning controls stay available on focused analysis pages. */}
            {activeTab !== 'dashboard' && <WhatIfControls
              selectedPreset={selectedPreset}
              onPresetChange={setSelectedPreset}
              selectedHorizon={selectedHorizon}
              onHorizonChange={setSelectedHorizon}
              thetaRisk={thetaRisk}
              onThetaRiskChange={setThetaRisk}
              targetCoACost={targetCoACost}
              onTargetCoACostChange={setTargetCoACost}
              bunkerOffset={bunkerOffset}
              onBunkerOffsetChange={setBunkerOffset}
              cargoQuantity={cargoQuantity}
              onCargoQuantityChange={setCargoQuantity}
              selectedOriginKey={selectedOriginKey}
              onOriginChange={setSelectedOriginKey}
              onResetControls={handleResetControls}
            />}

            {/* TAB 1: MAIN DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <section className="xl:col-span-1 rounded-2xl bg-[#17324d] p-6 text-white shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b9d8df]">Recommended next step</p>
                    <h2 className="mt-3 text-2xl font-bold leading-tight">
                      {decisionTrigger?.action === 'FIX_COA_NOW' ? 'Secure a short-term contract' : 'Keep the next shipment on spot'}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-200">
                      {decisionTrigger?.rationale || `For ${selectedOriginKey.replace('_', ' ')} to ${selectedPortKey}, current costs remain within the selected budget range.`}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4 text-sm">
                      <span className="text-slate-300">Planning horizon</span>
                      <strong>{selectedHorizon} days</strong>
                    </div>
                  </section>

                  <section className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2f7d8c]">Today at a glance</p>
                        <h2 className="mt-1 text-xl font-bold text-slate-800">Keep the team focused on what needs attention</h2>
                      </div>
                      <button onClick={() => setAppMode('operations')} className="text-sm font-semibold text-[#2f7d8c] hover:text-[#17324d]">Open operations →</button>
                    </div>
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-xl bg-[#f5f8f9] p-4"><p className="text-xs text-slate-500">Next arrival</p><p className="mt-1 font-bold text-slate-800">MV Orient Phoenix</p><p className="mt-1 text-sm text-slate-600">Berth 3 · 14h delay</p></div>
                      <div className="rounded-xl bg-[#f5f8f9] p-4"><p className="text-xs text-slate-500">Route in focus</p><p className="mt-1 font-bold text-slate-800">{selectedPortKey}</p><p className="mt-1 text-sm text-slate-600">From {selectedOriginKey.split('_')[0]}</p></div>
                      <div className="rounded-xl bg-[#f5f8f9] p-4"><p className="text-xs text-slate-500">Market watch</p><p className="mt-1 font-bold text-slate-800">{riskAnalysis?.overallRiskStatus || 'Normal'}</p><p className="mt-1 text-sm text-slate-600">Review fuel trend this week</p></div>
                    </div>
                  </section>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <RiskConeChart
                    historySeries={historySeries}
                    forecastData={forecast}
                    volatilityStats={volatilityStats}
                    selectedHorizon={selectedHorizon}
                    onSelectHorizon={setSelectedHorizon}
                  />

                  <EarlyWarningRiskPanel riskAnalysis={riskAnalysis} selectedPortKey={selectedPortKey} onPortChange={setSelectedPortKey} />
                </div>
              </div>
            )}

            {/* TAB 2: OPTIMAL MARKET ENTRY & COA TIMING (OBJECTIVE A) */}
            {activeTab === 'timing' && (
              <div className="space-y-8">
                <MarketEntryOptimizer
                  forecastData={forecast}
                  entryWindows={entryWindows}
                  decisionTrigger={decisionTrigger}
                  contractComparison={optimizationResults.contractComparison}
                  selectedHorizon={selectedHorizon}
                  onSelectHorizon={setSelectedHorizon}
                  targetCoACost={targetCoACost}
                />

                <RiskConeChart
                  historySeries={historySeries}
                  forecastData={forecast}
                  volatilityStats={volatilityStats}
                  selectedHorizon={selectedHorizon}
                  onSelectHorizon={setSelectedHorizon}
                />
              </div>
            )}

            {/* TAB 3: PORT MATRIX & FLEET RADAR (OBJECTIVE B) */}
            {activeTab === 'maritime' && (
              <div className="space-y-8">
                <InteractiveGeoMap
                  selectedPortKey={selectedPortKey}
                  onPortChange={setSelectedPortKey}
                  selectedOriginKey={selectedOriginKey}
                  onOriginChange={setSelectedOriginKey}
                />

                <PortVesselMap
                  selectedPortKey={selectedPortKey}
                  onPortChange={setSelectedPortKey}
                  selectedOriginKey={selectedOriginKey}
                  onOriginChange={setSelectedOriginKey}
                />

                <PrescriptiveOptimizerPanel
                  selectedHorizonForecast={selectedHorizonForecast}
                  decisionTrigger={decisionTrigger}
                  bunkerPrice={(lastHistoryPoint?.bunkerFuel || lastHistoryPoint?.bunker_fuel || 629.0) + bunkerOffset}
                  cargoQuantity={cargoQuantity}
                  selectedPortKey={selectedPortKey}
                  onPortChange={setSelectedPortKey}
                  selectedOriginKey={selectedOriginKey}
                  onOriginChange={setSelectedOriginKey}
                  optimizationResults={optimizationResults}
                />
              </div>
            )}

            {/* TAB: MULTI-ORIGIN ARBITRAGE COMPARATOR */}
            {activeTab === 'arbitrage' && (
              <div className="space-y-8">
                <OriginArbitrageComparator
                  selectedPortKey={selectedPortKey}
                  onPortChange={setSelectedPortKey}
                  cargoQuantity={cargoQuantity}
                  bunkerPrice={(lastHistoryPoint?.bunkerFuel || lastHistoryPoint?.bunker_fuel || 629.0) + bunkerOffset}
                  selectedHorizonForecast={selectedHorizonForecast}
                  decisionTrigger={decisionTrigger}
                  onSelectOrigin={handleSelectArbitrageOrigin}
                  arbitrageData={backendArbitrage}
                />

                <InteractiveGeoMap
                  selectedPortKey={selectedPortKey}
                  onPortChange={setSelectedPortKey}
                  selectedOriginKey={selectedOriginKey}
                  onOriginChange={setSelectedOriginKey}
                />
              </div>
            )}

            {/* TAB 4: IDLE SCENARIO & BACKHAUL OPTIMIZER (OBJECTIVE C) */}
            {activeTab === 'turnaround' && (
              <div className="space-y-8">
                <IdleScenarioManager
                  bestSolution={optimizationResults.bestSolution}
                  selectedPortKey={selectedPortKey}
                  cargoQuantity={cargoQuantity}
                  bunkerPrice={(lastHistoryPoint?.bunkerFuel || lastHistoryPoint?.bunker_fuel || 629.0) + bunkerOffset}
                  backendTurnaround={backendTurnaround}
                />

                <InteractiveGeoMap
                  selectedPortKey={selectedPortKey}
                  onPortChange={setSelectedPortKey}
                  selectedOriginKey={selectedOriginKey}
                  onOriginChange={setSelectedOriginKey}
                />
              </div>
            )}

            {/* TAB 5: EARLY WARNING & RISK MITIGATION (OBJECTIVE D) */}
            {activeTab === 'risk' && (
              <div className="space-y-8">
                <EarlyWarningRiskPanel
                  riskAnalysis={riskAnalysis}
                  selectedPortKey={selectedPortKey}
                  onPortChange={setSelectedPortKey}
                />

                <RiskConeChart
                  historySeries={historySeries}
                  forecastData={forecast}
                  volatilityStats={volatilityStats}
                  selectedHorizon={selectedHorizon}
                  onSelectHorizon={setSelectedHorizon}
                />
              </div>
            )}

            {/* TAB 6: MASTER MULTI-VOYAGE SCHEDULER */}
            {activeTab === 'scheduler' && (
              <div className="space-y-8">
                <MultiVoyageScheduler
                  forecastData={forecast}
                  targetCoACost={targetCoACost}
                  backendSchedule={backendSchedule}
                />

                <InteractiveGeoMap
                  selectedPortKey={selectedPortKey}
                  onPortChange={setSelectedPortKey}
                  selectedOriginKey={selectedOriginKey}
                  onOriginChange={setSelectedOriginKey}
                />
              </div>
            )}

            {/* TAB 7: MONTE CARLO STRESS TEST */}
            {activeTab === 'stress' && (
              <div className="space-y-8">
                <MonteCarloStressTest
                  selectedHorizonForecast={selectedHorizonForecast}
                  volatilityStats={volatilityStats}
                  cargoQuantity={cargoQuantity}
                  backendMonteCarlo={backendMonteCarlo}
                />

                <RiskConeChart
                  historySeries={historySeries}
                  forecastData={forecast}
                  volatilityStats={volatilityStats}
                  selectedHorizon={selectedHorizon}
                  onSelectHorizon={setSelectedHorizon}
                />
              </div>
            )}

            {/* TAB 8: MODEL ACCURACY & GOVERNANCE LAB */}
            {activeTab === 'validation' && (
              <div className="space-y-8">
                <ModelValidationLab historySeries={historySeries} backendMetrics={backendMetrics} />

                <DataExportCenter
                  forecastData={forecast}
                  historySeries={historySeries}
                  selectedPortKey={selectedPortKey}
                  selectedOriginKey={selectedOriginKey}
                />
              </div>
            )}

            {/* TAB 9: SHAP ANALYTICS & EXPLAINABILITY */}
            {activeTab === 'shap' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <ShapWaterfall
                    selectedHorizonForecast={selectedHorizonForecast}
                    lastHistoryPoint={lastHistoryPoint}
                  />
                </div>
                <div className="lg:col-span-2 space-y-8">
                  <RiskConeChart
                    historySeries={historySeries}
                    forecastData={forecast}
                    volatilityStats={volatilityStats}
                    selectedHorizon={selectedHorizon}
                    onSelectHorizon={setSelectedHorizon}
                  />
                  <MTIChart historySeries={historySeries} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Website Footer */}
        <footer className="glass-panel p-6 text-center text-xs text-slate-400 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong className="text-white">OceanPulse Freight Intelligence Suite</strong> — Data-Driven Maritime Logistics & Prescriptive Procurement.
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span className="text-emerald-400">● IMO 2026 Ready</span>
            <span>•</span>
            <span className="text-cyan-400">● GARCH(1,1) Volatility Cone</span>
            <span>•</span>
            <span className="text-orange-400">● PuLP MILP Constrained Solver</span>
          </div>
        </footer>

      </div>

      {/* Floating AI Maritime Copilot Trigger */}
      <button 
        onClick={() => setIsCopilotOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-2xl shadow-purple-500/40 border border-purple-400/40 flex items-center gap-2.5 group hover:scale-105 active:scale-95 transition-all"
        title="Open Maritime AI Procurement Copilot"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-white animate-bounce" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-slate-950 animate-ping" />
        </div>
        <span className="font-heading font-extrabold text-xs hidden md:inline">AI Copilot</span>
      </button>

      {/* Modals & AI Copilot */}
      <ExecutiveBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
      />

      <FreightQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        horizonForecast={selectedHorizonForecast}
        selectedHorizonForecast={selectedHorizonForecast}
        decisionTrigger={decisionTrigger}
        bunkerPrice={(lastHistoryPoint?.bunkerFuel || lastHistoryPoint?.bunker_fuel || 629.0) + bunkerOffset}
        onOpenReport={() => {
          setIsQuoteModalOpen(false);
          setIsReportModalOpen(true);
        }}
      />

      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        bestSolution={optimizationResults?.bestSolution}
        optimizationResults={optimizationResults}
        decisionTrigger={decisionTrigger}
        selectedHorizonForecast={selectedHorizonForecast}
        selectedPortKey={selectedPortKey}
        originPortKey={selectedOriginKey}
        cargoQuantity={cargoQuantity}
        targetCoACost={targetCoACost}
      />

      <CopilotAssistant
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        selectedHorizonForecast={selectedHorizonForecast}
        decisionTrigger={decisionTrigger}
        selectedPortKey={selectedPortKey}
        selectedOriginKey={selectedOriginKey}
      />

    </div>
  );
}

