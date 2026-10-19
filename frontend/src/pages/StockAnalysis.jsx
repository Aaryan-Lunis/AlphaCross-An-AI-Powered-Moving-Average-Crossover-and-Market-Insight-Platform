import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, RefreshCw, Sparkles, Star, X } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge, { AiBadge, TrendBadge } from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/States';
import StockSelector from '../components/StockSelector';
import PriceChart from '../components/PriceChart';
import PredictionCard from '../components/PredictionCard';
import PerformanceTable from '../components/PerformanceTable';
import NewsCard from '../components/NewsCard';
import AISummary from '../components/AISummary';
import CrossoverList from '../components/CrossoverList';
import Markdown from '../components/Markdown';
import { SummaryCard, SummaryStrip } from '../components/SummaryCard';
import { LAST_SYMBOL_KEY, getLastSymbol } from '../components/layout/Sidebar';
import { useStockBundle } from '../hooks/useStockBundle';
import { useStockList } from '../hooks/useStockList';
import { useWatchlist } from '../hooks/useWatchlist';
import api from '../api/api';
import { dayChange, emaSpreadPct, findCrossovers, rsiState, trendOf } from '../lib/signals';
import { fmtDate, inr, pct, plain, signedInr, toneClass, toneOf } from '../lib/format';

const errorMessage = (err, symbol) => {
  const status = err?.response?.status;
  if (status === 404) return `No market data was found for ${symbol}. Check the symbol and try again.`;
  if (!err?.response) return 'The backend could not be reached. Check that it is running, then try again.';
  return err?.response?.data?.detail || 'The data could not be loaded.';
};

