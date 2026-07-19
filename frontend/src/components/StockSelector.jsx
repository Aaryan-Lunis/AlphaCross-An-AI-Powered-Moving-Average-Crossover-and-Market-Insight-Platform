import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Sparkles } from 'lucide-react';
import api from '../api/api';

const StockSelector = ({ selected, onSelect }) => {
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Popular stocks for quick access
  const popularStocks = [
    'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN',
    'BHARTIARTL', 'ITC', 'KOTAKBANK', 'LT', 'HINDUNILVR', 'AXISBANK'
  ];

  useEffect(() => {
    loadStocks();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = stocks.filter(stock =>
        stock.Symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (stock.Industry && stock.Industry.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredStocks(filtered.slice(0, 20));
    } else {
      setFilteredStocks([]);
    }
  }, [searchTerm, stocks]);

  const loadStocks = async () => {
    try {
      const response = await api.getNSE500List();
      setStocks(response.stocks || []);
    } catch (error) {
      console.error('Error loading stocks:', error);
      // Fallback to popular stocks if API fails
      setStocks(popularStocks.map(symbol => ({ Symbol: symbol, Industry: 'N/A' })));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-gray-700 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Select Stock</h2>
            <p className="text-sm text-gray-400 mt-1">
              {stocks.length} stocks available
            </p>
          </div>
        </div>
        <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search stocks by name or symbol..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
        />
      </div>

      {/* Search Results Dropdown */}
      {searchTerm && filteredStocks.length > 0 && (
        <div className="mb-4 max-h-60 overflow-y-auto bg-gray-900/80 rounded-xl border border-gray-700 custom-scrollbar">
          {filteredStocks.map((stock, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelect(stock.Symbol);
                setSearchTerm('');
              }}
              className="w-full text-left px-4 py-3 hover:bg-blue-500/10 transition-colors border-b border-gray-800 last:border-b-0 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {stock.Symbol}
                  </p>
                  <p className="text-xs text-gray-400">{stock.Industry || 'N/A'}</p>
                </div>
                {selected === stock.Symbol && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Quick Access */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider border-l-4 border-blue-500 pl-3">
          Quick Access
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {popularStocks.map((symbol, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(symbol)}
              className={`group px-4 py-3 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 ${
                selected === symbol
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg border-2 border-blue-400'
                  : 'bg-gray-900/50 text-gray-300 hover:bg-gray-800 hover:text-white border-2 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>{symbol}</span>
                {selected === symbol && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4 text-gray-400">
          <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-sm">Loading stocks...</p>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.8);
        }
      `}</style>
    </div>
  );
};

export default StockSelector;