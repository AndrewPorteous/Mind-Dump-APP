import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeWarningsProps {
  q2Time: number;
  q3Time: number;
}

export function TimeWarnings({ q2Time, q3Time }: TimeWarningsProps) {
  const warnings: { message: string; type: 'warning' | 'error' }[] = [];

  // Q2 should have at least 2 hours (120 min)
  if (q2Time < 120) {
    warnings.push({
      message: `Q2 has only ${q2Time}m planned. Try to plan at least 2 hours for important tasks.`,
      type: 'warning',
    });
  }

  // Q3 should be max 45 min
  if (q3Time > 45) {
    warnings.push({
      message: `Q3 has ${q3Time}m planned. Try to limit to 30-45 minutes max.`,
      type: 'error',
    });
  }

  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {warnings.map((warning, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
            warning.type === 'error' 
              ? 'bg-destructive/10 text-destructive' 
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          )}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{warning.message}</span>
        </div>
      ))}
    </div>
  );
}
