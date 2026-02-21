'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchBtcPriceEur } from '@/services/btc';

export function useBtcPrice(refreshIntervalMs = 60000) {
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const nextPrice = await fetchBtcPriceEur();
      setPrice(nextPrice);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load BTC price.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const intervalId = setInterval(refresh, refreshIntervalMs);
    return () => clearInterval(intervalId);
  }, [refresh, refreshIntervalMs]);

  return { price, loading, error, refresh };
}