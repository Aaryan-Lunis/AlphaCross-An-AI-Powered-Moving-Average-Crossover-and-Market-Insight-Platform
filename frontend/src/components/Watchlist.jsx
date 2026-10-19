import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Plus, X } from 'lucide-react';
import Button from './ui/Button';
import Skeleton from './ui/Skeleton';
import Sparkline from './Sparkline';
import StockSelector from './StockSelector';
import { EmptyState } from './ui/States';
import { TrendBadge } from './ui/Badge';
import { dayChange, trendOf } from '../lib/signals';
import { pct, plain, toneClass, toneOf } from '../lib/format';

// Rows come from real price history. Day change = last close vs previous close.
const Watchlist = ({ symbols, charts, selected, onSelect, onAdd, onRemove }) => {
  const [adding, setAdding] = useState(false);

  return (
    <section className="card flex h-full flex-col" aria-label="Watchlist">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="text-body font-semibold text-ink">Watchlist</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAdding((a) => !a)}
          aria-expanded={adding}
        >
          {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {adding ? 'Close' : 'Add'}
        </Button>
      </div>

      {adding && (
        <div className="border-b border-line p-3">
          <StockSelector
            id="watchlist-add"
            value=""
            chips={null}
            placeholder="Add a stock to your watchlist"
            onChange={(sym) => {
              onAdd(sym);
              setAdding(false);
            }}
          />
        </div>
      )}

      {symbols.length === 0 ? (
        <EmptyState
          title="Your watchlist is empty"
          description="Add stocks to track their price and trend here."
          className="py-10"
        />
      ) : (
        <ul className="flex-1 divide-y divide-line/60">
          {symbols.map((s) => {
            const c = charts[s];
            const rows = c?.rows || [];
            const last = rows[rows.length - 1];
            const chg = dayChange(rows);
            const tone = toneOf(chg?.pct);
            const isSel = s === selected;
            return (
              <li key={s} className={`group relative flex items-center ${isSel ? 'bg-accent-soft/60' : 'hover:bg-elevated/60'}`}>
                {isSel && <span className="absolute inset-y-0 left-0 w-0.5 bg-accent-hi" aria-hidden="true" />}
                <button
                  type="button"
                  onClick={() => onSelect(s)}
                  aria-pressed={isSel}
                  className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-2.5 text-left"
                >
                  <div className="min-w-0">
                    <p className="num text-ui font-medium text-ink">{s}</p>
                    {!c || c.status === 'loading' ? (
                      <Skeleton className="mt-1 h-3 w-14" />
                    ) : c.status === 'error' ? (
                      <p className="mt-0.5 text-meta text-ink-3">No data</p>
                    ) : (
                      <div className="mt-0.5">
                        <TrendBadge trend={trendOf(last?.ema20, last?.ema50)} />
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:block xl:hidden 2xl:block">
                    {c?.status === 'ready' && (
                      <Sparkline values={rows.slice(-30).map((r) => r.close)} tone={tone} />
                    )}
                  </div>
                  <div className="text-right">
                    {c?.status === 'ready' ? (
                      <>
                        <p className="num text-ui text-ink">{plain(last?.close)}</p>
                        <p className={`num text-meta ${toneClass[tone]}`}>{chg ? pct(chg.pct, 2, { sign: true }) : '—'}</p>
                      </>
                    ) : (
                      <Skeleton className="h-8 w-16" />
                    )}
                  </div>
                </button>
                <div className="flex items-center pr-2 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  <Link
                    to={`/analysis/${s}`}
                    className="rounded p-1.5 text-ink-3 hover:bg-elevated hover:text-ink"
                    aria-label={`Open ${s} analysis`}
                    title="Open analysis"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onRemove(s)}
                    className="rounded p-1.5 text-ink-3 hover:bg-elevated hover:text-neg"
                    aria-label={`Remove ${s} from watchlist`}
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default Watchlist;
