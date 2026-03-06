import { formatBtc, formatMoneyRounded } from '@/lib/format';
import { InvestmentRow, Portfolio } from '@/lib/types';

type InvestmentsTableProps = {
  rows: InvestmentRow[];
  loading: boolean;
  error: string | null;
  portfolios: Portfolio[];
  selectedPortfolioId: string | null;
  selectedPortfolioName: string | null;
  onSelectPortfolio: (portfolioId: string) => void;
};

const EUR = '\u20AC';

export function InvestmentsTable({
  rows,
  loading,
  error,
  portfolios,
  selectedPortfolioId,
  selectedPortfolioName,
  onSelectPortfolio
}: InvestmentsTableProps) {
  const renderTableBody = () => {
    if (loading) {
      return <div className="loading">Loading your investments...</div>;
    }

    if (error) {
      return <p className="error centered-text">{error}</p>;
    }

    if (!portfolios.length) {
      return <p className="muted centered-text">No portfolios created yet</p>;
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
        <div className="investments-header">
          <h2>{selectedPortfolioName ?? 'Portfolio'}</h2>
          <div className="portfolio-select-wrap">
            <select
              id="portfolio-selector"
              className="portfolio-selector"
              value={selectedPortfolioId ?? ''}
              onChange={(event) => onSelectPortfolio(event.target.value)}
              disabled={loading || !portfolios.length}
            >
              {portfolios.map((portfolio) => (
                <option key={portfolio.portfolio_id} value={portfolio.portfolio_id}>
                  {portfolio.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {renderTableBody()}
      </div>
    </section>
  );
}
