import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { AlchemistBadge } from '@/components/ui/Logo';
import { Brain, Grid3X3, CheckCircle2, ArrowRight, Home } from 'lucide-react';
import { METAL_STAGES } from '@/data/alchemy';
import { useWelcome } from '@/hooks/useWelcome';
import { AppStep } from '@/types';

interface OnboardingWelcomeProps {
  /** Opened from inside the app: offer a way back instead of sign-up. */
  returning?: boolean;
}

export function OnboardingWelcome({ returning = false }: OnboardingWelcomeProps) {
  const { setStep } = useApp();
  const { returnFromWelcome } = useWelcome();

  const features: { icon: typeof Brain; label: string; desc: string; step: AppStep }[] = [
    { icon: Brain, label: 'Mind Dump', desc: 'Empty your mind', step: 'mind-dump' },
    { icon: Grid3X3, label: 'Prioritize', desc: 'Sort what matters', step: 'time-matrix' },
    { icon: CheckCircle2, label: 'Act', desc: 'Move with clarity', step: 'planning-daily' },
  ];

  return (
    <div className="screen-center relative overflow-hidden">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10 pt-6">
        <div className="relative mb-5 animate-breathe">
          <div className="absolute inset-3 rounded-full blur-2xl bg-primary/30" />
          <AlchemistBadge className="relative w-52 h-52 shadow-[0_12px_40px_-10px_hsl(228_80%_3%/0.9)]" />
        </div>

        <p className="brand-eyebrow mb-2">Your daily ritual for</p>
        <h1 className="text-4xl font-semibold gold-text mb-3 leading-tight animate-fade-in">
          Mental Clarity
        </h1>
        <div className="gold-divider max-w-[200px] mb-4" />

        <p className="font-serif italic text-xl text-foreground/85 leading-snug max-w-xs mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          Transform yourself,
          <br />
          transform your world.
        </p>

        {/* Seven-step path */}
        <div className="flex items-end justify-center gap-1.5 mb-6" aria-label="Seven steps: Lead to Palladium">
          {METAL_STAGES.map((m, i) => (
            <div key={m.id} className="flex flex-col items-center gap-1" title={`${m.name} · ${m.meaning}`}>
              <div
                className="w-6 rounded-sm animate-slide-up"
                style={{
                  height: `${10 + i * 5}px`,
                  background: `linear-gradient(180deg, hsl(var(${m.colorVar})), hsl(var(${m.colorVar}) / 0.4))`,
                  animationDelay: `${150 + i * 60}ms`,
                }}
              />
              <span className="text-[8px] font-display tracking-wider text-muted-foreground">{m.name.slice(0, 2)}</span>
            </div>
          ))}
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm animate-slide-up" style={{ animationDelay: '200ms' }}>
          {features.map((f) => {
            const content = (
              <>
                <div className="metal-medallion w-10 h-10">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-display tracking-wider text-foreground">{f.label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{f.desc}</span>
              </>
            );
            return returning ? (
              <button
                key={f.label}
                onClick={() => setStep(f.step)}
                className="flex flex-col items-center gap-2 p-4 metal-plate transition-all hover:border-primary/60 active:scale-[0.97]"
              >
                {content}
              </button>
            ) : (
              <div key={f.label} className="flex flex-col items-center gap-2 p-4 metal-plate">
                {content}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTAs */}
      {returning ? (
        <div className="pb-6 pt-4 space-y-2 relative z-10 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <ZenButton onClick={returnFromWelcome} className="gap-2">
            Continue where I left off
            <ArrowRight className="w-4 h-4" />
          </ZenButton>

          <button
            onClick={() => setStep('dashboard')}
            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            <Home className="w-4 h-4" /> Go to Home
          </button>
        </div>
      ) : (
        <div className="pb-6 pt-4 space-y-2 relative z-10 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <ZenButton onClick={() => setStep('onboarding-how')}>
            Begin the Path
          </ZenButton>

          <button
            onClick={() => setStep('save-progress')}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Already have an account? <span className="text-primary font-medium">Sign in</span>
          </button>

          <p className="text-center text-xs text-muted-foreground/70">
            ~20 min first setup · free forever
          </p>
        </div>
      )}
    </div>
  );
}
