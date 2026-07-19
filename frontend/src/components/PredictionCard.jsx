import React from 'react';
import { Zap, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

const PredictionCard = ({ prediction, symbol }) => {
  if (!prediction) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-gray-700 shadow-2xl animate-pulse">
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            <p>Loading prediction...</p>
          </div>
        </div>
      </div>
    );
  }

  // Determine colors based on prediction
  const getColors = () => {
    switch (prediction.prediction) {
      case 'BULLISH':
        return {
          bg: 'from-green-500/20 to-green-600/10',
          border: 'border-green-500/50',
          text: 'text-green-400',
          icon: 'text-green-400',
          glow: 'shadow-green-500/20',
          badge: 'bg-green-500/20 text-green-300 border-green-500/30'
        };
      case 'BEARISH':
        return {
          bg: 'from-red-500/20 to-red-600/10',
          border: 'border-red-500/50',
          text: 'text-red-400',
          icon: 'text-red-400',
          glow: 'shadow-red-500/20',
          badge: 'bg-red-500/20 text-red-300 border-red-500/30'
        };
      default: // NEUTRAL
        return {
          bg: 'from-gray-500/20 to-gray-600/10',
          border: 'border-gray-500/50',
          text: 'text-gray-400',
          icon: 'text-gray-400',
          glow: 'shadow-gray-500/20',
          badge: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        };
    }
  };

  const colors = getColors();

  // Get appropriate icon
  const getIcon = () => {
    switch (prediction.prediction) {
      case 'BULLISH':
        return <TrendingUp className={`w-6 h-6 ${colors.icon}`} />;
      case 'BEARISH':
        return <TrendingDown className={`w-6 h-6 ${colors.icon}`} />;
      default:
        return <Minus className={`w-6 h-6 ${colors.icon}`} />;
    }
  };

  const confidencePercentage = (prediction.confidence * 100).toFixed(0);

  return (
    <div className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-6 border-2 ${colors.border} shadow-2xl ${colors.glow} backdrop-blur-sm hover:scale-[1.02] transition-all`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg`}>
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">ML Prediction</h2>
            <p className="text-xs text-gray-400">XGBoost Model</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors group">
          <Info className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
      </div>

      {/* Prediction Display */}
      <div className="text-center mb-6">
        <div className="mb-4 flex justify-center">
          <div className={`p-4 rounded-full ${colors.bg} border-2 ${colors.border}`}>
            {getIcon()}
          </div>
        </div>
        
        <h3 className={`text-4xl font-bold mb-2 ${colors.text}`}>
          {prediction.prediction}
        </h3>
        
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-yellow-400">✨</span>
          <span className="text-sm text-gray-400">AI Powered</span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Model Confidence</span>
          <span className={`text-lg font-bold ${colors.text}`}>{confidencePercentage}%</span>
        </div>
        <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full ${
              prediction.prediction === 'BULLISH'
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : prediction.prediction === 'BEARISH'
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : 'bg-gradient-to-r from-gray-500 to-gray-600'
            } transition-all duration-1000 ease-out`}
            style={{ width: `${confidencePercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">Low</span>
          <span className="text-xs text-gray-500">High</span>
        </div>
      </div>

      {/* Technical Indicators */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-green-500/20 rounded">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-sm text-gray-400">EMA 20</span>
          </div>
          <span className="text-sm font-semibold text-white">₹{prediction.ema_20}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-orange-500/20 rounded">
              <TrendingUp className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-sm text-gray-400">EMA 50</span>
          </div>
          <span className="text-sm font-semibold text-white">₹{prediction.ema_50}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2">
            <div className={`p-1 ${
              prediction.rsi > 70 
                ? 'bg-red-500/20' 
                : prediction.rsi < 30 
                ? 'bg-green-500/20' 
                : 'bg-purple-500/20'
            } rounded`}>
              <Zap className={`w-4 h-4 ${
                prediction.rsi > 70 
                  ? 'text-red-400' 
                  : prediction.rsi < 30 
                  ? 'text-green-400' 
                  : 'text-purple-400'
              }`} />
            </div>
            <span className="text-sm text-gray-400">RSI</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${
              prediction.rsi > 70 
                ? 'text-red-400' 
                : prediction.rsi < 30 
                ? 'text-green-400' 
                : 'text-purple-400'
            }`}>
              {prediction.rsi}
            </span>
            <span className="text-xs text-gray-500">
              {prediction.rsi > 70 ? 'Overbought' : prediction.rsi < 30 ? 'Oversold' : 'Neutral'}
            </span>
          </div>
        </div>
      </div>

      {/* Signal Badge */}
      <div className="mt-6 text-center">
        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${colors.badge} border`}>
          {prediction.prediction === 'BULLISH' && '🚀 Strong Buy Signal'}
          {prediction.prediction === 'BEARISH' && '⚠️ Strong Sell Signal'}
          {prediction.prediction === 'NEUTRAL' && '⏸️ Hold Position'}
        </span>
      </div>
    </div>
  );
};

export default PredictionCard;