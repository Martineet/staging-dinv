'use client';

import { useEffect, useState } from 'react';
import { PortfolioSummary } from '@/lib/types';
import { getPortfolioSummary } from '@/services/portfolio';

export function usePortfolioSummary() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await getPortfolioSummary();
        if (!active) return;
        setSummary(data);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Portfolio summary unavailable.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return { summary, loading, error };
}