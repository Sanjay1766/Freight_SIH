import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
PRELOADED_DIR = os.path.join(DATA_DIR, "preloaded")
CSV_PATH = os.path.join(PRELOADED_DIR, "historical_market_data.csv")
LIVE_CSV_PATH = os.path.join(DATA_DIR, "live_market_data.csv")

def ensure_dirs():
    os.makedirs(PRELOADED_DIR, exist_ok=True)

def generate_base_historical_dataset(csv_path: str = CSV_PATH):
    ensure_dirs()
    if os.path.exists(csv_path) and os.path.getsize(csv_path) > 1000:
        return pd.read_csv(csv_path)

    start_date = datetime(2024, 1, 1)
    end_date = datetime(2026, 8, 28)
    num_days = (end_date - start_date).days + 1

    np.random.seed(42)
    t = np.arange(num_days)
    
    day_of_year = np.array([(start_date + timedelta(days=int(i))).timetuple().tm_yday for i in t])
    annual_cycle = np.sin((day_of_year - 80) / 365.25 * 2 * np.pi)
    monsoon_dip = -np.exp(-((day_of_year - 200) ** 2) / (2 * (25 ** 2))) * 250
    q4_rally = np.exp(-((day_of_year - 320) ** 2) / (2 * (30 ** 2))) * 350

    bdi_innovations = np.random.normal(0, 25, num_days)
    bdi_series = np.zeros(num_days)
    bdi_series[0] = 2085.0
    for i in range(1, num_days):
        mean_rev = 0.015 * (1850.0 + annual_cycle[i] * 300 + monsoon_dip[i] + q4_rally[i] - bdi_series[i - 1])
        bdi_series[i] = max(950.0, min(3850.0, bdi_series[i - 1] + mean_rev + bdi_innovations[i]))

    bci_series = np.round(bdi_series * 1.38 + np.random.normal(0, 45, num_days))
    bpi_series = np.round(bdi_series * 0.94 + np.random.normal(0, 25, num_days))
    bsi_series = np.round(bdi_series * 0.78 + np.random.normal(0, 18, num_days))

    bunker_innovations = np.random.normal(0, 4.5, num_days)
    bunker_series = np.zeros(num_days)
    bunker_series[0] = 635.0
    for i in range(1, num_days):
        mean_rev = 0.02 * (625.0 + np.sin(i / 60.0) * 40.0 - bunker_series[i - 1])
        bunker_series[i] = max(480.0, min(820.0, bunker_series[i - 1] + mean_rev + bunker_innovations[i]))

    coal_innovations = np.random.normal(0, 1.2, num_days)
    coal_series = np.zeros(num_days)
    coal_series[0] = 138.0
    for i in range(1, num_days):
        mean_rev = 0.015 * (135.0 + annual_cycle[i] * 12.0 - coal_series[i - 1])
        coal_series[i] = max(95.0, min(190.0, coal_series[i - 1] + mean_rev + coal_innovations[i]))

    indo_coal_series = np.round(coal_series * 0.42 + np.random.normal(0, 0.4, num_days), 2)

    dxy_innovations = np.random.normal(0, 0.25, num_days)
    dxy_series = np.zeros(num_days)
    dxy_series[0] = 104.2
    for i in range(1, num_days):
        mean_rev = 0.02 * (103.8 - dxy_series[i - 1])
        dxy_series[i] = max(98.5, min(108.5, dxy_series[i - 1] + mean_rev + dxy_innovations[i]))

    base_daily_volume = 720000.0
    volume_cycle = np.sin((day_of_year - 60) / 365.25 * 2 * np.pi) * 95000.0
    volume_innovations = np.random.normal(0, 15000, num_days)
    seaborne_volume = np.round(base_daily_volume + volume_cycle + volume_innovations)

    fleet_dwt = 12500000.0
    mti_india = np.round((seaborne_volume / fleet_dwt) * (bunker_series / 100.0) * 0.85, 3)
    spot_rate = np.round(bdi_series * 9.85 + mti_india * 4350.0 + (bunker_series - 600.0) * 13.5 + np.random.normal(0, 120, num_days))

    dates = [(start_date + timedelta(days=int(i))).strftime("%Y-%m-%d") for i in t]

    df = pd.DataFrame({
        "date": dates,
        "bdi": np.round(bdi_series).astype(int),
        "bci": bci_series.astype(int),
        "bpi": bpi_series.astype(int),
        "bsi": bsi_series.astype(int),
        "bunker_fuel": np.round(bunker_series, 2),
        "coal_index": np.round(coal_series, 2),
        "indo_coal_index": indo_coal_series,
        "dxy": np.round(dxy_series, 2),
        "seaborne_volume": seaborne_volume.astype(int),
        "mti_india": mti_india,
        "spot_freight_rate": spot_rate.astype(int)
    })

    df.to_csv(csv_path, index=False)
    return df

class MarketDataStorage:
    def __init__(self, data_path: str = None):
        ensure_dirs()
        self.data_path = data_path or (LIVE_CSV_PATH if os.path.exists(LIVE_CSV_PATH) else CSV_PATH)
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

