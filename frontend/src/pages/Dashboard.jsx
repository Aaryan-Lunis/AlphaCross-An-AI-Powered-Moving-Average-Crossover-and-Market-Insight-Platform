import React, { useState, useEffect } from 'react';
import StockSelector from '../components/StockSelector';
import ChartDisplay from '../components/ChartDisplay';
import PredictionCard from '../components/PredictionCard';
import PerformanceTable from '../components/PerformanceTable';
import SummaryCard from '../components/SummaryCard';
import TopMovers from '../components/TopMovers';
import Chatbot from '../components/Chatbot';
import Loader from '../components/Loader';
import api from '../api/api';
import { RefreshCw, AlertCircle, Sparkles, TrendingUp, BarChart3 } from 'lucide-react';

const Dashboard = () => {
  const [selectedStock, setSelectedStock] = useState('INFY');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [backtest, setBacktest] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadAllData();
  }, [selectedStock]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [data, pred, back, chart] = await Promise.all([
        api.getStockData(selectedStock),
        api.getPrediction(selectedStock),
        api.getBacktest(selectedStock),
        api.getChartData(selectedStock)
      ]);

      setStockData(data);
      setPrediction(pred);
      setBacktest(back);
      setChartData(chart);
      
      // Calculate quick stats
      if (back && back.summary) {
        setStats({
          winRate: back.summary.win_rate_pct,
          totalReturn: back.summary.pnl_pct,
          trades: back.summary.number_of_trades
        });
      }
    } catch (err) {
      setError('Failed to load data. Please check if the backend is running.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  const handleStockChange = (symbol) => {
    setSelectedStock(symbol);
  };

  if (loading && !refreshing) {
    return <Loader message={`Loading ${selectedStock} data...`} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative bg-gray-900/30 border-b border-gray-800 backdrop-blur-md sticky top-0 z-20 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                  AlphaCross
                </h1>
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
                  AI-Powered Moving Average Crossover Analyzer
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {stats && (
                <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Win Rate</p>
                    <p className="text-sm font-bold text-green-400">{stats.winRate.toFixed(1)}%</p>
                  </div>
                  <div className="w-px h-6 bg-gray-700"></div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Return</p>
                    <p className={`text-sm font-bold ${stats.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stats.totalReturn >= 0 ? '+' : ''}{stats.totalReturn.toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-xl border border-blue-500/30 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-500/10 border-2 border-red-500/30 rounded-xl p-4 flex items-center gap-3 animate-slide-down backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Stock Selector */}
        <div className="mb-8 animate-fade-in">
          <StockSelector selected={selectedStock} onSelect={handleStockChange} />
        </div>

        {/* Quick Stats Cards */}
        {stockData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-500/30 backdrop-blur-sm hover:scale-105 transition-transform">
              <p className="text-xs text-gray-400 mb-1">Current Price</p>
              <p className="text-2xl font-bold text-blue-300">₹{stockData.close}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-4 border border-green-500/30 backdrop-blur-sm hover:scale-105 transition-transform">
              <p className="text-xs text-gray-400 mb-1">EMA 20</p>
              <p className="text-2xl font-bold text-green-300">₹{stockData.ema20}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl p-4 border border-orange-500/30 backdrop-blur-sm hover:scale-105 transition-transform">
              <p className="text-xs text-gray-400 mb-1">EMA 50</p>
              <p className="text-2xl font-bold text-orange-300">₹{stockData.ema50}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-4 border border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-transform">
              <p className="text-xs text-gray-400 mb-1">RSI</p>
              <p className={`text-2xl font-bold ${
                stockData.rsi > 70 ? 'text-red-300' : 
                stockData.rsi < 30 ? 'text-green-300' : 
                'text-purple-300'
              }`}>
                {stockData.rsi}
              </p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Prediction Card */}
          <div className="lg:col-span-1 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <PredictionCard 
              prediction={prediction} 
              symbol={selectedStock}
              apiBase={process.env.REACT_APP_API_URL || 'http://localhost:8000'}
            />
          </div>

          {/* Performance Table */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <PerformanceTable backtest={backtest} />
          </div>
        </div>

        {/* Chart */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <ChartDisplay 
            chartData={chartData} 
            symbol={selectedStock}
            predictionContext={prediction}
            apiBase={process.env.REACT_APP_API_URL || 'http://localhost:8000'}
          />
        </div>

        {/* AI Summary Card */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <SummaryCard symbol={selectedStock} />
        </div>

        {/* Top Movers Screener */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <TopMovers />
        </div>

        {/* Additional Info */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700 backdrop-blur-sm hover:border-gray-600 transition-all animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              About the Strategy
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="group p-4 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all hover:scale-105">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="font-semibold text-green-400">Bullish Signal</p>
              </div>
              <p className="text-gray-300 leading-relaxed">EMA 20 crosses above EMA 50, indicating potential upward momentum and buying opportunity</p>
            </div>
            <div className="group p-4 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-red-500/50 transition-all hover:scale-105">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <p className="font-semibold text-red-400">Bearish Signal</p>
              </div>
              <p className="text-gray-300 leading-relaxed">EMA 20 crosses below EMA 50, suggesting potential downward pressure and selling signal</p>
            </div>
            <div className="group p-4 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all hover:scale-105">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <p className="font-semibold text-purple-400">ML Prediction</p>
              </div>
              <p className="text-gray-300 leading-relaxed">XGBoost model analyzes patterns to predict crossover probability within next 3 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot 
        symbol={selectedStock} 
        predictionContext={prediction}
        apiBase={process.env.REACT_APP_API_URL || 'http://localhost:8000'}
      />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
