import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Segmented from './ui/Segmented';
import Skeleton from './ui/Skeleton';
import { EmptyState, ErrorState } from './ui/States';
import { fmtTime, pct, plain, toneClass, toneOf } from '../lib/format';

// Largest one-day moves among the large-cap stocks the backend tracks.
const MarketMovers = ({ data, loading, error, onRetry }) => {
  const [side, setSide] = useState('gainers');
  const list = data ? data[side] || [] : [];

  return (
    <section className="card flex h-full flex-col" aria-label="Market movers">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div>
          <h2 className="text-body font-semibold text-ink">Daily movers</h2>
          <p className="text-meta text-ink-3">
            20 large-cap stocks{data?.timestamp ? ` · updated ${fmtTime(data.timestamp)}` : ''}
          </p>
        </div>
        <Segmented
          size="sm"
          label="Movers"
          value={side}
          onChange={setSide}
          options={[
            { value: 'gainers', label: 'Gainers' },
            { value: 'losers', label: 'Losers' },
          ]}
        />
      </div>

      {loading && (
        <div className="space-y-3 p-4" role="status" aria-label="Loading movers">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      )}
      {!loading && error && (
        <ErrorState compact title="Movers unavailable" message="Market movers could not be loaded." onRetry={onRetry} />
      )}
      {!loading && !error && list.length === 0 && (
        <EmptyState title="No movers right now" description="Price changes are unavailable at the moment." className="py-8" />
      )}
      {!loading && !error && list.length > 0 && (
        <ul className="divide-y divide-line/60">
          {list.map((s) => (
            <li key={s.symbol}>
              <Link
                to={`/analysis/${s.symbol}`}
                className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-elevated/60"
              >
                <div className="min-w-0">
                  <p className="num text-ui font-medium text-ink">{s.symbol}</p>
                  <p className="truncate text-meta text-ink-3">{s.sector}</p>
                </div>
                <div className="text-right">
                  <p className="num text-ui text-ink">{plain(s.price)}</p>
                  <p className={`num text-meta ${toneClass[toneOf(s.change)]}`}>{pct(s.change, 2, { sign: true })}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default MarketMovers;