const StockAnalysisView = ({ symbol }) => {
  const navigate = useNavigate();
  const b = useStockBundle(symbol);
  const wl = useWatchlist();
  const { industryOf } = useStockList();
  const [range, setRange] = useState('6M');
  const [explain, setExplain] = useState({ status: 'idle', text: '' });

  useEffect(() => {
    try {
      localStorage.setItem(LAST_SYMBOL_KEY, symbol);
    } catch (e) {
      /* ignore */
    }
    setExplain({ status: 'idle', text: '' });
  }, [symbol]);

  const q = b.quote.data;
  const change = useMemo(() => dayChange(b.rows), [b.rows]);
  const trend = q ? trendOf(q.ema20, q.ema50) : null;
  const spread = q ? emaSpreadPct(q.ema20, q.ema50) : null;
  const rsi = q ? rsiState(q.rsi) : null;
  const industry = industryOf(symbol);
  const watched = wl.has(symbol);

  const recent = useMemo(() => {
    const all = findCrossovers(b.rows);
    return all
      .slice(-5)
      .reverse()
      .map((c) => ({ ...c, sessionsAgo: b.rows.length - 1 - c.index }));
  }, [b.rows]);

  const runExplain = async () => {
    setExplain({ status: 'loading', text: '' });
    try {
      const res = await api.explainChart(symbol, b.chart.data, b.prediction.data || {});
      setExplain({ status: 'done', text: res.explanation });
    } catch (e) {
      setExplain({ status: 'error', text: '' });
    }
  };

  const askAssistant = () => {
    const label = b.prediction.data?.prediction?.toLowerCase();
    const question = label ? `Why does ${symbol} show a ${label} signal?` : `What is the current trend for ${symbol}?`;
    navigate(`/assistant/${symbol}?q=${encodeURIComponent(question)}`);
  };

  const quoteFailed = !b.quote.loading && b.quote.error;

  return (
    <div className="space-y-6">
      <StockSelector
        value={symbol}
        onChange={(s) => navigate(`/analysis/${s}`)}
        chips={wl.symbols.slice(0, 8)}
        chipsLabel="Watchlist"
        className="max-w-2xl"
      />

      {/* Instrument header */}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="num text-title font-semibold text-ink">{symbol}</h1>
            <span className="sr-only">stock analysis</span>
            {industry && <Badge tone="neutral">{industry}</Badge>}
            {trend && <TrendBadge trend={trend} />}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => wl.toggle(symbol)}
              aria-pressed={watched}
              aria-label={watched ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
              title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <Star className={`h-[18px] w-[18px] ${watched ? 'fill-warn text-warn' : ''}`} />
            </Button>
          </div>

          {b.quote.loading ? (
            <Skeleton className="mt-3 h-8 w-64" />
          ) : q ? (
            <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="num text-[28px] font-semibold leading-9 text-ink">{inr(q.close)}</span>
              {change && (
                <span className={`num text-body font-medium ${toneClass[toneOf(change.abs)]}`}>
                  {signedInr(change.abs)} ({pct(change.pct, 2, { sign: true })})
                </span>
              )}
              <span className="text-meta text-ink-3">vs previous close · as of {fmtDate(q.date)}</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={b.reloadAll} aria-label="Refresh all data">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="subtle" onClick={askAssistant}>
            <MessageSquare className="h-4 w-4" />
            Ask the assistant
          </Button>
        </div>
      </div>

      {quoteFailed && (
        <div className="card">
          <ErrorState
            compact
            title={`Couldn't load ${symbol}`}
            message={errorMessage(b.quote.error, symbol)}
            onRetry={b.reloadAll}
          />
        </div>
      )}

      {/* Key indicators */}
      {!quoteFailed && (
        <SummaryStrip>
          <SummaryCard
            label="EMA 20"
            loading={b.quote.loading}
            value={q ? plain(q.ema20) : '—'}
            hint={q ? `Price ${q.close >= q.ema20 ? 'above' : 'below'} EMA 20` : undefined}
          />
          <SummaryCard
            label="EMA 50"
            loading={b.quote.loading}
            value={q ? plain(q.ema50) : '—'}
            hint={q ? `Price ${q.close >= q.ema50 ? 'above' : 'below'} EMA 50` : undefined}
          />
          <SummaryCard
            label="EMA spread"
            loading={b.quote.loading}
            value={pct(spread, 2, { sign: true })}
            tone={toneOf(spread) === 'flat' ? 'neutral' : toneOf(spread)}
            hint="EMA 20 relative to EMA 50"
          />
          <SummaryCard
            label="RSI (14)"
            loading={b.quote.loading}
            value={q ? plain(q.rsi, 1) : '—'}
            hint={
              rsi && (
                <span className={rsi.tone === 'warn' ? 'text-warn' : rsi.tone === 'info' ? 'text-info' : ''}>
                  {rsi.label}
                </span>
              )
            }
          />
        </SummaryStrip>
      )}

      {/* Chart + model output */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PriceChart
          rows={b.rows}
          range={range}
          onRangeChange={setRange}
          loading={b.chart.loading}
          error={b.chart.error}
          onRetry={b.chart.reload}
          heading={
            <div>
              <h2 className="text-body font-semibold text-ink">Price and moving averages</h2>
              <p className="text-meta text-ink-3">Daily close with EMA 20 and EMA 50. Triangles mark crossovers.</p>
            </div>
          }
          actions={
            <Button
              size="sm"
              onClick={runExplain}
              disabled={explain.status === 'loading' || b.rows.length === 0}
            >
              <Sparkles className={`h-3.5 w-3.5 ${explain.status === 'loading' ? 'animate-pulse' : ''}`} />
              {explain.status === 'loading' ? 'Explaining…' : 'Explain chart'}
            </Button>
          }
        >
          {explain.status !== 'idle' && (
            <div className="mx-4 mb-4 rounded-lg border border-line bg-surface p-4 sm:mx-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-ui font-medium text-ink">Chart explanation</h3>
                  <AiBadge />
                </div>
                <button
                  type="button"
                  onClick={() => setExplain({ status: 'idle', text: '' })}
                  className="rounded p-1 text-ink-3 hover:bg-elevated hover:text-ink"
                  aria-label="Dismiss explanation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {explain.status === 'loading' && (
                <div className="space-y-2" role="status" aria-label="Generating explanation">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-10/12" />
                  <Skeleton className="h-4 w-8/12" />
                </div>
              )}
              {explain.status === 'done' && <Markdown text={explain.text} />}
              {explain.status === 'error' && (
                <p className="text-ui text-ink-2">
                  The explanation could not be generated right now.{' '}
                  <button type="button" onClick={runExplain} className="rounded text-accent-hi underline underline-offset-2">
                    Try again
                  </button>
                </p>
              )}
            </div>
          )}

          {!b.chart.loading && !b.chart.error && b.rows.length > 0 && (
            <div className="border-t border-line">
              <div className="flex items-baseline justify-between px-4 pt-3 sm:px-5">
                <h3 className="text-ui font-medium text-ink">Recent crossovers</h3>
                <span className="text-meta text-ink-3">Last 6 months</span>
              </div>
              <CrossoverList items={recent} />
            </div>
          )}
        </PriceChart>

        <PredictionCard
          prediction={b.prediction.data}
          loading={b.prediction.loading}
          error={b.prediction.error}
          onRetry={b.prediction.reload}
          symbol={symbol}
          asOf={q?.date}
          onAsk={askAssistant}
        />
      </div>

      <PerformanceTable
        backtest={b.backtest.data}
        loading={b.backtest.loading}
        error={b.backtest.error}
        onRetry={b.backtest.reload}
        symbol={symbol}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AISummary
          summary={b.summary.data?.summary}
          loading={b.summary.loading}
          error={b.summary.error}
          onReload={b.summary.reload}
        />
        <NewsCard news={b.news.data} loading={b.news.loading} />
      </div>
    </div>
  );
};

const StockAnalysis = () => {
  const { symbol } = useParams();
  if (!symbol) return <Navigate to={`/analysis/${getLastSymbol()}`} replace />;
  return <StockAnalysisView key={symbol.toUpperCase()} symbol={symbol.toUpperCase()} />;
};

export default StockAnalysis;
