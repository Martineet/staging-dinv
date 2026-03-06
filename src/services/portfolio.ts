import { supabase } from '@/services/supabaseClient';
import { Investment, MemberProfile, Portfolio, PortfolioSummary } from '@/lib/types';

export async function getMemberProfileByEmail(email: string): Promise<MemberProfile | null> {
  const { data, error } = await supabase
    .from('members')
    .select('member_id, display_name, email')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return data as MemberProfile;
}

export async function getPortfoliosByMemberId(memberId: string): Promise<Portfolio[]> {
  const { data, error } = await supabase
    .from('portfolios')
    .select('portfolio_id, member_id, name')
    .eq('member_id', memberId)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Portfolio[];
}

export async function getInvestmentsByPortfolioId(portfolioId: string): Promise<Investment[]> {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('date_swap', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Investment[];
}

export async function getPortfolioSummary(): Promise<PortfolioSummary | null> {
  const { data, error } = await supabase.rpc('get_portfolio_summary');

  if (error) throw error;
  if (!data) return null;
  return data as PortfolioSummary;
}
