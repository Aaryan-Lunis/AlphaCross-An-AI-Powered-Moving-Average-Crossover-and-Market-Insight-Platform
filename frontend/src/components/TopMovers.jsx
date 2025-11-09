import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Sparkles, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../api/api';

const TopMovers = () => {
  const [movers, setMovers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMovers();
  }, []);

  const loadMovers = async () => {
    try {
      setLoading(true);
      const data = await api.getTopMovers();
      setMovers(data);
    } catch (error) {
      console.error('Error loading top movers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMovers();
    setRefreshing(false);
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'negative':
        return <ArrowDown className="w-4 h-4 text-red-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'negative':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-gray-700 shadow-2xl">
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 animate-pulse text-gray-600" />
            <p className="text-gray-400">Loading top movers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-gray-700 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Top Movers Screener
            </h2>
            <p className="text-xs text-gray-400 mt-1">AI-powered stock discovery</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Bullish */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-green-400">Top 5 Bullish</h3>
          </div>
          <div className="space-y-3">
            {movers?.bullish && movers.bullish.length > 0 ? (
              movers.bullish.map((stock, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 rounded-xl p-4 border border-green-500/30 hover:border-green-500/50 transition-all hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-green-400 font-bold text-sm">{idx + 1}</span>
                      </div>
                      <div>
                        <p className="font-bold text-white">{stock.symbol}</p>
                        <p className="text-xs text-gray-400">{stock.name}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${getSentimentColor(stock.sentiment)}`}>
                      {getSentimentIcon(stock.sentiment)}
                      <span className="text-xs font-medium capitalize">{stock.sentiment}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs text-gray-400">Conviction</p>
                      <p className="text-lg font-bold text-green-400">{Math.round(stock.conviction * 100)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Confidence</p>
                      <p className="text-lg font-bold text-blue-400">{Math.round(stock.confidence * 100)}%</p>
                    </div>
                  </div>
                  
                  {/* Confidence Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
                      style={{ width: `${stock.conviction * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>RSI: {stock.rsi}</span>
                    <span>•</span>
                    <span>{stock.sector}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No bullish movers found</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Bearish */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-red-400">Top 5 Bearish</h3>
          </div>
          <div className="space-y-3">
            {movers?.bearish && movers.bearish.length > 0 ? (
              movers.bearish.map((stock, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-red-500/10 to-orange-500/5 rounded-xl p-4 border border-red-500/30 hover:border-red-500/50 transition-all hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-red-400 font-bold text-sm">{idx + 1}</span>
                      </div>
                      <div>
                        <p className="font-bold text-white">{stock.symbol}</p>
                        <p className="text-xs text-gray-400">{stock.name}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${getSentimentColor(stock.sentiment)}`}>
                      {getSentimentIcon(stock.sentiment)}
                      <span className="text-xs font-medium capitalize">{stock.sentiment}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs text-gray-400">Conviction</p>
                      <p className="text-lg font-bold text-red-400">{Math.round(stock.conviction * 100)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Confidence</p>
                      <p className="text-lg font-bold text-orange-400">{Math.round(stock.confidence * 100)}%</p>
                    </div>
                  </div>
                  
                  {/* Confidence Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all"
                      style={{ width: `${stock.conviction * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>RSI: {stock.rsi}</span>
                    <span>•</span>
                    <span>{stock.sector}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No bearish movers found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {movers?.updated_at && (
        <div className="mt-6 pt-4 border-t border-gray-700 text-center">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(movers.updated_at).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default TopMovers;

