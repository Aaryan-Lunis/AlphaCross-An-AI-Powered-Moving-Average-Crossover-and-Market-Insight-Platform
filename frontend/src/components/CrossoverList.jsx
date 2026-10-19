import React from 'react';
import { Link } from 'react-router-dom';
import Badge from './ui/Badge';
import { EmptyState } from './ui/States';
import { fmtDate, inr } from '../lib/format';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

// Rows: { symbol?, date, type: 'bullish'|'bearish', price, sessionsAgo? }
const CrossoverList = ({ items, showSymbol = false, emptyText = 'No EMA 20/50 crossovers in this period.' }) => {
  if (!items || items.length === 0) {
    return <EmptyState title="No crossovers" description={emptyText} className="py-8" />;
  }
  return (
    <ul className="divide-y divide-line/60">
      {items.map((c, i) => (
        <li key={`${c.symbol || ''}-${c.date}-${i}`} className="flex items-center gap-3 px-4 py-2.5">
          <Badge tone={c.type === 'bullish' ? 'pos' : 'neg'} icon={c.type === 'bullish' ? ArrowUpRight : ArrowDownRight}>
            {c.type === 'bullish' ? 'Bullish' : 'Bearish'}
          </Badge>
          {showSymbol && (
            <Link
              to={`/analysis/${c.symbol}`}
              className="num rounded text-ui font-medium text-ink hover:text-accent-hi"
            >
              {c.symbol}
            </Link>
          )}
          <span className="text-ui text-ink-2">{fmtDate(c.date)}</span>
          {typeof c.sessionsAgo === 'number' && (
            <span className="hidden text-meta text-ink-3 sm:inline">
              {c.sessionsAgo === 0 ? 'latest session' : `${c.sessionsAgo} session${c.sessionsAgo === 1 ? '' : 's'} ago`}
            </span>
          )}
          <span className="num ml-auto text-ui text-ink">{inr(c.price)}</span>
        </li>
      ))}
    </ul>
  );
};

export default CrossoverList;
