'use client';

import { formatMoneyRounded } from '@/lib/format';

type LandingHeaderProps = {
  btcPrice: number;
};

export function LandingHeader({ btcPrice }: LandingHeaderProps) {
  const displayPrice = btcPrice ? `${formatMoneyRounded(btcPrice)} EUR` : '-- EUR';

  return (
    <div className="login-header">
      <div className="login-header-row">
        <h1 className="header-title">🪙 D.Inversions</h1>
        <div id="headerBtcPrice" className="header-btc-price">
          {displayPrice}
        </div>
      </div>
      <div className="login-subtitle-row">
        <p className="subtitle">Track your Bitcoin investments</p>
        <p className="subtitle subtitle-right">Bitcoin price</p>
      </div>
    </div>
  );
}
