import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { Logo } from '@/components/ui/Logo';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { Brain, Grid3X3, CheckCircle2 } from 'lucide-react';

export function OnboardingHow() {
  const { setStep } = useApp();

  const steps = [
    { icon: Brain, title: 'Mind Dump everything', description: 'Empty your mind in one place' },
    { icon: Grid3X3, title: 'Prioritize', description: 'Sort by urgency and importance' },
    { icon: CheckCircle2, title: 'Get clarity', description: 'See what matters most right now' },
  ];

  return (
    <div className="screen-container justify-between">
      <div className="pt-8 space-y-4">
        <Logo size="sm" />
        <StepIndicator total={2} current={0} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-8 animate-fade-in">
        <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
          How it works
        </h2>
        <p className="text-muted-foreground mb-10 text-center">
          3 simple steps to mental clarity
        </p>

        <div className="w-full space-y-5">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex items-center gap-4 p-4 bg-card rounded-lg shadow-zen animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pb-8 space-y-3 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <ZenButton onClick={() => setStep('onboarding-commitment')}>
          I'm Ready
        </ZenButton>
        <button
          onClick={() => setStep('onboarding-welcome')}
          className="zen-button-ghost w-full text-sm"
        >
          Back
        </button>
      </div>
    </div>
  );
}
