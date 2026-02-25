'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LandingHeader } from '@/components/LandingHeader';
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

  useEffect(() => {
    if (!loading && session) {
      router.replace('/dashboard');
    }
  }, [loading, session, router]);

  return (
    <div className="container">
      <LandingHeader btcPrice={price} />
      <LoginForm />
      <SummarySection summary={summary} btcPrice={price} />
      <CalculatorsSection btcPrice={price} />
      <Logos />
      <Footer />
    </div>
  );
}
