import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { Logo } from '@/components/ui/Logo';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles } from 'lucide-react';

export function OnboardingCommitment() {
  const { setStep } = useApp();
  const [committed, setCommitted] = useState(false);

  return (
    <div className="screen-container justify-between">
      <div className="pt-8 space-y-4">
        <Logo size="sm" />
        <StepIndicator total={2} current={1} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8 animate-breathe">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-2xl font-semibold text-foreground mb-4">
          Ready for Clarity?
        </h1>

        <p className="text-muted-foreground leading-relaxed max-w-sm mb-10">
          This system works best when you give it your full attention.
          <br />
          <span className="text-sm opacity-75">No distractions, just you.</span>
        </p>

        <label className="flex items-start gap-3 p-4 bg-card rounded-lg shadow-zen cursor-pointer hover:shadow-zen-lg transition-shadow max-w-sm animate-slide-up">
          <Checkbox
            id="commitment"
            checked={committed}
            onCheckedChange={(checked) => setCommitted(checked === true)}
            className="mt-0.5"
          />
          <span className="text-left text-sm text-foreground leading-relaxed">
            I'm willing to spend a little time to gain a lot of clarity.
          </span>
        </label>
      </div>

      <div className="pb-8 space-y-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <ZenButton
          onClick={() => setStep('mind-dump')}
          disabled={!committed}
        >
          Start Mind Dump
        </ZenButton>
        <button
          onClick={() => setStep('onboarding-how')}
          className="zen-button-ghost w-full text-sm"
        >
          Back
        </button>
      </div>
    </div>
  );
}
