import { useState, useEffect } from 'react';

export function useApi<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetcher()
      .then((d) => { if (active) { setData(d); setLoading(false); } })
      .catch((e: unknown) => { if (active) { setError(String(e)); setLoading(false); } });
    return () => { active = false; };
  }, []);

  return { data, loading, error };
}
