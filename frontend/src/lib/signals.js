// Pure helpers that derive signals from real API rows. Nothing here
// invents data: every output is computed from the rows passed in.

export function normalizeChart(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map((d) => ({
    date: d.date,
    close: d.close,
    ema20: d.ema_20 ?? d.ema20,
    ema50: d.ema_50 ?? d.ema50,
    rsi: d.rsi,
    volume: d.volume,
  }));
}

export function trendOf(ema20, ema50) {
  if (!(ema20 > 0) || !(ema50 > 0)) return 'neutral';
  if (ema20 > ema50) return 'bullish';
  if (ema20 < ema50) return 'bearish';
  return 'neutral';
}

// Same crossover rule the backtester uses (EMA 20 vs EMA 50).
export function findCrossovers(rows) {
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const p = rows[i - 1];
    const c = rows[i];
    if (!(p.ema20 > 0 && p.ema50 > 0 && c.ema20 > 0 && c.ema50 > 0)) continue;
    if (p.ema20 <= p.ema50 && c.ema20 > c.ema50) {
      out.push({ index: i, date: c.date, type: 'bullish', price: c.close });
    } else if (p.ema20 >= p.ema50 && c.ema20 < c.ema50) {
      out.push({ index: i, date: c.date, type: 'bearish', price: c.close });
    }
  }
  return out;
}

export function rsiState(rsi) {
  if (!(typeof rsi === 'number')) return { label: '—', tone: 'neutral' };
  if (rsi >= 70) return { label: 'Overbought', tone: 'warn' };
  if (rsi <= 30) return { label: 'Oversold', tone: 'info' };
  return { label: 'Neutral', tone: 'neutral' };
}

export function dayChange(rows) {
  if (!rows || rows.length < 2) return null;
  const last = rows[rows.length - 1].close;
  const prev = rows[rows.length - 2].close;
  if (!(prev > 0) || !(last >= 0)) return null;
  return { abs: last - prev, pct: ((last - prev) / prev) * 100 };
}

// Spread of EMA 20 over EMA 50, as a percentage of EMA 50.
export function emaSpreadPct(ema20, ema50) {
  if (!(ema20 > 0) || !(ema50 > 0)) return null;
  return ((ema20 - ema50) / ema50) * 100;
}

export const RANGES = [
  { value: '1M', label: '1M', sessions: 22 },
  { value: '3M', label: '3M', sessions: 66 },
  { value: '6M', label: '6M', sessions: Infinity },
];

export function sliceRange(rows, range) {
  const r = RANGES.find((x) => x.value === range) || RANGES[2];
  if (!Number.isFinite(r.sessions) || rows.length <= r.sessions) return { rows, offset: 0 };
  const offset = rows.length - r.sessions;
  return { rows: rows.slice(offset), offset };
}
