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
import ExecutiveBriefingModal from './components/ExecutiveBriefingModal';
import FreightQuoteModal from './components/FreightQuoteModal';

import { generateHistoricalData } from './services/dataPipeline';
import { generateForecast } from './services/forecastingEngine';
import { evaluateDecisionTrigger } from './services/optimizerEngine';

export default function App() {
  const [selectedPreset, setSelectedPreset] = useState('normal');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Interactive parameter state
  const [selectedHorizon, setSelectedHorizon] = useState(15);
  const [thetaRisk, setThetaRisk] = useState(0.20);
  const [targetCoACost, setTargetCoACost] = useState(21500);
  const [bunkerOffset, setBunkerOffset] = useState(0);
  const [cargoQuantity, setCargoQuantity] = useState(75000);
  const [selectedPortKey, setSelectedPortKey] = useState('Dhamra');

  const scenarioModifiers = useMemo(() => {
    switch (selectedPreset) {
      case 'monsoon':
        return { regime: 'monsoon', importVolumeMultiplier: 1.25, bunkerFuelMultiplier: 1.05, bdiOffset: 350 };
      case 'bunker':
        return { regime: 'normal', importVolumeMultiplier: 1.0, bunkerFuelMultiplier: 1.50, bdiOffset: 150 };
      case 'disruption':
        return { regime: 'disruption', importVolumeMultiplier: 1.40, bunkerFuelMultiplier: 1.35, bdiOffset: 650 };
      case 'normal':
      default:
        return { regime: 'normal', importVolumeMultiplier: 1.0, bunkerFuelMultiplier: 1.0, bdiOffset: 0 };
    }
  }, [selectedPreset]);

  // 1. Pipeline
  const historySeries = useMemo(() => {
    return generateHistoricalData({
      ...scenarioModifiers,
      bunkerFuelMultiplier: scenarioModifiers.bunkerFuelMultiplier * (1 + bunkerOffset / 640)
    });
  }, [scenarioModifiers, bunkerOffset]);

  // 2. Forecast Engine
  const { forecast, volatilityStats } = useMemo(() => {
    return generateForecast(historySeries, 30, {
      fuelPriceOffset: bunkerOffset,
      regime: scenarioModifiers.regime
    });
  }, [historySeries, bunkerOffset, scenarioModifiers.regime]);

  const selectedHorizonForecast = useMemo(() => {
    return forecast.find(f => f.horizon === selectedHorizon) || forecast[0];
  }, [forecast, selectedHorizon]);

  const lastHistoryPoint = historySeries[historySeries.length - 1];

  // 3. Prescriptive Trigger
  const decisionTrigger = useMemo(() => {
    return evaluateDecisionTrigger(selectedHorizonForecast, thetaRisk, targetCoACost);
  }, [selectedHorizonForecast, thetaRisk, targetCoACost]);

  const handleResetControls = () => {
    setSelectedPreset('normal');
    setSelectedHorizon(15);
    setThetaRisk(0.20);
    setTargetCoACost(21500);
    setBunkerOffset(0);
    setCargoQuantity(75000);
    setSelectedPortKey('Dhamra');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#FF3B00] selection:text-white">
      
      {/* 1. Logistico Main Header */}
      <LogisticoNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
      />

      {/* 2. Enterprise Hero Banner */}
      <LogisticoHero
        onTabChange={setActiveTab}
        onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
        onOpenBriefing={() => setIsBriefingOpen(true)}
      />

      {/* Main Workspace Container */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Enterprise KPI Overview Cards */}
        <KPIOverviewBar lastHistoryPoint={lastHistoryPoint} />

        {/* Scenario & Parameter Controls */}
        <WhatIfControls
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
          onResetControls={handleResetControls}
        />

        {/* TAB 1: DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
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
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MARITIME RADAR VIEW */}
        {activeTab === 'maritime' && (
          <div className="space-y-8">
            <PortVesselMap
              selectedPortKey={selectedPortKey}
              onPortChange={setSelectedPortKey}
            />

            <PrescriptiveOptimizerPanel
              selectedHorizonForecast={selectedHorizonForecast}
              decisionTrigger={decisionTrigger}
              bunkerPrice={lastHistoryPoint.bunkerFuel + bunkerOffset}
              cargoQuantity={cargoQuantity}
              selectedPortKey={selectedPortKey}
              onPortChange={setSelectedPortKey}
            />
          </div>
        )}

        {/* TAB 3: SHAP ANALYTICS VIEW */}
        {activeTab === 'shap' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ShapWaterfall
                selectedHorizonForecast={selectedHorizonForecast}
                lastHistoryPoint={lastHistoryPoint}
              />
            </div>
            <div className="lg:col-span-2">
              <RiskConeChart
                historySeries={historySeries}
                forecastData={forecast}
                volatilityStats={volatilityStats}
                selectedHorizon={selectedHorizon}
                onSelectHorizon={setSelectedHorizon}
              />
            </div>
          </div>
        )}

        {/* Website Footer */}
        <footer className="card-clean p-6 text-center text-xs text-slate-500 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong className="text-slate-800">OceanPulse Freight Intelligence:</strong> Enterprise Maritime Rate Forecasting & Prescriptive Procurement Platform.
          </div>
          <div className="font-mono text-[#FF3B00] font-bold">
            GARCH(1,1) • CatBoost • Denton-Cholette • PuLP Solver
          </div>
        </footer>
      </div>

      {/* Briefing Modal */}
      <ExecutiveBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
      />

      {/* Freight Quote Modal */}
      <FreightQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        horizonForecast={selectedHorizonForecast}
        decisionTrigger={decisionTrigger}
        bunkerPrice={lastHistoryPoint.bunkerFuel + bunkerOffset}
      />
    </div>
  );
}
