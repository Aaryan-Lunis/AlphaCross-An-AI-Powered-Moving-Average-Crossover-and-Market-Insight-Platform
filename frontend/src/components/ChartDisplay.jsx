import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { TrendingUp, TrendingDown, Maximize2, Minimize2, Sparkles, Loader2, X } from 'lucide-react';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartDisplay = ({ chartData, symbol, predictionContext, apiBase }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);

  const explainChart = async () => {
    if (!chartData || chartData.length === 0) return;
    
    setExplaining(true);
    try {
      const response = await axios.post(`${apiBase}/explain-chart`, {
        symbol: symbol,
        chart_data: chartData,
        context: predictionContext || {}
      });
      setExplanation(response.data.explanation);
    } catch (error) {
      console.error('Error explaining chart:', error);
      setExplanation('Unable to generate chart explanation at this time.');
    } finally {
      setExplaining(false);
    }
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-gray-700 shadow-2xl backdrop-blur-sm">
        <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Price & EMAs Chart
        </h2>
        <div className="h-80 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 animate-pulse text-gray-600" />
            <p>Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Detect crossovers for visual markers
  const crossoverPoints = [];
  for (let i = 1; i < chartData.length; i++) {
    const prev = chartData[i - 1];
    const curr = chartData[i];
    if ((prev.ema20 < prev.ema50 && curr.ema20 > curr.ema50) || 
        (prev.ema20 > prev.ema50 && curr.ema20 < curr.ema50)) {
      crossoverPoints.push({
        index: i,
        type: curr.ema20 > curr.ema50 ? 'bullish' : 'bearish',
        price: curr.close
      });
    }
  }

  const data = {
    labels: chartData.map(d => d.date),
    datasets: [
      {
        label: 'Close Price',
        data: chartData.map(d => d.close),
        borderColor: 'rgb(96, 165, 250)',
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgb(96, 165, 250)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2
      },
      {
        label: 'EMA 20',
        data: chartData.map(d => d.ema20),
        borderColor: 'rgb(74, 222, 128)',
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderDash: [],
      },
      {
        label: 'EMA 50',
        data: chartData.map(d => d.ema50),
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderDash: [],
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(209, 213, 219)',
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(209, 213, 219)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        padding: 15,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₹${context.parsed.y.toFixed(2)}`;
          }
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
          drawBorder: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
          drawBorder: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 11
          },
          callback: function(value) {
            return '₹' + value.toFixed(0);
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  return (
    <div className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-700 shadow-2xl backdrop-blur-sm transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-50' : 'relative'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {symbol} - Price Movement
            </h2>
            <p className="text-xs text-gray-400 mt-1">Last 3 months • Interactive Chart</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Explain Chart Button */}
          <button
            onClick={explainChart}
            disabled={explaining}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
          >
            {explaining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Explain My Chart</span>
              </>
            )}
          </button>
          
          {/* Crossover Indicators */}
          <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs text-gray-400">Bullish</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
              <span className="text-xs text-gray-400">Bearish</span>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700 hover:border-gray-600"
          >
            {isExpanded ? (
              <Minimize2 className="w-5 h-5 text-gray-400" />
            ) : (
              <Maximize2 className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* AI Explanation */}
      {explanation && (
        <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-300 mb-1">AI Chart Analysis</p>
              <p className="text-sm text-gray-200 leading-relaxed">{explanation}</p>
            </div>
            <button
              onClick={() => setExplanation(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className={`p-6 ${isExpanded ? 'h-[calc(100vh-300px)]' : 'h-96'}`}>
        <Line data={data} options={options} />
      </div>

      {/* Crossover Info */}
      {crossoverPoints.length > 0 && (
        <div className="px-6 pb-6">
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400 mb-2">Recent Crossovers Detected</p>
            <div className="flex flex-wrap gap-2">
              {crossoverPoints.slice(-5).map((point, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    point.type === 'bullish'
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {point.type === 'bullish' ? (
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 inline mr-1" />
                  )}
                  {point.type === 'bullish' ? 'Bullish' : 'Bearish'} at ₹{point.price.toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartDisplay;
