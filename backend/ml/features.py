import pandas as pd
import numpy as np
from ta.momentum import RSIIndicator

def calculate_features(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate EMAs, RSI, slopes, returns"""
    df = df.copy()
    
    # EMAs
    df['EMA_20'] = df['Close'].ewm(span=20, adjust=False).mean()
    df['EMA_50'] = df['Close'].ewm(span=50, adjust=False).mean()
    
    # EMA slopes (rate of change) - use smaller window
    df['EMA_20_slope'] = df['EMA_20'].diff(3) / df['EMA_20'].shift(3)
    df['EMA_50_slope'] = df['EMA_50'].diff(3) / df['EMA_50'].shift(3)
    
    # RSI
    rsi = RSIIndicator(close=df['Close'], window=14)
    df['RSI'] = rsi.rsi()
    
    # Returns and volatility
    df['Returns'] = df['Close'].pct_change()
    df['Volatility'] = df['Returns'].rolling(window=10).std()  # Reduced window
    
    # Crossover signal for labeling
    df['Signal'] = 0
    df.loc[df['EMA_20'] > df['EMA_50'], 'Signal'] = 1  # Bullish
    df.loc[df['EMA_20'] < df['EMA_50'], 'Signal'] = -1  # Bearish
    
    # Label: upcoming crossover (2 days ahead instead of 3)
    df['Target'] = df['Signal'].shift(-2)
    
    # Drop rows with NaN values
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.dropna()
    
    print(f"Features calculated. Rows after cleanup: {len(df)}")
    
    return df