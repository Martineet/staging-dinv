'use client';

import { useCalculator } from '@/hooks/useCalculator';
import { formatMoney } from '@/lib/format';

type CalculatorSectionProps = {
  btcPrice: number;
};

export function CalculatorSection({ btcPrice }: CalculatorSectionProps) {
  const {
    growthRate,
    investment,
    futurePrice,
    computedFuturePrice,
    finalValue,
    setGrowthRate,
    setInvestment,
    handleFuturePriceChange
  } = useCalculator(btcPrice);

  const displayCurrent = btcPrice ? `${formatMoney(btcPrice)} €` : '-- €';
  const displayFinal = finalValue ? `${formatMoney(finalValue)} €` : '-- €';

  return (
    <section className="calculator-section section-divider">
      <h2 className="section-title large">💰 Bitcoin Investment Calculator</h2>
      <div className="calculator-card">
        <div className="calc-grid">
          <div className="calc-row">
            <label>Current BTC Price</label>
            <input type="text" value={displayCurrent} readOnly className="input-readonly" />
          </div>
          <div className="calc-row">
            <label>Annual Growth Rate (%)</label>
            <input
              type="number"
              value={growthRate}
              onChange={(event) => setGrowthRate(Number(event.target.value || 0))}
              min={0}
              max={1000}
            />
          </div>
          <div className="calc-row">
            <label>Investment Amount (€)</label>
            <input
              type="number"
              value={investment}
              onChange={(event) => setInvestment(event.target.value === '' ? '' : Number(event.target.value))}
              min={0}
              placeholder="1000"
            />
          </div>
          <div className="calc-row">
            <label>Expected BTC Price (4 years)</label>
            <input
              type="number"
              value={futurePrice === '' ? Math.round(computedFuturePrice || 0) : futurePrice}
              onChange={(event) => handleFuturePriceChange(event.target.value)}
              className="input-emphasis"
            />
          </div>
        </div>
        <div className="calc-result">
          <div className="result-label">Expected Final Value (4 years)</div>
          <div className="result-value">{displayFinal}</div>
        </div>
      </div>
    </section>
  );
}
