# AlphaCross — AI-Driven Moving Average Crossover Analyzer

A full-stack trading signal analyzer that uses XGBoost machine learning to predict moving average crossovers and includes an AI chatbot for trading insights.

## 🎯 Features

- **Real-time Stock Data**: Fetches NSE 500 stock prices (last 3 months) using yfinance with end-of-day closing prices (3:30 PM)
- **ML Predictions**: XGBoost classifier predicts bullish/bearish crossovers within 3 days
- **Backtesting**: Comprehensive backtest with detailed trade logs and performance metrics on NSE 500 stocks
- **AI Chatbot**: GenAI-powered assistant (OpenAI/Gemini) for trading Q&A
- **Interactive Dashboard**: ReactJS dashboard with charts, predictions, and chatbot
- **Dark UI**: Modern dark theme with TailwindCSS

## 🏗️ Architecture

```
AlphaCross/
├── backend/          # FastAPI Python backend
│   ├── main.py       # API endpoints
│   ├── ml/           # Machine learning modules
│   │   ├── data_fetch.py    # Stock data fetching
│   │   ├── features.py      # Feature engineering
│   │   ├── model_xgb.py     # XGBoost model
│   │   └── backtest.py      # Backtesting engine
│   └── ai/           # AI chatbot
│       └── chat.py   # GenAI integration
│
└── frontend/         # ReactJS frontend
    ├── src/
    │   ├── components/      # UI components
    │   ├── pages/           # Dashboard page
    │   └── api/             # API client
    └── public/
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file (optional, for AI chatbot):
```bash
cp .env.example .env
# Edit .env and add your API keys:
# OPENAI_API_KEY=your_openai_key (optional, for enhanced chatbot)
# GEMINI_API_KEY=your_gemini_key (optional, alternative to OpenAI)
```

**Note:** The system uses yfinance to fetch NSE stock data with end-of-day closing prices (3:30 PM) for the last 3 months, as per requirements.

5. Run the server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
# Edit .env and set REACT_APP_API_URL if backend is on different port
```

4. Start development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## 📡 API Endpoints

### `GET /data/{symbol}`
Fetch stock data with EMAs and RSI.

**Example:**
```bash
curl http://localhost:8000/data/INFY
```

**Response:**
```json
{
  "symbol": "INFY",
  "close": 1456.50,
  "ema20": 1445.20,
  "ema50": 1430.80,
  "rsi": 62.4,
  "date": "2025-01-15"
}
```

### `GET /predict/{symbol}`
Get ML prediction for upcoming crossover.

**Example:**
```bash
curl http://localhost:8000/predict/TCS
```

**Response:**
```json
{
  "symbol": "TCS",
  "prediction": "Bullish",
  "confidence": 0.87,
  "ema20": 3685.3,
  "ema50": 3594.2,
  "rsi": 62.4
}
```

### `GET /backtest/{symbol}`
Run backtest on historical data.

**Example:**
```bash
curl http://localhost:8000/backtest/RELIANCE
```

**Response:**
```json
{
  "trade_logs": [
    {
      "stock": "RELIANCE",
      "entry_date": "15-10-2025",
      "exit_date": "20-10-2025",
      "entry_price": 2456.50,
      "exit_price": 2489.20,
      "profit": 32.70,
      "profit_pct": 1.33
    }
  ],
  "summary": {
    "number_of_trades": 12,
    "invested_amount": 29478.00,
    "final_amount": 30125.50,
    "win_rate_pct": 66.67,
    "risk_reward_ratio": 1.45,
    "avg_profit_pct": 2.18,
    "max_loss_pct": -3.45,
    "max_win_pct": 5.67,
    "profit_factor": 2.10,
    "pnl_pct": 2.20,
    "avg_loss_pct": -1.85,
    "max_drawdown_pct": 4.20
  }
}
```

### `GET /chart/{symbol}`
Get historical chart data.

