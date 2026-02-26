'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/LoginForm';
import { SummarySection } from '@/components/SummarySection';
import { CalculatorsSection } from '@/components/CalculatorsSection';
import { Footer } from '@/components/Footer';
import { Logos } from '@/components/Logos';
import { useAuth } from '@/hooks/useAuth';
import { useBtcPrice } from '@/hooks/useBtcPrice';
import { usePortfolioSummary } from '@/hooks/usePortfolioSummary';

export default function HomePage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const { price } = useBtcPrice();
  const { summary } = usePortfolioSummary();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      router.replace('/dashboard');
    }
  }, [loading, session, router]);

  useEffect(() => {
    document.body.classList.add('landing-body');
    return () => {
      document.body.classList.remove('landing-body');
    };
  }, []);

  useEffect(() => {
    const shouldOpenFromRedirect = sessionStorage.getItem('open_members_zone') === '1';
    if (shouldOpenFromRedirect) {
      sessionStorage.removeItem('open_members_zone');
      setIsLoginModalOpen(true);
    }

    const handleOpenMembersZone = () => setIsLoginModalOpen(true);
    window.addEventListener('open-members-zone', handleOpenMembersZone);
    return () => {
      window.removeEventListener('open-members-zone', handleOpenMembersZone);
    };
  }, []);

  useEffect(() => {
    if (!isLoginModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLoginModalOpen]);

  return (
    <div className="landing-page">
      <main className="landing-main">
        <SummarySection summary={summary} btcPrice={price} />
        <CalculatorsSection btcPrice={price} />
        <Logos />
        <Footer />
      </main>

      {isLoginModalOpen ? (
        <div
          className="modal-overlay open"
          role="presentation"
          onClick={(event) => event.currentTarget === event.target && setIsLoginModalOpen(false)}
        >
          <section className="modal login-modal" role="dialog" aria-modal="true" aria-label="Member login">
            <button
              type="button"
              className="modal-close-btn"
              aria-label="Close login popup"
              onClick={() => setIsLoginModalOpen(false)}
            >
              &times;
            </button>
            <LoginForm />
          </section>
        </div>
      ) : null}
    </div>
  );
}
