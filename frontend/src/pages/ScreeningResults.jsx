import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Filter, Search, ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react';
import api from '../api/api';

const ScreeningResults = ({ onSelectStock }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [maxStocks, setMaxStocks] = useState(500); // Changed from 50 to 500

  useEffect(() => {
    runScreening();
  }, []);

  const runScreening = async () => {
    setLoading(true);
    try {
      const config = {
        max_stocks: maxStocks, // This will now be 500
        criteria: 'ema_crossover'
      };
      const data = await api.screenUniverse(config);
      setResults(data);
    } catch (error) {
      console.error('Error screening universe:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-lg text-gray-300">Screening NSE 500 universe...</p>
          <p className="text-sm text-gray-500 mt-2">Analyzing up to {maxStocks} stocks - This may take 2-3 minutes</p>
          <div className="mt-4 max-w-md mx-auto">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse" style={{width: '100%'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <p className="text-gray-400">No screening results available</p>
      </div>
    );
  }

  const filterStocks = (stocks) => {
    if (!searchTerm) return stocks;
    return stocks.filter(stock => 
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.sector.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const displayedStocks = filter === 'all' 
    ? [...filterStocks(results.bullish), ...filterStocks(results.bearish), ...filterStocks(results.neutral)]
    : filterStocks(results[filter] || []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                NSE 500 Screening Results
              </h1>
              <p className="text-gray-400">Real-time EMA crossover analysis across the universe</p>
            </div>
            <button
              onClick={runScreening}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Scanning...' : 'Refresh Scan'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Bullish Signals</p>
              <ArrowUpCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">{results.counts.bullish}</p>
            <p className="text-xs text-gray-500 mt-1">EMA 20 &gt; EMA 50</p>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl p-6 border border-red-500/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Bearish Signals</p>
              <ArrowDownCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-red-400">{results.counts.bearish}</p>
            <p className="text-xs text-gray-500 mt-1">EMA 20 &lt; EMA 50</p>
          </div>

          <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/10 rounded-xl p-6 border border-gray-500/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Neutral</p>
              <Minus className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-400">{results.counts.neutral}</p>
            <p className="text-xs text-gray-500 mt-1">No clear signal</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Total Analyzed</p>
              <Filter className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {results.counts.bullish + results.counts.bearish + results.counts.neutral}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {maxStocks === 500 ? 'Full NSE 500 scan' : `Top ${maxStocks} stocks`}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All Stocks
            </button>
            <button
              onClick={() => setFilter('bullish')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'bullish'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Bullish ({results.counts.bullish})
            </button>
            <button
              onClick={() => setFilter('bearish')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'bearish'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Bearish ({results.counts.bearish})
            </button>
            <button
              onClick={() => setFilter('neutral')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'neutral'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Neutral ({results.counts.neutral})
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search symbol or sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedStocks.map((stock, idx) => {
            const signal = stock.signal || 
              (results.bullish.includes(stock) ? 'bullish' : 
               results.bearish.includes(stock) ? 'bearish' : 'neutral');

            return (
              <button
                key={idx}
                onClick={() => onSelectStock && onSelectStock(stock.symbol)}
                className={`group text-left p-4 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-xl ${
                  signal === 'bullish'
                    ? 'bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30 hover:border-green-400'
                    : signal === 'bearish'
                    ? 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/30 hover:border-red-400'
                    : 'bg-gradient-to-br from-gray-500/10 to-gray-600/5 border-gray-500/30 hover:border-gray-400'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                      {stock.symbol}
                    </h3>
                    <p className="text-xs text-gray-400">{stock.sector}</p>
                  </div>
                  {signal === 'bullish' ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : signal === 'bearish' ? (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  ) : (
                    <Minus className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  signal === 'bullish'
                    ? 'bg-green-500/20 text-green-300'
                    : signal === 'bearish'
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-gray-500/20 text-gray-300'
                }`}>
                  {signal.toUpperCase()}
                </div>
              </button>
            );
          })}
        </div>

        {displayedStocks.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No stocks found matching your criteria</p>
          </div>
        )}

        {/* Info footer */}
        {results.timestamp && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Last scanned: {new Date(results.timestamp).toLocaleString()}</p>
            <p className="mt-1">Analyzing {maxStocks} stocks from NSE 500 • Processing time: ~2-3 minutes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreeningResults;