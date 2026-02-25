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

type StooqQuote = {
  date: string;
  close: number;
};

async function fetchStooqQuote(symbol: string): Promise<StooqQuote> {
  const response = await fetch(
    `https://stooq.com/q/l/?s=${encodeURIComponent(symbol)}&f=sd2t2ohlcv&h&e=csv`
  );

  if (!response.ok) {
    throw new Error(`Could not fetch quote for ${symbol}.`);
  }

  const csv = await response.text();
  const lines = csv.trim().split('\n');
  if (lines.length < 2) throw new Error(`Quote response for ${symbol} is empty.`);

  const row = lines[1].split(',');
  const date = row[1];
  const close = Number(row[6]);
  if (!date || !Number.isFinite(close) || close <= 0) {
    throw new Error(`Invalid quote payload for ${symbol}.`);
  }

  return { date, close };
}

export async function getCurrentComparisonAssetPrices() {
  const [goldUsd, sp500Usd, ibex35Eur, eurUsd] = await Promise.all([
    fetchStooqQuote('xauusd'),
    fetchStooqQuote('^spx'),
    fetchStooqQuote('^ibex'),
    fetchStooqQuote('eurusd')
  ]);

  return {
    asOf: [goldUsd.date, sp500Usd.date, ibex35Eur.date, eurUsd.date].sort().slice(-1)[0],
    goldEur: goldUsd.close / eurUsd.close,
    sp500Eur: sp500Usd.close / eurUsd.close,
    ibex35Eur: ibex35Eur.close
  };
}
