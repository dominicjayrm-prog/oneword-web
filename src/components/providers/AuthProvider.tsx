'use client';

import { createContext, useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('fetchProfile error:', error.code, error.message);
    }
    if (data) {
      setProfile(data);
    } else {
      setProfile(null);
    }
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id);
  }

  useEffect(() => {
    let initialLoadDone = false;

    // Listen for auth changes first to avoid race with getUser
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        fetchProfile(sessionUser.id).then(() => {
          if (!initialLoadDone) {
            initialLoadDone = true;
            setLoading(false);
          }
        });
      } else {
        setProfile(null);
        if (!initialLoadDone) {
          initialLoadDone = true;
          setLoading(false);
        }
      }
    });

    // Fallback: getUser in case onAuthStateChange doesn't fire initially
    supabase.auth.getUser().then(async ({ data: { user: initialUser } }) => {
      if (!initialLoadDone) {
        setUser(initialUser);
        if (initialUser) await fetchProfile(initialUser.id);
        initialLoadDone = true;
        setLoading(false);
      }
    }).catch(() => {
      if (!initialLoadDone) {
        initialLoadDone = true;
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
