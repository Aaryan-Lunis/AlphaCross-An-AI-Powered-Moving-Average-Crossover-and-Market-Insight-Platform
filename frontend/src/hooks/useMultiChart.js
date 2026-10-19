import { useEffect, useRef, useState } from 'react';
import { loadChart } from '../lib/loaders';
import { normalizeChart } from '../lib/signals';

// Loads price history for several symbols in parallel, filling in as each arrives.
// Bump `reloadKey` to force fresh data.
export function useMultiChart(symbols, reloadKey = 0) {
  const [map, setMap] = useState({});
  const prevKey = useRef(reloadKey);
  const joined = symbols.join(',');

  useEffect(() => {
    let live = true;
    const force = prevKey.current !== reloadKey;
    prevKey.current = reloadKey;
    symbols.forEach((s) => {
      setMap((m) => (m[s]?.status === 'ready' && !force ? m : { ...m, [s]: { status: 'loading', rows: [] } }));
      loadChart(s, { force }).then(
        (raw) => live && setMap((m) => ({ ...m, [s]: { status: 'ready', rows: normalizeChart(raw) } })),
        (err) => live && setMap((m) => ({ ...m, [s]: { status: 'error', rows: [], error: err } }))
      );
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined, reloadKey]);

  return map;
}
