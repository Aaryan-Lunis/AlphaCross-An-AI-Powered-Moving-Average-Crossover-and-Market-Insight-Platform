// Screening the NSE 500 takes minutes. Keeping the request outside the React
// component means the scan keeps running if you switch pages, and the last
// result is still there when you come back (or reload, within the session).
import api from '../api/api';

const KEY = 'alphacross-screen-v1';

const restore = () => {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY));
    if (v && v.data) return v;
  } catch (e) {
    /* ignore */
  }
  return null;
};

const saved = restore();
let state = {
  status: 'idle', // idle | running | done | error
  data: saved?.data || null,
  scope: saved?.scope || 500,
  error: null,
  startedAt: null,
};
const listeners = new Set();

const set = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

export const getScreenState = () => state;
export const subscribeScreen = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export async function runScreen(scope) {
  if (state.status === 'running') return;
  set({ status: 'running', scope, error: null, startedAt: Date.now() });
  try {
    const data = await api.screenUniverse({ max_stocks: scope, criteria: 'ema_crossover' });
    set({ status: 'done', data });
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ data, scope }));
    } catch (e) {
      /* ignore */
    }
  } catch (error) {
    set({ status: 'error', error });
  }
}
