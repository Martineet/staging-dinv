'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Footer } from '@/components/Footer';
import { InvestmentsTable } from '@/components/InvestmentsTable';
import { Logos } from '@/components/Logos';
import { StatsGrid } from '@/components/StatsGrid';
import { useAuth } from '@/hooks/useAuth';
import { useBtcPrice } from '@/hooks/useBtcPrice';
import { useInvestments } from '@/hooks/useInvestments';
import { buildInvestmentRows, calculatePortfolioTotals } from '@/lib/calculations';

export default function DashboardPage() {
  const router = useRouter();
  const { session, user, loading, signOut } = useAuth();
  const { price } = useBtcPrice();
  const { client, investments, loading: investmentsLoading, error, refresh } = useInvestments(user);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/');
    }
  }, [loading, session, router]);

  useEffect(() => {
    if (!session) return;
    const intervalId = setInterval(refresh, 60000);
    return () => clearInterval(intervalId);
  }, [session, refresh]);

  const totals = useMemo(() => {
    if (!investments.length || !price) return null;
    return calculatePortfolioTotals(investments, price);
  }, [investments, price]);

  const rows = useMemo(() => {
    if (!investments.length || !price) return [];
    return buildInvestmentRows(investments, price);
  }, [investments, price]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const displayName = client?.display_name || user?.email || 'Investor';

  return (
    <div className="container">
      <DashboardHeader
        displayName={displayName}
        onChangePassword={() => setIsModalOpen(true)}
        onLogout={() => signOut()}
      />
      <StatsGrid totals={totals} btcPrice={price} />
      <InvestmentsTable rows={rows} loading={investmentsLoading} error={error} />
      <ChangePasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Logos />
      <Footer />
    </div>
  );
}