import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { Check, Brain, Target, Calendar, TrendingUp } from 'lucide-react';
import { AlchemistBadge } from '@/components/ui/Logo';

export function Paywall() {
  const { setStep, setUser, user } = useApp();

  const features = [
    { icon: Target, text: 'Purpose, Values & Life Balance Wheel' },
    { icon: Brain, text: 'Goals aligned with what matters' },
    { icon: Calendar, text: 'Monthly · Weekly · Daily planning' },
    { icon: TrendingUp, text: 'SAVERS morning ritual' },
  ];

  const handleUnlock = async () => {
    // Placeholder for Stripe integration
    // For now, simulate successful payment
    setUser({ ...user, paymentStatus: 'paid' });
    setStep('dashboard');
  };

  const handleSkip = () => {
    setStep('dashboard');
  };

  return (
    <div className="screen-container-scroll">
      {/* Header */}
      <div className="pt-8 pb-6 text-center animate-fade-in">
        <AlchemistBadge className="w-20 h-20 mx-auto mb-4 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.6)]" />
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Self and Time Management
        </h1>
        <p className="text-muted-foreground">
          Unlock the full pack for lasting clarity
        </p>
      </div>

      {/* Features */}
      <div className="flex-1 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="bg-card rounded-lg shadow-zen p-6 mb-6">
          <h2 className="font-medium text-foreground mb-4">
            The Self and Time Management pack includes:
          </h2>
          <ul className="space-y-4">
            {features.map((feature) => (
              <li key={feature.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-4xl font-bold text-foreground">€4.44</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            One-time payment
          </p>
          <p className="text-xs text-muted-foreground">
            Lifetime access · No subscription
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Check className="w-4 h-4 text-primary" />
            Secure payment
          </span>
          <span className="flex items-center gap-1">
            <Check className="w-4 h-4 text-primary" />
            30-day refund
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="pb-8 space-y-3 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <ZenButton onClick={handleUnlock}>
          Unlock for €4.44
        </ZenButton>
        
        <button
          onClick={handleSkip}
          className="zen-button-ghost w-full text-sm"
        >
          Continue with free version
        </button>
      </div>
    </div>
  );
}
