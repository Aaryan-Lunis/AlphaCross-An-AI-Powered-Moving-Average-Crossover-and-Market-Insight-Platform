import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, Target, Zap, Info, Sparkles, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../api/api';

const PredictionCard = ({ prediction, symbol, apiBase }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [sentiment, setSentiment] = useState(null);
  const [conviction, setConviction] = useState(null);

  useEffect(() => {
    if (prediction && symbol) {
      loadSentiment();
    }
  }, [prediction, symbol]);

  const loadSentiment = async () => {
    try {
      const data = await api.getSentiment(symbol);
      setSentiment(data);
      
      // Calculate conviction score (confidence + sentiment fusion)
      if (prediction && data) {
        const confidence = prediction.confidence || 0;
        const sentimentScore = data.score || 0;
        // Normalize sentiment score (-1 to 1) to (0 to 1)
        const normalizedSentiment = (sentimentScore + 1) / 2;
        // Weighted fusion: 70% ML confidence, 30% sentiment
        const convictionScore = (confidence * 0.7) + (normalizedSentiment * 0.3);
        setConviction(convictionScore);
      }
    } catch (error) {
      console.error('Error loading sentiment:', error);
    }
  };

  if (!prediction) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl animate-pulse backdrop-blur-sm">
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            <p>Loading prediction...</p>
          </div>
        </div>
      </div>
    );
  }

  const getPredictionIcon = () => {
    switch (prediction.prediction) {
      case 'Bullish': return <TrendingUp className="w-10 h-10" />;
      case 'Bearish': return <TrendingDown className="w-10 h-10" />;
      default: return <Minus className="w-10 h-10" />;
    }
  };

  const getPredictionColor = () => {
    switch (prediction.prediction) {
      case 'Bullish': return 'green';
      case 'Bearish': return 'red';
      default: return 'gray';
    }
  };

  const color = getPredictionColor();
  const confidencePercent = Math.round(prediction.confidence * 100);

  // Get color classes based on prediction
  const getColorClasses = () => {
    if (color === 'green') {
      return {
        bg: 'bg-green-500/20',
        border: 'border-green-500/50',
        text: 'text-green-400',
        gradient: 'bg-gradient-to-r from-green-500 to-emerald-400',
        glow: 'shadow-lg shadow-green-500/20',
        iconBg: 'bg-green-500/20'
      };
    } else if (color === 'red') {
      return {
        bg: 'bg-red-500/20',
        border: 'border-red-500/50',
        text: 'text-red-400',
        gradient: 'bg-gradient-to-r from-red-500 to-orange-400',
        glow: 'shadow-lg shadow-red-500/20',
        iconBg: 'bg-red-500/20'
      };
    } else {
      return {
        bg: 'bg-gray-500/20',
        border: 'border-gray-500/50',
        text: 'text-gray-400',
        gradient: 'bg-gradient-to-r from-gray-500 to-gray-400',
        glow: 'shadow-lg shadow-gray-500/20',
        iconBg: 'bg-gray-500/20'
      };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-gray-700 shadow-2xl backdrop-blur-sm hover:border-gray-600 transition-all duration-300 group">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 ${colorClasses.iconBg} rounded-xl border ${colorClasses.border}`}>
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ML Prediction
              </h2>
              <p className="text-xs text-gray-400">XGBoost Model</p>
            </div>
          </div>
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Info className="w-4 h-4 text-gray-400" />
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs text-gray-300 z-50 shadow-xl">
                Prediction based on EMA crossovers, RSI, and price patterns. Confidence indicates model certainty.
              </div>
            )}
          </div>
        </div>

        {/* Main Prediction */}
        <div className={`${colorClasses.bg} border-2 ${colorClasses.border} rounded-2xl p-6 mb-6 ${colorClasses.glow} hover:scale-105 transition-transform duration-300`}>
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 ${colorClasses.iconBg} rounded-full border-2 ${colorClasses.border} animate-pulse-slow`}>
              <div className={colorClasses.text}>
                {getPredictionIcon()}
              </div>
            </div>
            <div className="text-center">
              <span className={`text-4xl font-bold ${colorClasses.text} drop-shadow-lg`}>
                {prediction.prediction}
              </span>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-sm text-gray-400">AI Powered</span>
              </div>
            </div>
            
            {/* Confidence Bar */}
            <div className="w-full mt-4">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-400 font-medium">Model Confidence</span>
                <span className={`font-bold ${colorClasses.text}`}>{confidencePercent}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-700">
                <div 
                  className={`h-full ${colorClasses.gradient} transition-all duration-1000 ease-out relative overflow-hidden`}
                  style={{ width: `${confidencePercent}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Indicators */}
        <div className="space-y-3">
          <div className="group flex items-center justify-between bg-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-green-500/50 hover:bg-gray-800/50 transition-all hover:scale-105 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                <Activity className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <span className="text-sm text-gray-400 block">EMA 20</span>
                <span className="text-xs text-gray-500">Short-term trend</span>
              </div>
            </div>
            <span className="font-bold text-xl text-green-400 group-hover:scale-110 transition-transform">
              ₹{prediction.ema20}
            </span>
          </div>

          <div className="group flex items-center justify-between bg-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-orange-500/50 hover:bg-gray-800/50 transition-all hover:scale-105 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
                <Activity className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <span className="text-sm text-gray-400 block">EMA 50</span>
                <span className="text-xs text-gray-500">Long-term trend</span>
              </div>
            </div>
            <span className="font-bold text-xl text-orange-400 group-hover:scale-110 transition-transform">
              ₹{prediction.ema50}
            </span>
          </div>

          <div className="group flex items-center justify-between bg-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/50 transition-all hover:scale-105 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${
                prediction.rsi > 70 ? 'bg-red-500/20 border-red-500/30' :
                prediction.rsi < 30 ? 'bg-green-500/20 border-green-500/30' :
                'bg-purple-500/20 border-purple-500/30'
              }`}>
                <Target className={`w-5 h-5 ${
                  prediction.rsi > 70 ? 'text-red-400' :
                  prediction.rsi < 30 ? 'text-green-400' :
                  'text-purple-400'
                }`} />
              </div>
              <div>
                <span className="text-sm text-gray-400 block">RSI</span>
                <span className="text-xs text-gray-500">Momentum indicator</span>
              </div>
            </div>
            <span className={`font-bold text-xl ${
              prediction.rsi > 70 ? 'text-red-400' : 
              prediction.rsi < 30 ? 'text-green-400' : 
              'text-purple-400'
            } group-hover:scale-110 transition-transform`}>
              {prediction.rsi}
            </span>
          </div>
        </div>

        {/* Sentiment Fusion */}
        {sentiment && conviction && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {sentiment.sentiment === 'positive' ? (
                  <ArrowUp className="w-4 h-4 text-green-400" />
                ) : sentiment.sentiment === 'negative' ? (
                  <ArrowDown className="w-4 h-4 text-red-400" />
                ) : (
                  <Sparkles className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-xs font-semibold text-gray-300">News Sentiment</span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                sentiment.sentiment === 'positive' ? 'bg-green-500/20 text-green-300' :
                sentiment.sentiment === 'negative' ? 'bg-red-500/20 text-red-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {sentiment.sentiment.toUpperCase()}
              </span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">High Conviction Score</span>
                <span className="font-bold text-purple-300">{Math.round(conviction * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-400 transition-all"
                  style={{ width: `${conviction * 100}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Fusion: {Math.round(prediction.confidence * 100)}% ML Confidence + {sentiment.sentiment} News Sentiment
            </p>
          </div>
        )}

        {/* Prediction Insight */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Info className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xs text-blue-200 leading-relaxed">
              {prediction.prediction === 'Bullish' 
                ? '📈 Model predicts upward momentum in next 3 days. Consider monitoring for entry opportunities.'
                : prediction.prediction === 'Bearish'
                ? '📉 Model predicts downward pressure in next 3 days. Exercise caution and consider risk management.'
                : '➖ No clear trend detected. Monitor for signals and wait for confirmation.'}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default PredictionCard;
