import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

def fetch_stock_data(symbol: str, period: str = "3mo") -> pd.DataFrame:
    """
    Fetch NSE stock data using yfinance
    Uses last 3 months of historical data with end-of-day closing prices (3:30 PM)
    
    Requirements:
    - Last 3 months of historical stock data
    - NSE 500 stocks
    - End-of-day closing prices (3:30 PM) - yfinance provides daily closing prices
    - Daily timeframe (not minute/hour)
    """
    # Add .NS suffix for NSE stocks
    ticker = f"{symbol}.NS"
    
    try:
        stock = yf.Ticker(ticker)
        # Use 3 months as per requirements
        df = stock.history(period="3mo")
        
        if df.empty:
            raise ValueError(f"No data found for {symbol}")
        
        # Keep only essential columns (Close and Volume)
        # Close price represents end-of-day closing price at 3:30 PM
        # yfinance daily data provides closing prices for the trading day
        df = df[['Close', 'Volume']].copy()
        df.dropna(inplace=True)
        
        print(f"Fetched {len(df)} days of data for {symbol} (3 months, EOD closing prices)")
        return df
    
    except Exception as e:
        raise Exception(f"Error fetching data for {symbol}: {str(e)}")
