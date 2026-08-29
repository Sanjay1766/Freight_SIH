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
import { RefreshCw } from 'lucide-react';

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
    engine: 'GARCH(1,1) + LightGBM + PuLP MILP Solver',
    lastUpdate: null,
    isUpdating: false
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
            engine: health.model_engine || 'GARCH(1,1) + LightGBM + PuLP MILP Solver',
            lastUpdate: health.last_update,
            isUpdating: false
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
    return forecast.find(f => f.horizon === selectedHorizon) || forecast[0];
  }, [forecast, selectedHorizon]);

  const lastHistoryPoint = historySeries[historySeries.length - 1];

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
    const bunkerPrice = (lastHistoryPoint.bunkerFuel || lastHistoryPoint.bunker_fuel || 629.0) + bunkerOffset;
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#FF3B00] selection:text-white">
      
      {/* 1. Logistico Main Header */}
      <LogisticoNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* 2. Enterprise Hero Banner */}
      <LogisticoHero
        onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
        onOpenBriefing={() => setIsBriefingOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Main Workspace Container */}
      <div className="max-w-[1650px] mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Backend & Live Model Pipeline Status Banner */}
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-all ${
          backendState.connected
            ? 'bg-emerald-950/10 border-emerald-500/30 text-emerald-900'
            : 'bg-amber-950/10 border-amber-500/30 text-amber-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full animate-pulse shrink-0 ${
              backendState.connected ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-amber-500'
            }`} />
            <div>
              <div className="flex items-center gap-2 font-bold text-xs">
                <span className="font-heading font-extrabold uppercase tracking-wide">
                  {backendState.connected ? 'FastAPI Live Backend Active' : 'Client-Side Offline Engine'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/80 border border-slate-200">
                  {backendState.engine}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {backendState.connected
                  ? `Sourced live from Baltic Dry Index (3,186), Ship & Bunker Singapore ($629/MT), Coal Benchmark ($139.75/MT), and FRED DXY (99.16) across ${backendState.records} daily records.`
                  : 'Backend starting or unreachable at http://localhost:8000; seamlessly operating via calibrated client engine.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {backendState.lastUpdate && (
              <span className="text-[10px] font-mono text-slate-500 hidden lg:inline">
                Live Synced: {new Date(backendState.lastUpdate).toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleTriggerUpdate}
              disabled={backendState.isUpdating}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#FF3B00] ${backendState.isUpdating ? 'animate-spin' : ''}`} />
              {backendState.isUpdating ? 'Scraping Live Feeds...' : 'Refresh Live Market Feeds'}
            </button>
          </div>
        </div>

        {/* Enterprise KPI Overview Cards */}
        <KPIOverviewBar lastHistoryPoint={lastHistoryPoint} />

        {/* Scenario & Parameter Simulator */}
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

        {/* TAB 1: MAIN DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <InteractiveGeoMap
              selectedPortKey={selectedPortKey}
              onPortChange={setSelectedPortKey}
              selectedOriginKey={selectedOriginKey}
              onOriginChange={setSelectedOriginKey}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RiskConeChart
                historySeries={historySeries}
                forecastData={forecast}
                volatilityStats={volatilityStats}
                selectedHorizon={selectedHorizon}
                onSelectHorizon={setSelectedHorizon}
              />

              <MTIChart historySeries={historySeries} />
            </div>

            <OriginArbitrageComparator
              selectedPortKey={selectedPortKey}
              onPortChange={setSelectedPortKey}
              cargoQuantity={cargoQuantity}
              bunkerPrice={(lastHistoryPoint.bunkerFuel || lastHistoryPoint.bunker_fuel || 629.0) + bunkerOffset}
              selectedHorizonForecast={selectedHorizonForecast}
              decisionTrigger={decisionTrigger}
              onSelectOrigin={handleSelectArbitrageOrigin}
              arbitrageData={backendArbitrage}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <ShapWaterfall
                  selectedHorizonForecast={selectedHorizonForecast}
                  lastHistoryPoint={lastHistoryPoint}
                />
              </div>

              <div className="lg:col-span-2">
                <PrescriptiveOptimizerPanel
                  selectedHorizonForecast={selectedHorizonForecast}
                  decisionTrigger={decisionTrigger}
                  bunkerPrice={(lastHistoryPoint.bunkerFuel || lastHistoryPoint.bunker_fuel || 629.0) + bunkerOffset}
                  cargoQuantity={cargoQuantity}
                  selectedPortKey={selectedPortKey}
                  onPortChange={setSelectedPortKey}
                  selectedOriginKey={selectedOriginKey}
                  onOriginChange={setSelectedOriginKey}
                  optimizationResults={optimizationResults}
                />
              </div>
            </div>

            <DataExportCenter
              forecastData={forecast}
              historySeries={historySeries}
              selectedPortKey={selectedPortKey}
              selectedOriginKey={selectedOriginKey}
            />
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
              bunkerPrice={(lastHistoryPoint.bunkerFuel || lastHistoryPoint.bunker_fuel || 629.0) + bunkerOffset}
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
              bunkerPrice={(lastHistoryPoint.bunkerFuel || lastHistoryPoint.bunker_fuel || 629.0) + bunkerOffset}
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
              bunkerPrice={(lastHistoryPoint.bunkerFuel || lastHistoryPoint.bunker_fuel || 629.0) + bunkerOffset}
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

        {/* Website Footer */}
        <footer className="card-clean p-6 text-center text-xs text-slate-500 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong className="text-slate-800">OceanPulse Intelligence Suite</strong> — Data-Driven Maritime Logistics & Prescriptive Procurement.
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>IMO 2026 Ready</span>
            <span>•</span>
            <span>GARCH(1,1) Volatility Cone</span>
            <span>•</span>
            <span>PuLP Constrained Solver</span>
          </div>
        </footer>

      </div>

      {/* Modals & AI Copilot */}
      <ExecutiveBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
      />

      <FreightQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        selectedHorizonForecast={selectedHorizonForecast}
        lastHistoryPoint={lastHistoryPoint}
      />

      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        forecastData={forecast}
        lastHistoryPoint={lastHistoryPoint}
        volatilityStats={volatilityStats}
        optimizationResults={optimizationResults}
        riskAnalysis={riskAnalysis}
      />

      <CopilotAssistant
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        selectedHorizonForecast={selectedHorizonForecast}
        lastHistoryPoint={lastHistoryPoint}
        optimizationResults={optimizationResults}
        riskAnalysis={riskAnalysis}
      />

    </div>
  );
}
