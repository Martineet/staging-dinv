import { AssetsDailyPrice } from '@/lib/types';
import { supabase } from '@/services/supabaseClient';

export async function getAssetsMonthlyPrices(fromDate = '2013-05-01'): Promise<AssetsDailyPrice[]> {
  const { data, error } = await supabase
    .from('assets_daily_prices')
    .select(
      [
        'price_date',
        'btc_eur',
        'btc_source',
        'gold_eur',
        'gold_source',
        'sp500_eur',
        'sp500_source',
        'ibex35_eur',
        'ibex35_source'
      ].join(', ')
    )
    .gte('price_date', fromDate)
    .order('price_date', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as AssetsDailyPrice[];
}

export async function getCurrentComparisonAssetPrices() {
  const response = await fetch('/api/asset-quotes', { cache: 'no-store' });
  if (!response.ok) throw new Error('Could not fetch current comparison assets prices.');

  const payload = (await response.json()) as {
    asOf: string;
    goldEur: number;
    sp500Eur: number;
    ibex35Eur: number;
  };

  if (
    !payload ||
    !payload.asOf ||
    !Number.isFinite(payload.goldEur) ||
    !Number.isFinite(payload.sp500Eur) ||
    !Number.isFinite(payload.ibex35Eur) ||
    payload.goldEur <= 0 ||
    payload.sp500Eur <= 0 ||
    payload.ibex35Eur <= 0
  ) {
    throw new Error('Invalid current comparison assets payload.');
  }

  return payload;
}
