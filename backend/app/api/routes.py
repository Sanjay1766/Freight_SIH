import os
from threading import Lock

from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from backend.app.optimizer.vessel_solver import MixedIntegerVesselSolver
from backend.app.optimizer.turnaround_engine import compute_virtual_arrival_optimization, match_triangular_backhaul
from backend.app.optimizer.arbitrage import compute_multi_origin_arbitrage
from backend.app.optimizer.scheduler import optimize_multi_voyage_schedule
from backend.app.optimizer.monte_carlo import run_monte_carlo_stress_test
from backend.app.optimizer.ports_matrix import EAST_COAST_PORT_MATRIX, ORIGIN_PORTS_MATRIX, get_nautical_distance

router = APIRouter()
vessel_solver = MixedIntegerVesselSolver()

class ForecastRequest(BaseModel):
    horizon: int = Field(default=90, ge=1, le=90, description="Forecast horizon in days (1 to 90)")
    bunkerOffset: float = Field(default=0.0, description="Fuel price offset ($/MT)")
    regime: str = Field(default="normal", description="Market regime: normal | monsoon | disruption | bunker")
    originPortKey: str = Field(default="Indonesia_Samarinda", description="Origin port key")
    destinationPortKey: str = Field(default="Paradip", description="Destination East Coast port key")
    thetaRisk: Optional[float] = Field(default=0.20, description="Risk tolerance threshold")
    targetCoACost: Optional[float] = Field(default=21500.0, description="Target CoA contract cost")

class OptimizationRequest(BaseModel):
    originPortKey: str = "Indonesia_Samarinda"
    destinationPortKey: str = "Paradip"
    cargoQuantityTons: int = 75000
    bunkerPrice: float = 784.50
    selectedHorizon: int = 15
    thetaRisk: float = 0.20
    targetCoACost: float = 21500.0

class TurnaroundRequest(BaseModel):
    destinationPortKey: str = "Paradip"
    originPortKey: str = "Indonesia_Samarinda"
    cargoQuantityTons: int = 75000
    bunkerPrice: float = 784.50

class ArbitrageRequest(BaseModel):
    destinationPortKey: str = "Paradip"
    cargoQuantityTons: int = 75000
    bunkerPrice: float = 784.50
    spotDailyRate: float = 22000.0

class MonteCarloRequest(BaseModel):
    spotRate: float = 22000.0
    dailyVol: float = 0.0155
    cargoQuantityTons: int = 75000
    bunkerPrice: float = 784.50
    iterations: int = 1000

class ScheduleRequest(BaseModel):
    targetCoACost: float = Field(default=21500.0, gt=0)

class CopilotChatRequest(BaseModel):
    message: str = Field(..., description="User question or strategy query")
    history: Optional[list] = Field(default_factory=list, description="Recent conversation turns")
    context: Optional[dict] = Field(default_factory=dict, description="Live dashboard state context")

class BriefingRequest(BaseModel):
    marketState: Optional[dict] = Field(default_factory=dict, description="Optional custom market state override")

_pipeline_update_lock = Lock()

def _pipeline_refresh_enabled() -> bool:
    """Keep expensive scrape-and-refit operations opt-in outside local development."""
    return os.getenv("ENABLE_PIPELINE_REFRESH", "true").strip().lower() in {"1", "true", "yes"}

@router.get("/health")
def health_check():
    from backend.app.main import state
    return {
        "status": "healthy",
        "service": "OceanPulse Maritime Freight Intelligence API",
        "model_engine": "GARCH(1,1) + CatBoost + SHAP TreeExplainer + PuLP MILP Solver",
        "models_trained": state.is_ready,
        "pipeline_refresh_enabled": _pipeline_refresh_enabled(),
        "historical_records": len(state.storage.df) if state.storage and state.storage.df is not None else 0,
        "date_range": {
            "start": str(state.storage.df.iloc[0]['date']) if state.storage and state.storage.df is not None and not state.storage.df.empty else None,
            "end": str(state.storage.df.iloc[-1]['date']) if state.storage and state.storage.df is not None and not state.storage.df.empty else None
        } if state.storage and state.storage.df is not None else None,
        "last_update": state.last_update_time
    }

