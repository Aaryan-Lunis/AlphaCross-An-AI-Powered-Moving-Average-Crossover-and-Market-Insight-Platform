// Formatting helpers. Everything numeric in the UI goes through here so
// prices, percentages and dates look the same on every page.

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

export const inr = (v, digits = 2) =>
  isNum(v)
    ? `₹${v.toLocaleString('en-IN', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })}`
    : '—';

export const plain = (v, digits = 2) =>
  isNum(v)
    ? v.toLocaleString('en-IN', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    : '—';

export const pct = (v, digits = 2, { sign = false } = {}) => {
  if (!isNum(v)) return '—';
  const s = sign && v > 0 ? '+' : '';
  return `${s}${v.toFixed(digits)}%`;
};

export const signedInr = (v, digits = 2) => {
  if (!isNum(v)) return '—';
  const s = v > 0 ? '+' : v < 0 ? '−' : '';
  return `${s}${inr(Math.abs(v), digits)}`;
};

export const compact = (v) =>
  isNum(v)
    ? new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(v)
    : '—';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2026-03-12" -> "12 Mar 2026". Parsed by hand so time zones can't shift the day.
export const fmtDate = (str, { year = true } = {}) => {
  if (!str || typeof str !== 'string') return '—';
  const [y, m, d] = str.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return str;
  return year ? `${d} ${MONTHS[m - 1]} ${y}` : `${d} ${MONTHS[m - 1]}`;
};

export const fmtDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const fmtTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export const fmtElapsed = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// Tone for a signed financial value: 'pos' | 'neg' | 'flat'
export const toneOf = (v) => (!isNum(v) || v === 0 ? 'flat' : v > 0 ? 'pos' : 'neg');

export const toneClass = {
  pos: 'text-pos',
  neg: 'text-neg',
  flat: 'text-ink-2',
};
