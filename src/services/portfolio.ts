import { supabase } from '@/services/supabaseClient';
import { Investment, MemberProfile, PortfolioSummary } from '@/lib/types';

export async function getMemberProfileByEmail(email: string): Promise<MemberProfile | null> {
  const { data, error } = await supabase
    .from('members')
    .select('member_id, display_name, email')
    .eq('email', email)
    .single();

  if (error) throw error;
  if (!data) return null;
  return data as MemberProfile;
}

export async function getInvestmentsByMemberId(memberId: string): Promise<Investment[]> {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('member_id', memberId)
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
