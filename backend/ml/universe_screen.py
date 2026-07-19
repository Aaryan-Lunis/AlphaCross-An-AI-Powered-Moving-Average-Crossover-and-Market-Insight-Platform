from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

from backend.ml.data_fetch import fetch_stock_data
from backend.ml.features import calculate_features
from backend.ml.nse500_fetcher import fetch_nse500_symbols


def screen_universe(
    ma_type="EMA",
    short_period=20,
    long_period=50,
    max_stocks=50,
    max_workers=8
):
    stocks = fetch_nse500_symbols()[:max_stocks]

    bullish, bearish, neutral = [], [], []

    def process(stock):
        symbol = stock["Symbol"]
        sector = stock.get("Industry", "Unknown")

        try:
            df = fetch_stock_data(symbol)
            if df is None or len(df) < 30:
                return None

            df = calculate_features(
                df,
                ma_type=ma_type,
                short_period=short_period,
                long_period=long_period
            )

            latest = df.iloc[-1]

            if latest["EMA_20"] > latest["EMA_50"]:
                bullish.append({"symbol": symbol, "sector": sector})
            elif latest["EMA_20"] < latest["EMA_50"]:
                bearish.append({"symbol": symbol, "sector": sector})
            else:
                neutral.append({"symbol": symbol, "sector": sector})

        except:
            return None

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        executor.map(process, stocks)

    return {
        "bullish": bullish,
        "bearish": bearish,
        "neutral": neutral,
        "counts": {
            "bullish": len(bullish),
            "bearish": len(bearish),
            "neutral": len(neutral),
        },
        "timestamp": datetime.now().isoformat()
    }
