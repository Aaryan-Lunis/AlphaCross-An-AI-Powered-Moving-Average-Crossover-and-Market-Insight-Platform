import React from 'react';
import Skeleton from './ui/Skeleton';
import { toneClass } from '../lib/format';

// One key metric: label, value, optional note. `tone` is only for values with
// financial direction (returns, spreads) - never for decoration.
export const SummaryCard = ({ label, value, hint, tone = 'neutral', loading = false, mono = true, children }) => (
  <div className="min-w-0 px-4 py-3.5">
    <p className="text-meta text-ink-3">{label}</p>
    {loading ? (
      <Skeleton className="mt-2 h-6 w-24" />
    ) : (
      <p
        className={`mt-1 truncate text-section font-semibold ${mono ? 'num' : ''} ${
          tone === 'neutral' ? 'text-ink' : toneClass[tone] || 'text-ink'
        }`}
      >
        {value}
      </p>
    )}
    {loading ? (
      <Skeleton className="mt-2 h-3 w-32" />
    ) : (
      (hint || children) && <div className="mt-0.5 text-meta text-ink-2">{hint || children}</div>
    )}
  </div>
);

// A single bordered group of metrics, separated by hairlines. Reads as one
// instrument panel rather than a row of identical cards.
export const SummaryStrip = ({ children, className = '' }) => {
  const count = React.Children.count(children);
  const cols =
    count === 4
      ? 'grid-cols-2 lg:grid-cols-4'
      : count === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : 'grid-cols-2';
  return (
    <div
      className={`card grid ${cols} gap-px overflow-hidden ${className}`}
      style={{ background: 'rgb(var(--line))' }}
    >
      {React.Children.map(children, (child) => (
        <div className="bg-card">{child}</div>
      ))}
    </div>
  );
};

export default SummaryCard;

// Dense grid of secondary metrics. Hairlines between cells, any number of items.
export const MetricGrid = ({ items, className = '' }) => (
  <div className={`overflow-hidden rounded-lg border border-line ${className}`}>
    <div className="-mb-px -mr-px grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {items.map((m) => (
        <div key={m.label} className="min-w-0 border-b border-r border-line px-4 py-3" title={m.title}>
          <p className="text-meta text-ink-3">{m.label}</p>
          <p
            className={`num mt-0.5 truncate text-body font-medium ${
              !m.tone || m.tone === 'neutral' ? 'text-ink' : toneClass[m.tone]
            }`}
          >
            {m.value}
          </p>
          {m.hint && <p className="mt-0.5 text-meta text-ink-3">{m.hint}</p>}
        </div>
      ))}
    </div>
  </div>
);
