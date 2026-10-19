import { useCallback, useState } from 'react';

const KEY = 'alphacross-watchlist';
const DEFAULT = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN'];

const read = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(v) && v.every((s) => typeof s === 'string')) return v;
  } catch (e) {
    /* fall through */
  }
  return DEFAULT;
};

// A personal watchlist kept in this browser only.
export function useWatchlist() {
  const [symbols, setSymbols] = useState(read);

  const save = useCallback((next) => {
    setSymbols(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch (e) {
      /* storage unavailable - list still works for this session */
    }
  }, []);

  const add = useCallback(
    (sym) => setSymbols((cur) => {
      if (cur.includes(sym)) return cur;
      const next = [...cur, sym];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) { /* ignore */ }
      return next;
    }),
    []
  );

  const remove = useCallback(
    (sym) => setSymbols((cur) => {
      const next = cur.filter((s) => s !== sym);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) { /* ignore */ }
      return next;
    }),
    []
  );

  const toggle = useCallback(
    (sym) => (symbols.includes(sym) ? remove(sym) : add(sym)),
    [symbols, add, remove]
  );

  return { symbols, add, remove, toggle, has: (s) => symbols.includes(s), reset: () => save(DEFAULT) };
}
