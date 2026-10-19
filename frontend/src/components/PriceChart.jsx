import React, { useMemo, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import Segmented from './ui/Segmented';
import Skeleton from './ui/Skeleton';
import { EmptyState, ErrorState } from './ui/States';
import { useChartTheme } from '../hooks/useChartTheme';
import { RANGES, findCrossovers, sliceRange } from '../lib/signals';
import { compact, fmtDate, inr, plain } from '../lib/format';
import { CandlestickChart } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler);

// Dashed vertical guide that follows the hovered point.
const crosshair = {
  id: 'crosshair',
  afterDatasetsDraw(chart, _args, opts) {
    const active = chart.tooltip?.getActiveElements?.();
    if (!active || !active.length) return;
    const { x } = active[0].element;
    const { top, bottom } = chart.chartArea;
    const { ctx } = chart;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.lineWidth = 1;
    ctx.strokeStyle = opts?.color || 'rgba(150,150,150,0.5)';
    ctx.stroke();
    ctx.restore();
  },
};

const Y_AXIS_WIDTH = 60; // keeps price / volume / RSI plot areas aligned

const LegendItem = ({ color, label, shape = 'line', onClick, off }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!onClick}
    aria-pressed={onClick ? !off : undefined}
    className={`flex items-center gap-1.5 rounded px-1 text-meta transition-opacity ${
      off ? 'opacity-40' : ''
    } ${onClick ? 'hover:text-ink' : 'cursor-default disabled:opacity-100'} text-ink-2`}
  >
    {shape === 'line' ? (
      <span className="inline-block h-0.5 w-4 rounded" style={{ background: color }} />
    ) : (
      <span
        className="inline-block h-0 w-0"
        style={{
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          [shape === 'up' ? 'borderBottom' : 'borderTop']: `8px solid ${color}`,
        }}
      />
    )}
    {label}
  </button>
);

