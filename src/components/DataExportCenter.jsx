import React from 'react';
import { Download, FileText, Table, Database, Cpu, CheckCircle2, ShieldCheck } from 'lucide-react';
import { EAST_COAST_PORT_MATRIX, ORIGIN_PORTS_MATRIX, CANDIDATE_VESSELS } from '../services/optimizerEngine';
import { API_BASE } from '../services/apiClient';

export default function DataExportCenter({ forecastData, historySeries, selectedPortKey, selectedOriginKey }) {
  
  // Download 90-Day Forecast as CSV
  const handleDownloadForecastCSV = () => {
    const headers = 'Horizon_Days,Target_Date,Point_Forecast_USD_Day,Lower_95_USD,Upper_95_USD,Volatility_USD,GARCH_Weight,ML_Weight\n';
    const rows = (forecastData || []).map(f =>
      `${f.horizon},${f.date},${f.pointForecast},${f.lower95},${f.upper95},${f.volatilityDollars},${f.garchWeight},${f.mlWeight}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `OceanPulse_Freight_Forecast_90D_${selectedPortKey || 'Paradip'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Port Matrix & Fleet Constraint Specs as JSON
  const handleDownloadPortMatrixJSON = () => {
    const payload = {
      exportTimestamp: new Date().toISOString(),
      activeDestinationPort: selectedPortKey,
      activeOriginTerminal: selectedOriginKey,
      eastCoastPortMatrix: EAST_COAST_PORT_MATRIX,
      originTerminals: ORIGIN_PORTS_MATRIX,
      candidateFleetPool: CANDIDATE_VESSELS
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `OceanPulse_Maritime_Matrix_Specs.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Historical 90-Day Pipeline CSV
  const handleDownloadHistoryCSV = () => {
    const headers = 'Day_Index,Date,BDI,Spot_Freight_Rate_USD,VLSFO_Bunker_USD_MT,Coal_Index_USD_MT,DXY_Currency_Index,Disaggregated_Volume_MT_Day,MTI_India,GARCH_Vol_Pct\n';
    const rows = (historySeries || []).map(h =>
      `${h.dayIndex ?? ''},${h.date},${h.bdi ?? ''},${h.spotFreightRate ?? ''},${h.bunkerFuel ?? ''},${h.coalIndex ?? ''},${h.dxy ?? ''},${h.seaborneVolumeDaily ?? ''},${h.mtiIndia ?? ''},${h.garchVolPct ?? 1.61}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `OceanPulse_Historical_Proxies_90D.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadArtifact = (filename) => {
    const link = document.createElement('a');
    link.setAttribute('href', `${API_BASE}/api/model/download/${filename}`);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card-clean p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              Data Export & ML Governance Artifact Ledger
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Export structured CSV/JSON datasets, trained CatBoost models (.cbm), and audit-ready SHAP/Backtest verification ledgers
          </p>
        </div>

        <span className="badge-navy text-xs font-mono">
          7 Ready-to-Export Artifacts
        </span>
      </div>

      {/* Row 1: Operational Datasets */}
      <div>
        <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
          Operational Market & Fleet Datasets
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Dataset 1: 90-Day Forecast */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-[#FF3B00]" /> 90-Day Forward Rate Curve
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">CSV</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Full 1-90 day forward point forecasts, 95% volatility confidence intervals, and model blend weights.
              </p>
            </div>
            <button
              onClick={handleDownloadForecastCSV}
              className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#FF3B00]" /> Download Forecast CSV
            </button>
          </div>

          {/* Dataset 2: Port & Fleet Matrix */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Maritime Port & Fleet Matrix
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">JSON</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Technical specifications for all 7 East Coast ports, 9 origin terminals, and candidate fleet classes.
              </p>
            </div>
            <button
              onClick={handleDownloadPortMatrixJSON}
              className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" /> Download Matrix JSON
            </button>
          </div>

          {/* Dataset 3: Historical Proxies */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-emerald-600" /> Historical Proxies & GARCH Series
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">CSV</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Bundled BDI history with development proxy fields for fuel, coal, volumes, and MTI_India. Review provenance before external use.
              </p>
            </div>
            <button
              onClick={handleDownloadHistoryCSV}
              className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" /> Download Historical CSV
            </button>
          </div>

        </div>
      </div>

      {/* Row 2: ML Model & Explainability Artifacts */}
      <div>
        <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
          Trained Machine Learning & Governance Artifacts
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Artifact 1: CatBoost Model Binary */}
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-600" /> CatBoost Model Binary
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-200 text-purple-900 font-bold">.CBM</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Trained 300-tree model binary (187 KB) ready for standalone offline inference.
              </p>
            </div>
            <button
              onClick={() => handleDownloadArtifact('catboost_freight_model.cbm')}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-purple-200" /> Download .CBM
            </button>
          </div>

          {/* Artifact 2: Backtest Metrics JSON */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Backtest Holdout Metrics
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-200 text-blue-900 font-bold">JSON</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Chronological next-day holdout predictions and metrics for the currently loaded dataset.
              </p>
            </div>
            <button
              onClick={() => handleDownloadArtifact('backtest_metrics.json')}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-blue-200" /> Download Backtest JSON
            </button>
          </div>

          {/* Artifact 3: SHAP Values JSON */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> SHAP TreeExplainer Matrix
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">JSON</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Complete TreeExplainer attribution values across all 26 engineered features.
              </p>
            </div>
            <button
              onClick={() => handleDownloadArtifact('shap_values.json')}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-amber-200" /> Download SHAP JSON
            </button>
          </div>

          {/* Artifact 4: 90-Day Forecast JSON */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-700" /> 90-Day Multi-Horizon Array
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">JSON</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Full programmatic array of 90-day point forecasts, confidence intervals, and entry scores.
              </p>
            </div>
            <button
              onClick={() => handleDownloadArtifact('forecast_90d.json')}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" /> Download Forecast JSON
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
