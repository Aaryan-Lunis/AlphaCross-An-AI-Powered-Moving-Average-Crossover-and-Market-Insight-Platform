import pandas as pd
import numpy as np

class StrategyEngine:
    @staticmethod
    def calculate_ma(df, period, ma_type):
        """Calculates dynamic MA types: SMA, EMA, or WMA."""
        if ma_type == "SMA":
            return df['Close'].rolling(window=period).mean()
        elif ma_type == "EMA":
            return df['Close'].ewm(span=period, adjust=False).mean()
        elif ma_type == "WMA":
            weights = np.arange(1, period + 1)
            return df['Close'].rolling(period).apply(lambda x: np.dot(x, weights) / weights.sum(), raw=True)
        return None

    @classmethod
    def generate_signals(cls, df: pd.DataFrame, config: dict):
        """
        Implements true crossover detection with .shift(1).
        Defensive: Returns empty signals if lookback data is insufficient.
        """
        # 3. Defensive Validation: Ensure enough data for the longest MA
        if len(df) < config['long_period']:
            return pd.DataFrame()

        df = df.copy()
        ma_type = config['ma_type']
        
        # Calculate Averages
        df['ma_fast'] = cls.calculate_ma(df, config['short_period'], ma_type)
        df['ma_slow'] = cls.calculate_ma(df, config['long_period'], ma_type)
        if config['strategy_type'] == 'triple':
            df['ma_mid'] = cls.calculate_ma(df, config['medium_period'], ma_type)

        # 3. Defensive: Drop rows where calculations failed
        df = df.dropna(subset=['ma_fast', 'ma_slow'])

        # Crossover Detection: Entry/Exit trigger only when state changes
        if config['strategy_type'] == "single":
            curr_above = df['Close'] > df['ma_fast']
            # .shift(1) ensures we trigger only on the 'cross' event, not persistent state
            df['entry_signal'] = curr_above & ~curr_above.shift(1).fillna(False)
            df['exit_signal'] = ~curr_above & curr_above.shift(1).fillna(False)
        
        elif config['strategy_type'] == "double":
            curr_cross = df['ma_fast'] > df['ma_slow']
            df['entry_signal'] = curr_cross & ~curr_cross.shift(1).fillna(False)
            df['exit_signal'] = ~curr_cross & curr_cross.shift(1).fillna(False)
            
        elif config['strategy_type'] == "triple":
            curr_order = (df['ma_fast'] > df['ma_mid']) & (df['ma_mid'] > df['ma_slow'])
            df['entry_signal'] = curr_order & ~curr_order.shift(1).fillna(False)
            df['exit_signal'] = ~curr_order & curr_order.shift(1).fillna(False)
            
        return df