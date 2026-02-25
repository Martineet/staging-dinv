'use client';

import { useEffect, useMemo, useState } from 'react';
import { AssetKind, AssetsDailyPrice } from '@/lib/types';
import { getAssetsMonthlyPrices, getCurrentComparisonAssetPrices } from '@/services/assetsHistory';

type DcaLegResult = {
  eurosValue: number;
  profitLoss: number;
};

type DcaResult = {
  investedEur: number;
  bitcoin: DcaLegResult;
  compare: DcaLegResult;
  compareAsset: AssetKind;
  finalValuationDate: string;
  usingLiveFinalPrice: boolean;
};

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthStart(dateIso: string): string {
  return `${dateIso.slice(0, 7)}-01`;
}

function monthStartOfDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}-01`;
}

function nextMonthStart(dateIso: string): string {
  const date = new Date(`${dateIso}T00:00:00Z`);
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + 1);
  return monthStartOfDate(date);
}

function dayDiff(aIso: string, bIso: string): number {
  const a = new Date(`${aIso}T00:00:00Z`).getTime();
  const b = new Date(`${bIso}T00:00:00Z`).getTime();
  return Math.abs(Math.round((a - b) / (1000 * 60 * 60 * 24)));
}

function nearestMonthStart(targetDate: string): string {
  const sameMonth = monthStart(targetDate);
  const nextMonth = nextMonthStart(sameMonth);
  const distanceToSame = dayDiff(targetDate, sameMonth);
  const distanceToNext = dayDiff(targetDate, nextMonth);
  return distanceToSame <= distanceToNext ? sameMonth : nextMonth;
}

function getCompareAssetPrice(row: AssetsDailyPrice, compareAsset: AssetKind): number {
  if (compareAsset === 'gold') return Number(row.gold_eur);
  if (compareAsset === 'sp500') return Number(row.sp500_eur);
  if (compareAsset === 'ibex35') return Number(row.ibex35_eur);
  return Number(row.btc_eur);
}

function buildMonthlySchedule(startDate: string, endDate: string): string[] {
  const start = nearestMonthStart(startDate);
  const end = monthStart(endDate);
  if (start > end) return [];

  const dates: string[] = [];
  let current = start;
  while (current <= end) {
    dates.push(current);
    current = nextMonthStart(current);
  }
  return dates;
}

export function useDcaCalculator(currentBtcPrice: number) {
  const [monthlyEur, setMonthlyEur] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('2018-01-12');
  const [endDate, setEndDate] = useState('');
  const [compareAsset, setCompareAsset] = useState<AssetKind>('gold');
  const [result, setResult] = useState<DcaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastStoredDate, setLastStoredDate] = useState<string | null>(null);

  const today = useMemo(() => toIsoDate(new Date()), []);

  useEffect(() => {
    const run = async () => {
      const amount = Number(monthlyEur);
      if (!amount || amount <= 0 || !startDate || !currentBtcPrice) {
        setResult(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const monthlyRows = await getAssetsMonthlyPrices('2013-05-01');
        if (!monthlyRows.length) {
          setResult(null);
          setError('No monthly assets prices found in database.');
          return;
        }

        const latestStored = monthlyRows[monthlyRows.length - 1].price_date;
        setLastStoredDate(latestStored);

        const inputEnd = endDate || today;
        const usesLiveFinalPrice = !endDate || endDate === today;

        if (inputEnd < startDate) {
          setResult(null);
          setError('End date must be after start date.');
          return;
        }

        if (inputEnd > latestStored && !usesLiveFinalPrice) {
          setResult(null);
          setError(
            `Dates after ${latestStored} are not allowed. Use today (${today}) or leave end date empty.`
          );
          return;
        }

        let effectiveEnd = inputEnd;
        if (!usesLiveFinalPrice) {
          effectiveEnd = nearestMonthStart(inputEnd);
          if (effectiveEnd > latestStored) {
            setResult(null);
            setError(
              `Rounded end date (${effectiveEnd}) is after last stored date (${latestStored}). Use today (${today}) or empty end date.`
            );
            return;
          }
        }

        const schedule = buildMonthlySchedule(startDate, effectiveEnd);
        if (!schedule.length) {
          setResult(null);
          setError('Invalid date range for monthly DCA schedule.');
          return;
        }

        const rowsByDate = new Map(monthlyRows.map((row) => [row.price_date, row]));
        let btcUnits = 0;
        let compareUnits = 0;

        for (const paymentDate of schedule) {
          const row = rowsByDate.get(paymentDate);
          if (!row) {
            setResult(null);
            setError(`Missing monthly price row for ${paymentDate}.`);
            return;
          }

          const btcPriceAtBuy = Number(row.btc_eur);
          const comparePriceAtBuy = getCompareAssetPrice(row, compareAsset);
          if (!btcPriceAtBuy || !comparePriceAtBuy || btcPriceAtBuy <= 0 || comparePriceAtBuy <= 0) {
            setResult(null);
            setError(`Invalid price data for ${paymentDate}.`);
            return;
          }

          btcUnits += amount / btcPriceAtBuy;
          compareUnits += amount / comparePriceAtBuy;
        }

        let btcFinalPrice = currentBtcPrice;
        let compareFinalPrice = 0;

        if (usesLiveFinalPrice) {
          const currentCompare = await getCurrentComparisonAssetPrices();
          if (compareAsset === 'gold') compareFinalPrice = currentCompare.goldEur;
          if (compareAsset === 'sp500') compareFinalPrice = currentCompare.sp500Eur;
          if (compareAsset === 'ibex35') compareFinalPrice = currentCompare.ibex35Eur;
        } else {
          const finalRow = rowsByDate.get(effectiveEnd);
          if (!finalRow) {
            setResult(null);
            setError(`Missing final valuation row for ${effectiveEnd}.`);
            return;
          }
          btcFinalPrice = Number(finalRow.btc_eur);
          compareFinalPrice = getCompareAssetPrice(finalRow, compareAsset);
        }

        if (!compareFinalPrice || compareFinalPrice <= 0) {
          setResult(null);
          setError('Invalid final comparison asset price.');
          return;
        }

        const investedEur = schedule.length * amount;
        const bitcoinValue = btcUnits * btcFinalPrice;
        const compareValue = compareUnits * compareFinalPrice;

        setResult({
          investedEur,
          bitcoin: {
            eurosValue: bitcoinValue,
            profitLoss: bitcoinValue - investedEur
          },
          compare: {
            eurosValue: compareValue,
            profitLoss: compareValue - investedEur
          },
          compareAsset,
          finalValuationDate: usesLiveFinalPrice ? today : effectiveEnd,
          usingLiveFinalPrice: usesLiveFinalPrice
        });
      } catch (err) {
        setResult(null);
        setError(err instanceof Error ? err.message : 'Could not calculate DCA.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [monthlyEur, startDate, endDate, compareAsset, currentBtcPrice, today]);

  return {
    monthlyEur,
    startDate,
    endDate,
    today,
    result,
    loading,
    error,
    compareAsset,
    lastStoredDate,
    setMonthlyEur,
    setStartDate,
    setEndDate,
    setCompareAsset
  };
}
