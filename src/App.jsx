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
    engine: 'Continuous Freight Forecasting Engine',
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
            engine: 'Continuous Freight Forecasting Engine',
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

  // Fetch live forecast from backend on parameter change
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
      if (res && isMounted) setBackendForecast(res);
    }
    loadBackendForecast();
    return () => { isMounted = false; };
  }, [backendState.connected, bunkerOffset, scenarioModifiers.regime, selectedOriginKey, selectedPortKey, thetaRisk, targetCoACost]);

  // Fetch live vessel allocation from backend
  useEffect(() => {
    let isMounted = true;
    async function loadBackendOptimization() {
      if (!backendState.connected) return;
      const res = await fetchVesselOptimization({
        originPortKey: selectedOriginKey,
        destinationPortKey: selectedPortKey,
        cargoQuantityTons: cargoQuantity,
        bunkerOffset,
        selectedHorizon,
        thetaRisk,
        targetCoACost
      });
      if (res && isMounted) setBackendOptimization(res);
    }
    loadBackendOptimization();
    return () => { isMounted = false; };
  }, [backendState.connected, selectedOriginKey, selectedPortKey, cargoQuantity, bunkerOffset, selectedHorizon, thetaRisk, targetCoACost]);

  // Fetch origin arbitrage data
  useEffect(() => {
    let isMounted = true;
    async function loadArbitrage() {
      if (!backendState.connected || activeTab !== 'arbitrage') return;
      const res = await fetchOriginArbitrage({
        destinationPortKey: selectedPortKey,
        cargoQuantityTons: cargoQuantity,
        bunkerOffset
      });
      if (res && isMounted) setBackendArbitrage(res);
    }
    loadArbitrage();
    return () => { isMounted = false; };
  }, [backendState.connected, activeTab, selectedPortKey, cargoQuantity, bunkerOffset]);

  // Fetch turnaround optimization
  useEffect(() => {
    let isMounted = true;
    async function loadTurnaround() {
      if (!backendState.connected || activeTab !== 'turnaround') return;
      const res = await fetchTurnaroundOptimization({
        portKey: selectedPortKey,
        vesselClass: 'Panamax',
        bunkerOffset
      });
      if (res && isMounted) setBackendTurnaround(res);
    }
    loadTurnaround();
    return () => { isMounted = false; };
  }, [backendState.connected, activeTab, selectedPortKey, bunkerOffset]);

  // Fetch multi-voyage schedule
  useEffect(() => {
    let isMounted = true;
    async function loadSchedule() {
      if (!backendState.connected || activeTab !== 'scheduler') return;
      const res = await fetchMultiVoyageSchedule({
        originPortKey: selectedOriginKey,
        destinationPortKey: selectedPortKey,
        targetCoACost,
        totalTons: cargoQuantity * 3
      });
      if (res && isMounted) setBackendSchedule(res);
    }
    loadSchedule();
    return () => { isMounted = false; };
  }, [backendState.connected, activeTab, selectedOriginKey, selectedPortKey, targetCoACost, cargoQuantity]);

  // Fetch Monte Carlo stress test
  useEffect(() => {
    let isMounted = true;
    async function loadMonteCarlo() {
      if (!backendState.connected || activeTab !== 'stress') return;
      const res = await fetchMonteCarloStressTest({
        horizon: selectedHorizon,
        cargoQuantityTons: cargoQuantity,
        numSimulations: 1000
      });
      if (res && isMounted) setBackendMonteCarlo(res);
    }
    loadMonteCarlo();
    return () => { isMounted = false; };
  }, [backendState.connected, activeTab, selectedHorizon, cargoQuantity]);

  const handleTriggerUpdate = async () => {
    setBackendState(prev => ({ ...prev, isUpdating: true }));
    const res = await triggerLivePipelineUpdate();
    if (res && res.status === 'ok') {
      const history = await fetchMarketHistory(90);
      if (history && history.length > 0) setBackendHistory(history);
      const metrics = await fetchModelMetrics();
      if (metrics) setBackendMetrics(metrics);
      setBackendState(prev => ({
        ...prev,
        isUpdating: false,
        records: res.historical_records || prev.records,
        lastUpdate: res.timestamp
      }));
    } else {
      setBackendState(prev => ({ ...prev, isUpdating: false }));
    }
  };

  // 1. Historical data series
  const historySeries = useMemo(() => {
    if (backendHistory && backendHistory.length > 0) {
      return backendHistory;
    }
    return generateHistoricalData(120, scenarioModifiers);
  }, [backendHistory, scenarioModifiers]);

  // 2. Forward forecast series
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

  const lastHistoryPoint = useMemo(() => {
    return (historySeries && historySeries.length > 0) ? historySeries[historySeries.length - 1] : {};
  }, [historySeries]);

  // 3. Decision Trigger
  const decisionTrigger = useMemo(() => {
    if (backendOptimization && backendOptimization.decisionTrigger) {
      return backendOptimization.decisionTrigger;
    }
    return evaluateDecisionTrigger(selectedHorizonForecast, thetaRisk, targetCoACost);
  }, [backendOptimization, selectedHorizonForecast, thetaRisk, targetCoACost]);

  // 4. Vessel Allocation Solution
  const optimizationResults = useMemo(() => {
    if (backendOptimization && backendOptimization.bestSolution) {
      return backendOptimization;
    }
    const bunkerPrice = (lastHistoryPoint?.bunkerFuel || lastHistoryPoint?.bunker_fuel || 784.50) + bunkerOffset;
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
    <div className="min-h-screen bg-[#F5F9FC] text-[#0F2942] font-sans selection:bg-[#D6E8F2] selection:text-[#077DB3]">
      
      {/* 1. Soothing Light Header */}
      <LogisticoNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        appMode={appMode}
        onModeChange={setAppMode}
        onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* 2. Soothing Intro Hero Space (Executive Mode) */}
      {appMode === 'executive' && activeTab === 'dashboard' && (
        <LogisticoHero
          onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
          onOpenBriefing={() => setIsBriefingOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />
      )}

      {/* Main Workspace Container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Clean Market Data Feed Status Bar */}
        <div className={`terminal-card px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
          backendState.connected ? 'border-[#BCEAE4] bg-[#F0FBF9]' : 'border-[#BED9EB] bg-[#F0F6FA]'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`live-dot ${backendState.connected ? 'live-dot-emerald' : 'live-dot-ocean'}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-bold text-[#0F2942]">
                  {backendState.connected ? 'Live Market Feed Active' : 'Market Snapshot Loaded'}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#334E68] border border-[#DCE8F0]">
                  {backendState.records} Observations Synced
                </span>
              </div>
              <p className="text-xs text-[#627D98] mt-0.5 font-medium">
                {backendState.connected
                  ? 'Continuous spot freight benchmarks and port waiting times informing today’s recommendations.'
                  : 'Displaying latest market snapshot while live rates reconnect.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {backendState.lastUpdate && (
              <span className="text-xs text-[#627D98] hidden lg:inline font-medium">
                Sync: {new Date(backendState.lastUpdate).toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleTriggerUpdate}
              disabled={backendState.isUpdating || !backendState.refreshEnabled}
              className="btn-terminal-secondary text-xs py-1.5 px-3 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#077DB3] ${backendState.isUpdating ? 'animate-spin' : ''}`} />
              <span>{backendState.isUpdating ? 'Syncing...' : backendState.refreshEnabled ? 'Refresh Rates' : 'Auto Sync Active'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW MODE A: PORT OPERATIONS PORTAL                                       */}
        {/* ========================================================================= */}
        {appMode === 'operations' && (
          <div className="space-y-6">
            <div className="terminal-card p-5 border-[#BED9EB] bg-gradient-to-r from-[#EBF4FA] via-[#F4F9FC] to-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold font-heading text-[#0F2942] flex items-center gap-2">
                    <span className="text-[#077DB3]">⚓</span> East Coast Port Operations & Berth Command
                  </h1>
                  <p className="text-xs text-[#334E68] mt-1 font-medium">
                    Real-time berth scheduling, vessel arrivals telemetry, draft monitoring, and shift reporting across 7 Indian gateways.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="status-pill status-pill-ocean text-xs">PARADIP PORT</span>
                  <span className="status-pill status-pill-emerald text-xs">VIZAG • DHAMRA • HALDIA</span>
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
            <KPIOverviewBar lastHistoryPoint={lastHistoryPoint} selectedHorizonForecast={selectedHorizonForecast} />

            {/* Planning controls stay available on focused analysis pages */}
            {activeTab !== 'dashboard' && (
              <WhatIfControls
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
              />
            )}

            {/* TAB 1: MAIN DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                  
                  {/* Strategy Recommendation Card */}
                  <section className="xl:col-span-1 terminal-card p-5 border-[#BED9EB] bg-gradient-to-b from-[#EBF4FA] to-white flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#077DB3]">
                          Recommended Procurement Action
                        </span>
                        <span className="status-pill status-pill-ocean text-[11px]">
                          Planning: {selectedHorizon} Days
                        </span>
                      </div>
                      <h2 className="mt-2.5 text-xl font-bold font-heading text-[#0F2942]">
                        {decisionTrigger?.action === 'FIX_COA_NOW' ? 'Lock Short-Term 3-Voyage Contract' : 'Operate on Prompt Spot Market'}
                      </h2>
                      <p className="mt-2 text-xs text-[#334E68] leading-relaxed font-medium">
                        {decisionTrigger?.rationale || `Shipments from ${selectedOriginKey.replace('_', ' ')} to ${selectedPortKey} remain within budget expectations.`}
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2 pt-3 border-t border-[#DCE8F0] text-xs">
                      <div>
                        <span className="text-[11px] text-[#627D98] block">PLANNING HORIZON</span>
                        <strong className="text-[#0F2942] text-sm">{selectedHorizon} Days</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-[#627D98] block">TARGET RATE</span>
                        <strong className="text-[#077DB3] text-sm font-bold font-mono">${targetCoACost.toLocaleString()}/d</strong>
                      </div>
                    </div>
                  </section>

                  {/* Route & Port Snapshot */}
                  <section className="xl:col-span-2 terminal-card p-5 flex flex-col justify-between bg-white">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#627D98]">
                          Active Trade Lane in Focus
                        </span>
                        <button onClick={() => setAppMode('operations')} className="text-xs font-semibold text-[#077DB3] hover:text-[#066997] flex items-center gap-1">
                          Open Shift Desk →
                        </button>
                      </div>
                      <h2 className="mt-1 text-base font-bold text-[#0F2942]">
                        {selectedOriginKey.replace('_', ' ')} ➔ {selectedPortKey} Port
                      </h2>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-[#F5F9FC] border border-[#E2EDF5]">
                        <span className="text-[11px] text-[#627D98] font-semibold uppercase block">Origin Loading Port</span>
                        <span className="text-xs font-bold text-[#0F2942] block mt-0.5">{selectedOriginKey.replace('_', ' ')}</span>
                        <span className="text-[11px] text-[#627D98] mt-1 block">Dedicated Bulk Terminal</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F5F9FC] border border-[#E2EDF5]">
                        <span className="text-[11px] text-[#627D98] font-semibold uppercase block">Discharge Gateway</span>
                        <span className="text-xs font-bold text-[#077DB3] block mt-0.5">{selectedPortKey}</span>
                        <span className="text-[11px] text-[#627D98] mt-1 block">Max Draft: {selectedPortKey === 'Haldia' ? '8.5m (Lightering req)' : selectedPortKey === 'Dhamra' ? '17.5m (Deep-water)' : '14.5m-18.0m'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F5F9FC] border border-[#E2EDF5]">
                        <span className="text-[11px] text-[#627D98] font-semibold uppercase block">Weather Condition</span>
                        <span className="text-xs font-bold text-[#0D9488] block mt-0.5">{riskAnalysis?.overallRiskStatus || 'STABLE'}</span>
                        <span className="text-[11px] text-[#627D98] mt-1 block">Bay of Bengal Calm</span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
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

            {/* TAB 2: CHARTER TIMING */}
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

            {/* TAB 3: SEA LANES & VESSEL CHOICE */}
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
                  bunkerPrice={(lastHistoryPoint?.bunkerFuel || lastHistoryPoint?.bunker_fuel || 784.50) + bunkerOffset}
                  cargoQuantity={cargoQuantity}
                  selectedPortKey={selectedPortKey}
                  onPortChange={setSelectedPortKey}
                  selectedOriginKey={selectedOriginKey}
                  onOriginChange={setSelectedOriginKey}
                  optimizationResults={optimizationResults}
                />
              </div>
            )}

            {/* TAB: ORIGIN COMPARISON */}
            {activeTab === 'arbitrage' && (
              <div className="space-y-8">
                <OriginArbitrageComparator
                  selectedPortKey={selectedPortKey}
                  onPortChange={setSelectedPortKey}
                  cargoQuantity={cargoQuantity}
                  bunkerPrice={(lastHistoryPoint?.bunkerFuel || lastHistoryPoint?.bunker_fuel || 784.50) + bunkerOffset}
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

            {/* TAB 4: PORT TURNAROUND */}
            {activeTab === 'turnaround' && (
              <div className="space-y-8">
                <IdleScenarioManager
                  bestSolution={optimizationResults.bestSolution}
                  selectedPortKey={selectedPortKey}
                  cargoQuantity={cargoQuantity}
                  bunkerPrice={(lastHistoryPoint?.bunkerFuel || lastHistoryPoint?.bunker_fuel || 784.50) + bunkerOffset}
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

            {/* TAB 5: RISK MONITOR */}
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

            {/* TAB 6: VOYAGE PLANNER */}
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

            {/* TAB 7: MARKET STRESS TEST */}
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

            {/* TAB 8: HISTORICAL BENCHMARKS */}
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

            {/* TAB 9: RATE DRIVERS */}
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
        <footer className="terminal-card p-5 text-center text-xs text-[#627D98] border-[#D6E4EE] flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <div>
            <strong className="text-[#0F2942]">OceanPulse Maritime Logistics Suite</strong> — Indian East Coast Freight Procurement & Terminal Intelligence.
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="text-[#0D9488]">● 2026 Environmental Standards</span>
            <span>•</span>
            <span className="text-[#077DB3]">● 7 Major Gateways</span>
            <span>•</span>
            <span className="text-[#334E68]">● Live Spot Rates</span>
          </div>
        </footer>

      </div>

      {/* Floating AI Maritime Copilot Trigger */}
      <button 
        onClick={() => setIsCopilotOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-gradient-to-r from-[#077DB3] to-[#299FE0] hover:from-[#066997] hover:to-[#2489C2] text-white shadow-xl shadow-cyan-500/30 border border-white/20 flex items-center gap-2.5 group hover:scale-105 active:scale-95 transition-all"
        title="Open Maritime Freight Assistant"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-white animate-bounce" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
        </div>
        <span className="font-heading font-bold text-xs hidden md:inline">Freight Assistant</span>
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
        bunkerPrice={(lastHistoryPoint?.bunkerFuel || lastHistoryPoint?.bunker_fuel || 784.50) + bunkerOffset}
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
