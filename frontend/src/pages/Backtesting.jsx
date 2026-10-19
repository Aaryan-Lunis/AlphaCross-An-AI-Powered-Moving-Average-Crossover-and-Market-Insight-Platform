import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FlaskConical, Play, RefreshCw } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { Field, Input } from '../components/ui/Input';
import Segmented from '../components/ui/Segmented';
import DataTable from '../components/ui/DataTable';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import { EmptyState, ErrorState } from '../components/ui/States';
import { SummaryCard, SummaryStrip } from '../components/SummaryCard';
import PerformanceChart from '../components/PerformanceChart';
import PerformanceTable from '../components/PerformanceTable';
import StockSelector from '../components/StockSelector';
import api from '../api/api';
import { useResource } from '../hooks/useResource';
import { useWatchlist } from '../hooks/useWatchlist';
import { loadBacktest } from '../lib/loaders';
import { getLastSymbol } from '../components/layout/Sidebar';
import { fmtDate, inr, pct, toneClass, toneOf } from '../lib/format';

const DEFAULTS = { max_stocks: '50', initial_capital: '100000', position_pct: '10', stop_loss_pct: '5', take_profit_pct: '15' };

// Validate the form and convert to the payload the API expects.
const toConfig = (f) => {
  const n = (v) => (v === '' ? NaN : Number(v));
  const rules = [
    ['max_stocks', 'Stocks to test', 10, 500],
    ['initial_capital', 'Starting capital', 10000, 1e9],
    ['position_pct', 'Position size', 1, 100],
    ['stop_loss_pct', 'Stop loss', 1, 50],
    ['take_profit_pct', 'Take profit', 1, 100],
  ];
  const errors = {};
  rules.forEach(([k, label, min, max]) => {
    const v = n(f[k]);
    if (!Number.isFinite(v) || v < min || v > max) errors[k] = `${label} must be between ${min.toLocaleString('en-IN')} and ${max.toLocaleString('en-IN')}.`;
  });
  if (Object.keys(errors).length) return { errors };
  return {
    config: {
      max_stocks: Math.round(n(f.max_stocks)),
      initial_capital: Math.round(n(f.initial_capital)),
      position_size: n(f.position_pct) / 100,
      stop_loss: n(f.stop_loss_pct) / 100,
      take_profit: n(f.take_profit_pct) / 100,
    },
  };
};

const tone = (v) => (toneOf(v) === 'flat' ? 'neutral' : toneOf(v));

