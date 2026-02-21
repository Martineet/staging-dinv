'use client';

import { useMemo, useState } from 'react';
import { DEFAULT_GROWTH } from '@/lib/constants';

export function useCalculator(currentBtcPrice: number) {
  const [growthRate, setGrowthRate] = useState(DEFAULT_GROWTH);
  const [investment, setInvestment] = useState<number | ''>('');
  const [futurePrice, setFuturePrice] = useState<number | ''>('');

  const computedFuturePrice = useMemo(() => {
    if (!currentBtcPrice) return 0;
    return currentBtcPrice * Math.pow(1 + growthRate / 100, 4);
  }, [currentBtcPrice, growthRate]);

  const normalizedFuturePrice = futurePrice === '' ? computedFuturePrice : Number(futurePrice || 0);
  const normalizedInvestment = investment === '' ? 0 : Number(investment || 0);

  const finalValue = useMemo(() => {
    if (!normalizedInvestment || !currentBtcPrice || !normalizedFuturePrice) return 0;
    const btcAmount = normalizedInvestment / currentBtcPrice;
    return btcAmount * normalizedFuturePrice;
  }, [normalizedInvestment, currentBtcPrice, normalizedFuturePrice]);

  const handleFuturePriceChange = (value: string) => {
    const numeric = Number(value);
    if (!numeric || !currentBtcPrice) {
      setFuturePrice(value === '' ? '' : 0);
      return;
    }

    const rate = (Math.pow(numeric / currentBtcPrice, 0.25) - 1) * 100;
    setGrowthRate(Number.isFinite(rate) ? Number(rate.toFixed(1)) : DEFAULT_GROWTH);
    setFuturePrice(numeric);
  };

  return {
    growthRate,
    investment,
    futurePrice: futurePrice === '' ? '' : normalizedFuturePrice,
    computedFuturePrice,
    finalValue,
    setGrowthRate,
    setInvestment,
    setFuturePrice,
    handleFuturePriceChange
  };
}