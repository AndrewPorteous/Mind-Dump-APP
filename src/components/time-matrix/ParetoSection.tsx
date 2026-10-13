import { Lightbulb } from 'lucide-react';

export function ParetoSection() {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-full">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-1">Pareto's Principle</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The 80/20 Rule should serve as a daily reminder to focus 80% of your time and energy 
            on the 20% of work that is really important. Don't just "work smart", work smart 
            on the right things.
          </p>
        </div>
      </div>
    </div>
  );
}
