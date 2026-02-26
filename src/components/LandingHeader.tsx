'use client';

import { formatMoneyRounded } from '@/lib/format';

type LandingHeaderProps = {
  btcPrice: number;
  onOpenMembersZone: () => void;
};

const EUR = '\u20AC';

export function LandingHeader({ btcPrice, onOpenMembersZone }: LandingHeaderProps) {
  const displayPrice = btcPrice ? `${formatMoneyRounded(btcPrice)} ${EUR}` : `-- ${EUR}`;

  return (
    <header className="landing-top-nav">
      <div className="landing-top-nav-left">
        <a
          href="https://www.dinversions.org/"
          target="_blank"
          rel="noreferrer"
          className="header-title nav-title-link"
        >
          D.Inversions
        </a>
        <div id="headerBtcPrice" className="header-btc-price">
          {displayPrice}
        </div>
      </div>
      <div className="landing-top-nav-right">
        <button type="button" className="members-zone-btn" onClick={onOpenMembersZone}>
          Members Zone
        </button>
      </div>
    </header>
  );
}
