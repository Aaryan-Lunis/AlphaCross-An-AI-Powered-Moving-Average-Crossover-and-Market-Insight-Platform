import React, { useState } from 'react';
import { BarChart3, TrendingUp, Award, DollarSign, Info, ChevronDown, ChevronUp } from 'lucide-react';

const PerformanceTable = ({ backtest }) => {
  const [showAllTrades, setShowAllTrades] = useState(false);
  const [hoveredMetric, setHoveredMetric] = useState(null);

  if (!backtest || !backtest.summary) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-gray-700 shadow-2xl animate-pulse backdrop-blur-sm">
        <div className="h-48 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            <p>Loading backtest results...</p>
          </div>
        </div>
      </div>
    );
  }

  const { trade_logs, summary } = backtest;

  const formatCurrency = (value) => {
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const displayedTrades = showAllTrades ? trade_logs : trade_logs.slice(0, 10);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-gray-700 shadow-2xl backdrop-blur-sm hover:border-gray-600 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Backtest Results
            </h2>
            <p className="text-xs text-gray-400 mt-1">Historical performance analysis</p>
          </div>
        </div>
        <span className="text-xs text-gray-300 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 px-4 py-2 rounded-full backdrop-blur-sm">
          Last 3 Months
        </span>
      </div>

      {/* Trade Details Table */}
      {trade_logs && trade_logs.length > 0 && (
        <div className="mb-6 bg-gray-900/30 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Trade Details
              <span className="text-xs text-gray-500 font-normal">({trade_logs.length} trades)</span>
            </h3>
            {trade_logs.length > 10 && (
              <button
                onClick={() => setShowAllTrades(!showAllTrades)}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors px-3 py-1 hover:bg-blue-500/10 rounded-lg"
              >
                {showAllTrades ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show All ({trade_logs.length})
                  </>
                )}
              </button>
            )}
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-bold">Stock</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-bold">Entry Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-bold">Exit Date</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-bold">Entry Price</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-bold">Exit Price</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-bold">Profit</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-bold">% Profit</th>
                </tr>
              </thead>
              <tbody>
                {displayedTrades.map((trade, idx) => (
                  <tr 
                    key={idx} 
                    className="border-b border-gray-700/30 hover:bg-gray-800/50 transition-all group"
                  >
                    <td className="py-3 px-4 text-gray-300 font-medium">{trade.stock}</td>
                    <td className="py-3 px-4 text-gray-300">{trade.entry_date}</td>
                    <td className="py-3 px-4 text-gray-300">{trade.exit_date}</td>
                    <td className="py-3 px-4 text-right text-gray-300">₹{trade.entry_price}</td>
                    <td className="py-3 px-4 text-right text-gray-300">₹{trade.exit_price}</td>
                    <td className={`py-3 px-4 text-right font-bold ${
                      trade.profit >= 0 ? 'text-green-400' : 'text-red-400'
                    } group-hover:scale-110 transition-transform`}>
                      {trade.profit >= 0 ? '+' : ''}₹{trade.profit.toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${
                      trade.profit_pct >= 0 ? 'text-green-400' : 'text-red-400'
                    } group-hover:scale-110 transition-transform`}>
                      {trade.profit_pct >= 0 ? '+' : ''}{trade.profit_pct.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Statistics Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          Performance Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div 
            className="group bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 hover:scale-105 transition-all cursor-pointer relative overflow-hidden"
            onMouseEnter={() => setHoveredMetric('trades')}
            onMouseLeave={() => setHoveredMetric(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/10 group-hover:from-blue-500/10 group-hover:to-blue-500/20 transition-all"></div>
            <div className="relative z-10">
              <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                <BarChart3 className="w-3 h-3" />
                Number of Trades
              </div>
              <div className="text-2xl font-bold text-blue-400 group-hover:scale-110 transition-transform inline-block">
                {summary.number_of_trades}
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-4 border border-gray-700 hover:border-gray-600 hover:scale-105 transition-all">
            <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
              <DollarSign className="w-3 h-3" />
              Invested Amount
            </div>
            <div className="text-xl font-bold text-gray-300 group-hover:scale-110 transition-transform inline-block">
              {formatCurrency(summary.invested_amount)}
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-4 border border-gray-700 hover:border-gray-600 hover:scale-105 transition-all">
            <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
              <DollarSign className="w-3 h-3" />
              Final Amount
            </div>
            <div className="text-xl font-bold text-gray-300 group-hover:scale-110 transition-transform inline-block">
              {formatCurrency(summary.final_amount)}
            </div>
          </div>
          
          <div className={`group bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-4 border border-gray-700 hover:border-${summary.win_rate_pct >= 50 ? 'green' : 'red'}-500/50 hover:scale-105 transition-all`}>
            <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
              <Award className="w-3 h-3" />
              Win Rate %
            </div>
            <div className={`text-2xl font-bold ${
              summary.win_rate_pct >= 50 ? 'text-green-400' : 'text-red-400'
            } group-hover:scale-110 transition-transform inline-block`}>
              {summary.win_rate_pct.toFixed(2)}%
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-4 border border-gray-700 hover:border-purple-500/50 hover:scale-105 transition-all">
            <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              Risk-Reward Ratio
            </div>
            <div className="text-2xl font-bold text-purple-400 group-hover:scale-110 transition-transform inline-block">
              {summary.risk_reward_ratio.toFixed(2)}
            </div>
          </div>
          
          <div className={`group bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-4 border border-gray-700 hover:border-${summary.avg_profit_pct >= 0 ? 'green' : 'red'}-500/50 hover:scale-105 transition-all`}>
            <div className="text-xs text-gray-400 mb-2">Avg Profit %</div>
            <div className={`text-2xl font-bold ${
              summary.avg_profit_pct >= 0 ? 'text-green-400' : 'text-red-400'
            } group-hover:scale-110 transition-transform inline-block`}>
              {summary.avg_profit_pct >= 0 ? '+' : ''}{summary.avg_profit_pct.toFixed(2)}%
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-4 border border-gray-700 hover:border-red-500/50 hover:scale-105 transition-all">
            <div className="text-xs text-gray-400 mb-2">Max Loss %</div>
            <div className="text-2xl font-bold text-red-400 group-hover:scale-110 transition-transform inline-block">
              {summary.max_loss_pct.toFixed(2)}%
            </div>
            </div>
          
          <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-4 border border-gray-700 hover:border-green-500/50 hover:scale-105 transition-all">
            <div className="text-xs text-gray-400 mb-2">Max Win %</div>
            <div className="text-2xl font-bold text-green-400 group-hover:scale-110 transition-transform inline-block">
              {summary.max_win_pct.toFixed(2)}%
            </div>
          </div>
          
          <div className={`group bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-4 border border-gray-700 hover:border-${summary.profit_factor >= 1 ? 'green' : 'red'}-500/50 hover:scale-105 transition-all`}>
            <div className="text-xs text-gray-400 mb-2">Profit Factor</div>
            <div className={`text-2xl font-bold ${
              summary.profit_factor >= 1 ? 'text-green-400' : 'text-red-400'
            } group-hover:scale-110 transition-transform inline-block`}>
              {summary.profit_factor.toFixed(2)}
            </div>
      </div>

          <div className={`group bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-4 border border-gray-700 hover:border-${summary.pnl_pct >= 0 ? 'green' : 'red'}-500/50 hover:scale-105 transition-all`}>
            <div className="text-xs text-gray-400 mb-2">PnL %</div>
            <div className={`text-2xl font-bold ${
              summary.pnl_pct >= 0 ? 'text-green-400' : 'text-red-400'
            } group-hover:scale-110 transition-transform inline-block`}>
              {summary.pnl_pct >= 0 ? '+' : ''}{summary.pnl_pct.toFixed(2)}%
            </div>
        </div>
          
          <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-4 border border-gray-700 hover:border-red-500/50 hover:scale-105 transition-all">
            <div className="text-xs text-gray-400 mb-2">Avg Loss %</div>
            <div className="text-2xl font-bold text-red-400 group-hover:scale-110 transition-transform inline-block">
              {summary.avg_loss_pct.toFixed(2)}%
        </div>
      </div>

          <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-4 border border-gray-700 hover:border-red-500/50 hover:scale-105 transition-all">
            <div className="text-xs text-gray-400 mb-2">Max Drawdown %</div>
            <div className="text-2xl font-bold text-red-400 group-hover:scale-110 transition-transform inline-block">
              {summary.max_drawdown_pct.toFixed(2)}%
            </div>
        </div>
      </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
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

export default PerformanceTable;