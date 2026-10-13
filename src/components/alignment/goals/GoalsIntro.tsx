import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { ArrowLeft, Target } from 'lucide-react';

export function GoalsIntro() {
  const { setStep } = useApp();
  return (
    <div className="screen-container-scroll">
      <button onClick={() => setStep('wheel-chart')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-4">
        <ArrowLeft className="w-4 h-4" /><span className="text-sm">Back</span>
      </button>
      <div className="flex-1 flex flex-col justify-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <Target className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground text-center mb-4">Set Meaningful Goals</h1>
        <p className="text-muted-foreground text-center mb-4">Goals = Purpose + Wheel + Values</p>
        <p className="text-sm text-muted-foreground text-center mb-8">
          We'll help you create goals aligned with your purpose and focused on your growth areas.
        </p>
      </div>
      <div className="pb-8">
        <ZenButton onClick={() => setStep('goals-create')}>Create Goals</ZenButton>
      </div>
    </div>
  );
}
