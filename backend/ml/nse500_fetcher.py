import requests
import pandas as pd
import io
from functools import lru_cache

NSE_500_URL = "https://www.niftyindices.com/IndexConstituent/ind_nifty500list.csv"

# Minimal fallback (only if network fails)
FALLBACK = [
    {"Symbol": "RELIANCE", "Industry": "Energy"},
    {"Symbol": "TCS", "Industry": "IT"},
    {"Symbol": "INFY", "Industry": "IT"},
    {"Symbol": "HDFCBANK", "Industry": "Banking"},
]

@lru_cache(maxsize=1)
def fetch_nse500_symbols():
    """
    Fetch official Nifty 500 constituents from Nifty Indices.
    """
    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    try:
        r = requests.get(NSE_500_URL, headers=headers, timeout=10)
        r.raise_for_status()

        df = pd.read_csv(io.StringIO(r.text))

        if "Symbol" not in df.columns:
            raise ValueError("Invalid CSV format")

        return df[["Symbol", "Industry"]].to_dict("records")

    except Exception:
        return FALLBACK


def get_nse500_status():
    stocks = fetch_nse500_symbols()
    return {
        "source": "niftyindices.com (official)",
        "count": len(stocks),
        "sample": stocks[:5]
    }
