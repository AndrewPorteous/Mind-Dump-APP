import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type AccessReason = 'owner' | 'paid' | 'trial' | 'trial_expired' | 'none';

/** "48 hours left", "3 hours left", "45 minutes left". Rounds hours up; shows minutes in the last hour. Display only: the server enforces the exact 48h. */
export function trialTimeLeft(trialEndsAt: string | null): string {
  if (!trialEndsAt) return '';
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  if (ms <= 0) return 'ended';
  if (ms < 3600000) {
    const m = Math.max(1, Math.ceil(ms / 60000));
    return `${m} ${m === 1 ? 'minute' : 'minutes'} left`;
  }
  const h = Math.ceil(ms / 3600000);
  return `${h} ${h === 1 ? 'hour' : 'hours'} left`;
}

/**
 * Server-verified access. Calls app_access_status() (falls back to has_app_access()
 * on a backend that does not have the trial yet). The server decides: owner, paid,
 * 48-hour trial or expired. The client never decides access and never writes
 * entitlement or payment data.
 */
export function useAppAccess() {
  const { user, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [reason, setReason] = useState<AccessReason>('none');
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setHasAccess(false);
      setReason('none');
      setTrialEndsAt(null);
      setChecking(false);
      return;
    }
    setChecking(true);
    // has_app_access is added by the entitlements migration; regenerate
    // integrations/supabase/types.ts after it runs to drop this cast.
    const status = await (supabase as any).rpc('app_access_status');
    if (!status.error && status.data && typeof status.data.access === 'boolean') {
      setHasAccess(status.data.access === true);
      setReason((status.data.reason as AccessReason) ?? 'none');
      setTrialEndsAt(status.data.trial_ends_at ?? null);
    } else {
      const { data, error } = await (supabase as any).rpc('has_app_access');
      setHasAccess(!error && data === true);
      setReason(!error && data === true ? 'paid' : 'none');
      setTrialEndsAt(null);
    }
    setChecking(false);
  }, [user]);

  // Restore purchase: asks the server to re-verify with the payment system, then re-reads access.
  // The server takes the email from the signed-in session, never from the client.
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const restore = useCallback(async () => {
    setRestoring(true);
    setRestoreMessage(null);
    const { data, error } = await supabase.functions.invoke('sync-entitlement', { body: {} });
    await refresh();
    if (error || !data?.ok) setRestoreMessage('We could not check right now. Please try again in a minute.');
    else if (!data.access && data.definitive === false) setRestoreMessage('We could not fully verify your purchase yet. Please try again in a few minutes.');
    else if (!data.access) setRestoreMessage('No purchase found for this email yet. Use the same email you sign in with.');
    setRestoring(false);
  }, [refresh]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  // Automatic purchase check: for a signed-in user who is not owner/paid, ask the server to look for a
  // qualifying purchase on sign-in/load and whenever the tab becomes visible again (e.g. back from checkout).
  // The server rate-limits (60s) and takes the email from the session. Failures are silent: the trial keeps working.
  const [lastAuto, setLastAuto] = useState(0);
  const autoSync = useCallback(async () => {
    if (!user) return;
    if (Date.now() - lastAuto < 60000) return;
    setLastAuto(Date.now());
    try {
      const { data } = await supabase.functions.invoke('sync-entitlement', { body: {} });
      if (data?.ok && data.access) await refresh();
    } catch {
      /* ignore: trial or lock state is unchanged */
    }
  }, [user, lastAuto, refresh]);

  useEffect(() => {
    if (authLoading || checking || !user) return;
    if (reason === 'owner' || reason === 'paid') return;
    autoSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, checking, user?.id, reason]);

  useEffect(() => {
    if (!user || reason === 'owner' || reason === 'paid') return;
    const onVisible = () => { if (document.visibilityState === 'visible') autoSync(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [user, reason, autoSync]);

  return { hasAccess, reason, trialEndsAt, checking: authLoading || checking, refresh, restore, restoring, restoreMessage };
}
