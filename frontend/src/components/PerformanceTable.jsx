import React from 'react';
import PerformanceChart from './PerformanceChart';
import DataTable from './ui/DataTable';
import Badge from './ui/Badge';
import Skeleton from './ui/Skeleton';
import { EmptyState, ErrorState } from './ui/States';
import { MetricGrid } from './SummaryCard';
import { fmtDate, inr, pct, signedInr, toneOf } from '../lib/format';
import { FlaskConical } from 'lucide-react';

const toneCls = { pos: 'text-pos', neg: 'text-neg', flat: 'text-ink' };

// Single-stock backtest: realised equity, summary metrics and the trade log.
const PerformanceTable = ({ backtest, loading, error, onRetry, symbol }) => {
  const summary = backtest?.summary;
  const trades = backtest?.trade_logs || [];

  const columns = [
    { key: 'entry_date', header: 'Entry', sortable: true, mono: true, render: (r) => fmtDate(r.entry_date) },
    { key: 'exit_date', header: 'Exit', sortable: true, mono: true, render: (r) => fmtDate(r.exit_date) },
    { key: 'entry_price', header: 'Entry price', align: 'right', sortable: true, mono: true, render: (r) => inr(r.entry_price) },
    { key: 'exit_price', header: 'Exit price', align: 'right', sortable: true, mono: true, render: (r) => inr(r.exit_price) },
    {
      key: 'profit',
      header: 'Profit',
      align: 'right',
      sortable: true,
      mono: true,
      render: (r) => <span className={toneCls[toneOf(r.profit)]}>{signedInr(r.profit)}</span>,
    },
    {
      key: 'profit_pct',
      header: 'Return',
      align: 'right',
      sortable: true,
      mono: true,
      render: (r) => <span className={toneCls[toneOf(r.profit_pct)]}>{pct(r.profit_pct, 2, { sign: true })}</span>,
    },
  ];

  const noLosses = summary && summary.win_rate_pct === 100 && summary.profit_factor === 0;

  const metrics = summary && [
    { label: 'Total return', value: pct(summary.pnl_pct, 2, { sign: true }), tone: toneOf(summary.pnl_pct) === 'flat' ? 'neutral' : toneOf(summary.pnl_pct) },
    { label: 'Win rate', value: pct(summary.win_rate_pct, 1) },
    { label: 'Trades', value: summary.number_of_trades },
    { label: 'Final capital', value: inr(summary.final_amount), hint: `from ${inr(summary.invested_amount, 0)}` },
    { label: 'Average return', value: pct(summary.avg_profit_pct, 2, { sign: true }), tone: toneOf(summary.avg_profit_pct) === 'flat' ? 'neutral' : toneOf(summary.avg_profit_pct) },
    { label: 'Best trade', value: pct(summary.max_win_pct, 2, { sign: true }), tone: summary.max_win_pct > 0 ? 'pos' : 'neutral' },
    { label: 'Worst trade', value: pct(summary.max_loss_pct, 2), tone: summary.max_loss_pct < 0 ? 'neg' : 'neutral' },
    { label: 'Average loss', value: pct(summary.avg_loss_pct, 2), tone: summary.avg_loss_pct < 0 ? 'neg' : 'neutral' },
    {
      label: 'Profit factor',
      value: noLosses ? '—' : summary.profit_factor.toFixed(2),
      hint: noLosses ? 'No losing trades' : undefined,
      tone: noLosses ? 'neutral' : summary.profit_factor >= 1 ? 'pos' : 'neg',
    },
    {
      label: 'Reward / risk',
      value: noLosses ? '—' : summary.risk_reward_ratio.toFixed(2),
      hint: 'Average win ÷ average loss',
    },
    {
      label: 'Max drawdown (approx.)',
      value: pct(-Math.abs(summary.max_drawdown_pct), 2),
      tone: summary.max_drawdown_pct > 0 ? 'neg' : 'neutral',
      title: 'The backend approximates drawdown as the worst single-trade loss.',
      hint: 'Worst single-trade loss',
    },
  ];

  return (
    <section className="card" aria-label="Backtest results">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-3">
        <div>
          <h2 className="text-body font-semibold text-ink">Backtest{symbol ? ` · ${symbol}` : ''}</h2>
          <p className="mt-0.5 max-w-2xl text-meta text-ink-3">
            EMA 20/50 crossover, long only. Starts with {summary ? inr(summary.invested_amount, 0) : '₹1,00,000'}, buys
            with all available capital on a bullish crossover and sells on a bearish one or at the end of the period.
            Fees and slippage are not modelled.
          </p>
        </div>
        <Badge tone="neutral">Last 1 year of data</Badge>
      </div>

      {loading && (
        <div className="space-y-4 p-5" role="status" aria-label="Loading backtest">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!loading && error && (
        <ErrorState
          compact
          title="Backtest unavailable"
          message="The backtest could not be run for this stock. It needs about a year of price history."
          onRetry={onRetry}
        />
      )}

      {!loading && !error && summary && trades.length === 0 && (
        <EmptyState
          icon={FlaskConical}
          title="No completed trades"
          description="No bullish EMA 20/50 crossover occurred in the last year, so the strategy never entered a position."
        />
      )}

      {!loading && !error && summary && trades.length > 0 && (
        <div className="space-y-5 p-5">
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-ui font-medium text-ink">Realised equity</h3>
              <span className="text-meta text-ink-3">Capital after each closed trade</span>
            </div>
            <PerformanceChart variant="equity" trades={trades} startCapital={summary.invested_amount} />
          </div>

          <MetricGrid items={metrics} />

          <div>
            <h3 className="mb-2 text-ui font-medium text-ink">
              Trade history <span className="num font-normal text-ink-3">({trades.length})</span>
            </h3>
            <div className="overflow-hidden rounded-lg border border-line">
              <DataTable
                columns={columns}
                rows={trades}
                rowKey={(r, i) => `${r.entry_date}-${r.exit_date}-${i}`}
                defaultSort={{ key: 'exit_date', dir: 'desc' }}
                pageSize={10}
                dense
                caption="Trade history"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PerformanceTable;
