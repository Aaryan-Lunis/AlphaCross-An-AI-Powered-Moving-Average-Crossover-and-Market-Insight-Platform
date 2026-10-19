import React from 'react';

// Two moving averages crossing - the product's core signal, drawn as a mark.
export const LogoMark = ({ className = 'h-7 w-7' }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
    <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8" fill="rgb(var(--accent-soft))" stroke="rgb(var(--line))" strokeWidth="1.5" />
    <path d="M6 22 C 12 22, 14 11, 20 11 S 25 10, 26 9" stroke="rgb(var(--ink-2))" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 11 C 12 11, 14 21, 20 21 S 25 22, 26 23" stroke="rgb(var(--accent-hi))" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const Logo = ({ collapsed = false }) => (
  <div className="flex items-center gap-2.5">
    <LogoMark />
    {!collapsed && <span className="text-body font-semibold tracking-tight text-ink">AlphaCross</span>}
  </div>
);

export default Logo;
