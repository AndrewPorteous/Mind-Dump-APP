import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Server-verified access. Calls the has_app_access() database function,
 * which reads app_entitlements for the signed-in user. The client never
 * decides access on its own and never writes entitlement or payment data.
 */
export function useAppAccess() {
  const { user, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setHasAccess(false);
      setChecking(false);
      return;
    }
    setChecking(true);
    // has_app_access is added by the entitlements migration; regenerate
    // integrations/supabase/types.ts after it runs to drop this cast.
    const { data, error } = await (supabase as any).rpc('has_app_access');
    setHasAccess(!error && data === true);
    setChecking(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  return { hasAccess, checking: authLoading || checking, refresh };
}
