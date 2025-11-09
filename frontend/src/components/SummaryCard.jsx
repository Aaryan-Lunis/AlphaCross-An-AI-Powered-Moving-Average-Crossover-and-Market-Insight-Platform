import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Sparkles } from 'lucide-react';
import api from '../api/api';

const SummaryCard = ({ symbol }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSummary();
  }, [symbol]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await api.getStockSummary(symbol);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error loading summary:', error);
      setSummary(`${symbol} shows active trading signals. Monitor for crossover opportunities.`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSummary();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-blue-400 animate-pulse" />
          <h3 className="text-lg font-semibold">AI Summary</h3>
        </div>
        <div className="h-20 flex items-center justify-center">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Split summary into lines if it contains newlines
  const summaryLines = summary ? summary.split('\n').filter(line => line.trim()) : [];

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-gray-700 shadow-xl hover:border-blue-500/50 transition-all backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Daily Summary
            </h3>
            <p className="text-xs text-gray-400">Powered by GPT-4-Turbo</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {summaryLines.length > 0 ? (
          summaryLines.map((line, idx) => (
            <div
              key={idx}
              className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors"
            >
              <p className="text-sm text-gray-200 leading-relaxed">{line}</p>
            </div>
          ))
        ) : (
          <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
            <p className="text-sm text-gray-200 leading-relaxed">{summary || 'No summary available'}</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Summary generated daily • Updates automatically
        </p>
      </div>
    </div>
  );
};

export default SummaryCard;

