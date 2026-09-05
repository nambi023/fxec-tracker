import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, ALLOWED_DOMAIN, ADMIN_EMAILS } from './supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [domainError, setDomainError] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      handleSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      handleSession(sess);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  function handleSession(sess) {
    if (sess?.user?.email && !sess.user.email.endsWith(ALLOWED_DOMAIN)) {
      // Wrong domain snuck through (e.g. personal Gmail) - reject client-side.
      // NOTE: this must ALSO be enforced server-side via a Supabase Auth Hook
      // (see supabase/schema.sql) so it can't be bypassed by disabling JS.
      supabase.auth.signOut();
      setSession(null);
      setDomainError(true);
      return;
    }
    setDomainError(false);
    setSession(sess);
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { hd: ALLOWED_DOMAIN.replace('@', '') }, // hints Google to only show college accounts
      },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const isAdmin = session?.user?.email
    ? ADMIN_EMAILS.includes(session.user.email)
    : false;

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
