import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Bot, CandlestickChart, ChevronRight, FlaskConical, ListFilter, RefreshCw } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { TrendBadge } from '../components/ui/Badge';
import PriceChart from '../components/PriceChart';
import Watchlist from '../components/Watchlist';
import MarketMovers from '../components/MarketMovers';
import CrossoverList from '../components/CrossoverList';
import { SummaryCard, SummaryStrip } from '../components/SummaryCard';
import { getLastSymbol } from '../components/layout/Sidebar';
import { useMultiChart } from '../hooks/useMultiChart';
import { useResource } from '../hooks/useResource';
import { useWatchlist } from '../hooks/useWatchlist';
import { loadMovers } from '../lib/loaders';
import { dayChange, findCrossovers, rsiState, trendOf } from '../lib/signals';
import { inr, pct, signedInr, toneClass, toneOf } from '../lib/format';

const today = () =>
  new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const QuickLink = ({ to, icon: Icon, title, text }) => (
  <Link
    to={to}
    className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-elevated/60"
  >
    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-elevated text-ink-2 group-hover:text-accent-hi">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-ui font-medium text-ink">{title}</span>
      <span className="block truncate text-meta text-ink-3">{text}</span>
    </span>
    <ChevronRight className="h-4 w-4 text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
  </Link>
);