@router.get("/api/health")
def api_health_check():
    return health_check()

@router.get("/api/market-data/live")
def get_live_market_data():
    """Direct live data quote fetch from real-time external sources."""
    from backend.app.main import state
    from backend.app.data.fetcher import RealTimeDataFetcher
    fetcher = state.fetcher or RealTimeDataFetcher()
    last_known = state.storage.get_latest_row() if (state.storage and state.storage.df is not None) else None
    live_data = fetcher.fetch_all_latest(fallback_row=last_known)
    return {
        "status": "success",
        "data": live_data,
        "fetched_at": datetime.utcnow().isoformat()
    }

@router.get("/api/market-data/history")
def get_market_history(limit: int = Query(default=90, ge=1, le=1000)):
    from backend.app.main import state
    if not state.is_ready or state.storage is None or state.storage.df is None:
        raise HTTPException(status_code=503, detail="Model pipeline is initializing")
    
    df = state.storage.df.tail(limit).copy()
    if 'date' in df.columns:
        df['date'] = df['date'].astype(str)
    
    cols_to_keep = [c for c in df.columns if c != 'sources']
    df = df[cols_to_keep].fillna(0)
    raw_records = df.to_dict(orient="records")

    normalized_records = []
    for idx, r in enumerate(raw_records):
        norm = dict(r)
        norm["dayIndex"] = idx
        norm["bciCapesize"] = int(r.get("bci", 0))
        norm["bpiPanamax"] = int(r.get("bpi", 0))
        norm["bsiSupramax"] = int(r.get("bsi", 0))
        norm["bunkerFuel"] = float(r.get("bunker_fuel", 0.0))
        norm["coalIndex"] = float(r.get("coal_index", 0.0))
        norm["indoCoalIndex"] = float(r.get("indo_coal_index", 0.0))
        norm["dxy"] = float(r.get("dxy", 0.0))
        norm["seaborneVolumeDaily"] = int(r.get("seaborne_volume", 0))
        norm["mtiIndia"] = float(r.get("mti_india", 0.0))
        norm["spotFreightRate"] = int(r.get("spot_freight_rate", 0))
        norm["garchVolPct"] = float(r.get("garch_vol_pct", 1.61))
        norm["garchUpper95"] = int(r.get("garch_upper_95", round(norm["spotFreightRate"] * 1.032)))
        norm["garchLower95"] = int(r.get("garch_lower_95", round(norm["spotFreightRate"] * 0.968)))
        norm["isDisaggregated"] = True
        normalized_records.append(norm)

    return {
        "count": len(normalized_records),
        "data": normalized_records
    }

@router.post("/api/forecast")
def generate_forecast(req: ForecastRequest):
    from backend.app.main import state
    if not state.is_ready or state.ensemble is None:
        raise HTTPException(status_code=503, detail="Forecasting engine is initializing")

    last_row = state.storage.get_latest_row()
    latest_feat = state.feature_df.iloc[-1]

    scenario_modifiers = {
        "bunkerOffset": req.bunkerOffset,
        "regime": req.regime,
        "originPortKey": req.originPortKey,
        "destinationPortKey": req.destinationPortKey
    }

    result = state.ensemble.generate_full_forecast(
        latest_features=latest_feat,
        last_row=last_row,
        max_horizon=req.horizon,
        scenario_modifiers=scenario_modifiers
    )

    return result

@router.post("/api/optimize/vessel-allocation")
def solve_vessel_allocation(req: OptimizationRequest):
    from backend.app.main import state
    if not state.is_ready or state.ensemble is None:
        raise HTTPException(status_code=503, detail="Pipeline initializing")

    last_row = state.storage.get_latest_row()
    latest_feat = state.feature_df.iloc[-1]

    forecast_res = state.ensemble.generate_full_forecast(
        latest_features=latest_feat,
        last_row=last_row,
        max_horizon=req.selectedHorizon,
        scenario_modifiers={"originPortKey": req.originPortKey, "destinationPortKey": req.destinationPortKey}
    )
    selected_horizon_fc = forecast_res["forecast"][req.selectedHorizon - 1]

    solution = vessel_solver.solve(
        origin_port_key=req.originPortKey,
        dest_port_key=req.destinationPortKey,
        cargo_qty_tons=req.cargoQuantityTons,
        bunker_price=req.bunkerPrice,
        horizon_forecast=selected_horizon_fc,
        theta_risk=req.thetaRisk,
        target_coa_cost=req.targetCoACost
    )
    return solution

