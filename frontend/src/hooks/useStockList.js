import { useEffect, useMemo, useState } from 'react';
import { loadStockList } from '../lib/loaders';

export const POPULAR = [
  'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN',
  'BHARTIARTL', 'ITC', 'KOTAKBANK', 'LT', 'HINDUNILVR', 'AXISBANK',
];

// The NSE 500 constituents (symbol + industry). Loaded once and shared.
export function useStockList() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    loadStockList().then(
      (list) => {
        if (!live) return;
        setStocks(list);
        setLoading(false);
      },
      () => {
        if (!live) return;
        setFailed(true);
        setStocks(POPULAR.map((Symbol) => ({ Symbol, Industry: '' })));
        setLoading(false);
      }
    );
    return () => {
      live = false;
    };
  }, []);

  const industryOf = useMemo(() => {
    const m = new Map();
    stocks.forEach((s) => m.set(s.Symbol, s.Industry));
    return (sym) => m.get(sym) || '';
  }, [stocks]);

  return { stocks, loading, failed, industryOf };
}
