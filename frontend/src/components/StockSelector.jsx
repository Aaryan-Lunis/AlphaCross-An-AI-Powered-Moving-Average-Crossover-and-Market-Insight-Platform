import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { POPULAR, useStockList } from '../hooks/useStockList';

// Search any NSE 500 stock, or jump to a quick pick.
const StockSelector = ({
  value,
  onChange,
  chips = POPULAR.slice(0, 8),
  chipsLabel = 'Quick picks',
  placeholder,
  className = '',
  id = 'stock-selector',
}) => {
  const { stocks, loading } = useStockList();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const starts = [];
    const rest = [];
    for (const s of stocks) {
      const sym = s.Symbol.toLowerCase();
      if (sym.startsWith(t)) starts.push(s);
      else if (sym.includes(t) || (s.Industry || '').toLowerCase().includes(t)) rest.push(s);
    }
    return [...starts, ...rest].slice(0, 8);
  }, [q, stocks]);

  useEffect(() => setActive(0), [q]);

  useEffect(() => {
    const onClick = (e) => boxRef.current && !boxRef.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const pick = (sym) => {
    setQ('');
    setOpen(false);
    onChange(sym);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[active]) pick(results[active].Symbol);
      else if (q.trim()) pick(q.trim().toUpperCase());
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showList = open && q.trim().length > 0;

  return (
    <div className={className}>
      <div ref={boxRef} className="relative">
        <label htmlFor={id} className="sr-only">
          Select a stock
        </label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
        <input
          id={id}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          placeholder={placeholder || `Viewing ${value} — search symbol or sector`}
          className="field h-10 pl-9"
          autoComplete="off"
          spellCheck="false"
        />
        {showList && (
          <ul
            id={`${id}-list`}
            role="listbox"
            className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-lg border border-line bg-elevated py-1 shadow-pop"
          >
            {results.length === 0 && (
              <li className="px-3 py-3 text-ui text-ink-2">
                {loading ? 'Loading stock list…' : 'No stock matches that search.'}
              </li>
            )}
            {results.map((s, i) => (
              <li
                key={s.Symbol}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(s.Symbol);
                }}
                className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 ${
                  i === active ? 'bg-accent-soft' : ''
                }`}
              >
                <span className="num text-ui font-medium text-ink">{s.Symbol}</span>
                <span className="truncate text-meta text-ink-3">{s.Industry}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {chips && chips.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-meta text-ink-3">{chipsLabel}</span>
          {chips.map((s) => {
            const sel = s === value;
            return (
              <button
                key={s}
                type="button"
                onClick={() => pick(s)}
                aria-pressed={sel}
                className={`num rounded-md border px-2.5 py-1 text-meta font-medium transition-colors ${
                  sel
                    ? 'border-accent/60 bg-accent-soft text-accent-hi'
                    : 'border-line bg-card text-ink-2 hover:border-ink-3/50 hover:text-ink'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StockSelector;