**Example:**
```bash
curl http://localhost:8000/chart/HDFCBANK
```

### `POST /chat`
Chat with AI assistant.

**Request:**
```json
{
  "symbol": "INFY",
  "query": "Why is INFY predicted bullish?",
  "context": {
    "prediction": "Bullish",
    "confidence": 0.87,
    "ema20": 1445.20,
    "ema50": 1430.80,
    "rsi": 62.4
  }
}
```

**Response:**
```json
{
  "response": "The 20-day EMA (1445.20) is above the 50-day EMA (1430.80) with RSI at 62.4, indicating upward momentum."
}
```

## 🤖 AI Chatbot

The chatbot supports two providers:

1. **OpenAI** (GPT-3.5-turbo): Set `OPENAI_API_KEY` in `.env`
2. **Google Gemini**: Set `GEMINI_API_KEY` in `.env`
3. **Fallback**: Rule-based responses if no API key is provided

The chatbot answers questions about:
- Why a stock is predicted bullish/bearish
- Explanation of crossover strategies
- RSI interpretation
- Model confidence levels

## 📊 ML Model Details

### Data Requirements
- **Data Source**: yfinance (NSE stocks with .NS suffix)
- **Time Period**: Last 3 months of historical data
- **Price Type**: End-of-day closing prices (3:30 PM)
- **Timeframe**: Daily (not minute/hour)
- **Stocks**: NSE 500 stocks

### Features
- EMA_20, EMA_50 (20-day and 50-day Exponential Moving Averages)
- EMA_20_slope, EMA_50_slope (rate of change)
- RSI (Relative Strength Index, 14-period)
- Returns (daily percentage change)
- Volatility (rolling 10-day standard deviation)

### Labels
- `1`: Bullish crossover likely (EMA 20 > EMA 50)
- `-1`: Bearish crossover likely (EMA 20 < EMA 50)
- `0`: Neutral (no clear signal)

### Model
- **Algorithm**: XGBoost Classifier
- **Parameters**: 50 estimators, max_depth=3, learning_rate=0.1
- **Training**: Trained on historical data, predicts next 3 days

## 🎨 Frontend Components

- **StockSelector**: Dropdown to select NSE stocks (INFY, RELIANCE, TCS, HDFCBANK)
- **ChartDisplay**: Interactive chart showing Close price, EMA 20, EMA 50
- **PredictionCard**: ML prediction with confidence and technical indicators
- **PerformanceTable**: Detailed trade logs and summary statistics
- **Chatbot**: Side panel AI assistant for Q&A

## 🚢 Deployment

### Backend (Render/HuggingFace)

1. Push code to GitHub
2. Connect repository to Render/HuggingFace
3. Set environment variables:
   - `OPENAI_API_KEY` (optional)
   - `GEMINI_API_KEY` (optional)
4. Deploy using `requirements.txt`

**Render:**
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable:
   - `REACT_APP_API_URL`: Your backend API URL
4. Deploy

**Build Command:**
```bash
npm install && npm run build
```

## 📝 Supported Stocks

Currently supports NSE stocks:
- **INFY** - Infosys
- **RELIANCE** - Reliance Industries
- **TCS** - Tata Consultancy Services
- **HDFCBANK** - HDFC Bank

To add more stocks, update `STOCKS` array in `frontend/src/components/StockSelector.jsx`

## 🛠️ Tech Stack

**Backend:**
- FastAPI
- XGBoost
- pandas, numpy
- yfinance
- ta (Technical Analysis Library)
- OpenAI / Google Generative AI

**Frontend:**
- React 18
- TailwindCSS
- Chart.js / react-chartjs-2
- Axios
- Lucide React (icons)

## 📄 License

MIT License - feel free to use and modify.

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## ⚠️ Disclaimer

This tool is for educational and research purposes only. Not financial advice. Always do your own research before making trading decisions.

---

**Built with ❤️ for traders and developers**

