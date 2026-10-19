import React from 'react';
import { RefreshCw } from 'lucide-react';
import { AiBadge } from './ui/Badge';
import Button from './ui/Button';
import Markdown from './Markdown';
import Skeleton from './ui/Skeleton';
import { ErrorState } from './ui/States';

const AISummary = ({ summary, loading, error, onReload }) => (
  <section className="card flex h-full flex-col" aria-label="AI summary">
    <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
      <div className="flex items-center gap-2.5">
        <h2 className="text-body font-semibold text-ink">Daily summary</h2>
        <AiBadge />
      </div>
      <Button variant="ghost" size="icon-sm" onClick={onReload} disabled={loading} aria-label="Regenerate summary" title="Regenerate summary">
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      </Button>
    </div>

    {loading && (
      <div className="space-y-3 p-5" role="status" aria-label="Loading summary">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-9/12" />
      </div>
    )}
    {!loading && error && (
      <ErrorState compact title="Summary unavailable" message="The AI summary could not be generated." onRetry={onReload} />
    )}
    {!loading && !error && (
      <div className="p-5">
        {summary ? <Markdown text={summary} /> : <p className="text-ui text-ink-2">No summary available for this stock.</p>}
      </div>
    )}
  </section>
);

export default AISummary;
