import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft } from 'lucide-react';
import { SaversItemId } from '@/types/planning';

export function SaversSetup() {
  const { setStep, saversConfig, updateSaversConfig } = useApp();

  const totalMinutes = saversConfig
    .filter(item => item.enabled)
    .reduce((sum, item) => sum + item.durationMinutes, 0);

  return (
    <div className="screen-container-scroll">
      <div className="py-4">
        <button
          onClick={() => setStep('dashboard')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Dashboard</span>
        </button>
      </div>

      <div className="flex-1 py-6 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            SAVERS Routine
          </h1>
          <p className="text-muted-foreground">
            Design your ideal morning ritual
          </p>
          <p className="text-primary font-medium mt-2">
            Total: {totalMinutes} minutes
          </p>
        </div>

        <div className="space-y-4">
          {saversConfig.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-card rounded-lg shadow-zen space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={item.enabled}
                  onCheckedChange={(enabled) => 
                    updateSaversConfig(item.id, { enabled })
                  }
                />
              </div>

              {item.enabled && (
                <div className="flex items-center gap-4 pl-10">
                  <Slider
                    value={[item.durationMinutes]}
                    onValueChange={([v]) => 
                      updateSaversConfig(item.id, { durationMinutes: v })
                    }
                    min={5}
                    max={60}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-foreground w-12 text-right">
                    {item.durationMinutes}m
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pb-8 space-y-3">
        <ZenButton onClick={() => setStep('savers-daily')}>
          Start Today's SAVERS
        </ZenButton>
        <button
          onClick={() => setStep('dashboard')}
          className="zen-button-ghost w-full text-sm"
        >
          Save for Later
        </button>
      </div>
    </div>
  );
}
