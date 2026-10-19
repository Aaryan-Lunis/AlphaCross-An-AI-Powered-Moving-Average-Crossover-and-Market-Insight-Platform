import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, RefreshCw, Search, SearchX, X } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import Segmented from '../components/ui/Segmented';
import DataTable from '../components/ui/DataTable';
import Skeleton from '../components/ui/Skeleton';
import { TrendBadge } from '../components/ui/Badge';
import { EmptyState, ErrorState } from '../components/ui/States';
import { SummaryCard, SummaryStrip } from '../components/SummaryCard';
import { getScreenState, runScreen, subscribeScreen } from '../lib/screenStore';
import { emaSpreadPct } from '../lib/signals';
import { fmtDateTime, fmtElapsed, pct, plain, toneClass, toneOf } from '../lib/format';

const SCOPES = [
  { value: 100, label: 'First 100 stocks' },
  { value: 250, label: 'First 250 stocks' },
  { value: 500, label: 'All 500 stocks' },
];

const SIGNAL_ORDER = { bullish: 0, neutral: 1, bearish: 2 };

const ScreeningResults = () => {
  const navigate = useNavigate();
  const st = useSyncExternalStore(subscribeScreen, getScreenState);
  const [scope, setScope] = useState(st.scope);
  const [signal, setSignal] = useState('all');
  const [sector, setSector] = useState('all');
  const [q, setQ] = useState('');
  const [now, setNow] = useState(Date.now());

  // First visit with nothing cached: start a scan, as before.
  useEffect(() => {
    const s = getScreenState();
    if (s.status === 'idle' && !s.data) runScreen(s.scope);
  }, []);

  useEffect(() => {
    if (st.status !== 'running') return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [st.status]);

  const data = st.data;
  const rows = useMemo(() => {
    if (!data) return [];
    return ['bullish', 'bearish', 'neutral'].flatMap((sig) =>
      (data[sig] || []).map((r) => ({ ...r, signal: sig, spread: emaSpreadPct(r.ema_20, r.ema_50) }))
    );
  }, [data]);

  const sectors = useMemo(() => [...new Set(rows.map((r) => r.sector).filter(Boolean))].sort(), [rows]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (signal === 'all' || r.signal === signal) &&
        (sector === 'all' || r.sector === sector) &&
        (!t || r.symbol.toLowerCase().includes(t) || (r.sector || '').toLowerCase().includes(t))
    );
  }, [rows, signal, sector, q]);

  const counts = data?.counts || { bullish: 0, bearish: 0, neutral: 0 };
  const total = counts.bullish + counts.bearish + counts.neutral;
  const share = (n) => (total ? `${((n / total) * 100).toFixed(0)}% of scanned` : undefined);

  const activeFilters = [
    signal !== 'all' && { key: 'signal', label: `Signal: ${signal[0].toUpperCase()}${signal.slice(1)}`, clear: () => setSignal('all') },
    sector !== 'all' && { key: 'sector', label: `Sector: ${sector}`, clear: () => setSector('all') },
    q.trim() && { key: 'q', label: `Search: “${q.trim()}”`, clear: () => setQ('') },
  ].filter(Boolean);
  const clearAll = () => {
    setSignal('all');
    setSector('all');
    setQ('');
  };

  const columns = [
    {
      key: 'symbol',
      header: 'Symbol',
      sortable: true,
      mono: true,
      render: (r) => <span className="font-medium text-ink">{r.symbol}</span>,
    },
    { key: 'sector', header: 'Sector', sortable: true, render: (r) => <span className="text-ink-2">{r.sector}</span> },
    { key: 'close', header: 'Close', align: 'right', sortable: true, mono: true, render: (r) => plain(r.close) },
    { key: 'ema_20', header: 'EMA 20', align: 'right', sortable: true, mono: true, render: (r) => plain(r.ema_20) },
    { key: 'ema_50', header: 'EMA 50', align: 'right', sortable: true, mono: true, render: (r) => plain(r.ema_50) },
    {
      key: 'spread',
      header: 'EMA spread',
      align: 'right',
      sortable: true,
      mono: true,
      render: (r) => <span className={toneClass[toneOf(r.spread)]}>{pct(r.spread, 2, { sign: true })}</span>,
    },
    {
      key: 'signal',
      header: 'Trend',
      sortable: true,
      sortValue: (r) => SIGNAL_ORDER[r.signal],
      render: (r) => <TrendBadge trend={r.signal} />,
    },
  ];

  const running = st.status === 'running';
  const scanLabel = SCOPES.find((s) => s.value === st.scope)?.label.toLowerCase() || `${st.scope} stocks`;

  return (
    <div>
      <PageHeader
        title="Screener"
        description="NSE 500 stocks by EMA 20/50 trend on the latest close. A bullish stock has EMA 20 above EMA 50; it is not necessarily a fresh crossover."
        actions={
          <>
            <Select value={scope} onChange={(e) => setScope(Number(e.target.value))} aria-label="Scan size" disabled={running}>
              {SCOPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
            <Button variant="primary" onClick={() => runScreen(scope)} disabled={running}>
              {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {running ? 'Scanning…' : data ? 'Run new scan' : 'Run scan'}
            </Button>
          </>
        }
      />

      {running && (
        <div className="card mb-6 px-5 py-4" role="status" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-body font-medium text-ink">Scanning {scanLabel}</p>
            <p className="num text-ui text-ink-2">{fmtElapsed(now - st.startedAt)}</p>
          </div>
          <p className="mt-0.5 text-ui text-ink-2">
            Fetching prices and computing EMAs for each stock. A full scan usually takes 2–3 minutes, and you can leave
            this page while it runs.
          </p>
          <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-elevated">
            <div className="absolute inset-y-0 w-1/3 animate-[scan_1.6s_ease-in-out_infinite] rounded-full bg-accent-hi" />
          </div>
          <style>{`@keyframes scan { 0% { left: -33%; } 100% { left: 100%; } }`}</style>
        </div>
      )}

      {st.status === 'error' && (
        <div className="card mb-6">
          <ErrorState
            compact
            title="The scan failed"
            message={
              st.error?.response?.data?.detail ||
              'The screener request did not complete. Check that the backend is reachable, then try again.'
            }
            onRetry={() => runScreen(scope)}
          />
        </div>
      )}

      {!data && running && (
        <div className="space-y-6">
          <div className="card grid grid-cols-2 gap-px overflow-hidden lg:grid-cols-4" style={{ background: 'rgb(var(--line))' }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-card px-4 py-3.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-3 h-6 w-16" />
              </div>
            ))}
          </div>
          <div className="card p-5">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      )}

      {!data && !running && st.status !== 'error' && (
        <div className="card">
          <EmptyState
            title="No scan results yet"
            description="Run a scan to see which NSE 500 stocks have EMA 20 above or below EMA 50."
            action={
              <Button variant="primary" onClick={() => runScreen(scope)}>
                <Play className="h-4 w-4" />
                Run scan
              </Button>
            }
          />
        </div>
      )}

      {data && (
        <div className={`space-y-6 ${running ? 'opacity-60' : ''}`} aria-busy={running}>
          <SummaryStrip>
            <SummaryCard label="Bullish" value={counts.bullish} hint={share(counts.bullish)} tone="pos" />
            <SummaryCard label="Bearish" value={counts.bearish} hint={share(counts.bearish)} tone="neg" />
            <SummaryCard label="Neutral" value={counts.neutral} hint={share(counts.neutral)} />
            <SummaryCard label="Stocks scanned" value={total} hint={`Scanned ${fmtDateTime(data.timestamp)}`} />
          </SummaryStrip>

          <section className="card overflow-hidden" aria-label="Screening results">
            <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
              <Segmented
                label="Trend filter"
                value={signal}
                onChange={setSignal}
                options={[
                  { value: 'all', label: 'All', count: total },
                  { value: 'bullish', label: 'Bullish', count: counts.bullish },
                  { value: 'bearish', label: 'Bearish', count: counts.bearish },
                  { value: 'neutral', label: 'Neutral', count: counts.neutral },
                ]}
                className="self-start"
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select value={sector} onChange={(e) => setSector(e.target.value)} aria-label="Filter by sector" className="sm:w-52">
                  <option value="all">All sectors</option>
                  {sectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
                <Input
                  icon={Search}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search symbol or sector"
                  aria-label="Search symbol or sector"
                  className="sm:w-64"
                />
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
                <span className="text-meta text-ink-3">
                  Showing <span className="num text-ink-2">{filtered.length}</span> of <span className="num">{total}</span>
                </span>
                {activeFilters.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={f.clear}
                    className="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-1 text-meta font-medium text-accent-hi hover:bg-accent-soft/70"
                    aria-label={`Remove filter ${f.label}`}
                  >
                    {f.label}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                <button type="button" onClick={clearAll} className="ml-1 rounded text-meta text-ink-2 underline-offset-2 hover:text-ink hover:underline">
                  Clear all
                </button>
              </div>
            )}

            <DataTable
              columns={columns}
              rows={filtered}
              rowKey={(r) => r.symbol}
              onRowClick={(r) => navigate(`/analysis/${r.symbol}`)}
              defaultSort={{ key: 'spread', dir: 'desc' }}
              pageSize={50}
              caption="NSE 500 screening results"
              empty={
                <EmptyState
                  icon={SearchX}
                  title="No stocks match these filters"
                  description="Try a different trend, sector or search term."
                  action={
                    <Button size="sm" onClick={clearAll}>
                      Clear filters
                    </Button>
                  }
                />
              }
            />
          </section>

          <p className="text-meta text-ink-3">
            EMA spread is EMA 20 relative to EMA 50. Select a row to open the full analysis.
          </p>
        </div>
      )}
    </div>
  );
};

export default ScreeningResults;