const UniverseBacktest = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULTS);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ status: 'idle', data: null, error: null, config: null });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const run = async () => {
    const { config, errors: errs } = toConfig(form);
    setErrors(errs || {});
    if (errs) return;
    setState({ status: 'running', data: null, error: null, config });
    try {
      const data = await api.runUniverseBacktest(config);
      if (data.status === 'error') setState({ status: 'error', data: null, error: data.message, config });
      else setState({ status: 'done', data, error: null, config });
    } catch (e) {
      setState({
        status: 'error',
        data: null,
        error: 'The backtest request failed. Check that the backend is reachable, then try again.',
        config,
      });
    }
  };

  const { status, data: r, config: used } = state;
  const running = status === 'running';

  const tradeBars = useMemo(
    () => (r?.trade_details || []).map((t) => ({ label: `${t.symbol} ${fmtDate(t.entry_date, { year: false })}`, value: t.profit_pct })),
    [r]
  );
  const sectorBars = useMemo(() => (r?.top_sectors || []).map((s) => ({ label: s.sector, value: s.avg_return })), [r]);

  const columns = [
    { key: 'symbol', header: 'Symbol', sortable: true, mono: true, render: (t) => <span className="font-medium">{t.symbol}</span> },
    { key: 'sector', header: 'Sector', sortable: true, render: (t) => <span className="text-ink-2">{t.sector}</span> },
    { key: 'entry_date', header: 'Entry', sortable: true, mono: true, render: (t) => fmtDate(t.entry_date) },
    { key: 'exit_date', header: 'Exit', sortable: true, mono: true, render: (t) => fmtDate(t.exit_date) },
    { key: 'entry_price', header: 'Entry price', align: 'right', sortable: true, mono: true, render: (t) => inr(t.entry_price) },
    { key: 'exit_price', header: 'Exit price', align: 'right', sortable: true, mono: true, render: (t) => inr(t.exit_price) },
    {
      key: 'profit_pct',
      header: 'Return',
      align: 'right',
      sortable: true,
      mono: true,
      render: (t) => <span className={toneClass[toneOf(t.profit_pct)]}>{pct(t.profit_pct, 2, { sign: true })}</span>,
    },
  ];

  const posPct = used ? Math.round(used.position_size * 100) : Number(form.position_pct);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      {/* Configuration */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <section className="card" aria-label="Backtest settings">
          <div className="border-b border-line px-5 py-3">
            <h2 className="text-body font-semibold text-ink">Settings</h2>
          </div>
          <div className="space-y-4 p-5">
            <Field label="Stocks to test" htmlFor="bt-max" hint={errors.max_stocks || 'The first N stocks of the NSE 500 list.'}>
              <Input id="bt-max" type="number" inputMode="numeric" min="10" max="500" value={form.max_stocks} onChange={set('max_stocks')} aria-invalid={!!errors.max_stocks} />
            </Field>
            <Field label="Starting capital" htmlFor="bt-cap" hint={errors.initial_capital}>
              <Input id="bt-cap" type="number" inputMode="numeric" min="10000" step="10000" value={form.initial_capital} onChange={set('initial_capital')} suffix="₹" aria-invalid={!!errors.initial_capital} />
            </Field>
            <Field label="Position size" htmlFor="bt-pos" hint={errors.position_pct || 'Share of starting capital used per trade.'}>
              <Input id="bt-pos" type="number" inputMode="decimal" min="1" max="100" value={form.position_pct} onChange={set('position_pct')} suffix="%" aria-invalid={!!errors.position_pct} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Stop loss" htmlFor="bt-sl" hint={errors.stop_loss_pct}>
                <Input id="bt-sl" type="number" inputMode="decimal" min="1" max="50" value={form.stop_loss_pct} onChange={set('stop_loss_pct')} suffix="%" aria-invalid={!!errors.stop_loss_pct} />
              </Field>
              <Field label="Take profit" htmlFor="bt-tp" hint={errors.take_profit_pct}>
                <Input id="bt-tp" type="number" inputMode="decimal" min="1" max="100" value={form.take_profit_pct} onChange={set('take_profit_pct')} suffix="%" aria-invalid={!!errors.take_profit_pct} />
              </Field>
            </div>
            <Button variant="primary" className="w-full" onClick={run} disabled={running}>
              {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {running ? 'Running backtest…' : 'Run backtest'}
            </Button>
          </div>
          <div className="border-t border-line px-5 py-4">
            <h3 className="text-ui font-medium text-ink">Assumptions</h3>
            <ul className="mt-2 space-y-1.5 text-meta text-ink-3">
              <li>Enter on a bullish EMA 20/50 crossover.</li>
              <li>Exit on a bearish crossover, the stop loss or the take profit.</li>
              <li>Uses the latest 6 months of daily prices for each stock.</li>
              <li>Each trade is sized at {posPct}% of starting capital. Profits are summed, not compounded.</li>
              <li>Fees and slippage are not modelled.</li>
            </ul>
          </div>
        </section>
      </aside>

      {/* Results */}
      <div className="min-w-0 space-y-6">
        {status === 'idle' && (
          <div className="card">
            <EmptyState
              icon={FlaskConical}
              title="Ready to backtest"
              description="Set your parameters and run the EMA 20/50 crossover strategy across the NSE 500."
            />
          </div>
        )}

        {running && (
          <div className="space-y-6" role="status" aria-label="Running backtest">
            <div className="card px-5 py-4">
              <p className="text-body font-medium text-ink">Testing {used?.max_stocks} stocks</p>
              <p className="mt-0.5 text-ui text-ink-2">This can take a minute or two. Results will appear here.</p>
            </div>
            <div className="card grid grid-cols-2 gap-px overflow-hidden lg:grid-cols-4" style={{ background: 'rgb(var(--line))' }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-card px-4 py-3.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-3 h-6 w-20" />
                </div>
              ))}
            </div>
            <div className="card p-5">
              <Skeleton className="h-60 w-full" />
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="card">
            <ErrorState title="Backtest failed" message={state.error} onRetry={run} />
          </div>
        )}

        {status === 'done' && r.status !== 'success' && (
          <div className="card">
            <EmptyState
              icon={FlaskConical}
              title="No trades were generated"
              description={r.message || 'Try more stocks or different stop-loss and take-profit levels.'}
            />
          </div>
        )}

        {status === 'done' && r.status === 'success' && (
          <>
            <div className="flex flex-wrap items-center gap-2 text-meta text-ink-3">
              <Badge tone="neutral">{r.stocks_tested} stocks</Badge>
              <Badge tone="neutral">Last 6 months</Badge>
              <Badge tone="neutral">Stop loss {Math.round(used.stop_loss * 100)}%</Badge>
              <Badge tone="neutral">Take profit {Math.round(used.take_profit * 100)}%</Badge>
            </div>

            <SummaryStrip>
              <SummaryCard label="Total return" value={pct(r.total_return, 2, { sign: true })} tone={tone(r.total_return)} hint="On starting capital" />
              <SummaryCard label="Win rate" value={pct(r.win_rate, 1)} hint={`${r.winning_trades} won · ${r.losing_trades} lost`} />
              <SummaryCard label="Trades" value={r.total_trades} hint={`Across ${r.stocks_tested} stocks`} />
              <SummaryCard label="Final capital" value={inr(r.final_capital, 0)} hint={`From ${inr(r.initial_capital ?? used.initial_capital, 0)}`} />
            </SummaryStrip>

            <div className="grid gap-6 xl:grid-cols-2">
              <section className="card" aria-label="Best trades">
                <div className="border-b border-line px-5 py-3">
                  <h2 className="text-body font-semibold text-ink">Best 20 trades</h2>
                  <p className="text-meta text-ink-3">The API returns only the top 20 trades by return, so this overstates typical results.</p>
                </div>
                <div className="p-4">
                  <PerformanceChart variant="bars" items={tradeBars} />
                </div>
              </section>

              <div className="space-y-6">
                <section className="card" aria-label="Trade statistics">
                  <div className="border-b border-line px-5 py-3">
                    <h2 className="text-body font-semibold text-ink">Trade statistics</h2>
                  </div>
                  <dl className="divide-y divide-line/60 px-5 text-ui">
                    {[
                      ['Average win', pct(r.avg_win, 2, { sign: true }), 'text-pos'],
                      ['Average loss', pct(r.avg_loss, 2), 'text-neg'],
                      r.best_trade && ['Best trade', `${r.best_trade.symbol}  ${pct(r.best_trade.profit_pct, 2, { sign: true })}`, 'text-pos'],
                      r.worst_trade && ['Worst trade', `${r.worst_trade.symbol}  ${pct(r.worst_trade.profit_pct, 2)}`, 'text-neg'],
                    ]
                      .filter(Boolean)
                      .map(([k, v, c]) => (
                        <div key={k} className="flex items-center justify-between py-2.5">
                          <dt className="text-ink-2">{k}</dt>
                          <dd className={`num font-medium ${c}`}>{v}</dd>
                        </div>
                      ))}
                  </dl>
                </section>

                {sectorBars.length > 0 && (
                  <section className="card" aria-label="Sector performance">
                    <div className="border-b border-line px-5 py-3">
                      <h2 className="text-body font-semibold text-ink">Top sectors</h2>
                      <p className="text-meta text-ink-3">Average return per trade</p>
                    </div>
                    <div className="p-4">
                      <PerformanceChart variant="bars" items={sectorBars} />
                    </div>
                  </section>
                )}
              </div>
            </div>

            {r.trade_details?.length > 0 && (
              <section className="card overflow-hidden" aria-label="Trade list">
                <div className="border-b border-line px-5 py-3">
                  <h2 className="text-body font-semibold text-ink">Trade list</h2>
                  <p className="text-meta text-ink-3">Top 20 trades by return</p>
                </div>
                <DataTable
                  columns={columns}
                  rows={r.trade_details}
                  rowKey={(t, i) => `${t.symbol}-${t.entry_date}-${i}`}
                  onRowClick={(t) => navigate(`/analysis/${t.symbol}`)}
                  defaultSort={{ key: 'profit_pct', dir: 'desc' }}
                  caption="Top 20 trades by return"
                  dense
                />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const SingleStockBacktest = () => {
  const [params, setParams] = useSearchParams();
  const wl = useWatchlist();
  const symbol = (params.get('symbol') || getLastSymbol()).toUpperCase();
  const bt = useResource(`backtest:${symbol}`, (o) => loadBacktest(symbol, o));

  return (
    <div className="space-y-6">
      <StockSelector
        value={symbol}
        onChange={(s) => setParams({ tab: 'single', symbol: s })}
        chips={wl.symbols.slice(0, 8)}
        chipsLabel="Watchlist"
        id="bt-stock"
        className="max-w-2xl"
      />
      <PerformanceTable backtest={bt.data} loading={bt.loading} error={bt.error} onRetry={bt.reload} symbol={symbol} />
    </div>
  );
};

const Backtesting = () => {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'single' ? 'single' : 'universe';

  return (
    <div>
      <PageHeader
        title="Backtesting"
        description="See how the EMA 20/50 crossover strategy would have performed on past prices."
        actions={
          <Segmented
            label="Backtest type"
            value={tab}
            onChange={(v) => setParams(v === 'single' ? { tab: 'single' } : {})}
            options={[
              { value: 'universe', label: 'NSE 500 universe' },
              { value: 'single', label: 'Single stock' },
            ]}
          />
        }
      />
      {tab === 'universe' ? <UniverseBacktest /> : <SingleStockBacktest />}
    </div>
  );
};

export default Backtesting;
