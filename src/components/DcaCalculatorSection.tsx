'use client';

import { useDcaCalculator } from '@/hooks/useDcaCalculator';
import { AssetKind } from '@/lib/types';
import { formatMoneyRounded } from '@/lib/format';

type DcaCalculatorSectionProps = {
  btcPrice: number;
};

const EUR = '\u20AC';
const DIAMOND = '\u{1F48E}';
const HANDS = '\u{1F932}';

function assetLabel(asset: AssetKind): string {
  if (asset === 'gold') return 'Gold';
  if (asset === 'sp500') return 'SP500';
  if (asset === 'ibex35') return 'Ibex35';
  return 'Bitcoin';
}

export function DcaCalculatorSection({ btcPrice }: DcaCalculatorSectionProps) {
  const {
    monthlyEur,
    startDate,
    endDate,
    today,
    result,
    loading,
    error,
    compareAsset,
    setMonthlyEur,
    setStartDate,
    setEndDate,
    setCompareAsset
  } = useDcaCalculator(btcPrice);

  const btcSign = result && result.bitcoin.profitLoss >= 0 ? '+' : '';
  const btcClass = result && result.bitcoin.profitLoss >= 0 ? 'positive' : 'negative';
  const cmpSign = result && result.compare.profitLoss >= 0 ? '+' : '';
  const cmpClass = result && result.compare.profitLoss >= 0 ? 'positive' : 'negative';

  return (
    <div className="calculator-panel">
      <h2 className="section-title large">{`${DIAMOND} Bitcoin DCA Calculator ${HANDS}`}</h2>
      <div className="calculator-card">
        <div className="calc-grid">
          <div className="calc-row">
            <label>Monthly Investment ({EUR})</label>
            <input
              type="number"
              min={0}
              placeholder="200"
              value={monthlyEur}
              onChange={(event) => setMonthlyEur(event.target.value === '' ? '' : Number(event.target.value))}
            />
          </div>
          <div className="calc-row">
            <label>Start Date</label>
            <input
              type="date"
              min="2013-05-01"
              max={today}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="calc-row">
            <label>End Date (optional)</label>
            <input
              type="date"
              min={startDate || '2013-05-01'}
              max={today}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <div className="calc-row">
            <label>Compare With</label>
            <select
              value={compareAsset}
              onChange={(event) => setCompareAsset(event.target.value as AssetKind)}
            >
              <option value="gold">Gold</option>
              <option value="sp500">SP500</option>
              <option value="ibex35">Ibex35</option>
            </select>
          </div>
        </div>

        <div className="calc-result">
          <div className="dca-row dca-row-eur">
            <div className="dca-inline-line">
              <span className="result-label dca-inline-label">Euros invested</span>
              <span className="result-value result-value-normal dca-inline-value">
                {result ? `${formatMoneyRounded(result.investedEur)} ${EUR}` : `-- ${EUR}`}
              </span>
            </div>
          </div>

          <div className="dca-row dca-row-strong">
            <div className="dca-row-item">
              <div className="result-label">Bitcoin value</div>
              <div className="result-value">
                {result ? `${formatMoneyRounded(result.bitcoin.eurosValue)} ${EUR}` : `-- ${EUR}`}
              </div>
            </div>
            <div className="dca-row-item">
              <div className={`result-label ${result ? btcClass : ''}`}>Bitcoin Profit/Loss</div>
              <div className={`result-value ${result ? btcClass : ''}`}>
                {result ? `${btcSign}${formatMoneyRounded(result.bitcoin.profitLoss)} ${EUR}` : `-- ${EUR}`}
              </div>
            </div>
          </div>

          <div className="dca-row">
            <div className="dca-row-item">
              <div className="result-label">{assetLabel(compareAsset)} value</div>
              <div className="result-value result-value-normal">
                {result ? `${formatMoneyRounded(result.compare.eurosValue)} ${EUR}` : `-- ${EUR}`}
              </div>
            </div>
            <div className="dca-row-item">
              <div className={`result-label ${result ? cmpClass : ''}`}>
                {assetLabel(compareAsset)} Profit/Loss
              </div>
              <div className={`result-value result-value-normal ${result ? cmpClass : ''}`}>
                {result ? `${cmpSign}${formatMoneyRounded(result.compare.profitLoss)} ${EUR}` : `-- ${EUR}`}
              </div>
            </div>
          </div>

          <div className="result-label">
            {result
              ? `${assetLabel(compareAsset)} reference price: ${formatMoneyRounded(
                  result.compareFinalPrice
                )} ${EUR} ${result.usingLiveFinalPrice ? '(live)' : '(stored monthly)'}`
              : `${assetLabel(compareAsset)} reference price: -- ${EUR}`}
          </div>

          {loading && <div className="loading">Calculating DCA...</div>}
          {error && <div className="error centered-text">{error}</div>}
        </div>
      </div>
    </div>
  );
}
