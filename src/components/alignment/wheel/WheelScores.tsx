import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WHEEL_DOMAINS } from '@/data/wheel-domains';
import { WheelDomain } from '@/types/alignment';

export function WheelScores() {
  const { setStep, wheelScores, setWheelScore } = useApp();
  const [index, setIndex] = useState(0);
  const domain = WHEEL_DOMAINS[index];
  const total = WHEEL_DOMAINS.length;

  const handlePick = useCallback(
    (n: number) => {
      setWheelScore(domain.id as WheelDomain, n);
      setTimeout(() => {
        if (index < total - 1) {
          setIndex((i) => i + 1);
        } else {
          setStep('wheel-chart');
        }
      }, 160);
    },
    [domain.id, index, total, setWheelScore, setStep]
  );

  const goBack = () => {
    if (index === 0) setStep('dashboard');
    else setIndex((i) => i - 1);
  };

  // Keyboard support: 1-9 and 0 = 10
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '9') handlePick(parseInt(e.key, 10));
      else if (e.key === '0') handlePick(10);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlePick]);

  const current = wheelScores[domain.id];

  return (
    <div className="screen-container-scroll">
      <button
        onClick={goBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {index + 1} / {total}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center animate-fade-in" key={domain.id}>
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{domain.emoji}</div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">{domain.label}</h1>
          <p className="text-sm text-muted-foreground">{domain.description}</p>
        </div>

        <p className="text-center text-xs text-muted-foreground uppercase tracking-wide mb-4">
          1 = Needs work · 10 = Thriving
        </p>

        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => handlePick(n)}
              className={cn(
                'aspect-square rounded-xl text-lg font-semibold border-2 transition-all active:scale-95',
                current === n
                  ? 'bg-primary text-primary-foreground border-primary shadow-zen-lg'
                  : 'bg-card text-foreground border-border/40 hover:border-primary/40'
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
