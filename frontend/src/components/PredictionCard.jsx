import React from 'react';
import { ArrowDownRight, ArrowUpRight, MessageSquare } from 'lucide-react';
import Button from './ui/Button';
import Skeleton from './ui/Skeleton';
import { ErrorState } from './ui/States';
import { fmtDate, plain } from '../lib/format';

const TREND = {
  BULLISH: { label: 'Bullish', text: 'text-pos', bar: 'bg-pos', blurb: 'EMA 20 is above EMA 50 and rising.' },
  BEARISH: { label: 'Bearish', text: 'text-neg', bar: 'bg-neg', blurb: 'EMA 20 is below EMA 50 and falling.' },
  NEUTRAL: { label: 'No clear trend', text: 'text-ink-2', bar: 'bg-ink-3', blurb: 'EMA 20 and its slope do not agree.' },
};

const PredictionCard = ({ prediction, loading, error, onRetry, symbol, asOf, onAsk }) => {
  const trend = prediction ? TREND[prediction.prediction] || TREND.NEUTRAL : null;
  const factors = prediction?.explainability?.top_factors || [];
  const maxImpact = Math.max(0.0001, ...factors.map((f) => Math.abs(f.impact)));
  const confidencePct = prediction ? Math.round(prediction.confidence * 100) : 0;

  return (
    <section className="card flex h-full flex-col" aria-label="Model output">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <h2 className="text-body font-semibold text-ink">Model output</h2>
        {asOf && <span className="text-meta text-ink-3">As of {fmtDate(asOf)}</span>}
      </div>

      {loading && (
        <div className="space-y-4 p-5" role="status" aria-label="Loading model output">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-28 w-full" />
        </div>
      )}

      {!loading && error && (
        <ErrorState compact title="Model output unavailable" message="The prediction could not be loaded." onRetry={onRetry} />
      )}

      {!loading && !error && prediction && (
        <div className="flex flex-1 flex-col p-5">
          <p className={`text-title font-semibold ${trend.text}`}>{trend.label}</p>
          <p className="mt-0.5 text-ui text-ink-2">{trend.blurb}</p>

          <div className="mt-5">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-ui text-ink-2">Confidence score</span>
              <span className="num text-body font-medium text-ink">{confidencePct}%</span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-elevated"
              role="progressbar"
              aria-valuenow={confidencePct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Confidence score"
            >
              <div className={`h-full rounded-full ${trend.bar}`} style={{ width: `${confidencePct}%` }} />
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line text-center">
            {[
              ['EMA 20', plain(prediction.ema_20)],
              ['EMA 50', plain(prediction.ema_50)],
              ['RSI', plain(prediction.rsi, 1)],
            ].map(([k, v]) => (
              <div key={k} className="bg-card px-2 py-2.5">
                <dt className="text-meta text-ink-3">{k}</dt>
                <dd className="num mt-0.5 text-ui font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>

          {factors.length > 0 && (
            <div className="mt-5">
              <h3 className="text-ui font-medium text-ink">What drove it</h3>
              <ul className="mt-2.5 space-y-2.5">
                {factors.map((f) => {
                  const positive = f.direction === 'positive';
                  return (
                    <li key={f.feature}>
                      <div className="flex items-center justify-between gap-2 text-ui">
                        <span className="flex min-w-0 items-center gap-1.5 text-ink-2">
                          {positive ? (
                            <ArrowUpRight className="h-3.5 w-3.5 flex-shrink-0 text-pos" aria-label="pushes up" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5 flex-shrink-0 text-neg" aria-label="pushes down" />
                          )}
                          <span className="truncate">{f.feature}</span>
                        </span>
                        <span className={`num text-meta ${positive ? 'text-pos' : 'text-neg'}`}>
                          {positive ? '+' : '−'}
                          {Math.abs(f.impact).toFixed(3)}
                        </span>
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-elevated">
                        <div
                          className={`h-full rounded-full ${positive ? 'bg-pos/70' : 'bg-neg/70'}`}
                          style={{ width: `${(Math.abs(f.impact) / maxImpact) * 100}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-meta text-ink-3">Feature attribution from an XGBoost model, explained with SHAP.</p>
            </div>
          )}

          <details className="mt-5 text-ui text-ink-2">
            <summary className="cursor-pointer select-none rounded text-ink-2 hover:text-ink">How this is calculated</summary>
            <p className="mt-2 text-meta text-ink-3">
              The trend label and confidence score come from the EMA 20/50 trend rule: EMA 20 against EMA 50, plus the
              slope of EMA 20. The confidence score is a heuristic, not a probability. This is model output, not
              investment advice.
            </p>
          </details>

          {onAsk && (
            <div className="mt-auto pt-5">
              <Button variant="subtle" className="w-full" onClick={onAsk}>
                <MessageSquare className="h-4 w-4" />
                Ask the assistant about {symbol}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default PredictionCard;
