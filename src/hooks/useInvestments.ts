'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import {
  createInvestment as createInvestmentRecord,
  createPortfolio as createPortfolioRecord,
  deleteInvestment as deleteInvestmentRecord,
  deletePortfolio as deletePortfolioRecord,
  renamePortfolio as renamePortfolioRecord,
  updateInvestment as updateInvestmentRecord
} from '@/services/investmentsService';
import {
  getInvestmentsByPortfolioId,
  getMemberProfileByEmail,
  getPortfoliosByMemberId
} from '@/services/portfolio';
import { Investment, InvestmentFormInput, MemberProfile, Portfolio } from '@/lib/types';

type MutationState = {
  loading: boolean;
  error: string | null;
  success: boolean;
};

const INITIAL_MUTATION_STATE: MutationState = {
  loading: false,
  error: null,
  success: false
};

export function useInvestments(user: User | null) {
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const selectedPortfolioIdRef = useRef<string | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creatingPortfolio, setCreatingPortfolio] = useState<MutationState>(INITIAL_MUTATION_STATE);
  const [renamingPortfolio, setRenamingPortfolio] = useState<MutationState>(INITIAL_MUTATION_STATE);
  const [deletingPortfolio, setDeletingPortfolio] = useState<MutationState>(INITIAL_MUTATION_STATE);
  const [creatingInvestment, setCreatingInvestment] = useState<MutationState>(INITIAL_MUTATION_STATE);
  const [updatingInvestment, setUpdatingInvestment] = useState<MutationState>(INITIAL_MUTATION_STATE);
  const [deletingInvestment, setDeletingInvestment] = useState<MutationState>(INITIAL_MUTATION_STATE);

  useEffect(() => {
    selectedPortfolioIdRef.current = selectedPortfolioId;
  }, [selectedPortfolioId]);

  const refresh = useCallback(
    async (portfolioIdOverride?: string | null) => {
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
    },
    [user]
  );

  const selectPortfolio = useCallback(
    async (portfolioId: string) => {
      if (portfolioId === selectedPortfolioIdRef.current) return;
      setSelectedPortfolioId(portfolioId);
      await refresh(portfolioId);
    },
    [refresh]
  );

  const createPortfolio = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) {
        setCreatingPortfolio({ loading: false, error: 'Portfolio name is required.', success: false });
        return false;
      }

      if (!member?.member_id) {
        setCreatingPortfolio({ loading: false, error: 'No member loaded.', success: false });
        return false;
      }

      setCreatingPortfolio({ loading: true, error: null, success: false });
      const { data, error: createError } = await createPortfolioRecord(trimmed, member.member_id);

      if (createError || !data) {
        setCreatingPortfolio({
          loading: false,
          error: createError?.message ?? 'Unable to create portfolio.',
          success: false
        });
        return false;
      }

      await refresh(data.portfolio_id);
      setCreatingPortfolio({ loading: false, error: null, success: true });
      return true;
    },
    [member, refresh]
  );

  const renamePortfolio = useCallback(
    async (portfolioId: string, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) {
        setRenamingPortfolio({ loading: false, error: 'Portfolio name is required.', success: false });
        return false;
      }

      setRenamingPortfolio({ loading: true, error: null, success: false });
      const { error: renameError } = await renamePortfolioRecord(portfolioId, trimmed);

      if (renameError) {
        setRenamingPortfolio({ loading: false, error: renameError.message, success: false });
        return false;
      }

      await refresh(portfolioId);
      setRenamingPortfolio({ loading: false, error: null, success: true });
      return true;
    },
    [refresh]
  );

  const deletePortfolio = useCallback(
    async (portfolioId: string) => {
      setDeletingPortfolio({ loading: true, error: null, success: false });

      const { error: deleteError } = await deletePortfolioRecord(portfolioId);
      if (deleteError) {
        setDeletingPortfolio({ loading: false, error: deleteError.message, success: false });
        return false;
      }

      await refresh();
      setDeletingPortfolio({ loading: false, error: null, success: true });
      return true;
    },
    [refresh]
  );

  const createInvestment = useCallback(
    async (investmentData: Omit<InvestmentFormInput, 'portfolio_id'> & { portfolio_id?: string }) => {
      const portfolioId = investmentData.portfolio_id ?? selectedPortfolioIdRef.current;
      if (!portfolioId) {
        setCreatingInvestment({ loading: false, error: 'Select a portfolio first.', success: false });
        return false;
      }

      setCreatingInvestment({ loading: true, error: null, success: false });
      const { error: createError } = await createInvestmentRecord({ ...investmentData, portfolio_id: portfolioId });

      if (createError) {
        setCreatingInvestment({ loading: false, error: createError.message, success: false });
        return false;
      }

      await refresh(portfolioId);
      setCreatingInvestment({ loading: false, error: null, success: true });
      return true;
    },
    [refresh]
  );

  const updateInvestment = useCallback(
    async (investmentId: string, updates: Omit<InvestmentFormInput, 'portfolio_id'> & { portfolio_id?: string }) => {
      const portfolioId = updates.portfolio_id ?? selectedPortfolioIdRef.current;
      if (!portfolioId) {
        setUpdatingInvestment({ loading: false, error: 'Select a portfolio first.', success: false });
        return false;
      }

      setUpdatingInvestment({ loading: true, error: null, success: false });
      const { error: updateError } = await updateInvestmentRecord(investmentId, {
        ...updates,
        portfolio_id: portfolioId
      });

      if (updateError) {
        setUpdatingInvestment({ loading: false, error: updateError.message, success: false });
        return false;
      }

      await refresh(portfolioId);
      setUpdatingInvestment({ loading: false, error: null, success: true });
      return true;
    },
    [refresh]
  );

  const deleteInvestment = useCallback(
    async (investmentId: string, portfolioIdOverride?: string) => {
      const portfolioId = portfolioIdOverride ?? selectedPortfolioIdRef.current;
      if (!portfolioId) {
        setDeletingInvestment({ loading: false, error: 'Select a portfolio first.', success: false });
        return false;
      }

      setDeletingInvestment({ loading: true, error: null, success: false });
      const { error: deleteError } = await deleteInvestmentRecord(investmentId, portfolioId);

      if (deleteError) {
        setDeletingInvestment({ loading: false, error: deleteError.message, success: false });
        return false;
      }

      await refresh(portfolioId);
      setDeletingInvestment({ loading: false, error: null, success: true });
      return true;
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

  const selectedPortfolio =
    selectedPortfolioId ? portfolios.find((portfolio) => portfolio.portfolio_id === selectedPortfolioId) ?? null : null;

  return {
    member,
    portfolios,
    selectedPortfolio,
    selectedPortfolioId,
    investments,
    loading,
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
  };
}
