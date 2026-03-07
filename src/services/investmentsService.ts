import type { PostgrestError } from '@supabase/supabase-js';
import { Investment, InvestmentFormInput, Portfolio } from '@/lib/types';
import { supabase } from '@/services/supabaseClient';

type ServiceResult<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

type PortfolioInsert = {
  member_id: string;
  name: string;
};

type InvestmentInsert = {
  portfolio_id: string;
  type: string;
  btc_amount: number;
  purchase_price: number;
  eur_amount: number;
  date_swap: string;
  notes: string | null;
  commission: number;
  guaranteed: boolean;
};

function normalizePortfolioName(name: string): string {
  return name.trim();
}

function toInvestmentInsert(payload: InvestmentFormInput): InvestmentInsert {
  return {
    portfolio_id: payload.portfolio_id,
    type: payload.asset.trim(),
    btc_amount: payload.amount,
    purchase_price: payload.price,
    eur_amount: payload.amount * payload.price,
    date_swap: payload.date,
    notes: null,
    commission: 0,
    guaranteed: false
  };
}

export async function createPortfolio(name: string, memberId: string): Promise<ServiceResult<Portfolio>> {
  const portfolio: PortfolioInsert = {
    member_id: memberId,
    name: normalizePortfolioName(name)
  };

  const { data, error } = await supabase
    .from('portfolios')
    .insert(portfolio)
    .select('portfolio_id, member_id, name')
    .single();

  return {
    data: (data as Portfolio | null) ?? null,
    error
  };
}

export async function renamePortfolio(portfolioId: string, newName: string): Promise<ServiceResult<Portfolio>> {
  const { data, error } = await supabase
    .from('portfolios')
    .update({ name: normalizePortfolioName(newName) })
    .eq('portfolio_id', portfolioId)
    .select('portfolio_id, member_id, name')
    .single();

  return {
    data: (data as Portfolio | null) ?? null,
    error
  };
}

export async function deletePortfolio(portfolioId: string): Promise<ServiceResult<true>> {
  const { error } = await supabase.from('portfolios').delete().eq('portfolio_id', portfolioId);
  return { data: error ? null : true, error };
}

export async function createInvestment(
  investmentData: InvestmentFormInput
): Promise<ServiceResult<Investment>> {
  const payload = toInvestmentInsert(investmentData);

  const { data, error } = await supabase
    .from('investments')
    .insert(payload)
    .select('*')
    .single();

  return {
    data: (data as Investment | null) ?? null,
    error
  };
}

export async function updateInvestment(
  investmentId: string,
  updates: InvestmentFormInput
): Promise<ServiceResult<Investment>> {
  const payload = toInvestmentInsert(updates);

  const { data, error } = await supabase
    .from('investments')
    .update(payload)
    .eq('id', investmentId)
    .eq('portfolio_id', updates.portfolio_id)
    .select('*')
    .single();

  return {
    data: (data as Investment | null) ?? null,
    error
  };
}

export async function deleteInvestment(
  investmentId: string,
  portfolioId: string
): Promise<ServiceResult<true>> {
  const { error } = await supabase
    .from('investments')
    .delete()
    .eq('id', investmentId)
    .eq('portfolio_id', portfolioId);

  return { data: error ? null : true, error };
}
