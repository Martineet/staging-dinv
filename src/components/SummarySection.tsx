'use client';

import { PortfolioSummary } from '@/lib/types';
import { formatMoneyRounded } from '@/lib/format';

type SummarySectionProps = {
  summary: PortfolioSummary | null;
  btcPrice: number;
};

const EUR = '\u20AC';
const HOURGLASS = '\u23F3';
const COIN = '\u20BF';
const USERS = '\u{1F465}';
const EURO_BANKNOTE = '\u{1F4B6}';
const MONEY_BAG = '\u{1F4B0}';
const TREND = '\u{1F4C8}';
const CHART = '\u{1F4CA}';

export function SummarySection({ summary, btcPrice }: SummarySectionProps) {
  const totalBtc = summary?.total_btc ?? 0;
  const totalInvested = summary?.total_invested ?? 0;
  const bitcoiners = summary?.bitcoiners ?? 0;

  const totalVolume = totalBtc * btcPrice;
  const portfolioResult = totalVolume - totalInvested;
  const resultSign = portfolioResult >= 0 ? '+' : '';
  const resultClass = portfolioResult >= 0 ? 'positive' : 'negative';
  const totalBtcDisplay = totalBtc.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <section className="summary-section section-divider">
      <h2 className="section-title large">{CHART} D.Inversions Community</h2>
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon">{COIN}</div>
          <div className="summary-value">
            {summary ? `${totalBtcDisplay} BTC` : '-- BTC'}
          </div>
          <div className="summary-label">Bitcoin Hodled</div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">{USERS}</div>
          <div className="summary-value">{summary ? bitcoiners : '--'}</div>
          <div className="summary-label">Bitcoiners</div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">{EURO_BANKNOTE}</div>
          <div className="summary-value">
            {summary ? `${formatMoneyRounded(totalVolume)} ${EUR}` : `-- ${EUR}`}
          </div>
          <div className="summary-label">Community Value</div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">{MONEY_BAG}</div>
          <div className="summary-value">
            {summary ? `${formatMoneyRounded(totalInvested)} ${EUR}` : `-- ${EUR}`}
          </div>
          <div className="summary-label">Total Invested</div>
        </div>
        <div className="summary-card highlight">
          <div className="summary-icon">{TREND}</div>
          <div className={`summary-value ${summary ? resultClass : ''}`}>
            {summary ? `${resultSign}${formatMoneyRounded(portfolioResult)} ${EUR}` : `-- ${EUR}`}
          </div>
          <div className="summary-label">Portfolio Result</div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">{HOURGLASS}</div>
          <div className="summary-value">12/01/2018</div>
          <div className="summary-label">Journey started</div>
        </div>
      </div>
    </section>
  );
}
