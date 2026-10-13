import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle2, Circle, Sparkles, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SaversItemId } from '@/types/planning';

export function SaversDaily() {
  const { 
    setStep, 
    saversConfig, 
    toggleSaversItem, 
    getSaversProgress 
  } = useApp();

  const today = format(new Date(), 'yyyy-MM-dd');
  const completedItems = getSaversProgress(today);
  
  const enabledItems = useMemo(() => 
    saversConfig.filter(item => item.enabled),
    [saversConfig]
  );

  const progress = useMemo(() => 
    enabledItems.length > 0 
      ? Math.round((completedItems.length / enabledItems.length) * 100)
      : 0,
    [completedItems, enabledItems]
  );

  const totalMinutes = useMemo(() => 
    enabledItems.reduce((sum, item) => sum + item.durationMinutes, 0),
    [enabledItems]
  );

  const completedMinutes = useMemo(() => 
    enabledItems
      .filter(item => completedItems.includes(item.id))
      .reduce((sum, item) => sum + item.durationMinutes, 0),
    [enabledItems, completedItems]
  );

  const isComplete = completedItems.length === enabledItems.length;

  return (
    <div className="screen-container-scroll">
      <div className="py-4 flex items-center justify-between">
        <button
          onClick={() => setStep('dashboard')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Dashboard</span>
        </button>
        <button
          onClick={() => setStep('savers-setup')}
          className="p-2 text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 py-6 animate-fade-in">
        <div className="text-center mb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Morning SAVERS
          </h1>
          
          <div className="flex items-center justify-center gap-4 my-4">
            <Progress value={progress} className="w-32 h-2" />
            <span className="text-sm font-medium text-foreground">
              {progress}%
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {completedMinutes} / {totalMinutes} minutes
          </p>
        </div>

        {isComplete && (
          <div className="mb-6 p-4 bg-primary/10 rounded-lg flex items-center gap-3 animate-slide-up">
            <Sparkles className="w-6 h-6 text-primary" />
            <div>
              <p className="font-medium text-foreground">Amazing start!</p>
              <p className="text-sm text-muted-foreground">
                You've completed your morning ritual.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {enabledItems.map((item, idx) => {
            const isCompleted = completedItems.includes(item.id);
            
            return (
              <button
                key={item.id}
                onClick={() => toggleSaversItem(today, item.id)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-lg transition-all text-left',
                  'bg-card shadow-zen hover:shadow-zen-lg',
                  isCompleted && 'bg-primary/5 border-l-4 border-primary'
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground shrink-0" />
                )}
                
                <span className="text-2xl">{item.emoji}</span>
                
                <div className="flex-1">
                  <p className={cn(
                    'font-medium',
                    isCompleted ? 'text-primary' : 'text-foreground'
                  )}>
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.durationMinutes} minutes
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {enabledItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No SAVERS items configured yet.
            </p>
            <button
              onClick={() => setStep('savers-setup')}
              className="text-primary hover:underline"
            >
              Set up your routine
            </button>
          </div>
        )}
      </div>

      <div className="pb-8">
        {isComplete ? (
          <ZenButton onClick={() => setStep('planning-daily')}>
            Continue to Daily Plan
          </ZenButton>
        ) : (
          <ZenButton onClick={() => setStep('dashboard')} variant="secondary">
            Done for Now
          </ZenButton>
        )}
      </div>
    </div>
  );
}
