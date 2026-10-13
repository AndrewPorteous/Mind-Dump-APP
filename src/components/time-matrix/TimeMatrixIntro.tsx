import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { ArrowLeft, ArrowRight, Grid3X3, Clock, Target, Trash2, Play } from 'lucide-react';

export function TimeMatrixIntro() {
  const { setStep } = useApp();

  return (
    <div className="screen-container-scroll pb-4">
      {/* Header */}
      <div className="pt-6 pb-4 animate-fade-in">
        <button
          onClick={() => setStep('mind-dump-sort')}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Grid3X3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Time Management Matrix</h1>
            <p className="text-sm text-muted-foreground">The Eisenhower Method</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6 animate-slide-up">
        {/* Video placeholder */}
        <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border border-border">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Play className="w-8 h-8 text-primary ml-1" />
            </div>
            <p className="text-sm text-muted-foreground">Video explanation coming soon</p>
          </div>
        </div>

        {/* Concept explanation */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">What is it?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Eisenhower Matrix, named after President Dwight D. Eisenhower, is a powerful 
            tool for prioritizing tasks based on their <span className="font-medium text-foreground">urgency</span> and{' '}
            <span className="font-medium text-foreground">importance</span>.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            It helps you focus on what truly matters and avoid the trap of spending all your 
            time on urgent but unimportant tasks.
          </p>
        </div>

        {/* 4 Quadrants preview */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">The 4 Quadrants</h2>
          
          <div className="grid grid-cols-2 gap-2">
            {/* Q1 */}
            <div className="bg-card border-l-4 border-red-500 rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-red-500">1</span>
                <span className="text-sm font-medium text-foreground">Do it Now</span>
              </div>
              <p className="text-xs text-muted-foreground">Urgent + Important</p>
            </div>

            {/* Q2 */}
            <div className="bg-card border-l-4 border-emerald-500 rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-emerald-500">2</span>
                <span className="text-sm font-medium text-foreground">Schedule</span>
              </div>
              <p className="text-xs text-muted-foreground">Important, Not Urgent</p>
            </div>

            {/* Q3 */}
            <div className="bg-card border-l-4 border-amber-500 rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-amber-500">3</span>
                <span className="text-sm font-medium text-foreground">Delegate</span>
              </div>
              <p className="text-xs text-muted-foreground">Urgent, Not Important</p>
            </div>

            {/* Q4 */}
            <div className="bg-card border-l-4 border-gray-400 rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-gray-400">4</span>
                <span className="text-sm font-medium text-foreground">Eliminate</span>
              </div>
              <p className="text-xs text-muted-foreground">Not Urgent, Not Important</p>
            </div>
          </div>
        </div>

        {/* Key insight */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">The Secret</h3>
              <p className="text-sm text-muted-foreground">
                Most successful people spend the majority of their time in{' '}
                <span className="font-medium text-emerald-500">Quadrant 2</span> — 
                important but not urgent tasks. This is where growth, planning, and prevention happen.
              </p>
            </div>
          </div>
        </div>

        {/* Time rules */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Daily Time Rules</h2>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-foreground">Q2: Min. 2 hours/day</p>
                <p className="text-xs text-muted-foreground">Invest in what matters most</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Trash2 className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-foreground">Q3: Max. 45 min/day</p>
                <p className="text-xs text-muted-foreground">Limit interruptions and busywork</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="pt-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <ZenButton onClick={() => setStep('time-matrix')}>
          Start Prioritizing
          <ArrowRight className="w-4 h-4 ml-2" />
        </ZenButton>
      </div>
    </div>
  );
}
