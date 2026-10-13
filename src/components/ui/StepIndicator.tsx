import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  total: number;
  current: number;
  className?: string;
}

export function StepIndicator({ total, current, className }: StepIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'step-indicator transition-all duration-300',
            index === current && 'step-indicator-active'
          )}
        />
      ))}
    </div>
  );
}
