import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { ArrowLeft, PieChart } from 'lucide-react';

export function WheelIntro() {
  const { setStep } = useApp();

  return (
    <div className="screen-container-scroll">
      <button onClick={() => setStep('values-rank')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-4">
        <ArrowLeft className="w-4 h-4" /><span className="text-sm">Back</span>
      </button>
      <div className="flex-1 flex flex-col justify-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <PieChart className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground text-center mb-4">The Wheel of Life</h1>
        <p className="text-muted-foreground text-center mb-8 leading-relaxed">
          Rate 8 key life areas to see where you're thriving and where you need focus.
        </p>
      </div>
      <div className="space-y-3 pb-8">
        <ZenButton onClick={() => setStep('wheel-scores')}>Take the Quick Test</ZenButton>
      </div>
    </div>
  );
}
