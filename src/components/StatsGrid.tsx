import { formatMoney } from '@/lib/format';
import { PortfolioTotals } from '@/lib/types';

type StatsGridProps = {
  totals: PortfolioTotals | null;
  btcPrice: number;
};

export function StatsGrid({ totals, btcPrice }: StatsGridProps) {
  const display = (value: number | null | undefined) => {
    if (!totals || value === null || value === undefined) return '-- €';
    return `${formatMoney(value)} €`;
  };

  const profitLoss = totals ? totals.totalProfitLoss : 0;
  const profitSign = profitLoss >= 0 ? '+' : '';

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">Current BTC Price</div>
        <div className="stat-value">{btcPrice ? `${formatMoney(btcPrice)} €` : '-- €'}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Total Invested</div>
        <div className="stat-value">{display(totals?.totalInvested)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Current Value</div>
        <div className="stat-value">{display(totals?.totalCurrentValue)}</div>
      </div>
      <div className="stat-card highlight">
        <div className="stat-label">Guaranteed Investment</div>
        <div className="stat-value highlight-value">{display(totals?.totalGuaranteed)}</div>
      </div>
      <div className="stat-card highlight">
        <div className="stat-label">Final Value</div>
        <div className="stat-value highlight-value">{display(totals?.totalFinalValue)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Result</div>
        <div className={`stat-value ${profitLoss >= 0 ? 'positive' : 'negative'}`}>
          {totals ? `${profitSign}${formatMoney(profitLoss)} €` : '-- €'}
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Total Commissions</div>
        <div className="stat-value">{display(totals?.totalCommissions)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Total Taxes</div>
        <div className="stat-value">{display(totals?.totalTaxes)}</div>
      </div>
    </div>
  );
}
