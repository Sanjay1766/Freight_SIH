import numpy as np
import pandas as pd

FEATURE_COLUMNS = [
    "lag_1", "lag_3", "lag_7", "lag_14", "lag_30",
    "rolling_mean_7", "rolling_mean_14", "rolling_mean_30",
    "rolling_vol_7", "rolling_vol_30",
    "mti_india", "mti_ma7", "mti_momentum_7",
    "bunker_fuel", "bunker_pct_change_7",
    "coal_index", "coal_pct_change_14",
    "indo_coal_index",
    "dxy", "dxy_delta_7",
    "bci_bdi_ratio", "bpi_bdi_ratio",
    "sin_day_of_year", "cos_day_of_year",
    "is_monsoon_season", "is_prewinter_restocking"
]

class FeatureEngineeringPipeline:
    def __init__(self):
        pass

    def compute_features(self, df: pd.DataFrame) -> pd.DataFrame:
        df_feat = df.copy()
        if not pd.api.types.is_datetime64_any_dtype(df_feat['date']):
            df_feat['date'] = pd.to_datetime(df_feat['date'])
        df_feat = df_feat.sort_values('date').reset_index(drop=True)

        df_feat['spot_log_return'] = np.log(df_feat['spot_freight_rate'] / df_feat['spot_freight_rate'].shift(1))
        df_feat['bdi_log_return'] = np.log(df_feat['bdi'] / df_feat['bdi'].shift(1))

        df_feat['lag_1'] = df_feat['spot_freight_rate'].shift(1)
        df_feat['lag_3'] = df_feat['spot_freight_rate'].shift(3)
        df_feat['lag_7'] = df_feat['spot_freight_rate'].shift(7)
        df_feat['lag_14'] = df_feat['spot_freight_rate'].shift(14)
        df_feat['lag_30'] = df_feat['spot_freight_rate'].shift(30)

        df_feat['rolling_mean_7'] = df_feat['spot_freight_rate'].shift(1).rolling(7).mean()
        df_feat['rolling_mean_14'] = df_feat['spot_freight_rate'].shift(1).rolling(14).mean()
        df_feat['rolling_mean_30'] = df_feat['spot_freight_rate'].shift(1).rolling(30).mean()

        df_feat['rolling_vol_7'] = df_feat['spot_log_return'].shift(1).rolling(7).std() * np.sqrt(365)
        df_feat['rolling_vol_30'] = df_feat['spot_log_return'].shift(1).rolling(30).std() * np.sqrt(365)

        df_feat['mti_ma7'] = df_feat['mti_india'].rolling(7).mean()
        df_feat['mti_momentum_7'] = df_feat['mti_india'] - df_feat['mti_india'].shift(7)

        df_feat['bunker_pct_change_7'] = df_feat['bunker_fuel'].pct_change(7)
        df_feat['coal_pct_change_14'] = df_feat['coal_index'].pct_change(14)
        df_feat['dxy_delta_7'] = df_feat['dxy'] - df_feat['dxy'].shift(7)

        df_feat['bci_bdi_ratio'] = df_feat['bci'] / np.maximum(df_feat['bdi'], 1.0)
        df_feat['bpi_bdi_ratio'] = df_feat['bpi'] / np.maximum(df_feat['bdi'], 1.0)

        day_of_year = df_feat['date'].dt.dayofyear
        month = df_feat['date'].dt.month

        df_feat['sin_day_of_year'] = np.sin(2 * np.pi * day_of_year / 365.25)
        df_feat['cos_day_of_year'] = np.cos(2 * np.pi * day_of_year / 365.25)

        df_feat['is_monsoon_season'] = month.isin([6, 7, 8, 9]).astype(int)
        df_feat['is_prewinter_restocking'] = month.isin([10, 11, 12]).astype(int)

        # Do not backfill time-series features: it leaks future observations into
        # the beginning of the history. Invalid warm-up rows are removed below.
        df_feat = df_feat.ffill()
        return df_feat

    def build_training_matrix(self, df_feat: pd.DataFrame):
        # Predict the next day's rate, not the rate from the same observation.
        # This makes the chronological holdout a genuine one-step-ahead test.
        valid_df = df_feat.iloc[30:].copy().reset_index(drop=True)
        X = valid_df[FEATURE_COLUMNS].iloc[:-1].reset_index(drop=True)
        y = valid_df['spot_freight_rate'].shift(-1).iloc[:-1].reset_index(drop=True)
        valid_df = valid_df.iloc[:-1].reset_index(drop=True)
        return X, y, valid_df

