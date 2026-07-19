from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
import pandas as pd

# ===== INTERNAL IMPORTS (REQUIRED) =====
from backend.ml.data_fetch import fetch_stock_data
from backend.ml.features import calculate_features
from backend.ml.nse500_fetcher import fetch_nse500_symbols, get_nse500_status

# =====================================

app = FastAPI(title="AlphaCross API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to safely convert Series to float
def safe_float(value):
    """Safely convert pandas Series or value to float"""
    if isinstance(value, pd.Series):
        return float(value.iloc[0])
    return float(value)

# ---------- BASIC HEALTH ----------
@app.get("/")
def root():
    return {"status": "OK", "message": "AlphaCross backend alive"}

@app.get("/ping")
def ping():
    return {"pong": True}

# ---------- DATA ----------
@app.get("/data/{symbol}")
def get_stock_data(symbol: str):
    """Get current stock data with technical indicators"""
    try:
        df = fetch_stock_data(symbol)

        if df.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")

        # Calculate features to get EMAs and RSI
        df = calculate_features(df)
        
        if df.empty:
            raise HTTPException(status_code=404, detail=f"Insufficient data to calculate indicators for {symbol}")
            
        latest = df.iloc[-1]
        
        return {
            "symbol": symbol,
            "close": round(safe_float(latest["Close"]), 2),
            "ema20": round(safe_float(latest["EMA_20"]), 2),
            "ema50": round(safe_float(latest["EMA_50"]), 2),
            "rsi": round(safe_float(latest["RSI"]), 2),
            "date": str(latest.name.date())
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_stock_data for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching data for {symbol}: {str(e)}")



# ---------- CHART DATA ----------
@app.get("/chart/{symbol}")
def get_chart_data(symbol: str):
    """Return historical price data for charting"""
    df = fetch_stock_data(symbol, period="6mo")
    
    if df.empty:
        raise HTTPException(status_code=404, detail="No data found")
    
    df = calculate_features(df)
    
    chart_data = []
    for idx, row in df.iterrows():
        chart_data.append({
            "date": str(idx.date()),
            "close": round(safe_float(row["Close"]), 2),
            "ema_20": round(safe_float(row["EMA_20"]), 2),
            "ema_50": round(safe_float(row["EMA_50"]), 2),
            "rsi": round(safe_float(row["RSI"]), 2),
            "volume": int(safe_float(row["Volume"]))
        })
    
    return {"data": chart_data}

# ---------- PREDICTION ----------
@app.get("/predict/{symbol}")
def get_prediction(symbol: str):
    """Get ML prediction for stock"""
    try:
        df = fetch_stock_data(symbol)
        
        if df.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
        
        df = calculate_features(df)
        
        if df.empty:
            raise HTTPException(status_code=404, detail=f"Insufficient data for {symbol}")
            
        latest = df.iloc[-1]
        
        # Simple prediction based on EMA crossover
        ema_20 = safe_float(latest["EMA_20"])
        ema_50 = safe_float(latest["EMA_50"])
        ema_20_slope = safe_float(latest["EMA_20_slope"])
        
        if ema_20 > ema_50 and ema_20_slope > 0:
            prediction = "BULLISH"
            confidence = min(0.85, 0.6 + abs(ema_20_slope) * 10)
        elif ema_20 < ema_50 and ema_20_slope < 0:
            prediction = "BEARISH"
            confidence = min(0.85, 0.6 + abs(ema_20_slope) * 10)
        else:
            prediction = "NEUTRAL"
            confidence = 0.5
        
        return {
            "symbol": symbol,
            "prediction": prediction,
            "confidence": round(confidence, 2),
            "ema_20": round(ema_20, 2),
            "ema_50": round(ema_50, 2),
            "rsi": round(safe_float(latest["RSI"]), 2)
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_prediction for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error predicting {symbol}: {str(e)}")


# ---------- BACKTEST ----------
@app.get("/backtest/{symbol}")
def get_backtest(symbol: str):
    """Run comprehensive backtest on stock"""
    try:
        df = fetch_stock_data(symbol, period="1y")
        
        if df.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
        
        df = calculate_features(df)
        
        if df.empty or len(df) < 100:
            raise HTTPException(status_code=404, detail=f"Insufficient data for backtesting {symbol}")
        
        # Initialize tracking variables
        initial_capital = 100000
        capital = initial_capital
        position = 0
        entry_price = 0
        trades = []
        
        # Simple strategy: Buy when EMA_20 crosses above EMA_50
        for i in range(1, len(df)):
            prev = df.iloc[i-1]
            curr = df.iloc[i]
            
            # Entry signal: EMA 20 crosses above EMA 50
            if prev["EMA_20"] <= prev["EMA_50"] and curr["EMA_20"] > curr["EMA_50"] and position == 0:
                # Buy
                shares = capital // safe_float(curr["Close"])
                if shares > 0:
                    position = shares
                    entry_price = safe_float(curr["Close"])
                    capital -= shares * entry_price
                    
            # Exit signal: EMA 20 crosses below EMA 50
            elif prev["EMA_20"] >= prev["EMA_50"] and curr["EMA_20"] < curr["EMA_50"] and position > 0:
                # Sell
                exit_price = safe_float(curr["Close"])
                capital += position * exit_price
                profit = (exit_price - entry_price) * position
                profit_pct = ((exit_price - entry_price) / entry_price) * 100
                
                trades.append({
                    "stock": symbol,
                    "entry_date": str(df.index[i-1].date()),
                    "exit_date": str(curr.name.date()),
                    "entry_price": round(entry_price, 2),
                    "exit_price": round(exit_price, 2),
                    "profit": round(profit, 2),
                    "profit_pct": round(profit_pct, 2)
                })
                
                position = 0
                entry_price = 0
        
        # Close any open position at the end
        if position > 0:
            exit_price = safe_float(df.iloc[-1]["Close"])
            capital += position * exit_price
            profit = (exit_price - entry_price) * position
            profit_pct = ((exit_price - entry_price) / entry_price) * 100
            
            trades.append({
                "stock": symbol,
                "entry_date": str(df.index[-2].date()),
                "exit_date": str(df.index[-1].date()),
                "entry_price": round(entry_price, 2),
                "exit_price": round(exit_price, 2),
                "profit": round(profit, 2),
                "profit_pct": round(profit_pct, 2)
            })
        
        # Calculate summary statistics
        final_amount = capital
        total_pnl = final_amount - initial_capital
        pnl_pct = (total_pnl / initial_capital) * 100
        
        if not trades:
            # No trades executed
            return {
                "trade_logs": [],
                "summary": {
                    "number_of_trades": 0,
                    "invested_amount": initial_capital,
                    "final_amount": initial_capital,
                    "win_rate_pct": 0,
                    "risk_reward_ratio": 0,
                    "avg_profit_pct": 0,
                    "max_loss_pct": 0,
                    "max_win_pct": 0,
                    "profit_factor": 0,
                    "pnl_pct": 0,
                    "avg_loss_pct": 0,
                    "max_drawdown_pct": 0
                }
            }
        
        winning_trades = [t for t in trades if t["profit"] > 0]
        losing_trades = [t for t in trades if t["profit"] < 0]
        
        win_rate = (len(winning_trades) / len(trades) * 100) if trades else 0
        avg_profit_pct = sum(t["profit_pct"] for t in trades) / len(trades) if trades else 0
        
        max_win = max([t["profit_pct"] for t in trades]) if trades else 0
        max_loss = min([t["profit_pct"] for t in trades]) if trades else 0
        
        avg_win_pct = sum(t["profit_pct"] for t in winning_trades) / len(winning_trades) if winning_trades else 0
        avg_loss_pct = sum(t["profit_pct"] for t in losing_trades) / len(losing_trades) if losing_trades else 0
        
        total_wins = sum(t["profit"] for t in winning_trades)
        total_losses = abs(sum(t["profit"] for t in losing_trades))
        profit_factor = total_wins / total_losses if total_losses > 0 else 0
        
        risk_reward = abs(avg_win_pct / avg_loss_pct) if avg_loss_pct != 0 else 0
        
        # Calculate max drawdown (simplified)
        max_drawdown_pct = abs(max_loss) if trades else 0
        
        return {
            "trade_logs": trades,
            "summary": {
                "number_of_trades": len(trades),
                "invested_amount": initial_capital,
                "final_amount": round(final_amount, 2),
                "win_rate_pct": round(win_rate, 2),
                "risk_reward_ratio": round(risk_reward, 2),
                "avg_profit_pct": round(avg_profit_pct, 2),
                "max_loss_pct": round(max_loss, 2),
                "max_win_pct": round(max_win, 2),
                "profit_factor": round(profit_factor, 2),
                "pnl_pct": round(pnl_pct, 2),
                "avg_loss_pct": round(avg_loss_pct, 2),
                "max_drawdown_pct": round(max_drawdown_pct, 2)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_backtest for {symbol}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error backtesting {symbol}: {str(e)}")

# ---------- STOCKS LIST ----------
@app.get("/stocks")
def get_stocks():
    """Get list of available stocks"""
    stocks = fetch_nse500_symbols()
    return {"stocks": stocks[:50]}

# ---------- SEARCH STOCKS ----------
@app.get("/stocks/search")
def search_stocks(q: str):
    """Search for stocks by symbol or name"""
    stocks = fetch_nse500_symbols()
    q_lower = q.lower()
    
    results = [
        stock for stock in stocks
        if q_lower in stock["Symbol"].lower() or q_lower in stock.get("Industry", "").lower()
    ]
    
    return {"results": results[:20]}

# ---------- SUMMARY ----------
@app.get("/summary/{symbol}")
def get_summary(symbol: str):
    """Get AI-generated summary for stock"""
    df = fetch_stock_data(symbol)
    
    if df.empty:
        raise HTTPException(status_code=404, detail="No data found")
    
    df = calculate_features(df)
    latest = df.iloc[-1]
    
    ema_20 = safe_float(latest["EMA_20"])
    ema_50 = safe_float(latest["EMA_50"])
    rsi = safe_float(latest["RSI"])
    
    trend = "upward" if ema_20 > ema_50 else "downward"
    rsi_status = "overbought" if rsi > 70 else "oversold" if rsi < 30 else "neutral"
    
    summary = f"{symbol} is currently in a {trend} trend with RSI indicating {rsi_status} conditions. "
    summary += f"The 20-day EMA is {'above' if ema_20 > ema_50 else 'below'} the 50-day EMA."
    
    return {
        "symbol": symbol,
        "summary": summary,
        "trend": trend,
        "rsi_status": rsi_status
    }

# ---------- SENTIMENT ----------
@app.get("/sentiment/{symbol}")
def get_sentiment(symbol: str):
    """Get sentiment analysis (placeholder)"""
    return {
        "symbol": symbol,
        "sentiment": "NEUTRAL",
        "score": 0.5,
        "sources": 0,
        "message": "Sentiment analysis not yet implemented"
    }

# ---------- TOP MOVERS ----------
@app.get("/top-movers")
def get_top_movers():
    """Get top gaining and losing stocks from a curated list"""
    try:
        # Use a curated list of liquid stocks for faster processing
        popular_stocks = [
            {"Symbol": "RELIANCE", "Industry": "Energy"},
            {"Symbol": "TCS", "Industry": "IT"},
            {"Symbol": "INFY", "Industry": "IT"},
            {"Symbol": "HDFCBANK", "Industry": "Banking"},
            {"Symbol": "ICICIBANK", "Industry": "Banking"},
            {"Symbol": "SBIN", "Industry": "Banking"},
            {"Symbol": "BHARTIARTL", "Industry": "Telecom"},
            {"Symbol": "ITC", "Industry": "FMCG"},
            {"Symbol": "KOTAKBANK", "Industry": "Banking"},
            {"Symbol": "LT", "Industry": "Construction"},
            {"Symbol": "HINDUNILVR", "Industry": "FMCG"},
            {"Symbol": "AXISBANK", "Industry": "Banking"},
            {"Symbol": "BAJFINANCE", "Industry": "Financial Services"},
            {"Symbol": "WIPRO", "Industry": "IT"},
            {"Symbol": "ASIANPAINT", "Industry": "Paints"},
            {"Symbol": "MARUTI", "Industry": "Automobile"},
            {"Symbol": "TITAN", "Industry": "Consumer Goods"},
            {"Symbol": "SUNPHARMA", "Industry": "Pharma"},
            {"Symbol": "ULTRACEMCO", "Industry": "Cement"},
            {"Symbol": "TATAMOTORS", "Industry": "Automobile"}
        ]
        
        movers = []
        
        def get_change(stock):
            try:
                df = fetch_stock_data(stock["Symbol"], period="5d")
                if df.empty or len(df) < 2:
                    return None
                    
                # Get last 2 days for daily change
                close_today = safe_float(df['Close'].iloc[-1])
                close_yesterday = safe_float(df['Close'].iloc[-2])
                change = ((close_today - close_yesterday) / close_yesterday) * 100
                
                return {
                    "symbol": stock["Symbol"],
                    "sector": stock.get("Industry", "Unknown"),
                    "change": round(change, 2),
                    "price": round(close_today, 2)
                }
            except Exception as e:
                print(f"Error getting change for {stock['Symbol']}: {str(e)}")
                return None
        
        # Process stocks with threading
        with ThreadPoolExecutor(max_workers=10) as executor:
            results = list(executor.map(get_change, popular_stocks))
        
        # Filter out None results
        movers = [r for r in results if r is not None]
        
        if not movers:
            return {
                "gainers": [],
                "losers": [],
                "message": "Unable to fetch market movers at this time"
            }
        
        # Sort by change
        movers.sort(key=lambda x: x["change"], reverse=True)
        
        # Get top 5 gainers and losers
        gainers = movers[:5]
        losers = movers[-5:]
        losers.reverse()  # Show worst first
        
        return {
            "gainers": gainers,
            "losers": losers,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Error in get_top_movers: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "gainers": [],
            "losers": [],
            "error": str(e)
        }

# ---------- CHAT ----------
@app.post("/chat")
def chat(request: Dict[str, Any]):
    """Simple chat endpoint"""
    symbol = request.get("symbol", "")
    query = request.get("query", "")
    
    response = f"I understand you're asking about {symbol}: '{query}'. "
    response += "This is a placeholder response. Full AI chat functionality coming soon!"
    
    return {
        "response": response,
        "symbol": symbol
    }

# ---------- NSE 500 ----------
@app.get("/nse500/status")
def nse500_status():
    return get_nse500_status()

@app.get("/nse500/list")
def nse500_list():
    return {"stocks": fetch_nse500_symbols()}

# ---------- UNIVERSE SCREEN ----------
@app.post("/screen/universe")
def screen_universe(config: Dict[str, Any]):
    """Screen the entire NSE 500 universe"""
    stocks = fetch_nse500_symbols()
    limit = config.get("max_stocks", 500)  # Default to full NSE 500
    stocks = stocks[:limit]
    
    print(f"Screening {len(stocks)} stocks...")  # Debug log

    results = {
        "bullish": [],
        "bearish": [],
        "neutral": []
    }

    def process(stock):
        try:
            symbol = stock["Symbol"]
            print(f"Processing {symbol}...")  # Debug log
            df = fetch_stock_data(symbol, period="3mo")  # Use shorter period for speed

            if df.empty or len(df) < 60:  # Need at least 60 days for EMA 50
                return None

            df = calculate_features(df)
            latest = df.iloc[-1]
            
            ema_20 = safe_float(latest["EMA_20"])
            ema_50 = safe_float(latest["EMA_50"])

            if ema_20 > ema_50:
                signal = "bullish"
            elif ema_20 < ema_50:
                signal = "bearish"
            else:
                signal = "neutral"

            return {
                "symbol": symbol,
                "sector": stock.get("Industry", "Unknown"),
                "signal": signal,
                "ema_20": round(ema_20, 2),
                "ema_50": round(ema_50, 2),
                "close": round(safe_float(latest["Close"]), 2)
            }
        except Exception as e:
            print(f"Error processing {stock['Symbol']}: {str(e)}")  # Debug log
            return None

    # Process stocks with threading
    with ThreadPoolExecutor(max_workers=20) as executor:  # Increased workers
        processed = list(executor.map(process, stocks))

    # Filter out None results and categorize
    for item in processed:
        if item:
            results[item["signal"]].append({
                "symbol": item["symbol"],
                "sector": item["sector"],
                "ema_20": item["ema_20"],
                "ema_50": item["ema_50"],
                "close": item["close"]
            })

    print(f"Screening complete: {len(results['bullish'])} bullish, {len(results['bearish'])} bearish, {len(results['neutral'])} neutral")

    return {
        "bullish": results["bullish"],
        "bearish": results["bearish"],
        "neutral": results["neutral"],
        "counts": {
            "bullish": len(results["bullish"]),
            "bearish": len(results["bearish"]),
            "neutral": len(results["neutral"])
        },
        "timestamp": datetime.now().isoformat()
    }

# ---------- UNIVERSE BACKTEST ----------
@app.post("/backtest/universe")
def backtest_universe(config: Dict[str, Any]):
    """Run backtest across multiple stocks in the universe"""
    try:
        stocks = fetch_nse500_symbols()
        max_stocks = config.get("max_stocks", 100)
        initial_capital = config.get("initial_capital", 100000)
        position_size = config.get("position_size", 0.1)  # 10% per position
        stop_loss = config.get("stop_loss", 0.05)  # 5% stop loss
        take_profit = config.get("take_profit", 0.15)  # 15% take profit
        
        # Limit stocks to test
        stocks = stocks[:max_stocks]
        print(f"Starting universe backtest on {len(stocks)} stocks...")
        
        all_trades = []
        total_capital = initial_capital
        active_positions = {}
        
        def backtest_single_stock(stock):
            """Backtest a single stock"""
            try:
                symbol = stock["Symbol"]
                df = fetch_stock_data(symbol, period="6mo")  # Use 6 months for faster processing
                
                if df.empty or len(df) < 60:
                    return None
                
                df = calculate_features(df)
                
                if df.empty:
                    return None
                
                trades = []
                position = None
                
                for i in range(1, len(df)):
                    prev = df.iloc[i-1]
                    curr = df.iloc[i]
                    
                    # Entry: EMA 20 crosses above EMA 50
                    if prev["EMA_20"] <= prev["EMA_50"] and curr["EMA_20"] > curr["EMA_50"] and position is None:
                        entry_price = safe_float(curr["Close"])
                        position = {
                            "entry_date": curr.name,
                            "entry_price": entry_price,
                            "symbol": symbol
                        }
                    
                    # Exit conditions
                    elif position is not None:
                        current_price = safe_float(curr["Close"])
                        entry_price = position["entry_price"]
                        pnl_pct = ((current_price - entry_price) / entry_price)
                        
                        # Exit on: crossover, stop loss, or take profit
                        exit_signal = (
                            (prev["EMA_20"] >= prev["EMA_50"] and curr["EMA_20"] < curr["EMA_50"]) or  # Crossover
                            (pnl_pct <= -stop_loss) or  # Stop loss
                            (pnl_pct >= take_profit)  # Take profit
                        )
                        
                        if exit_signal:
                            exit_price = current_price
                            profit_pct = ((exit_price - entry_price) / entry_price) * 100
                            
                            trades.append({
                                "symbol": symbol,
                                "entry_date": str(position["entry_date"].date()),
                                "exit_date": str(curr.name.date()),
                                "entry_price": round(entry_price, 2),
                                "exit_price": round(exit_price, 2),
                                "profit_pct": round(profit_pct, 2),
                                "sector": stock.get("Industry", "Unknown")
                            })
                            
                            position = None
                
                return {
                    "symbol": symbol,
                    "trades": trades,
                    "sector": stock.get("Industry", "Unknown")
                }
                
            except Exception as e:
                print(f"Error backtesting {stock['Symbol']}: {str(e)}")
                return None
        
        # Run backtests in parallel
        with ThreadPoolExecutor(max_workers=10) as executor:
            results = list(executor.map(backtest_single_stock, stocks))
        
        # Collect all trades
        for result in results:
            if result and result["trades"]:
                all_trades.extend(result["trades"])
        
        # Calculate portfolio metrics
        if not all_trades:
            return {
                "status": "completed",
                "message": "No trades generated. Try different parameters or more stocks.",
                "total_trades": 0,
                "win_rate": 0,
                "total_return": 0,
                "final_capital": initial_capital,
                "stocks_tested": len(stocks),
                "trade_details": []
            }
        
        # Calculate returns
        winning_trades = [t for t in all_trades if t["profit_pct"] > 0]
        losing_trades = [t for t in all_trades if t["profit_pct"] < 0]
        
        win_rate = (len(winning_trades) / len(all_trades) * 100) if all_trades else 0
        
        # Simulate portfolio returns
        # Each trade uses position_size of capital
        total_pnl = 0
        for trade in all_trades:
            trade_amount = initial_capital * position_size
            trade_pnl = trade_amount * (trade["profit_pct"] / 100)
            total_pnl += trade_pnl
        
        final_capital = initial_capital + total_pnl
        total_return = (total_pnl / initial_capital) * 100
        
        avg_win = sum(t["profit_pct"] for t in winning_trades) / len(winning_trades) if winning_trades else 0
        avg_loss = sum(t["profit_pct"] for t in losing_trades) / len(losing_trades) if losing_trades else 0
        
        # Best and worst trades
        best_trade = max(all_trades, key=lambda x: x["profit_pct"]) if all_trades else None
        worst_trade = min(all_trades, key=lambda x: x["profit_pct"]) if all_trades else None
        
        # Sector performance
        sector_performance = {}
        for trade in all_trades:
            sector = trade["sector"]
            if sector not in sector_performance:
                sector_performance[sector] = {"trades": 0, "total_pnl": 0}
            sector_performance[sector]["trades"] += 1
            sector_performance[sector]["total_pnl"] += trade["profit_pct"]
        
        top_sectors = sorted(
            [{"sector": k, "avg_return": v["total_pnl"]/v["trades"], "trades": v["trades"]} 
             for k, v in sector_performance.items()],
            key=lambda x: x["avg_return"],
            reverse=True
        )[:5]
        
        return {
            "status": "success",
            "message": f"Successfully backtested {len(stocks)} stocks",
            "total_trades": len(all_trades),
            "win_rate": round(win_rate, 2),
            "total_return": round(total_return, 2),
            "final_capital": round(final_capital, 2),
            "initial_capital": initial_capital,
            "stocks_tested": len(stocks),
            "winning_trades": len(winning_trades),
            "losing_trades": len(losing_trades),
            "avg_win": round(avg_win, 2),
            "avg_loss": round(avg_loss, 2),
            "best_trade": {
                "symbol": best_trade["symbol"],
                "profit_pct": best_trade["profit_pct"]
            } if best_trade else None,
            "worst_trade": {
                "symbol": worst_trade["symbol"],
                "profit_pct": worst_trade["profit_pct"]
            } if worst_trade else None,
            "top_sectors": top_sectors,
            "trade_details": sorted(all_trades, key=lambda x: x["profit_pct"], reverse=True)[:20]  # Top 20 trades
        }
        
    except Exception as e:
        print(f"Error in universe backtest: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": f"Error running backtest: {str(e)}",
            "total_trades": 0,
            "win_rate": 0,
            "total_return": 0,
            "final_capital": 0
        }