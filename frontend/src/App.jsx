import React, { useState } from "react";
import Dashboard from "./pages/Dashboard";
import ScreeningResults from "./pages/ScreeningResults";
import UniverseBacktestDashboard from "./pages/UniverseBacktestDashboard";
import { TrendingUp, Filter, BarChart3 } from "lucide-react";
import "./App.css";

function App() {
  const [view, setView] = useState("dashboard");

  return (
    <div className="App min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-gray-900/80 border-b border-gray-800 backdrop-blur-md sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  AlphaCross
                </h1>
                <p className="text-xs text-gray-400">AI-Powered Trading Platform</p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView("dashboard")}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  view === "dashboard"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden md:inline">Single Stock</span>
              </button>

              <button
                onClick={() => setView("screening")}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  view === "screening"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden md:inline">NSE 500 Screener</span>
              </button>

              <button
                onClick={() => setView("backtest")}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  view === "backtest"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden md:inline">Universe Backtest</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative">
        {view === "dashboard" && <Dashboard />}
        {view === "screening" && <ScreeningResults />}
        {view === "backtest" && <UniverseBacktestDashboard />}
      </div>
    </div>
  );
}

export default App;