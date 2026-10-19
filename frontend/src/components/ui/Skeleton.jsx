import React from 'react';

const Skeleton = ({ className = '', style }) => (
  <div aria-hidden="true" className={`animate-pulse rounded-md bg-elevated ${className}`} style={style} />
);

export const SkeletonRows = ({ rows = 5, className = '' }) => (
  <div className={`space-y-3 ${className}`} role="status" aria-label="Loading">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-5" style={{ width: `${92 - (i % 3) * 14}%` }} />
    ))}
  </div>
);

export default Skeleton;
