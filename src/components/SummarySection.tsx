'use client';

import { PortfolioSummary } from '@/lib/types';
import { formatBtc, formatMoneyRounded } from '@/lib/format';

type SummarySectionProps = {
  summary: PortfolioSummary | null;
  btcPrice: number;
};

export function SummarySection({ summary, btcPrice }: SummarySectionProps) {
  const totalBtc = summary?.total_btc ?? 0;
  const totalInvested = summary?.total_invested ?? 0;
  const totalGuaranteed = summary?.total_guaranteed ?? 0;
  const bitcoiners = summary?.bitcoiners ?? 0;

  const totalVolume = totalBtc * btcPrice;
  const portfolioResult = totalVolume - totalInvested;
  const resultSign = portfolioResult >= 0 ? '+' : '';
  const resultClass = portfolioResult >= 0 ? 'positive' : 'negative';

  return (
    <section className="summary-section section-divider">
      <h2 className="section-title large">📊 D.Inversions Portfolio</h2>
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon">₿</div>
          <div className="summary-value">
            {summary ? `${formatBtc(totalBtc)} BTC` : '-- BTC'}
          </div>
          <div className="summary-label">Bitcoin Hodled</div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">👥</div>
          <div className="summary-value">{summary ? bitcoiners : '--'}</div>
          <div className="summary-label">Bitcoiners</div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">💵</div>
          <div className="summary-value">
            {summary ? `${formatMoneyRounded(totalVolume)} EUR` : '-- EUR'}
          </div>
          <div className="summary-label">Real Time Value</div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-value">
            {summary ? `${formatMoneyRounded(totalInvested)} EUR` : '-- EUR'}
          </div>
          <div className="summary-label">Total Invested</div>
        </div>
        <div className="summary-card highlight">
          <div className="summary-icon">📈</div>
          <div className={`summary-value ${summary ? resultClass : ''}`}>
            {summary ? `${resultSign}${formatMoneyRounded(portfolioResult)} EUR` : '-- EUR'}
          </div>
          <div className="summary-label">Portfolio Result</div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">🛡️</div>
          <div className="summary-value">
            {summary ? `${formatMoneyRounded(totalGuaranteed)} EUR` : '-- EUR'}
          </div>
          <div className="summary-label">Guaranteed Amount</div>
        </div>
      </div>
    </section>
  );
}
