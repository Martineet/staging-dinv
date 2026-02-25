import { formatBtc, formatMoneyRounded } from '@/lib/format';
import { PortfolioTotals } from '@/lib/types';

type StatsGridProps = {
  totals: PortfolioTotals | null;
};

export function StatsGrid({ totals }: StatsGridProps) {
  const display = (value: number | null | undefined) => {
    if (!totals || value === null || value === undefined) return '-- €';
    return `${formatMoneyRounded(value)} €`;
  };

  const profitLoss = totals ? totals.totalProfitLoss : 0;
  const profitSign = profitLoss >= 0 ? '+' : '';
  const btcHodled = totals ? `${formatBtc(totals.totalBTC)} BTC` : '-- BTC';

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">Btc hodled</div>
        <div className="stat-value">{btcHodled}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Current Value</div>
        <div className="stat-value">{display(totals?.totalCurrentValue)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Total Invested</div>
        <div className="stat-value">{display(totals?.totalInvested)}</div>
      </div>
      <div className="stat-card highlight">
        <div className="stat-label">Final Value</div>
        <div className="stat-value highlight-value">{display(totals?.totalFinalValue)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Result</div>
        <div className={`stat-value ${profitLoss >= 0 ? 'positive' : 'negative'}`}>
          {totals ? `${profitSign}${formatMoneyRounded(profitLoss)} €` : '-- €'}
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Total Taxes</div>
        <div className="stat-value">{display(totals?.totalTaxes)}</div>
      </div>
    </div>
  );
}
