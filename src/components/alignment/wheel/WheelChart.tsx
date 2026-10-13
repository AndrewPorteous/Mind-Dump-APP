import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { ArrowLeft } from 'lucide-react';
import { WHEEL_DOMAINS } from '@/data/wheel-domains';
import { WheelDiagram } from './WheelDiagram';

export function WheelChart() {
  const { setStep, wheelScores, getLowestWheelDomains } = useApp();

  const lowDomains = getLowestWheelDomains(3);
  const highDomains = getHighestWheelDomains(3);

  // Calculate average score
  const avgScore = Object.values(wheelScores).reduce((a, b) => a + b, 0) / 8;

  function getHighestWheelDomains(count: number) {
    return Object.entries(wheelScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([domain]) => domain);
  }

  return (
    <div className="screen-container-scroll">
      <button
        onClick={() => setStep('wheel-scores')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <h1 className="text-xl font-semibold text-foreground mb-2 text-center">
        Your Balance Wheel
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-4">
        Average score: <span className="font-semibold text-foreground">{avgScore.toFixed(1)}/10</span>
      </p>

      <div className="mb-6">
        <WheelDiagram scores={wheelScores} size={320} />
      </div>

      {highDomains.length > 0 && (
        <div className="bg-primary/10 rounded-lg p-4 mb-3">
          <p className="text-sm font-medium text-foreground mb-2">✨ Your strengths:</p>
          <div className="flex flex-wrap gap-2">
            {highDomains.map((d) => {
              const domain = WHEEL_DOMAINS.find((w) => w.id === d);
              return (
                domain && (
                  <span
                    key={d}
                    className="px-3 py-1 bg-primary/20 rounded-full text-xs font-medium"
                  >
                    {domain.emoji} {domain.label}
                  </span>
                )
              );
            })}
          </div>
        </div>
      )}

      {lowDomains.length > 0 && (
        <div className="bg-secondary/50 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-foreground mb-2">🎯 Areas to focus on:</p>
          <div className="flex flex-wrap gap-2">
            {lowDomains.map((d) => {
              const domain = WHEEL_DOMAINS.find((w) => w.id === d);
              return (
                domain && (
                  <span
                    key={d}
                    className="px-3 py-1 bg-accent rounded-full text-xs font-medium"
                  >
                    {domain.emoji} {domain.label}
                  </span>
                )
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-auto pb-8 space-y-3">
        <ZenButton onClick={() => setStep('goals-intro')}>
          Set Goals for These Areas
        </ZenButton>
        <button
          onClick={() => setStep('dashboard')}
          className="w-full text-sm text-muted-foreground hover:text-foreground py-2"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
