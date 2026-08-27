import React, { useState, useMemo } from 'react';
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

import { generateHistoricalData } from './services/dataPipeline';
import { generateForecast } from './services/forecastingEngine';
import { evaluateDecisionTrigger, solveVesselAllocation } from './services/optimizerEngine';

export default function App() {
  const [selectedPreset, setSelectedPreset] = useState('normal');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

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

  // 1. Ingestion Pipeline
  const historySeries = useMemo(() => {
    return generateHistoricalData({
      ...scenarioModifiers,
      bunkerFuelMultiplier: scenarioModifiers.bunkerFuelMultiplier * (1 + bunkerOffset / 640)
    });
  }, [scenarioModifiers, bunkerOffset]);

  // 2. Forecast & Risk Engine (1-90 Days)
  const { forecast, volatilityStats, entryWindows, riskAnalysis } = useMemo(() => {
    return generateForecast(historySeries, 90, {
      fuelPriceOffset: bunkerOffset,
      regime: scenarioModifiers.regime,
      originPortKey: selectedOriginKey,
      destinationPortKey: selectedPortKey
    });
  }, [historySeries, bunkerOffset, scenarioModifiers.regime, selectedOriginKey, selectedPortKey]);

  const selectedHorizonForecast = useMemo(() => {
    return forecast.find(f => f.horizon === selectedHorizon) || forecast[0];
  }, [forecast, selectedHorizon]);

  const lastHistoryPoint = historySeries[historySeries.length - 1];

  // 3. Prescriptive Decision Trigger
  const decisionTrigger = useMemo(() => {
    return evaluateDecisionTrigger(selectedHorizonForecast, thetaRisk, targetCoACost);
  }, [selectedHorizonForecast, thetaRisk, targetCoACost]);

  // 4. PuLP Vessel Solver Solution
  const optimizationResults = useMemo(() => {
    return solveVesselAllocation({
      originPortKey: selectedOriginKey,
      destinationPortKey: selectedPortKey,
      cargoQuantityTons: cargoQuantity,
      bunkerPrice: lastHistoryPoint.bunkerFuel + bunkerOffset,
      horizonForecast: selectedHorizonForecast,
      decisionTrigger
    });
  }, [selectedOriginKey, selectedPortKey, cargoQuantity, lastHistoryPoint.bunkerFuel, bunkerOffset, selectedHorizonForecast, decisionTrigger]);

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
              bunkerPrice={lastHistoryPoint.bunkerFuel + bunkerOffset}
              selectedHorizonForecast={selectedHorizonForecast}
              decisionTrigger={decisionTrigger}
              onSelectOrigin={handleSelectArbitrageOrigin}
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
                  bunkerPrice={lastHistoryPoint.bunkerFuel + bunkerOffset}
                  cargoQuantity={cargoQuantity}
                  selectedPortKey={selectedPortKey}
                  onPortChange={setSelectedPortKey}
                  selectedOriginKey={selectedOriginKey}
                  onOriginChange={setSelectedOriginKey}
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
              bunkerPrice={lastHistoryPoint.bunkerFuel + bunkerOffset}
              cargoQuantity={cargoQuantity}
              selectedPortKey={selectedPortKey}
              onPortChange={setSelectedPortKey}
              selectedOriginKey={selectedOriginKey}
              onOriginChange={setSelectedOriginKey}
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
              bunkerPrice={lastHistoryPoint.bunkerFuel + bunkerOffset}
              selectedHorizonForecast={selectedHorizonForecast}
              decisionTrigger={decisionTrigger}
              onSelectOrigin={handleSelectArbitrageOrigin}
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
              bunkerPrice={lastHistoryPoint.bunkerFuel + bunkerOffset}
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
            <ModelValidationLab historySeries={historySeries} />

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
            <strong className="text-slate-800">OceanPulse Freight Intelligence:</strong> Enterprise Maritime Rate Forecasting & Prescriptive Procurement Suite.
          </div>
          <div className="font-mono text-[#FF3B00] font-bold">
            GARCH(1,1) • CatBoost • Denton-Cholette • PuLP Constrained Optimization • IMO CII & Virtual Arrival
          </div>
        </footer>
      </div>

      {/* 1. Briefing Modal */}
      <ExecutiveBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
      />

      {/* 2. Freight Quote Modal */}
      <FreightQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        horizonForecast={selectedHorizonForecast}
        decisionTrigger={decisionTrigger}
        bunkerPrice={lastHistoryPoint.bunkerFuel + bunkerOffset}
        onOpenReport={() => setIsReportModalOpen(true)}
      />

      {/* 3. Executive Report Modal */}
      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        bestSolution={optimizationResults.bestSolution}
        decisionTrigger={decisionTrigger}
        selectedHorizonForecast={selectedHorizonForecast}
        riskAnalysis={riskAnalysis}
        selectedPortKey={selectedPortKey}
        originPortKey={selectedOriginKey}
        cargoQuantity={cargoQuantity}
        targetCoACost={targetCoACost}
      />

      {/* 4. AI Copilot Modal */}
      <CopilotAssistant
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        selectedHorizonForecast={selectedHorizonForecast}
        decisionTrigger={decisionTrigger}
        selectedPortKey={selectedPortKey}
        selectedOriginKey={selectedOriginKey}
        bunkerPrice={lastHistoryPoint.bunkerFuel + bunkerOffset}
        cargoQuantity={cargoQuantity}
      />

    </div>
  );
}
