import yfinance as yf
import pandas as pd
import time

def fetch_stock_data(symbol: str, period: str = "1y", retries: int = 3) -> pd.DataFrame:
    """
    Fetch NSE stock data safely using yfinance with retry logic.
    """
    ticker = symbol if symbol.endswith(".NS") else f"{symbol}.NS"
    
    for attempt in range(retries):
        try:
            # Use Ticker object instead of download for better reliability
            stock = yf.Ticker(ticker)
            df = stock.history(period=period)
            
            if df is None or df.empty:
                if attempt < retries - 1:
                    time.sleep(1)  # Wait before retry
                    continue
                return pd.DataFrame()
            
            # Flatten MultiIndex columns if they exist
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)
            
            # Ensure we have the required columns
            required_cols = ['Open', 'High', 'Low', 'Close', 'Volume']
            if not all(col in df.columns for col in required_cols):
                if attempt < retries - 1:
                    time.sleep(1)
                    continue
                return pd.DataFrame()
            
            df = df[required_cols]
            df = df.dropna()
            
            return df
            
        except KeyError as e:
            # Handle yfinance internal KeyError
            if attempt < retries - 1:
                print(f"KeyError for {ticker}, retrying... (attempt {attempt + 1}/{retries})")
                time.sleep(1)
                continue
            else:
                print(f"Failed to fetch {ticker} after {retries} attempts: {str(e)}")
                return pd.DataFrame()
                
        except Exception as e:
            if attempt < retries - 1:
                print(f"Error fetching {ticker}, retrying... (attempt {attempt + 1}/{retries}): {str(e)}")
                time.sleep(1)
                continue
            else:
                print(f"Failed to fetch {ticker} after {retries} attempts: {str(e)}")
                return pd.DataFrame()
    
    return pd.DataFrame()