from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
import uvicorn
import traceback

from ml.data_fetch import fetch_stock_data
from ml.features import calculate_features
from ml.model_xgb import train_and_predict
from ml.backtest import run_backtest
from ml.stocks_list import get_popular_stocks, search_stocks
from ai.chat import get_chat_response

app = FastAPI(title="AlphaCross API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    symbol: str
    query: str
    context: Optional[Dict[str, Any]] = {}
    conversation_history: Optional[List[Dict[str, str]]] = []

@app.get("/")
def root():
    return {"message": "AlphaCross API is running"}

@app.get("/stocks")
def get_stocks():
    """Get list of popular NSE stocks"""
    return {"stocks": get_popular_stocks()}

@app.get("/stocks/search")
def search_stocks_endpoint(q: str = ""):
    """Search stocks by query"""
    if not q:
        return {"stocks": get_popular_stocks()}
    return {"stocks": search_stocks(q)}

@app.get("/data/{symbol}")
def get_data(symbol: str):
    """Fetch stock data and compute EMAs, RSI"""
    try:
        print(f"Fetching data for {symbol}...")
        df = fetch_stock_data(symbol)
        print(f"Data fetched: {len(df)} rows")
        
        df = calculate_features(df)
        print(f"Features calculated: {len(df)} rows after cleanup")
        
        if df.empty:
            raise HTTPException(status_code=404, detail="No data available after processing")
        
        latest = df.iloc[-1]
        return {
            "symbol": symbol,
            "close": round(float(latest['Close']), 2),
            "ema20": round(float(latest['EMA_20']), 2),
            "ema50": round(float(latest['EMA_50']), 2),
            "rsi": round(float(latest['RSI']), 2),
            "date": str(latest.name.date())
        }
    except Exception as e:
        print(f"Error in /data/{symbol}: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chart/{symbol}")
def get_chart_data(symbol: str):
    """Fetch historical chart data for visualization"""
    try:
        df = fetch_stock_data(symbol)
        df = calculate_features(df)
        
        if df.empty:
            raise HTTPException(status_code=404, detail="No data available")
        
        # Return last 3 months of data (approximately 60-65 trading days)
        df_recent = df.tail(65)
        
        chart_data = []
        for idx, row in df_recent.iterrows():
            chart_data.append({
                "date": idx.strftime('%d-%b') if hasattr(idx, 'strftime') else str(idx),
                "close": round(float(row['Close']), 2),
                "ema20": round(float(row['EMA_20']), 2),
                "ema50": round(float(row['EMA_50']), 2)
            })
        
        return {"symbol": symbol, "data": chart_data}
    except Exception as e:
        print(f"Error in /chart/{symbol}: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/predict/{symbol}")
def predict(symbol: str):
    """Train XGBoost and predict crossover"""
    try:
        print(f"Predicting for {symbol}...")
        df = fetch_stock_data(symbol)
        print(f"Data fetched: {len(df)} rows")
        
        df = calculate_features(df)
        print(f"Features calculated: {len(df)} rows after cleanup")
        
        if len(df) < 30:
            raise HTTPException(status_code=400, detail=f"Not enough data for prediction. Have {len(df)} rows, need at least 30")
        
        print(f"Starting prediction with {len(df)} rows...")
        prediction, confidence = train_and_predict(df)
        print(f"Prediction complete: {prediction}, confidence: {confidence}")
        
        latest = df.iloc[-1]
        
        signal_map = {1: "Bullish", -1: "Bearish", 0: "Neutral"}
        
        return {
            "symbol": symbol,
            "prediction": signal_map.get(prediction, "Neutral"),
            "confidence": round(float(confidence), 2),
            "ema20": round(float(latest['EMA_20']), 2),
            "ema50": round(float(latest['EMA_50']), 2),
            "rsi": round(float(latest['RSI']), 2)
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in /predict/{symbol}: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/backtest/{symbol}")
def backtest(symbol: str):
    """Run simple backtest on historical data"""
    try:
        df = fetch_stock_data(symbol)
        df = calculate_features(df)
        
        results = run_backtest(df, symbol)
        return results
    except Exception as e:
        print(f"Error in /backtest/{symbol}: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
def chat(request: ChatRequest):
    """Context-aware GenAI chatbot endpoint with conversation history"""
    try:
        # Ensure context is a dict, not None
        context = request.context if request.context is not None else {}
        conversation_history = request.conversation_history if request.conversation_history else []
        
        response = get_chat_response(
            symbol=request.symbol,
            query=request.query,
            context=context,
            conversation_history=conversation_history
        )
        return {"response": response}
    except Exception as e:
        print(f"Error in /chat: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

class ChartExplainRequest(BaseModel):
    symbol: str
    chart_data: List[Dict[str, Any]]
    context: Optional[Dict[str, Any]] = {}

@app.post("/explain-chart")
def explain_chart_endpoint(request: ChartExplainRequest):
    """AI-powered chart explanation endpoint"""
    try:
        from ai.chat import explain_chart
        context = request.context or {}
        explanation = explain_chart(request.symbol, request.chart_data, context)
        return {"explanation": explanation}
    except Exception as e:
        print(f"Error in /explain-chart: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/summary/{symbol}")
def get_stock_summary(symbol: str):
    """Generate AI summary for stock"""
    try:
        from ai.chat import generate_stock_summary
        from ml.data_fetch import fetch_stock_data
        from ml.features import calculate_features
        from ml.model_xgb import train_and_predict
        
        # Get current data and prediction
        df = fetch_stock_data(symbol)
        df = calculate_features(df)
        
        if df.empty:
            raise HTTPException(status_code=404, detail="No data available")
        
        # Get prediction
        try:
            prediction, confidence = train_and_predict(df)
            signal_map = {1: "Bullish", -1: "Bearish", 0: "Neutral"}
            prediction_str = signal_map.get(prediction, "Neutral")
        except:
            prediction_str = "Neutral"
            confidence = 0.5
        
        latest = df.iloc[-1]
        context = {
            "prediction": prediction_str,
            "confidence": float(confidence),
            "ema20": float(latest['EMA_20']),
            "ema50": float(latest['EMA_50']),
            "rsi": float(latest['RSI'])
        }
        
        # Get chart data for context
        chart_data = []
        df_recent = df.tail(30)
        for idx, row in df_recent.iterrows():
            chart_data.append({
                "date": str(idx.date()),
                "close": float(row['Close']),
                "ema20": float(row['EMA_20']),
                "ema50": float(row['EMA_50'])
            })
        
        summary = generate_stock_summary(symbol, context, chart_data)
        return {"symbol": symbol, "summary": summary}
    except Exception as e:
        print(f"Error in /summary/{symbol}: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sentiment/{symbol}")
def get_sentiment(symbol: str):
    """Get news sentiment for stock"""
    try:
        from ai.chat import get_news_sentiment
        sentiment_data = get_news_sentiment(symbol)
        return {"symbol": symbol, **sentiment_data}
    except Exception as e:
        print(f"Error in /sentiment/{symbol}: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/top-movers")
def get_top_movers():
    """Get top 5 bullish and bearish stocks with confidence and sentiment"""
    try:
        from ml.stocks_list import get_popular_stocks
        from ml.data_fetch import fetch_stock_data
        from ml.features import calculate_features
        from ml.model_xgb import train_and_predict
        from ai.chat import get_news_sentiment
        
        stocks = get_popular_stocks()
        movers = []
        
        # Analyze first 15 stocks for performance (optimized for speed)
        for stock_info in stocks[:15]:
            symbol = stock_info['symbol']
            try:
                df = fetch_stock_data(symbol)
                df = calculate_features(df)
                
                if len(df) < 30:
                    continue
                
                prediction, confidence = train_and_predict(df)
                latest = df.iloc[-1]
                
                # Get sentiment
                sentiment_data = get_news_sentiment(symbol)
                
                # Calculate conviction score (confidence + sentiment)
                sentiment_score = sentiment_data['score']
                conviction = (confidence * 0.7) + ((sentiment_score + 1) / 2) * 0.3
                
                signal_map = {1: "Bullish", -1: "Bearish", 0: "Neutral"}
                
                movers.append({
                    "symbol": symbol,
                    "name": stock_info['name'],
                    "sector": stock_info['sector'],
                    "prediction": signal_map.get(prediction, "Neutral"),
                    "confidence": round(float(confidence), 2),
                    "sentiment": sentiment_data['sentiment'],
                    "sentiment_score": sentiment_data['score'],
                    "conviction": round(conviction, 2),
                    "ema20": round(float(latest['EMA_20']), 2),
                    "ema50": round(float(latest['EMA_50']), 2),
                    "rsi": round(float(latest['RSI']), 2)
                })
            except Exception as e:
                print(f"Error processing {symbol}: {e}")
                continue
        
        # Sort by conviction and get top 5 bullish and bearish
        bullish = sorted([m for m in movers if m['prediction'] == 'Bullish'], 
                        key=lambda x: x['conviction'], reverse=True)[:5]
        bearish = sorted([m for m in movers if m['prediction'] == 'Bearish'], 
                        key=lambda x: x['conviction'], reverse=True)[:5]
        
        return {
            "bullish": bullish,
            "bearish": bearish,
            "updated_at": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error in /top-movers: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)