@router.post("/api/optimize/turnaround-backhaul")
def get_turnaround_and_backhaul(req: TurnaroundRequest):
    dist_nm = get_nautical_distance(req.originPortKey, req.destinationPortKey)
    dummy_vessel = {"vessel": {"speedKnots": 13.5, "bunkerConsumptionTonsPerDay": 28.0}}
    
    virtual_arrival = compute_virtual_arrival_optimization(
        best_vessel=dummy_vessel,
        dest_port_key=req.destinationPortKey,
        distance_nm=dist_nm,
        bunker_price=req.bunkerPrice
    )
    backhaul = match_triangular_backhaul(
        dest_port_key=req.destinationPortKey,
        vessel_class="Panamax"
    )

    return {
        "virtualArrival": virtual_arrival,
        "backhaul": backhaul
    }

@router.post("/api/arbitrage/compare")
def get_arbitrage_comparison(req: ArbitrageRequest):
    return compute_multi_origin_arbitrage(
        dest_port_key=req.destinationPortKey,
        cargo_qty_tons=req.cargoQuantityTons,
        bunker_price=req.bunkerPrice,
        spot_daily_rate=req.spotDailyRate
    )

@router.post("/api/scheduler/multi-voyage")
def get_multi_voyage_schedule(req: ScheduleRequest):
    from backend.app.main import state
    last_row = state.storage.get_latest_row()
    latest_feat = state.feature_df.iloc[-1]
    fc = state.ensemble.generate_full_forecast(latest_feat, last_row, max_horizon=90)
    return optimize_multi_voyage_schedule(fc["forecast"], target_coa_cost=req.targetCoACost)

@router.post("/api/stress-test/monte-carlo")
def get_monte_carlo_stress_test(req: MonteCarloRequest):
    return run_monte_carlo_stress_test(
        spot_rate=req.spotRate,
        daily_vol=req.dailyVol,
        cargo_qty_tons=req.cargoQuantityTons,
        bunker_price=req.bunkerPrice,
        iterations=req.iterations
    )

@router.get("/api/model/metrics")
def get_model_metrics():
    from backend.app.main import state
    if not state.is_ready:
        raise HTTPException(status_code=503, detail="Models are training")
    
    return {
        "ml_regressor": state.ml_regressor.metrics,
        "garch_econometrics": state.garch_model.get_summary(),
        "feature_importances": state.ml_regressor.feature_importances
    }

@router.get("/api/model/shap")
def get_shap_waterfall(horizon: int = Query(default=15, ge=1, le=90)):
    from backend.app.main import state
    if not state.is_ready or state.ensemble is None:
        raise HTTPException(status_code=503, detail="Engine not ready")

    last_row = state.storage.get_latest_row()
    latest_feat = state.feature_df.iloc[-1]

    forecast_res = state.ensemble.generate_full_forecast(
        latest_features=latest_feat,
        last_row=last_row,
        max_horizon=horizon
    )

    target_pt = forecast_res["forecast"][horizon - 1]["pointForecast"]
    waterfall = state.ml_regressor.compute_shap_waterfall(
        horizon=horizon,
        point_forecast=target_pt,
        last_row=last_row
    )

    return {
        "horizon": horizon,
        "pointForecast": target_pt,
        "features": waterfall
    }

from fastapi.responses import FileResponse

