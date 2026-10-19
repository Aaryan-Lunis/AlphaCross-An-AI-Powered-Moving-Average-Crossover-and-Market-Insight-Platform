// Thin wrappers over api.js that add caching and turn "empty" results
// into real errors, so the UI can show a proper error state.
import api from '../api/api';
import { cached } from './cache';

export const loadQuote = (sym, opts) => cached(`data:${sym}`, () => api.getStockData(sym), opts);
export const loadPrediction = (sym, opts) => cached(`predict:${sym}`, () => api.getPrediction(sym), opts);
export const loadBacktest = (sym, opts) => cached(`backtest:${sym}`, () => api.getBacktest(sym), opts);
export const loadSummary = (sym, opts) => cached(`summary:${sym}`, () => api.getStockSummary(sym), opts);
export const loadNews = (sym, opts) => cached(`news:${sym}`, () => api.getNewsIntelligence(sym), opts);
export const loadMovers = (opts) =>
  cached(
    'movers',
    async () => {
      const d = await api.getTopMovers();
      if (d?.error) throw new Error(d.error);
      return d;
    },
    opts
  );

export const loadChart = (sym, opts) =>
  cached(
    `chart:${sym}`,
    async () => {
      const rows = await api.getChartData(sym); // api.js returns [] on failure
      if (!rows || rows.length === 0) throw new Error(`No price history available for ${sym}.`);
      return rows;
    },
    opts
  );

export const loadStockList = () =>
  cached(
    'nse500-list',
    async () => {
      const d = await api.getNSE500List();
      return d?.stocks || [];
    },
    { ttl: 60 * 60 * 1000 }
  );
