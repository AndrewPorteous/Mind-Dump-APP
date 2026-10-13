import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { ArrowLeft } from 'lucide-react';

export function ClarityCheck() {
  const { setStep, getActiveItems, tasks } = useApp();

  const itemCount = getActiveItems().length;
  const taskCount = tasks.length;
  const q1 = tasks.filter(t => t.quadrant === 'Q1').length;
  const q2 = tasks.filter(t => t.quadrant === 'Q2').length;
  const q3 = tasks.filter(t => t.quadrant === 'Q3').length;
  const q4 = tasks.filter(t => t.quadrant === 'Q4').length;

  return (
    <div className="screen-container-scroll">
      <button
        onClick={() => setStep('time-matrix')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="flex-1 flex flex-col justify-center animate-fade-in">
        <h1 className="text-2xl font-semibold text-foreground text-center mb-8">
          Session summary
        </h1>


        {/* Summary */}
        <div className="space-y-3 mb-10">
          <div className="bg-card rounded-2xl p-4 border border-border/20" style={{ boxShadow: 'var(--zen-shadow-card)' }}>
            <p className="text-sm text-muted-foreground mb-2">Your session</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{itemCount}</p>
                <p className="text-xs text-muted-foreground">items dumped</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{taskCount}</p>
                <p className="text-xs text-muted-foreground">tasks prioritized</p>
              </div>
            </div>
          </div>

          {taskCount > 0 && (
            <div className="grid grid-cols-4 gap-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
              {[
                { label: 'Do Now', count: q1, color: 'bg-red-500/10 text-red-500' },
                { label: 'Schedule', count: q2, color: 'bg-blue-500/10 text-blue-500' },
                { label: 'Delegate', count: q3, color: 'bg-amber-500/10 text-amber-500' },
                { label: 'Eliminate', count: q4, color: 'bg-muted text-muted-foreground' },
              ].map(q => (
                <div key={q.label} className="bg-card rounded-xl p-2.5 text-center border border-border/20">
                  <p className={`text-lg font-bold ${q.color.split(' ')[1]}`}>{q.count}</p>
                  <p className="text-[10px] text-muted-foreground">{q.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="space-y-3 pb-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <ZenButton onClick={() => setStep('save-progress')}>
          Save My Progress
        </ZenButton>
        <button
          onClick={() => setStep('dashboard')}
          className="zen-button-ghost w-full text-sm"
        >
          Continue without saving
        </button>
      </div>
    </div>
  );
}
