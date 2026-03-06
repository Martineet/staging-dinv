'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import {
  getInvestmentsByPortfolioId,
  getMemberProfileByEmail,
  getPortfoliosByMemberId
} from '@/services/portfolio';
import { Investment, MemberProfile, Portfolio } from '@/lib/types';

export function useInvestments(user: User | null) {
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const selectedPortfolioIdRef = useRef<string | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    selectedPortfolioIdRef.current = selectedPortfolioId;
  }, [selectedPortfolioId]);

  const refresh = useCallback(async (portfolioIdOverride?: string | null) => {
    if (!user?.email) {
      setMember(null);
      setPortfolios([]);
      setSelectedPortfolioId(null);
      setInvestments([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    try {
      const memberProfile = await getMemberProfileByEmail(user.email);
      if (!memberProfile) {
        setError('Could not find your account. Contact the administrator.');
        setMember(null);
        setPortfolios([]);
        setSelectedPortfolioId(null);
        setInvestments([]);
        setLoading(false);
        return;
      }

      const memberPortfolios = await getPortfoliosByMemberId(memberProfile.member_id);
      const nextSelectedPortfolioId =
        portfolioIdOverride ??
        (selectedPortfolioIdRef.current &&
        memberPortfolios.some((portfolio) => portfolio.portfolio_id === selectedPortfolioIdRef.current)
          ? selectedPortfolioIdRef.current
          : memberPortfolios[0]?.portfolio_id ?? null);

      let data: Investment[] = [];
      if (nextSelectedPortfolioId) {
        data = await getInvestmentsByPortfolioId(nextSelectedPortfolioId);
      }

      setMember(memberProfile);
      setPortfolios(memberPortfolios);
      setSelectedPortfolioId(nextSelectedPortfolioId);
      setInvestments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading investments.');
      setMember(null);
      setPortfolios([]);
      setSelectedPortfolioId(null);
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const selectPortfolio = useCallback(
    async (portfolioId: string) => {
      if (portfolioId === selectedPortfolioIdRef.current) return;
      setSelectedPortfolioId(portfolioId);
      await refresh(portfolioId);
    },
    [refresh]
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!active) return;
      await refresh();
    };

    load();
    return () => {
      active = false;
    };
  }, [refresh]);

  return {
    member,
    portfolios,
    selectedPortfolioId,
    investments,
    loading,
    error,
    refresh,
    selectPortfolio
  };
}
