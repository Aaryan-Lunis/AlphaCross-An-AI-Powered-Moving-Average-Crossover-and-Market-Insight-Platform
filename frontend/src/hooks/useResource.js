import { useCallback, useEffect, useRef, useState } from 'react';

// Load something async, with loading / error / reload. `key` identifies the
// resource; pass a falsy key to stay idle. The loader receives { force }.
export function useResource(key, loader) {
  const [state, setState] = useState({ data: null, error: null, loading: !!key });
  const [tick, setTick] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const forceRef = useRef(false);

  useEffect(() => {
    if (!key) {
      setState({ data: null, error: null, loading: false });
      return undefined;
    }
    let live = true;
    const force = forceRef.current;
    forceRef.current = false;
    setState({ data: null, error: null, loading: true });
    Promise.resolve(loaderRef.current({ force })).then(
      (data) => live && setState({ data, error: null, loading: false }),
      (error) => live && setState({ data: null, error, loading: false })
    );
    return () => {
      live = false;
    };
  }, [key, tick]);

  const reload = useCallback(() => {
    forceRef.current = true;
    setTick((t) => t + 1);
  }, []);

  return { ...state, reload };
}
