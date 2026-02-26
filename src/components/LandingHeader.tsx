'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { SettingsMenu } from '@/components/SettingsMenu';
import { formatMoneyRounded } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';
import { useBtcPrice } from '@/hooks/useBtcPrice';

const EUR = '\u20AC';

export function LandingHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, loading, signOut } = useAuth();
  const { price: btcPrice } = useBtcPrice();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const displayPrice = btcPrice ? `${formatMoneyRounded(btcPrice)} ${EUR}` : `-- ${EUR}`;
  const isLoggedIn = !loading && Boolean(session);

  const openMembersZone = () => {
    if (pathname !== '/') {
      sessionStorage.setItem('open_members_zone', '1');
      router.push('/');
      return;
    }

    window.dispatchEvent(new CustomEvent('open-members-zone'));
  };

  return (
    <header className="landing-top-nav" role="banner">
      <div className="landing-top-nav-left">
        <div className="nav-brand-logo" aria-hidden="true">
          <img src="/log1.png" alt="" />
        </div>
        <a href="https://www.dinversions.org/" className="header-title nav-title-link">
          D.Inversions
        </a>
        <div id="headerBtcPrice" className="header-btc-price">
          {displayPrice}
        </div>
      </div>
      <div className="landing-top-nav-middle">
        <p className="nav-quote">Bitcoin is building the next global monetary system</p>
      </div>
      <div className="landing-top-nav-right">
        {isLoggedIn ? (
          <>
            <SettingsMenu onChangePassword={() => setIsChangePasswordOpen(true)} onLogout={() => signOut()} />
            <ChangePasswordModal
              isOpen={isChangePasswordOpen}
              onClose={() => setIsChangePasswordOpen(false)}
            />
          </>
        ) : (
          <button type="button" className="members-zone-btn" onClick={openMembersZone}>
            Members Zone
          </button>
        )}
      </div>
    </header>
  );
}
