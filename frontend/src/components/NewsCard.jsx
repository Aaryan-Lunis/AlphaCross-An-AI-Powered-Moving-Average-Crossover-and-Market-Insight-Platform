import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import Badge, { AiBadge } from './ui/Badge';
import Skeleton from './ui/Skeleton';
import { EmptyState } from './ui/States';
import { Newspaper } from 'lucide-react';

const sentimentTone = (s) => {
  const v = (s || '').toLowerCase();
  if (v.includes('bull') || v.includes('positive')) return 'pos';
  if (v.includes('bear') || v.includes('negative')) return 'neg';
  return 'neutral';
};

const NewsCard = ({ news, loading }) => (
  <section className="card flex h-full flex-col" aria-label="News intelligence">
    <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
      <h2 className="text-body font-semibold text-ink">News</h2>
      {news?.available && (
        <Badge tone={sentimentTone(news.sentiment)} title="Sentiment classified by an AI model from the headlines below">
          {news.sentiment} sentiment{news.confidence ? ` · ${news.confidence}%` : ''}
        </Badge>
      )}
    </div>

    {loading && (
      <div className="space-y-3 p-5" role="status" aria-label="Loading news">
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-10/12" />
        <Skeleton className="h-4 w-9/12" />
        <Skeleton className="mt-4 h-16 w-full" />
      </div>
    )}

    {!loading && (!news || !news.available) && (
      <EmptyState
        icon={Newspaper}
        title="News isn't available"
        description={news?.message || 'News intelligence is not available right now.'}
        className="py-10"
      />
    )}

    {!loading && news?.available && (
      <div className="space-y-5 p-5">
        {news.headlines?.length > 0 && (
          <div>
            <h3 className="mb-2 text-ui font-medium text-ink">Headlines</h3>
            <ul className="space-y-2">
              {news.headlines.slice(0, 5).map((h, i) => (
                <li key={i} className="text-ui text-ink-2">
                  {h.url ? (
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-start gap-1.5 rounded hover:text-ink"
                    >
                      <span>{h.title}</span>
                      <ExternalLink className="mt-1 h-3 w-3 flex-shrink-0 text-ink-3 group-hover:text-accent-hi" aria-label="opens in a new tab" />
                    </a>
                  ) : (
                    h.title
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(news.summary || news.risks?.length > 0 || news.impact) && (
          <div className="rounded-lg border border-line bg-surface p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-ui font-medium text-ink">Briefing</h3>
              <AiBadge />
            </div>
            {news.summary && <p className="text-ui leading-relaxed text-ink-2">{news.summary}</p>}
            {news.risks?.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {news.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-ui text-ink-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warn" aria-label="risk" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}
            {news.impact && (
              <p className="mt-3 border-t border-line pt-3 text-ui text-ink-2">
                <span className="font-medium text-ink">Likely impact: </span>
                {news.impact}
              </p>
            )}
          </div>
        )}
      </div>
    )}
  </section>
);

export default NewsCard;
