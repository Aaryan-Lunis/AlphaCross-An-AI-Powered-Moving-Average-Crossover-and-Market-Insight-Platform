import React from 'react';

const PageHeader = ({ title, description, actions, children }) => (
  <header className="mb-6">
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 className="text-title font-semibold text-ink">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-body text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
    {children}
  </header>
);

export default PageHeader;
