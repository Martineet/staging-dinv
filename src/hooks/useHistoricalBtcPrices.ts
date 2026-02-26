'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/services/supabaseClient';

export type HistoricalBtcPricePoint = {
  date: string;
  price: number;
};

export function useHistoricalBtcPrices() {
  const [data, setData] = useState<HistoricalBtcPricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data: rows, error: queryError } = await supabase
      .from('assets_daily_prices')
      .select('price_date, btc_eur')
      .order('price_date', { ascending: true });

    if (queryError) {
      setError(queryError.message);
      setLoading(false);
      return;
    }

    const nextData = (rows ?? []).map((row) => ({
      date: row.price_date,
      price: Number(row.btc_eur)
    }));

    setData(nextData);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
