'use client';

import { useCallback, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabaseClient';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  }, []);

  const signOut = useCallback(async () => {
    return supabase.auth.signOut();
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user as User | null;

    if (!user?.email) {
      throw new Error('No active session. Please log in again.');
    }

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });

    if (reauthError) throw reauthError;

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;

    sessionStorage.setItem('pw_changed', '1');
    await supabase.auth.signOut();
  }, []);

  return {
    session,
    user: session?.user ?? null,
    loading,
    signIn,
    signOut,
    changePassword
  };
}