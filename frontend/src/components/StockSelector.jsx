import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Search, X, Loader2, Sparkles } from 'lucide-react';
import api from '../api/api';

const StockSelector = ({ selected, onSelect }) => {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoveredStock, setHoveredStock] = useState(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadStocks();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = stocks.filter(stock =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.sector.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStocks(filtered);
    } else {
      setFilteredStocks(stocks);
    }
  }, [searchQuery, stocks]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && !searchRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadStocks = async () => {
    try {
      setLoading(true);
      const response = await api.getStocks();
      setStocks(response.stocks || []);
      setFilteredStocks(response.stocks || []);
    } catch (error) {
      console.error('Error loading stocks:', error);
      // Fallback to default stocks
      const fallback = [
        { symbol: 'INFY', name: 'Infosys', sector: 'IT' },
        { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy' },
        { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT' },
        { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking' }
      ];
      setStocks(fallback);
      setFilteredStocks(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleStockSelect = (stock) => {
    onSelect(stock.symbol);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const getSectorColor = (sector) => {
    const colors = {
      'IT': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Banking': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Energy': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'Pharma': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'FMCG': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'Auto': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'Telecom': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'Finance': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    };
    return colors[sector] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const selectedStock = stocks.find(s => s.symbol === selected);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Select Stock
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {stocks.length} stocks available
            </p>
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
      </div>

      {/* Search Bar */}
      <div className="relative mb-4" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search stocks by name or symbol..."
            className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-xl pl-12 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {isSearchOpen && filteredStocks.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto custom-scrollbar"
          >
            {filteredStocks.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => handleStockSelect(stock)}
                onMouseEnter={() => setHoveredStock(stock.symbol)}
                onMouseLeave={() => setHoveredStock(null)}
                className={`w-full p-4 text-left hover:bg-gray-800 transition-all ${
                  selected === stock.symbol ? 'bg-blue-500/10 border-l-4 border-blue-500' : ''
                } ${hoveredStock === stock.symbol ? 'transform scale-[1.02]' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg text-white">{stock.symbol}</span>
                      {selected === stock.symbol && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Active</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300">{stock.name}</p>
                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-md border ${getSectorColor(stock.sector)}`}>
                      {stock.sector}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Access - Popular Stocks */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded"></span>
          Quick Access
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {stocks.slice(0, 12).map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => handleStockSelect(stock)}
                onMouseEnter={() => setHoveredStock(stock.symbol)}
                onMouseLeave={() => setHoveredStock(null)}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-300 transform ${
                  selected === stock.symbol
                    ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-lg shadow-blue-500/20 scale-105'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-800/50 hover:scale-105'
                } ${hoveredStock === stock.symbol ? 'z-10' : ''}`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`font-bold text-lg mb-1 transition-colors ${
                    selected === stock.symbol ? 'text-blue-300' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {stock.symbol}
                  </div>
                  <div className="text-xs text-gray-400 line-clamp-1">{stock.name}</div>
                  {selected === stock.symbol && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Stock Info */}
      {selectedStock && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Currently Selected</p>
              <p className="text-xl font-bold text-white mt-1">{selectedStock.name}</p>
              <p className="text-sm text-gray-300">{selectedStock.symbol} • {selectedStock.sector}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>
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
