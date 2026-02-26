import { formatBtc, formatMoneyRounded } from '@/lib/format';
import { InvestmentRow } from '@/lib/types';

type InvestmentsTableProps = {
  rows: InvestmentRow[];
  loading: boolean;
  error: string | null;
};

const EUR = '\u20AC';

export function InvestmentsTable({ rows, loading, error }: InvestmentsTableProps) {
  const renderTableBody = () => {
    if (loading) {
      return <div className="loading">Loading your investments...</div>;
    }

    if (error) {
      return <p className="error centered-text">{error}</p>;
    }

    if (!rows.length) {
      return <p className="muted centered-text">No investments yet.</p>;
    }

    return (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>BTC Amount</th>
              <th>{`${EUR} Invested`}</th>
              <th>Purchase Price</th>
              <th>Current Value</th>
              <th>Profit/Loss</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const profitSign = row.profitLoss >= 0 ? '+' : '';
              return (
                <tr key={`${row.date}-${index}`}>
                  <td>{row.date}</td>
                  <td>{row.type}</td>
                  <td>{`${formatBtc(row.btcAmount)} BTC`}</td>
                  <td>{`${formatMoneyRounded(row.eurAmount)} ${EUR}`}</td>
                  <td>{`${formatMoneyRounded(row.purchasePrice)} ${EUR}`}</td>
                  <td>{`${formatMoneyRounded(row.currentValue)} ${EUR}`}</td>
                  <td className={row.profitLoss >= 0 ? 'positive' : 'negative'}>
                    {`${profitSign}${formatMoneyRounded(row.profitLoss)} ${EUR}`}
                  </td>
                  <td>{row.notes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <section className="investments-shell">
      <div className="investments-table">
        <h2>Your Investments</h2>
        {renderTableBody()}
      </div>
    </section>
  );
}
