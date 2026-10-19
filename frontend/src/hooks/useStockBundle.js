import { useCallback, useMemo } from 'react';
import { useResource } from './useResource';
import {
  loadBacktest,
  loadChart,
  loadNews,
  loadPrediction,
  loadQuote,
  loadSummary,
} from '../lib/loaders';
import { normalizeChart } from '../lib/signals';

// Everything the analysis and assistant pages know about one stock.
// Each piece loads independently so a slow model never blocks the chart.
export function useStockBundle(symbol) {
  const k = symbol || null;
  const quote = useResource(k && `data:${k}`, (o) => loadQuote(symbol, o));
  const chart = useResource(k && `chart:${k}`, (o) => loadChart(symbol, o));
  const prediction = useResource(k && `predict:${k}`, (o) => loadPrediction(symbol, o));
  const backtest = useResource(k && `backtest:${k}`, (o) => loadBacktest(symbol, o));
  const news = useResource(k && `news:${k}`, (o) => loadNews(symbol, o));
  const summary = useResource(k && `summary:${k}`, (o) => loadSummary(symbol, o));

  const rows = useMemo(() => normalizeChart(chart.data), [chart.data]);

  const reloadAll = useCallback(() => {
    [quote, chart, prediction, backtest, news, summary].forEach((r) => r.reload());
  }, [quote, chart, prediction, backtest, news, summary]);

  return { quote, chart, rows, prediction, backtest, news, summary, reloadAll };
}
