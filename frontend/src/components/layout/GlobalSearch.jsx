import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useStockList } from '../../hooks/useStockList';

// Topbar stock search. Press "/" anywhere to focus it.
const GlobalSearch = () => {
  const navigate = useNavigate();
  const { stocks, loading } = useStockList();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
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
    const onKey = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (e.key === '/' && !['input', 'textarea', 'select'].includes(tag) && !e.target.isContentEditable) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  const go = (sym) => {
    setQ('');
    setOpen(false);
    inputRef.current?.blur();
    navigate(`/analysis/${sym}`);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[active]) go(results[active].Symbol);
      else if (q.trim()) go(q.trim().toUpperCase());
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showList = open && q.trim().length > 0;

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={showList}
        aria-controls="global-search-list"
        aria-autocomplete="list"
        aria-label="Search stocks"
        placeholder="Search stocks"
        className="field h-9 pl-9 pr-9"
        autoComplete="off"
        spellCheck="false"
      />
      <span className="kbd pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 sm:inline-flex" aria-hidden="true">
        /
      </span>

      {showList && (
        <ul
          id="global-search-list"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-lg border border-line bg-elevated py-1 shadow-pop"
        >
          {results.length === 0 && (
            <li className="px-3 py-3 text-ui text-ink-2">
              {loading ? 'Loading stock list…' : (
                <>
                  No match. Press <span className="kbd">Enter</span> to open “{q.trim().toUpperCase()}”.
                </>
              )}
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
                go(s.Symbol);
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
  );
};

export default GlobalSearch;
