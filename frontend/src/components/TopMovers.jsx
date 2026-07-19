import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

const TopMovers = () => {
  const [movers, setMovers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMovers();
  }, []);

  const loadMovers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://alphacross-ai-powered-moving-average.onrender.com/top-movers');
      
      if (!response.ok) {
        throw new Error('Failed to fetch movers');
      }
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setMovers(data);
      }
    } catch (err) {
      console.error('Error loading movers:', err);
      setError('Unable to load market movers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-gray-700 shadow-2xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-3" />
            <p className="text-gray-400">Loading market movers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-gray-700 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Top Movers Screener</h2>
        </div>
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!movers || (movers.gainers.length === 0 && movers.losers.length === 0)) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Top Movers Screener</h2>
              <p className="text-xs text-gray-400 mt-1">AI-powered stock discovery</p>
            </div>
          </div>
          <button
            onClick={loadMovers}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <p className="text-center text-gray-400 py-8">No market movers found</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-gray-700 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Top Movers Screener</h2>
            <p className="text-xs text-gray-400 mt-1">AI-powered stock discovery</p>
          </div>
        </div>
        <button
          onClick={loadMovers}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors group"
        >
          <RefreshCw className="w-5 h-5 text-gray-400 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 5 Bullish */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-green-400">Top 5 Bullish</h3>
          </div>
          
          {movers.gainers.length > 0 ? (
            <div className="space-y-2">
              {movers.gainers.map((stock, idx) => (
                <div
                  key={idx}
                  className="group bg-gradient-to-r from-green-500/10 to-transparent p-4 rounded-xl border border-green-500/30 hover:border-green-400 transition-all hover:scale-105 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white group-hover:text-green-400 transition-colors">
                        {stock.symbol}
                      </p>
                      <p className="text-xs text-gray-400">{stock.sector}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400">
                        +{stock.change}%
                      </p>
                      <p className="text-xs text-gray-400">₹{stock.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No bullish movers found</p>
          )}
        </div>

        {/* Top 5 Bearish */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-red-400">Top 5 Bearish</h3>
          </div>
          
          {movers.losers.length > 0 ? (
            <div className="space-y-2">
              {movers.losers.map((stock, idx) => (
                <div
                  key={idx}
                  className="group bg-gradient-to-r from-red-500/10 to-transparent p-4 rounded-xl border border-red-500/30 hover:border-red-400 transition-all hover:scale-105 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white group-hover:text-red-400 transition-colors">
                        {stock.symbol}
                      </p>
                      <p className="text-xs text-gray-400">{stock.sector}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-400">
                        {stock.change}%
                      </p>
                      <p className="text-xs text-gray-400">₹{stock.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No bearish movers found</p>
          )}
        </div>
      </div>

      {movers.timestamp && (
        <p className="text-xs text-gray-500 text-center mt-4">
          Last updated: {new Date(movers.timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default TopMovers;