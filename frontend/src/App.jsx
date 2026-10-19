import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import AppShell from './components/layout/AppShell';
import Overview from './pages/Overview';
import StockAnalysis from './pages/StockAnalysis';
import ScreeningResults from './pages/ScreeningResults';
import Backtesting from './pages/Backtesting';
import AIAssistant from './pages/AIAssistant';

// HashRouter keeps deep links working on any static host without
// server-side rewrite rules (e.g. /#/analysis/TCS).
function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Overview />} />
            <Route path="analysis/:symbol?" element={<StockAnalysis />} />
            <Route path="screener" element={<ScreeningResults />} />
            <Route path="backtesting" element={<Backtesting />} />
            <Route path="assistant/:symbol?" element={<AIAssistant />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
