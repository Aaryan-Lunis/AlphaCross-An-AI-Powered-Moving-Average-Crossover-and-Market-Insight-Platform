import React, { useMemo } from 'react';
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
import { useChartTheme } from '../hooks/useChartTheme';
import { fmtDate, inr, plain } from '../lib/format';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler);

/*
  variant="equity": realised equity after each closed trade, derived from the
    backtest's own trade log (start capital + running profit). No benchmark or
    drawdown series is drawn because the backend does not calculate them.
  variant="bars": horizontal bars of percentage returns (per trade or per sector).
*/
const PerformanceChart = ({ variant = 'equity', trades = [], startCapital, items = [], valueSuffix = '%' }) => {
  const t = useChartTheme();

  const equity = useMemo(() => {
    if (variant !== 'equity' || !trades.length || !startCapital) return null;
    const sorted = [...trades].sort((a, b) => (a.exit_date < b.exit_date ? -1 : a.exit_date > b.exit_date ? 1 : 0));
    const labels = [sorted[0].entry_date];
    const values = [startCapital];
    let eq = startCapital;
    sorted.forEach((tr) => {
      eq += tr.profit;
      labels.push(tr.exit_date);
      values.push(Math.round(eq * 100) / 100);
    });
    return { labels, values };
  }, [variant, trades, startCapital]);

  if (variant === 'equity') {
    if (!equity) return null;
    const data = {
      labels: equity.labels,
      datasets: [
        {
          label: 'Realised equity',
          data: equity.values,
          stepped: 'after',
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: t.card,
          pointBorderWidth: 1.5,
          borderColor: t.accent,
          pointBorderColor: (ctx) => (ctx.parsed?.y >= startCapital ? t.pos : t.neg),
          segment: {
            borderColor: (ctx) => (ctx.p1.parsed.y >= startCapital ? t.pos : t.neg),
          },
          tension: 0,
        },
        {
          label: 'Starting capital',
          data: new Array(equity.labels.length).fill(startCapital),
          borderColor: t.c('ink-3', 0.8),
          borderDash: [4, 4],
          borderWidth: 1,
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    };
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
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
          callbacks: {
            title: (items) => fmtDate(items[0]?.label),
            label: (c) => ` ${c.dataset.label}  ${inr(c.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
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
        },
        y: {
          position: 'right',
          grace: '8%',
          grid: { color: t.grid, drawTicks: false },
          border: { display: false },
          ticks: { color: t.ink3, font: { family: t.mono, size: 11 }, padding: 8, callback: (v) => plain(v, 0) },
        },
      },
    };
    return (
      <div className="relative h-[240px]">
        <Line data={data} options={options} />
      </div>
    );
  }

  // bars
  if (!items.length) return null;
  const data = {
    labels: items.map((i) => i.label),
    datasets: [
      {
        data: items.map((i) => i.value),
        backgroundColor: items.map((i) => (i.value >= 0 ? t.c('pos', 0.8) : t.c('neg', 0.8))),
        borderRadius: 3,
        barThickness: 14,
      },
    ],
  };
  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: t.elevated,
        titleColor: t.ink2,
        bodyColor: t.ink,
        borderColor: t.line,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { family: t.mono, size: 12, weight: '500' },
        bodyFont: { family: t.mono, size: 12 },
        callbacks: {
          label: (c) => ` ${c.parsed.x > 0 ? '+' : ''}${c.parsed.x.toFixed(2)}${valueSuffix}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: t.grid, drawTicks: false },
        border: { display: false },
        ticks: { color: t.ink3, font: { family: t.mono, size: 11 }, callback: (v) => `${v}${valueSuffix}` },
      },
      y: {
        grid: { display: false },
        border: { color: t.line },
        ticks: { color: t.ink2, font: { family: t.mono, size: 11 } },
      },
    },
  };
  return (
    <div className="relative" style={{ height: Math.max(140, items.length * 24 + 36) }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default PerformanceChart;