@router.post("/api/pipeline/update")
def trigger_pipeline_update(background_tasks: BackgroundTasks):
    from backend.app.main import state, run_data_update_and_refit
    if not _pipeline_refresh_enabled():
        raise HTTPException(status_code=403, detail="Pipeline refresh is disabled. Set ENABLE_PIPELINE_REFRESH=true for local administrative use.")
    if not _pipeline_update_lock.acquire(blocking=False):
        raise HTTPException(status_code=409, detail="A pipeline refresh is already running")

    def update_pipeline():
        try:
            run_data_update_and_refit()
        finally:
            _pipeline_update_lock.release()

    background_tasks.add_task(update_pipeline)
    return {
        "status": "triggered",
        "message": "Live data scrape and model refit task dispatched in background.",
        "dispatched_at": datetime.utcnow().isoformat()
    }

@router.get("/api/model/exports")
def get_model_exports():
    """Returns a summary of all exported model artifacts and their locations."""
    import os
    exports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "exports")
    artifacts = {}
    expected_files = [
        "catboost_freight_model.cbm",
        "backtest_metrics.json",
        "shap_values.json",
        "feature_importances.json",
        "forecast_90d.json"
    ]
    for fname in expected_files:
        fpath = os.path.join(exports_dir, fname)
        if os.path.exists(fpath):
            artifacts[fname] = {
                "exists": True,
                "size_bytes": os.path.getsize(fpath),
                "download_url": f"/api/model/download/{fname}"
            }
        else:
            artifacts[fname] = {"exists": False}
    
    return {
        "exports_directory": exports_dir,
        "artifacts": artifacts
    }

@router.get("/api/model/download/{filename}")
def download_model_export(filename: str):
    import os
    exports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "exports")
    allowed_files = {
        "catboost_freight_model.cbm": ("application/octet-stream", "catboost_freight_model.cbm"),
        "backtest_metrics.json": ("application/json", "backtest_metrics.json"),
        "shap_values.json": ("application/json", "shap_values.json"),
        "feature_importances.json": ("application/json", "feature_importances.json"),
        "forecast_90d.json": ("application/json", "forecast_90d.json")
    }
    if filename not in allowed_files:
        raise HTTPException(status_code=404, detail=f"Invalid artifact request: {filename}")
    fpath = os.path.join(exports_dir, filename)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail=f"Artifact {filename} is not generated yet")
    media_type, dl_name = allowed_files[filename]
    return FileResponse(fpath, media_type=media_type, filename=dl_name)

@router.post("/api/copilot/chat")
def copilot_chat(req: CopilotChatRequest):
    """
    Real-time Groq LLM Maritime Copilot conversational endpoint with live market data injection.
    """
    from backend.app.main import state
    from backend.app.services.groq_service import groq_service

    # Build enriched context if not fully provided by client
    context = req.context or {}
    if state.storage and state.storage.df is not None and not state.storage.df.empty:
        last_row = state.storage.get_latest_row()
        context.setdefault("spotFreightRate", float(last_row.get("spot_freight_rate", 22000)))
        context.setdefault("bdi", float(last_row.get("bdi", 1850)))
        context.setdefault("bunkerFuel", float(last_row.get("bunker_fuel", 784.50)))

    try:
        reply = groq_service.query_copilot(
            user_message=req.message,
            chat_history=req.history,
            context_data=context
        )
        return {
            "status": "success",
            "reply": reply,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Copilot inference error: {str(e)}")

@router.post("/api/ai/briefing")
def ai_executive_briefing(req: BriefingRequest):
    """
    Generates an executive-ready maritime briefing memo powered by Groq LLM.
    """
    from backend.app.main import state
    from backend.app.services.groq_service import groq_service

    market_state = req.marketState or {}
    if state.storage and state.storage.df is not None and not state.storage.df.empty:
        last_row = state.storage.get_latest_row()
        market_state.setdefault("bdi", float(last_row.get("bdi", 1850)))
        market_state.setdefault("spot_rate", float(last_row.get("spot_freight_rate", 22000)))
        market_state.setdefault("bunker", float(last_row.get("bunker_fuel", 784.50)))

    try:
        memo = groq_service.generate_executive_briefing(market_state)
        return {
            "status": "success",
            "memo": memo,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Executive briefing generation error: {str(e)}")
