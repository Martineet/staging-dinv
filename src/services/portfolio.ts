import { supabase } from '@/services/supabaseClient';
import { ClientProfile, Investment, PortfolioSummary } from '@/lib/types';

export async function getClientProfileByEmail(email: string): Promise<ClientProfile | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('client_id, display_name, email')
    .eq('email', email)
    .single();

  if (error) throw error;
  if (!data) return null;
  return data as ClientProfile;
}

export async function getInvestmentsByClientId(clientId: string): Promise<Investment[]> {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('client_id', clientId)
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