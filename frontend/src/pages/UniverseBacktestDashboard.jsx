import React, { useState } from 'react';
import { BarChart3, TrendingUp, Award, DollarSign, Play, Settings, Loader2, AlertCircle, TrendingDown, Target } from 'lucide-react';

const UniverseBacktestDashboard = () => {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState({
    max_stocks: 50,
    initial_capital: 100000,
    position_size: 0.1,
    stop_loss: 0.05,
    take_profit: 0.15
  });

  const runBacktest = async () => {
    setRunning(true);
    setError(null);
    setResults(null);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/backtest/universe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (!response.ok) {
        throw new Error('Backtest failed');
      }
      
      const data = await response.json();
      
      if (data.status === 'error') {
        setError(data.message);
      } else {
        setResults(data);
      }
    } catch (err) {
      setError('Failed to run universe backtest. Please check if backend is running.');
      console.error('Backtest error:', err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Universe Backtest Dashboard
          </h1>
          <p className="text-gray-400">Test your strategy across the entire NSE 500 universe</p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold">Backtest Configuration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Max Stocks to Test</label>
              <input
                type="number"
                value={config.max_stocks}
                onChange={(e) => setConfig({...config, max_stocks: parseInt(e.target.value)})}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                min="10"
                max="500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Initial Capital (₹)</label>
              <input
                type="number"
                value={config.initial_capital}
                onChange={(e) => setConfig({...config, initial_capital: parseInt(e.target.value)})}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                min="10000"
                step="10000"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Position Size (% of capital per trade)</label>
              <input
                type="number"
                value={config.position_size * 100}
                onChange={(e) => setConfig({...config, position_size: parseFloat(e.target.value) / 100})}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                min="1"
                max="100"
                step="1"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Stop Loss (%)</label>
              <input
                type="number"
                value={config.stop_loss * 100}
                onChange={(e) => setConfig({...config, stop_loss: parseFloat(e.target.value) / 100})}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                min="1"
                max="50"
                step="1"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Take Profit (%)</label>
              <input
                type="number"
                value={config.take_profit * 100}
                onChange={(e) => setConfig({...config, take_profit: parseFloat(e.target.value) / 100})}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                min="1"
                max="100"
                step="1"
              />
            </div>
          </div>

          <button
            onClick={runBacktest}
            disabled={running}
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {running ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Running Backtest...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Universe Backtest
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Results */}
        {results && results.status === 'success' && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-6 border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Total Return</p>
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <p className={`text-3xl font-bold ${results.total_return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {results.total_return >= 0 ? '+' : ''}{results.total_return}%
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Win Rate</p>
                  <Award className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-green-400">
                  {results.win_rate}%
                </p>
                <p className="text-xs text-gray-500 mt-1">{results.winning_trades}W / {results.losing_trades}L</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Total Trades</p>
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-purple-400">
                  {results.total_trades}
                </p>
                <p className="text-xs text-gray-500 mt-1">{results.stocks_tested} stocks tested</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-xl p-6 border border-yellow-500/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Final Capital</p>
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-3xl font-bold text-yellow-400">
                  ₹{results.final_capital.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Performance Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Average Win</span>
                    <span className="text-green-400 font-semibold">+{results.avg_win}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Average Loss</span>
                    <span className="text-red-400 font-semibold">{results.avg_loss}%</span>
                  </div>
                  {results.best_trade && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Best Trade</span>
                      <span className="text-green-400 font-semibold">
                        {results.best_trade.symbol}: +{results.best_trade.profit_pct}%
                      </span>
                    </div>
                  )}
                  {results.worst_trade && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Worst Trade</span>
                      <span className="text-red-400 font-semibold">
                        {results.worst_trade.symbol}: {results.worst_trade.profit_pct}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Sectors */}
              {results.top_sectors && results.top_sectors.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Top Performing Sectors</h3>
                  <div className="space-y-2">
                    {results.top_sectors.map((sector, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">{sector.sector}</span>
                        <span className={`font-semibold ${sector.avg_return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {sector.avg_return >= 0 ? '+' : ''}{sector.avg_return.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Top Trades */}
            {results.trade_details && results.trade_details.length > 0 && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Top 20 Trades</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 px-3 text-gray-400">Symbol</th>
                        <th className="text-left py-2 px-3 text-gray-400">Sector</th>
                        <th className="text-left py-2 px-3 text-gray-400">Entry</th>
                        <th className="text-left py-2 px-3 text-gray-400">Exit</th>
                        <th className="text-right py-2 px-3 text-gray-400">Return</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.trade_details.map((trade, idx) => (
                        <tr key={idx} className="border-b border-gray-800 hover:bg-gray-700/30">
                          <td className="py-2 px-3 font-medium">{trade.symbol}</td>
                          <td className="py-2 px-3 text-gray-400 text-xs">{trade.sector}</td>
                          <td className="py-2 px-3 text-gray-400 text-xs">{trade.entry_date}</td>
                          <td className="py-2 px-3 text-gray-400 text-xs">{trade.exit_date}</td>
                          <td className={`py-2 px-3 text-right font-semibold ${trade.profit_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.profit_pct >= 0 ? '+' : ''}{trade.profit_pct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Placeholder when no results */}
        {!results && !error && !running && (
          <div className="bg-gray-800/30 rounded-2xl p-12 border-2 border-dashed border-gray-700 text-center">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-2">Ready to Backtest</p>
            <p className="text-sm text-gray-500">
              Configure your parameters above and click "Run Universe Backtest" to begin
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniverseBacktestDashboard;