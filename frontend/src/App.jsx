import React, { useState, useRef, useCallback } from "react";
import Dashboard from "./pages/Dashboard";
import ScreeningResults from "./pages/ScreeningResults";
import UniverseBacktestDashboard from "./pages/UniverseBacktestDashboard";
import { TrendingUp, Filter, BarChart3, RefreshCw } from "lucide-react";
import "./App.css";

function App() {
  const [view, setView] = useState("dashboard");
  const [dashboardStats, setDashboardStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const refreshFnRef = useRef(null);

  const handleStatsChange = useCallback((stats) => {
    setDashboardStats(stats);
  }, []);

  const registerRefresh = useCallback((fn) => {
    refreshFnRef.current = fn;
  }, []);

  const handleRefreshingChange = useCallback((isRefreshing) => {
    setRefreshing(isRefreshing);
  }, []);

  const handleRefreshClick = () => {
    if (refreshFnRef.current) {
      refreshFnRef.current();
    }
  };

  const navButtonClass = (isActive) =>
    `group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
      isActive
        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
        : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
    }`;

  return (
    <div className="App min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-gray-900/80 border-b border-gray-800 backdrop-blur-md sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
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

            {/* Right side: stats (dashboard only) + refresh + nav buttons, all one line */}
            <div className="flex items-center gap-3 flex-wrap justify-end">
              {view === "dashboard" && dashboardStats && (
                <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Win Rate</p>
                    <p className="text-sm font-bold text-green-400">
                      {dashboardStats.winRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-px h-6 bg-gray-700"></div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Return</p>
                    <p
                      className={`text-sm font-bold ${
                        dashboardStats.totalReturn >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {dashboardStats.totalReturn >= 0 ? "+" : ""}
                      {dashboardStats.totalReturn.toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}

              {view === "dashboard" && (
                <button
                  onClick={handleRefreshClick}
                  disabled={refreshing}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-xl transition-all disabled:opacity-50 shadow-lg"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                  <span className="hidden md:inline text-sm font-medium">Refresh</span>
                </button>
              )}

              <button onClick={() => setView("dashboard")} className={navButtonClass(view === "dashboard")}>
                <TrendingUp className="w-4 h-4" />
                <span className="hidden md:inline">Single Stock</span>
              </button>

              <button onClick={() => setView("screening")} className={navButtonClass(view === "screening")}>
                <Filter className="w-4 h-4" />
                <span className="hidden md:inline">NSE 500 Screener</span>
              </button>

              <button onClick={() => setView("backtest")} className={navButtonClass(view === "backtest")}>
                <BarChart3 className="w-4 h-4" />
                <span className="hidden md:inline">Universe Backtest</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative">
        {view === "dashboard" && (
          <Dashboard
            onStatsChange={handleStatsChange}
            registerRefresh={registerRefresh}
            onRefreshingChange={handleRefreshingChange}
          />
        )}
        {view === "screening" && <ScreeningResults />}
        {view === "backtest" && <UniverseBacktestDashboard />}
      </div>
    </div>
  );
}

export default App;