const Overview = () => {
  const wl = useWatchlist();
  const [reloadKey, setReloadKey] = useState(0);
  const charts = useMultiChart(wl.symbols, reloadKey);
  const movers = useResource('movers', (o) => loadMovers(o));
  const [focus, setFocus] = useState(null);
  const [range, setRange] = useState('3M');

  const focusSym = wl.symbols.includes(focus) ? focus : wl.symbols[0];
  const focusChart = focusSym ? charts[focusSym] : null;
  const focusRows = focusChart?.rows || [];
  const focusLast = focusRows[focusRows.length - 1];
  const focusChange = dayChange(focusRows);

  const stats = useMemo(() => {
    const ready = wl.symbols.filter((s) => charts[s]?.status === 'ready' && charts[s].rows.length);
    const pending = wl.symbols.some((s) => !charts[s] || charts[s].status === 'loading');
    let bull = 0;
    let bear = 0;
    const extremes = [];
    ready.forEach((s) => {
      const last = charts[s].rows[charts[s].rows.length - 1];
      const t = trendOf(last.ema20, last.ema50);
      if (t === 'bullish') bull += 1;
      if (t === 'bearish') bear += 1;
      const r = rsiState(last.rsi);
      if (r.label === 'Overbought' || r.label === 'Oversold') extremes.push(`${s} ${r.label.toLowerCase()}`);
    });
    return { ready: ready.length, pending, bull, bear, extremes };
  }, [charts, wl.symbols]);

  const crossovers = useMemo(() => {
    const out = [];
    wl.symbols.forEach((s) => {
      const c = charts[s];
      if (c?.status !== 'ready') return;
      findCrossovers(c.rows)
        .slice(-2)
        .forEach((x) => out.push({ ...x, symbol: s, sessionsAgo: c.rows.length - 1 - x.index }));
    });
    return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)).slice(0, 6);
  }, [charts, wl.symbols]);

  const topGainer = movers.data?.gainers?.[0];

  const refresh = () => {
    setReloadKey((k) => k + 1);
    movers.reload();
  };

  return (
    <div>
      <PageHeader
        title="Overview"
        description={today()}
        actions={
          <>
            <Button onClick={refresh} aria-label="Refresh market data">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="primary" as={Link} to={`/analysis/${getLastSymbol()}`}>
              <CandlestickChart className="h-4 w-4" />
              Analyse a stock
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        <SummaryStrip>
          <SummaryCard
            label="Bullish in watchlist"
            loading={stats.pending && stats.ready === 0}
            value={`${stats.bull} of ${stats.ready}`}
            tone={stats.bull > 0 ? 'pos' : 'neutral'}
            hint="EMA 20 above EMA 50"
          />
          <SummaryCard
            label="Bearish in watchlist"
            loading={stats.pending && stats.ready === 0}
            value={`${stats.bear} of ${stats.ready}`}
            tone={stats.bear > 0 ? 'neg' : 'neutral'}
            hint="EMA 20 below EMA 50"
          />
          <SummaryCard
            label="RSI extremes"
            loading={stats.pending && stats.ready === 0}
            value={stats.extremes.length}
            hint={stats.extremes.length ? stats.extremes.slice(0, 2).join(', ') : 'None above 70 or below 30'}
          />
          <SummaryCard
            label="Largest daily gain"
            loading={movers.loading}
            value={topGainer ? topGainer.symbol : '—'}
            tone={topGainer ? 'pos' : 'neutral'}
            hint={topGainer ? `${pct(topGainer.change, 2, { sign: true })} among 20 large caps` : 'Unavailable right now'}
          />
        </SummaryStrip>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <PriceChart
            rows={focusRows}
            range={range}
            onRangeChange={setRange}
            panels={[]}
            priceHeight="h-[300px] sm:h-[380px]"
            loading={!focusSym ? false : !focusChart || focusChart.status === 'loading'}
            error={focusChart?.status === 'error' ? focusChart.error : null}
            onRetry={refresh}
            heading={
              focusSym ? (
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <Link to={`/analysis/${focusSym}`} className="num group inline-flex items-center gap-1 rounded text-section font-semibold text-ink hover:text-accent-hi">
                    {focusSym}
                    <ArrowUpRight className="h-4 w-4 text-ink-3 group-hover:text-accent-hi" aria-label="Open analysis" />
                  </Link>
                  {focusLast && (
                    <>
                      <span className="num text-body text-ink">{inr(focusLast.close)}</span>
                      {focusChange && (
                        <span className={`num text-ui ${toneClass[toneOf(focusChange.abs)]}`}>
                          {signedInr(focusChange.abs)} ({pct(focusChange.pct, 2, { sign: true })})
                        </span>
                      )}
                      <TrendBadge trend={trendOf(focusLast.ema20, focusLast.ema50)} />
                    </>
                  )}
                </div>
              ) : (
                <h2 className="text-body font-semibold text-ink">Price chart</h2>
              )
            }
          />

          <Watchlist
            symbols={wl.symbols}
            charts={charts}
            selected={focusSym}
            onSelect={setFocus}
            onAdd={wl.add}
            onRemove={wl.remove}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="card flex flex-col" aria-label="Recent crossovers">
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-body font-semibold text-ink">Recent crossovers</h2>
              <p className="text-meta text-ink-3">EMA 20/50 signals in your watchlist</p>
            </div>
            {stats.pending && crossovers.length === 0 ? (
              <p className="px-4 py-8 text-center text-ui text-ink-3" role="status">Checking your watchlist…</p>
            ) : (
              <CrossoverList items={crossovers} showSymbol emptyText="No crossovers in your watchlist over the last six months." />
            )}
          </section>

          <MarketMovers data={movers.data} loading={movers.loading} error={movers.error} onRetry={movers.reload} />

          <section className="card" aria-label="Quick access">
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-body font-semibold text-ink">Jump to</h2>
            </div>
            <nav className="divide-y divide-line/60" aria-label="Quick access">
              <QuickLink to="/screener" icon={ListFilter} title="Scan the NSE 500" text="Find bullish and bearish trends" />
              <QuickLink to="/backtesting" icon={FlaskConical} title="Run a backtest" text="Test the crossover strategy on past prices" />
              <QuickLink
                to={`/assistant/${focusSym || getLastSymbol()}`}
                icon={Bot}
                title="Ask the AI assistant"
                text={`Questions about ${focusSym || getLastSymbol()}`}
              />
            </nav>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Overview;
