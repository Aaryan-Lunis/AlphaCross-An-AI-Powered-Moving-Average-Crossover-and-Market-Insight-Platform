// Tiny in-memory request cache. Prevents the same stock from being
// re-fetched every time the user switches pages, and shares requests
// between components that need the same data.

const store = new Map();

export function cached(key, loader, { ttl = 5 * 60 * 1000, force = false } = {}) {
  const hit = store.get(key);
  if (!force && hit && Date.now() - hit.t < ttl) return hit.p;
  const p = Promise.resolve().then(loader);
  store.set(key, { p, t: Date.now() });
  // Never keep failures around - the next call should retry.
  p.catch(() => {
    if (store.get(key)?.p === p) store.delete(key);
  });
  return p;
}

export function invalidate(prefix) {
  for (const k of store.keys()) if (k.startsWith(prefix)) store.delete(k);
}
