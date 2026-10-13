import { ReactNode } from 'react';
import { useApp } from '@/context/AppContext';
import { Lock, Sparkles } from 'lucide-react';
import { ZenButton } from '@/components/ui/ZenButton';

interface PremiumGateProps {
  children: ReactNode;
  feature: 'planning' | 'savers' | 'unlimited';
  preview?: boolean;
}

const FEATURE_NAMES: Record<string, string> = {
  planning: 'Planning System',
  savers: 'SAVERS Routine',
  unlimited: 'Unlimited Mind Dumps',
};

export function PremiumGate({ children, feature, preview = false }: PremiumGateProps) {
  const { user, setStep } = useApp();
  const isPaid = user?.paymentStatus === 'paid';

  if (isPaid) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Preview content (blurred) */}
      {preview && (
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="blur-sm opacity-50 pointer-events-none">
            {children}
          </div>
        </div>
      )}

      {/* Lock overlay */}
      <div className={`${preview ? 'absolute inset-0' : ''} flex flex-col items-center justify-center p-8 text-center ${preview ? 'bg-background/80 backdrop-blur-sm rounded-lg' : ''}`}>
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {FEATURE_NAMES[feature]} is part of the Self and Time Management pack
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          One-time €4.44 unlocks the full pack — lifetime access.
        </p>
        <ZenButton onClick={() => setStep('premium-overview')} className="max-w-xs">
          <Sparkles className="w-4 h-4 mr-2" />
          See what's included
        </ZenButton>
      </div>
    </div>
  );
}
