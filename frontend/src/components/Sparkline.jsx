import React from 'react';

// Tiny trend line drawn from real closing prices.
const Sparkline = ({ values, tone = 'flat', width = 72, height = 22 }) => {
  const v = (values || []).filter((x) => typeof x === 'number');
  if (v.length < 2) return <span className="inline-block" style={{ width, height }} />;
  const min = Math.min(...v);
  const max = Math.max(...v);
  const span = max - min || 1;
  const pts = v.map((y, i) => {
    const x = (i / (v.length - 1)) * (width - 2) + 1;
    const yy = height - 2 - ((y - min) / span) * (height - 4);
    return `${x.toFixed(1)},${yy.toFixed(1)}`;
  });
  const color = tone === 'pos' ? 'rgb(var(--pos))' : tone === 'neg' ? 'rgb(var(--neg))' : 'rgb(var(--ink-3))';
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="block">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

export default Sparkline;
