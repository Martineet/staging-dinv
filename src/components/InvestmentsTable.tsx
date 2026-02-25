import { formatBtc, formatMoneyRounded } from '@/lib/format';
import { InvestmentRow } from '@/lib/types';

type InvestmentsTableProps = {
  rows: InvestmentRow[];
  loading: boolean;
  error: string | null;
};

export function InvestmentsTable({ rows, loading, error }: InvestmentsTableProps) {
  if (loading) {
    return (
      <div className="investments-table">
        <h2>Your Investments</h2>
        <div className="loading">Loading your investments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="investments-table">
        <h2>Your Investments</h2>
        <p className="error centered-text">{error}</p>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="investments-table">
        <h2>Your Investments</h2>
        <p className="muted centered-text">No investments yet.</p>
      </div>
    );
  }

  return (
    <div className="investments-table">
      <h2>Your Investments</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>BTC Amount</th>
              <th>€ Invested</th>
              <th>Purchase Price</th>
              <th>Current Value</th>
              <th>Profit/Loss</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const profitSign = row.profitLoss >= 0 ? '+' : '';
              return (
                <tr key={`${row.date}-${index}`}>
                  <td>{row.date}</td>
                  <td>{`${formatBtc(row.btcAmount)} BTC`}</td>
                  <td>{`${formatMoneyRounded(row.eurAmount)} €`}</td>
                  <td>{`${formatMoneyRounded(row.purchasePrice)} €`}</td>
                  <td>{`${formatMoneyRounded(row.currentValue)} €`}</td>
                  <td className={row.profitLoss >= 0 ? 'positive' : 'negative'}>
                    {`${profitSign}${formatMoneyRounded(row.profitLoss)} €`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
