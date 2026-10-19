import React from 'react';

// Compact single-choice control (range pickers, signal filters, tabs).
const Segmented = ({ options, value, onChange, label, size = 'md', className = '' }) => (
  <div
    role="radiogroup"
    aria-label={label}
    className={`inline-flex rounded-md border border-line bg-surface p-0.5 ${className}`}
  >
    {options.map((o) => {
      const active = o.value === value;
      return (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(o.value)}
          className={`rounded-[6px] font-medium transition-colors ${
            size === 'sm' ? 'px-2.5 py-1 text-meta' : 'px-3 py-1.5 text-ui'
          } ${active ? 'bg-elevated text-ink shadow-card' : 'text-ink-2 hover:text-ink'}`}
        >
          {o.label}
          {o.count != null && (
            <span className={`num ml-1.5 text-meta ${active ? 'text-ink-2' : 'text-ink-3'}`}>{o.count}</span>
          )}
        </button>
      );
    })}
  </div>
);

export default Segmented;
