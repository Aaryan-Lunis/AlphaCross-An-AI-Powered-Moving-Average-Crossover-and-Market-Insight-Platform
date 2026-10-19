import React, { useCallback, useMemo } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import Badge, { AiBadge, TrendBadge } from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import StockSelector from '../components/StockSelector';
import ChatPanel from '../components/ChatPanel';
import { getLastSymbol, LAST_SYMBOL_KEY } from '../components/layout/Sidebar';
import { useStockBundle } from '../hooks/useStockBundle';
import { useWatchlist } from '../hooks/useWatchlist';
import { fmtDate, pct, plain } from '../lib/format';
import { rsiState, trendOf } from '../lib/signals';

const Row = ({ k, v, loading }) => (
  <div className="flex items-center justify-between gap-3 py-2 text-ui">
    <dt className="text-ink-2">{k}</dt>
    <dd className="num text-right font-medium text-ink">{loading ? <Skeleton className="h-4 w-16" /> : v}</dd>
  </div>
);

const Group = ({ title, badge, children }) => (
  <div className="px-5 py-4">
    <div className="mb-1 flex items-center justify-between gap-2">
      <h3 className="text-ui font-medium text-ink">{title}</h3>
      {badge}
    </div>
    <dl className="divide-y divide-line/60">{children}</dl>
  </div>
);

const AssistantView = ({ symbol }) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const wl = useWatchlist();
  const b = useStockBundle(symbol);

  React.useEffect(() => {
    try {
      localStorage.setItem(LAST_SYMBOL_KEY, symbol);
    } catch (e) {
      /* ignore */
    }
  }, [symbol]);

  const q = b.quote.data;
  const pred = b.prediction.data;
  const news = b.news.data;
  const bt = b.backtest.data?.summary;
  const factors = pred?.explainability?.top_factors;

  // Same context keys the backend chat endpoint already reads. Missing values are omitted.
  const buildContext = useCallback(() => {
    const ctx = {
      prediction: pred?.prediction,
      confidence: pred?.confidence,
      ema20: pred?.ema_20 ?? q?.ema20,
      ema50: pred?.ema_50 ?? q?.ema50,
      rsi: pred?.rsi ?? q?.rsi,
      sentiment: news?.available ? news.sentiment : undefined,
      news_summary: news?.available ? news.summary : undefined,
      news_risks: news?.available ? news.risks : undefined,
      top_factors: factors,
      backtest_win_rate: bt?.win_rate_pct,
    };
    return Object.fromEntries(Object.entries(ctx).filter(([, v]) => v !== undefined && v !== null));
  }, [pred, q, news, factors, bt]);

  const suggestions = useMemo(() => {
    const label = pred?.prediction?.toLowerCase();
    const list = [
      label ? `Why does ${symbol} show a ${label} signal?` : `What is the current trend for ${symbol}?`,
      `How did the EMA crossover strategy perform on ${symbol}?`,
      `Summarise the main news risks for ${symbol}`,
      q ? `Is an RSI of ${q.rsi} a concern for ${symbol}?` : `What does RSI say about ${symbol}?`,
    ];
    if (factors?.length) list.splice(1, 0, 'What do the main model factors mean?');
    return list.slice(0, 4);
  }, [symbol, pred, q, factors]);

  const ready = !b.quote.loading && !b.prediction.loading && !b.news.loading;
  const rsi = q ? rsiState(q.rsi) : null;

  return (
    <div>
      <PageHeader
        title="AI assistant"
        description="Ask about a stock's signals, model output, backtest and news. Answers use the data shown on the right."
      >
        <StockSelector
          value={symbol}
          onChange={(s) => navigate(`/assistant/${s}`)}
          chips={wl.symbols.slice(0, 8)}
          chipsLabel="Watchlist"
          className="mt-4 max-w-2xl"
        />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ChatPanel
          symbol={symbol}
          buildContext={buildContext}
          suggestions={suggestions}
          prefill={params.get('q') || ''}
          contextReady={ready}
        />

        <aside className="card h-fit divide-y divide-line" aria-label="Data the assistant can see">
          <div className="flex items-center justify-between px-5 py-3">
            <h2 className="text-body font-semibold text-ink">Context for {symbol}</h2>
            <Link to={`/analysis/${symbol}`} className="rounded text-meta text-accent-hi hover:underline">
              Open analysis
            </Link>
          </div>

          <Group title="Market data" badge={<Badge tone="info" title="Calculated from price data">Calculated</Badge>}>
            <Row k="Last close" loading={b.quote.loading} v={q ? plain(q.close) : '—'} />
            <Row k="EMA 20" loading={b.quote.loading} v={q ? plain(q.ema20) : '—'} />
            <Row k="EMA 50" loading={b.quote.loading} v={q ? plain(q.ema50) : '—'} />
            <Row k="RSI (14)" loading={b.quote.loading} v={q ? `${plain(q.rsi, 1)}${rsi ? ` · ${rsi.label}` : ''}` : '—'} />
            <Row k="As of" loading={b.quote.loading} v={q ? fmtDate(q.date) : '—'} />
          </Group>

          <Group title="Model output" badge={<Badge tone="neutral" title="EMA 20/50 trend rule with SHAP attribution">Model</Badge>}>
            <Row
              k="Trend"
              loading={b.prediction.loading}
              v={pred ? <TrendBadge trend={pred.prediction} /> : q ? <TrendBadge trend={trendOf(q.ema20, q.ema50)} /> : '—'}
            />
            <Row k="Confidence score" loading={b.prediction.loading} v={pred ? pct(pred.confidence * 100, 0) : '—'} />
            <Row k="Backtest win rate" loading={b.backtest.loading} v={bt ? pct(bt.win_rate_pct, 1) : '—'} />
          </Group>

          <Group title="News" badge={<AiBadge />}>
            <Row
              k="Sentiment"
              loading={b.news.loading}
              v={news?.available ? `${news.sentiment}${news.confidence ? ` · ${news.confidence}%` : ''}` : 'Unavailable'}
            />
          </Group>

          <p className="px-5 py-3 text-meta text-ink-3">
            Market data and model output are calculated by AlphaCross. Text written by the assistant is labelled
            AI-generated and may contain mistakes.
          </p>
        </aside>
      </div>
    </div>
  );
};

const AIAssistant = () => {
  const { symbol } = useParams();
  if (!symbol) return <Navigate to={`/assistant/${getLastSymbol()}`} replace />;
  return <AssistantView symbol={symbol.toUpperCase()} />;
};

export default AIAssistant;
