'use client';

import { useCallback, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getInvestmentsByMemberId, getMemberProfileByEmail } from '@/services/portfolio';
import { Investment, MemberProfile } from '@/lib/types';

export function useInvestments(user: User | null) {
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.email) {
      setMember(null);
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
        setInvestments([]);
        setLoading(false);
        return;
      }

      const data = await getInvestmentsByMemberId(memberProfile.member_id);
      setMember(memberProfile);
      setInvestments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading investments.');
      setMember(null);
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

  return { member, investments, loading, error, refresh };
}
