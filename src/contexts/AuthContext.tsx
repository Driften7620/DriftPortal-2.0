import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { demoUser } from '../features/auth/roleAccess';
import { supabase } from '../services/supabaseClient';
import type { AuthState, SignInInput, UserProfile } from '../types/auth';

interface AuthContextValue extends AuthState {
  signIn: (input: SignInInput) => Promise<void>;
  signInDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const demoStorageKey = 'driftportal-demo-user';

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isDemoMode: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const demoSession = localStorage.getItem(demoStorageKey);
      if (demoSession === '1') {
        if (isMounted) setState({ user: demoUser, isLoading: false, isDemoMode: true });
        return;
      }

      if (!supabase) {
        if (isMounted) setState({ user: null, isLoading: false, isDemoMode: false });
        return;
      }

      const { data } = await supabase.auth.getSession();
      const authUser = data.session?.user;

      if (!authUser) {
        if (isMounted) setState({ user: null, isLoading: false, isDemoMode: false });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id,email,full_name,role,module_access,is_active')
        .eq('id', authUser.id)
        .single();

      if (isMounted) {
        setState({
          user: profile
            ? mapProfile(profile)
            : {
                id: authUser.id,
                email: authUser.email ?? '',
                fullName: authUser.email ?? 'Bruger',
                role: 'operator',
                moduleAccess: [],
                isActive: true,
              },
          isLoading: false,
          isDemoMode: false,
        });
      }
    }

    loadSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async ({ email, password }: SignInInput) => {
    if (!supabase) {
      throw new Error('Supabase er ikke konfigureret endnu. Brug demo-login i Sprint 1.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const authUser = data.user;
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id,email,full_name,role,module_access,is_active')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      throw new Error('Brugerprofilen kunne ikke hentes. Kontakt en administrator.');
    }

    localStorage.removeItem(demoStorageKey);
    setState({
      user: mapProfile(profile),
      isLoading: false,
      isDemoMode: false,
    });
  }, []);

  const signInDemo = useCallback(() => {
    localStorage.setItem(demoStorageKey, '1');
    setState({ user: demoUser, isLoading: false, isDemoMode: true });
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(demoStorageKey);
    if (supabase) await supabase.auth.signOut();
    setState({ user: null, isLoading: false, isDemoMode: false });
  }, []);

  const value = useMemo(
    () => ({ ...state, signIn, signInDemo, signOut }),
    [state, signIn, signInDemo, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth skal bruges inde i AuthProvider');
  return context;
}

function mapProfile(profile: {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserProfile['role'];
  module_access: string[] | null;
  is_active: boolean | null;
}): UserProfile {
  return {
    id: profile.id,
    email: profile.email ?? '',
    fullName: profile.full_name ?? profile.email ?? 'Bruger',
    role: profile.role,
    moduleAccess: profile.module_access ?? [],
    isActive: profile.is_active ?? true,
  };
}
