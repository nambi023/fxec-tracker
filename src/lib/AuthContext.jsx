import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, ALLOWED_DOMAIN } from './supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [domainError, setDomainError] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      await handleSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      handleSession(sess);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSession(sess) {
    if (sess?.user?.email && !sess.user.email.endsWith(ALLOWED_DOMAIN)) {
      supabase.auth.signOut();
      setSession(null);
      setIsAdmin(false);
      setDomainError(true);
      return;
    }
    setDomainError(false);
    setSession(sess);

    if (sess?.user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', sess.user.id)
        .single();
      setIsAdmin(profile?.role === 'admin');
    } else {
      setIsAdmin(false);
    }
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { hd: ALLOWED_DOMAIN.replace('@', '') },
      },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{ session, loading, domainError, signInWithGoogle, signOut, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
