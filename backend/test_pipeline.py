import os
import sys

# Auto-re-execute with dedicated venv if running from global system python
backend_dir = os.path.dirname(os.path.abspath(__file__))
venv_python = os.path.join(backend_dir, "venv", "bin", "python")

if os.path.exists(venv_python) and sys.executable != venv_python and "venv" not in sys.prefix:
    os.execv(venv_python, [venv_python] + sys.argv)

PROJECT_ROOT = os.path.dirname(backend_dir)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.data.storage import MarketDataStorage
from backend.app.features.pipeline import FeatureEngineeringPipeline
from backend.app.models.garch_model import GarchVolatilityModel
from backend.app.models.ml_regressor import CatBoostFreightRegressor, LightGBMFreightRegressor
from backend.app.models.ensemble import Tier2StackedEnsemble

def test_pipeline():
    print("=== 1. Testing Storage & Base Dataset Generation ===")
    storage = MarketDataStorage()
    df = storage.load_data()
    print(f"Loaded {len(df)} historical rows. Date range: {df['date'].min()} to {df['date'].max()}")
    assert len(df) >= 200, "Dataset too small"

    print("\n=== 2. Testing Feature Engineering Pipeline ===")
    pipeline = FeatureEngineeringPipeline()
    df_feat = pipeline.compute_features(df)
    print(f"Features computed. Columns ({len(df_feat.columns)})")

    X, y, valid_df = pipeline.build_training_matrix(df_feat)
    print(f"Training matrix shape: X={X.shape}, y={y.shape}")

    print("\n=== 3. Testing GARCH(1,1) with 'arch' Package ===")
    garch = GarchVolatilityModel()
    log_returns = df_feat['spot_log_return'].dropna()
    garch_summary = garch.fit(log_returns)
    print("GARCH Summary:", garch_summary)

    print("\n=== 4. Testing CatBoost Regressor & Backtesting ===")
    ml = CatBoostFreightRegressor()
    metrics = ml.train_and_evaluate(X, y)
    print("CatBoost Backtest Metrics:", metrics)

    print("\n=== 5. Testing Tier-2 Stacked Ensemble & Multi-Horizon Forecast ===")
    ensemble = Tier2StackedEnsemble(garch, ml)
    latest_feat = df_feat.iloc[-1]
    last_row = storage.get_latest_row()

    forecast_output = ensemble.generate_full_forecast(
        latest_features=latest_feat,
        last_row=last_row,
        max_horizon=90,
        scenario_modifiers={"regime": "normal", "originPortKey": "Indonesia_Samarinda", "destinationPortKey": "Paradip"}
    )
    series = forecast_output["forecast"]
    print(f"Generated {len(series)} forecast steps.")
    print("Day 1:", series[0])
    print("Day 45:", series[44])
    print("Day 90:", series[89])

    print("\n✅ All automated pipeline tests PASSED successfully!")

if __name__ == "__main__":
    test_pipeline()
