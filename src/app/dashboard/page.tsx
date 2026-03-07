'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  const { session, user, loading } = useAuth();
  const { price } = useBtcPrice();
  const {
    member,
    portfolios,
    selectedPortfolio,
    selectedPortfolioId,
    investments,
    loading: investmentsLoading,
    error,
    refresh,
    selectPortfolio,
    createPortfolio,
    renamePortfolio,
    deletePortfolio,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    creatingPortfolio,
    renamingPortfolio,
    deletingPortfolio,
    creatingInvestment,
    updatingInvestment,
    deletingInvestment
  } = useInvestments(user);

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

  const selectedPortfolioName = selectedPortfolio?.name ?? null;

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const displayName = member?.display_name || user?.email || 'Investor';

  return (
    <div className="container">
      <DashboardHeader displayName={displayName} />
      <StatsGrid totals={totals} />
      <InvestmentsTable
        investments={investments}
        rows={rows}
        loading={investmentsLoading}
        error={error}
        portfolios={portfolios}
        selectedPortfolioId={selectedPortfolioId}
        selectedPortfolioName={selectedPortfolioName}
        onSelectPortfolio={selectPortfolio}
        onCreatePortfolio={createPortfolio}
        onRenamePortfolio={renamePortfolio}
        onDeletePortfolio={deletePortfolio}
        onCreateInvestment={createInvestment}
        onUpdateInvestment={updateInvestment}
        onDeleteInvestment={deleteInvestment}
        creatingPortfolio={creatingPortfolio}
        renamingPortfolio={renamingPortfolio}
        deletingPortfolio={deletingPortfolio}
        creatingInvestment={creatingInvestment}
        updatingInvestment={updatingInvestment}
        deletingInvestment={deletingInvestment}
      />
      <Logos />
      <Footer />
    </div>
  );
}
