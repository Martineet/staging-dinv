'use client';

import { useCallback, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getClientProfileByEmail, getInvestmentsByClientId } from '@/services/portfolio';
import { ClientProfile, Investment } from '@/lib/types';

export function useInvestments(user: User | null) {
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.email) {
      setClient(null);
      setInvestments([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    try {
      const clientProfile = await getClientProfileByEmail(user.email);
      if (!clientProfile) {
        setError('Could not find your account. Contact the administrator.');
        setClient(null);
        setInvestments([]);
        setLoading(false);
        return;
      }

      const data = await getInvestmentsByClientId(clientProfile.client_id);
      setClient(clientProfile);
      setInvestments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading investments.');
      setClient(null);
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

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

  return { client, investments, loading, error, refresh };
}