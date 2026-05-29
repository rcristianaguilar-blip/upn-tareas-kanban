import { useCallback, useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import PublicBoard from './pages/PublicBoard.jsx';
import { fetchAdminRecord, isSupabaseConfigured, supabase } from './lib/supabase.js';

function getHashRoute() {
  return window.location.hash.replace(/^#/, '') || '/';
}

function navigate(route) {
  window.location.hash = route;
}

export default function App() {
  const [route, setRoute] = useState(getHashRoute);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const onHashChange = () => setRoute(getHashRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return undefined;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function validateAdmin() {
      if (!session?.user) {
        setIsAdmin(false);
        setAuthLoading(false);
        setAuthError('');
        return;
      }

      setAuthLoading(true);
      setAuthError('');

      try {
        const adminRecord = await fetchAdminRecord(session.user);
        if (isMounted) {
          setIsAdmin(Boolean(adminRecord));
        }
      } catch (error) {
        if (isMounted) {
          setIsAdmin(false);
          setAuthError(error.message || 'No se pudo validar el usuario administrador.');
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    }

    validateAdmin();

    return () => {
      isMounted = false;
    };
  }, [session]);

  const handleOpenLogin = useCallback(() => navigate('/login'), []);

  const handleBackToBoard = useCallback(() => navigate('/'), []);

  const handleSignOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setIsAdmin(false);
    navigate('/');
  }, []);

  if (route === '/login' && !isAdmin) {
    return (
      <LoginPage
        onBack={handleBackToBoard}
        onSuccess={handleBackToBoard}
        authError={authError}
      />
    );
  }

  return (
    <PublicBoard
      session={session}
      isAdmin={isAdmin}
      authLoading={authLoading}
      authError={authError}
      onOpenLogin={handleOpenLogin}
      onSignOut={handleSignOut}
    />
  );
}
