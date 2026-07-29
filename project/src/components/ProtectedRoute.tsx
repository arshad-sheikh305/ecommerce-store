import { useState, useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FullPageSpinner } from '@/components/ui';
import { supabase } from '@/lib/supabase';

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const [serverVerified, setServerVerified] = useState(!requireAdmin);
  const [verifying, setVerifying] = useState(false);

  // For admin routes, double-check the role against the server.
  // The frontend role check is a fast first gate, but the server is the
  // source of truth — RLS policies enforce it regardless, but this prevents
  // a non-admin from even seeing the admin UI flash before RLS blocks data.
  useEffect(() => {
    if (!requireAdmin || !user || !isAdmin) {
      setServerVerified(!requireAdmin);
      return;
    }

    let cancelled = false;
    setVerifying(true);

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) {
          if (!cancelled) setServerVerified(false);
          return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-auth`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'verify' }),
          }
        );

        if (!cancelled) {
          setServerVerified(res.ok);
        }
      } catch {
        if (!cancelled) setServerVerified(false);
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [requireAdmin, user, isAdmin]);

  if (loading || (requireAdmin && verifying)) {
    return <FullPageSpinner message="Verifying access..." />;
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  // Admin route but user is not an admin (client-side check) or server
  // verification failed — redirect to 403 Access Denied page.
  if (requireAdmin && (!isAdmin || !serverVerified)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}
