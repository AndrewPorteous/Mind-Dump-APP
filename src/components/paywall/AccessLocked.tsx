import { ZenButton } from '@/components/ui/ZenButton';
import { AlchemistBadge } from '@/components/ui/Logo';
import { Lock } from 'lucide-react';
import { MIND_DUMP_CHECKOUT_URL } from '@/lib/checkout';

interface Props {
  onRecheck: () => void;
  onSignOut: () => void;
  restoring?: boolean;
  message?: string | null;
}

export function AccessLocked({ onRecheck, onSignOut, restoring, message }: Props) {
  return (
    <div className="screen-container-scroll">
      <div className="pt-12 pb-6 text-center">
        <AlchemistBadge className="w-20 h-20 mx-auto mb-4" />
        <Lock className="w-6 h-6 mx-auto mb-3 text-primary" />
        <h1 className="text-2xl font-semibold text-foreground mb-2">Access required</h1>
        <p className="text-muted-foreground max-w-xs mx-auto">
          This app unlocks after a verified purchase. Use the same email you sign in with when you buy.
        </p>
      </div>
      <div className="space-y-3 max-w-xs mx-auto">
        {MIND_DUMP_CHECKOUT_URL && (
          <ZenButton onClick={() => window.open(MIND_DUMP_CHECKOUT_URL, '_blank', 'noopener')}>
            Get access
          </ZenButton>
        )}
        <ZenButton variant="secondary" onClick={onRecheck} disabled={restoring}>
          {restoring ? 'Checking...' : 'I already purchased, restore access'}
        </ZenButton>
        {message && <p className="text-sm text-muted-foreground text-center" role="status">{message}</p>}
        <button className="w-full text-sm text-muted-foreground underline" onClick={onSignOut}>Sign out</button>
      </div>
    </div>
  );
}