const PriceChart = ({
  rows,
  range = '6M',
  onRangeChange,
  panels = ['volume', 'rsi'],
  heading,
  actions,
  loading = false,
  error = null,
  onRetry,
  priceHeight = 'h-[280px] sm:h-[340px]',
  children,
}) => {
  const t = useChartTheme();
  const [hidden, setHidden] = useState({ ema20: false, ema50: false });

  const { view, markers } = useMemo(() => {
    const all = findCrossovers(rows);
    const { rows: v, offset } = sliceRange(rows, range);
    const inView = all.filter((c) => c.index >= offset).map((c) => ({ ...c, index: c.index - offset }));
    return { view: v, markers: inView, offset };
  }, [rows, range]);

  const labels = useMemo(() => view.map((r) => r.date), [view]);

  const sharedOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { top: 6, right: 0, bottom: 0, left: 0 } },
    }),
    []
  );

  const tooltip = useMemo(
    () => ({
      backgroundColor: t.elevated,
      titleColor: t.ink2,
      bodyColor: t.ink,
      borderColor: t.line,
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      boxWidth: 8,
      boxHeight: 8,
      usePointStyle: true,
      titleFont: { family: t.font, size: 12, weight: '500' },
      bodyFont: { family: t.mono, size: 12 },
      filter: (item) => item.parsed.y != null,
      callbacks: { title: (items) => fmtDate(items[0]?.label) },
    }),
    [t]
  );

  const xScale = (show = true) => ({
    display: show,
    grid: { display: false },
    border: { color: t.line },
    ticks: {
      color: t.ink3,
      font: { family: t.font, size: 11 },
      maxRotation: 0,
      autoSkip: true,
      maxTicksLimit: 6,
      callback(value) {
        return fmtDate(this.getLabelForValue(value), { year: false });
      },
    },
  });

  const yScale = (extra = {}) => ({
    position: 'right',
    grid: { color: t.grid, drawTicks: false },
    border: { display: false },
    afterFit(scale) {
      scale.width = Y_AXIS_WIDTH;
    },
    ticks: { color: t.ink3, font: { family: t.mono, size: 11 }, padding: 8 },
    ...extra,
  });

  const priceData = useMemo(() => {
    const bull = new Array(view.length).fill(null);
    const bear = new Array(view.length).fill(null);
    markers.forEach((m) => {
      (m.type === 'bullish' ? bull : bear)[m.index] = m.price;
    });
    return {
      labels,
      datasets: [
        {
          label: 'Close',
          data: view.map((r) => r.close),
          borderColor: t.accent,
          borderWidth: 2,
          tension: 0,
          fill: 'start',
          backgroundColor: (ctx) => {
            const { chart } = ctx;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return 'transparent';
            const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            g.addColorStop(0, t.c('accent-hi', 0.16));
            g.addColorStop(1, t.c('accent-hi', 0));
            return g;
          },
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: t.accent,
          pointHoverBorderColor: t.card,
          pointHoverBorderWidth: 2,
          order: 3,
        },
        {
          label: 'EMA 20',
          data: view.map((r) => (r.ema20 > 0 ? r.ema20 : null)),
          borderColor: t.info,
          borderWidth: 1.5,
          tension: 0,
          pointRadius: 0,
          pointHoverRadius: 0,
          hidden: hidden.ema20,
          order: 2,
        },
        {
          label: 'EMA 50',
          data: view.map((r) => (r.ema50 > 0 ? r.ema50 : null)),
          borderColor: t.series2,
          borderWidth: 1.5,
          tension: 0,
          pointRadius: 0,
          pointHoverRadius: 0,
          hidden: hidden.ema50,
          order: 2,
        },
        {
          label: 'Bullish crossover',
          data: bull,
          showLine: false,
          pointStyle: 'triangle',
          pointRadius: 6,
          pointHoverRadius: 7,
          pointBackgroundColor: t.pos,
          pointBorderColor: t.card,
          pointBorderWidth: 1.5,
          order: 1,
        },
        {
          label: 'Bearish crossover',
          data: bear,
          showLine: false,
          pointStyle: 'triangle',
          pointRotation: 180,
          pointRadius: 6,
          pointHoverRadius: 7,
          pointBackgroundColor: t.neg,
          pointBorderColor: t.card,
          pointBorderWidth: 1.5,
          order: 1,
        },
      ],
    };
  }, [view, markers, labels, t, hidden]);

  const priceOptions = useMemo(
    () => ({
      ...sharedOptions,
      plugins: {
        legend: { display: false },
        crosshair: { color: t.c('ink-3', 0.6) },
        tooltip: {
          ...tooltip,
          callbacks: {
            ...tooltip.callbacks,
            label: (c) => ` ${c.dataset.label}  ${inr(c.parsed.y)}`,
          },
        },
      },
      scales: {
        x: xScale(panels.length === 0),
        y: yScale({
          grace: '6%',
          ticks: { color: t.ink3, font: { family: t.mono, size: 11 }, padding: 8, callback: (v) => plain(v, 0) },
        }),
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, tooltip, sharedOptions, panels.length]
  );

  const volumeData = useMemo(() => {
    const full = rows;
    const start = full.length - view.length;
    return {
      labels,
      datasets: [
        {
          label: 'Volume',
          data: view.map((r) => r.volume),
          backgroundColor: view.map((r, i) => {
            const prev = full[start + i - 1]?.close ?? r.close;
            return r.close >= prev ? t.c('pos', 0.55) : t.c('neg', 0.55);
          }),
          borderWidth: 0,
          barPercentage: 0.9,
          categoryPercentage: 1,
        },
      ],
    };
  }, [rows, view, labels, t]);

  const volumeOptions = useMemo(
    () => ({
      ...sharedOptions,
      plugins: {
        legend: { display: false },
        crosshair: { color: t.c('ink-3', 0.6) },
        tooltip: { ...tooltip, displayColors: false, callbacks: { ...tooltip.callbacks, label: (c) => ` Volume  ${compact(c.parsed.y)}` } },
      },
      scales: {
        x: xScale(panels.indexOf('rsi') === -1),
        y: yScale({ ticks: { color: t.ink3, font: { family: t.mono, size: 11 }, padding: 8, maxTicksLimit: 3, callback: (v) => compact(v) } }),
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, tooltip, sharedOptions, panels]
  );

  const rsiData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'RSI',
          data: view.map((r) => r.rsi),
          borderColor: t.info,
          borderWidth: 1.5,
          tension: 0,
          pointRadius: 0,
          pointHoverRadius: 3,
          pointHoverBackgroundColor: t.info,
        },
        ...[70, 30].map((lvl) => ({
          label: `RSI ${lvl}`,
          data: new Array(view.length).fill(lvl),
          borderColor: t.c('ink-3', 0.7),
          borderDash: [4, 4],
          borderWidth: 1,
          pointRadius: 0,
          pointHoverRadius: 0,
        })),
      ],
    }),
    [view, labels, t]
  );

  const rsiOptions = useMemo(
    () => ({
      ...sharedOptions,
      plugins: {
        legend: { display: false },
        crosshair: { color: t.c('ink-3', 0.6) },
        tooltip: {
          ...tooltip,
          displayColors: false,
          filter: (item) => item.datasetIndex === 0 && item.parsed.y != null,
          callbacks: { ...tooltip.callbacks, label: (c) => ` RSI (14)  ${c.parsed.y.toFixed(1)}` },
        },
      },
      scales: {
        x: xScale(true),
        y: yScale({
          min: 0,
          max: 100,
          afterBuildTicks(scale) {
            scale.ticks = [{ value: 30 }, { value: 50 }, { value: 70 }];
          },
          ticks: { color: t.ink3, font: { family: t.mono, size: 11 }, padding: 8 },
        }),
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, tooltip, sharedOptions]
  );

  const hasData = rows && rows.length > 0;
  const bullCount = markers.filter((m) => m.type === 'bullish').length;
  const bearCount = markers.length - bullCount;

  return (
    <section className="card overflow-hidden" aria-label="Price chart">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div className="min-w-0">{heading}</div>
        <div className="flex flex-wrap items-center gap-2">
          {onRangeChange && (
            <Segmented
              label="Date range"
              size="sm"
              options={RANGES.map((r) => ({ value: r.value, label: r.label }))}
              value={range}
              onChange={onRangeChange}
            />
          )}
          {actions}
        </div>
      </div>

      {loading && (
        <div className="p-5" role="status" aria-label="Loading chart">
          <Skeleton className={`w-full ${priceHeight}`} />
        </div>
      )}

      {!loading && error && (
        <ErrorState
          title="Chart unavailable"
          message={error.message || 'Price history could not be loaded.'}
          onRetry={onRetry}
        />
      )}

      {!loading && !error && !hasData && (
        <EmptyState icon={CandlestickChart} title="No price history" description="There is no price data to chart for this stock." />
      )}

      {!loading && !error && hasData && (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pt-3 sm:px-5">
            <LegendItem color={t.accent} label="Close" />
            <LegendItem
              color={t.info}
              label="EMA 20"
              off={hidden.ema20}
              onClick={() => setHidden((h) => ({ ...h, ema20: !h.ema20 }))}
            />
            <LegendItem
              color={t.series2}
              label="EMA 50"
              off={hidden.ema50}
              onClick={() => setHidden((h) => ({ ...h, ema50: !h.ema50 }))}
            />
            <LegendItem color={t.pos} shape="up" label={`Bullish crossover${bullCount ? ` (${bullCount})` : ''}`} />
            <LegendItem color={t.neg} shape="down" label={`Bearish crossover${bearCount ? ` (${bearCount})` : ''}`} />
          </div>

          <div className="px-2 pb-3 pt-1 sm:px-3">
            <div className={`relative ${priceHeight}`}>
              <Line data={priceData} options={priceOptions} plugins={[crosshair]} />
            </div>

            {panels.includes('volume') && (
              <div className="relative mt-1 h-[84px]">
                <span className="pointer-events-none absolute left-2 top-0 z-[1] text-meta text-ink-3">Volume</span>
                <Bar data={volumeData} options={volumeOptions} plugins={[crosshair]} />
              </div>
            )}

            {panels.includes('rsi') && (
              <div className="relative mt-1 h-[112px]">
                <span className="pointer-events-none absolute left-2 top-0 z-[1] text-meta text-ink-3">RSI (14)</span>
                <Line data={rsiData} options={rsiOptions} plugins={[crosshair]} />
              </div>
            )}
          </div>
        </>
      )}

      {children}
    </section>
  );
};

export default PriceChart;
