import os
import sys
import logging
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure root path is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app.data.storage import MarketDataStorage
from backend.app.data.fetcher import RealTimeDataFetcher
from backend.app.features.pipeline import FeatureEngineeringPipeline
from backend.app.models.garch_model import GarchVolatilityModel
from backend.app.models.ml_regressor import CatBoostFreightRegressor
from backend.app.models.ensemble import Tier2StackedEnsemble
from backend.app.api.routes import router as api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("OceanPulse")

class ApplicationState:
    def __init__(self):
        self.storage: MarketDataStorage = None
        self.fetcher: RealTimeDataFetcher = None
        self.feature_pipeline: FeatureEngineeringPipeline = None
        self.garch_model: GarchVolatilityModel = None
        self.ml_regressor: CatBoostFreightRegressor = None
        self.ensemble: Tier2StackedEnsemble = None
        self.feature_df = None
        self.is_ready: bool = False
        self.last_update_time: str = None

state = ApplicationState()

def run_data_update_and_refit():
    """
    Core pipeline: Ingests/updates data, engineers features, and fits GARCH(1,1) + CatBoost models.
    """
    logger.info("Initializing OceanPulse Data Ingestion & Econometric/ML Pipeline...")
    
    # 1. Load Data
    if state.storage is None:
        state.storage = MarketDataStorage()
    if state.fetcher is None:
        state.fetcher = RealTimeDataFetcher()
    if state.feature_pipeline is None:
        state.feature_pipeline = FeatureEngineeringPipeline()

    # 2. Attempt live update
    try:
        last_known = state.storage.get_latest_row()
        logger.info("Attempting live quote fetch from external sources (Baltic, Bunker, Coal, FRED DXY)...")
        live_update = state.fetcher.fetch_all_latest(fallback_row=last_known)
        
        # Merge if today's date differs or update latest row
        state.storage.append_or_update([live_update])
        logger.info(f"Live market data merged. Current BDI: {live_update['bdi']}, Bunker: ${live_update['bunker_fuel']}, DXY: {live_update['dxy']}")
    except Exception as e:
        logger.warning(f"Live data scraping encounter non-fatal error: {e}. Utilizing baseline historical dataset.")

    # 3. Compute Features
    df = state.storage.df
    df_feat = state.feature_pipeline.compute_features(df)
    state.feature_df = df_feat

    X, y, valid_df = state.feature_pipeline.build_training_matrix(df_feat)

    # 4. Fit GARCH(1,1) across all historical log returns
    if state.garch_model is None:
        state.garch_model = GarchVolatilityModel()
    log_returns = df_feat['spot_log_return'].dropna()
    state.garch_model.fit(log_returns)

    # Attach historical GARCH conditional volatility & confidence envelopes to historical DataFrame
    hist_garch_df = state.garch_model.get_historical_volatility_dataframe(df['date'], df['spot_freight_rate'])
    df['garch_vol_pct'] = hist_garch_df['garch_vol_pct'].values
    df['garch_upper_95'] = hist_garch_df['garch_upper_95'].values
    df['garch_lower_95'] = hist_garch_df['garch_lower_95'].values
    state.storage.df = df

    # 5. Fit CatBoost Regressor (with SHAP TreeExplainer + artifact export)
    if state.ml_regressor is None:
        state.ml_regressor = CatBoostFreightRegressor()
    state.ml_regressor.train_and_evaluate(X, y)

    # 6. Assemble Tier-2 Stacking Ensemble
    state.ensemble = Tier2StackedEnsemble(state.garch_model, state.ml_regressor)
    state.is_ready = True
    state.last_update_time = datetime.now(timezone.utc).isoformat()
    logger.info("OceanPulse Pipeline fully initialized and ready to serve live forecasts!")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Run data load and model training
    run_data_update_and_refit()
    yield
    # Shutdown
    logger.info("Shutting down OceanPulse backend.")

app = FastAPI(
    title="OceanPulse Maritime Freight Forecasting API",
    description="Maritime freight decision-support engine using GARCH(1,1), CatBoost, SHAP TreeExplainer, PuLP MILP solver, and Groq LLM Intelligence.",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend applications (Local, Render, Netlify, Custom Domains)
allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.onrender\.com|https://.*\.netlify\.app|http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
