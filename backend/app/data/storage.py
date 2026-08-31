import os
import pandas as pd
import numpy as np

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
PRELOADED_DIR = os.path.join(DATA_DIR, "preloaded")
KOYFIN_RAW_PATH = os.path.join(PRELOADED_DIR, "koyfin_2026-08-29.csv")
CSV_PATH = os.path.join(PRELOADED_DIR, "historical_market_data.csv")

# live_market_data.csv lives alongside storage.py and IS committed to git.
# This means Render (ephemeral filesystem) always boots from the latest seed,
# not from the stale 2026-08-28 historical CSV.
LIVE_CSV_PATH = os.path.join(DATA_DIR, "live_market_data.csv")


def ensure_dirs():
    os.makedirs(PRELOADED_DIR, exist_ok=True)


def generate_base_historical_dataset(csv_path: str = CSV_PATH) -> pd.DataFrame:
    """
    Ingests the supplied Baltic Dry Index (BDIY) time series and derives demo
    covariates and a proxy target. These generated fields are useful for local
    interface development, but are not a substitute for licensed market data.
    """
    ensure_dirs()

    # Check if raw Koyfin CSV is available in preloaded directory
    if os.path.exists(KOYFIN_RAW_PATH):
        df_raw = pd.read_csv(KOYFIN_RAW_PATH)
        df_raw.columns = [c.replace('"', '').strip() for c in df_raw.columns]

        date_col = 'Date' if 'Date' in df_raw.columns else df_raw.columns[0]
        close_col = [c for c in df_raw.columns if 'Close' in c or 'BDIY' in c][-1]

        df_raw['date'] = pd.to_datetime(df_raw[date_col], format='%m-%d-%Y')
        df_raw['bdi'] = df_raw[close_col].astype(float)
        df_raw = df_raw.sort_values('date').reset_index(drop=True)

        start_date = df_raw['date'].min()
        end_date = df_raw['date'].max()
        all_dates = pd.date_range(start_date, end_date, freq='D')

        df_daily = pd.DataFrame({'date': all_dates})
        df = pd.merge(df_daily, df_raw[['date', 'bdi']], on='date', how='left')
        df['bdi'] = df['bdi'].ffill().bfill()

        n = len(df)
        np.random.seed(42)

        # Correlated Vessel Sub-Indices (Capesize BCI, Panamax BPI, Supramax BSI)
        df['bci'] = np.round(df['bdi'] * 1.38 + np.random.normal(0, 30, n)).astype(int)
        df['bpi'] = np.round(df['bdi'] * 0.94 + np.random.normal(0, 15, n)).astype(int)
        df['bsi'] = np.round(df['bdi'] * 0.78 + np.random.normal(0, 12, n)).astype(int)

        # Macro & Commodity Indices aligned to 2025-2026 actuals
        t = np.arange(n)
        bunker_base = 635.0 + np.sin(t / 45.0) * 20.0 + np.random.normal(0, 3.5, n)
        df['bunker_fuel'] = np.round(bunker_base, 2)

        coal_base = 138.0 + np.sin(t / 60.0) * 8.0 + np.random.normal(0, 1.0, n)
        df['coal_index'] = np.round(coal_base, 2)
        df['indo_coal_index'] = np.round(df['coal_index'] * 0.42 + np.random.normal(0, 0.3, n), 2)

        dxy_base = 103.5 + np.sin(t / 75.0) * 2.5 + np.random.normal(0, 0.2, n)
        df['dxy'] = np.round(dxy_base, 2)

        # Port Logistics & MTI
        daily_vol = 720000.0 + np.sin(t / 60.0) * 60000.0 + np.random.normal(0, 10000, n)
        df['seaborne_volume'] = np.round(daily_vol).astype(int)

        fleet_dwt = 12500000.0
        df['mti_india'] = np.round(
            (df['seaborne_volume'] / fleet_dwt) * (df['bunker_fuel'] / 100.0) * 0.85, 3
        )

        df['spot_freight_rate'] = np.round(
            df['bdi'] * 9.85
            + df['mti_india'] * 4350.0
            + (df['bunker_fuel'] - 600.0) * 13.5
            + np.random.normal(0, 80, n)
        ).astype(int)

        df['date'] = df['date'].dt.strftime('%Y-%m-%d')
        df['bdi'] = df['bdi'].astype(int)

        df.to_csv(csv_path, index=False)
        return df

    # Fallback to existing CSV if raw Koyfin is not found
    if os.path.exists(csv_path) and os.path.getsize(csv_path) > 1000:
        return pd.read_csv(csv_path)

    raise FileNotFoundError(f"Neither {KOYFIN_RAW_PATH} nor {csv_path} was found.")


class MarketDataStorage:
    def __init__(self, data_path: str = None):
        ensure_dirs()
        if data_path:
            self.data_path = data_path
        elif os.path.exists(LIVE_CSV_PATH) and os.path.getsize(LIVE_CSV_PATH) > 1000:
            # Prefer live_market_data.csv — committed to git so Render always has
            # fresh data (through the last local commit) on every cold start.
            self.data_path = LIVE_CSV_PATH
        else:
            self.data_path = CSV_PATH
        self.df = self.load_data()

    def load_data(self) -> pd.DataFrame:
        if not os.path.exists(self.data_path) or os.path.getsize(self.data_path) == 0:
            return generate_base_historical_dataset(CSV_PATH)
        df = pd.read_csv(self.data_path)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').drop_duplicates(subset=['date'], keep='last').reset_index(drop=True)
        return df

    def save_data(self, df: pd.DataFrame, target_path: str = LIVE_CSV_PATH):
        df_to_save = df.copy()
        if 'date' in df_to_save.columns and pd.api.types.is_datetime64_any_dtype(df_to_save['date']):
            df_to_save['date'] = df_to_save['date'].dt.strftime("%Y-%m-%d")
        df_to_save.to_csv(target_path, index=False)
        self.data_path = target_path
        self.df = self.load_data()

    def get_latest_row(self) -> dict:
        if self.df is None or self.df.empty:
            self.df = generate_base_historical_dataset(CSV_PATH)
        return self.df.iloc[-1].to_dict()

    def append_or_update(self, new_rows: list[dict]):
        if not new_rows:
            return self.df
        new_df = pd.DataFrame(new_rows)
        new_df['date'] = pd.to_datetime(new_df['date'])
        combined = pd.concat([self.df, new_df], ignore_index=True)
        combined = combined.sort_values('date').drop_duplicates(subset=['date'], keep='last').reset_index(drop=True)
        self.save_data(combined)
        return self.df
