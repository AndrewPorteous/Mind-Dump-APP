import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/useHaptic';

interface TouchCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  haptic?: boolean;
}

export function TouchCard({ 
  children, 
  onClick, 
  className,
  disabled = false,
  haptic = true
}: TouchCardProps) {
  const { impact } = useHaptic();

  const handleClick = () => {
    if (disabled) return;
    if (haptic) impact('light');
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'w-full text-left bg-card rounded-2xl p-4',
        'border border-border/20',
        'transition-all duration-150',
        'active:scale-[0.97] active:bg-muted/30',
        'disabled:opacity-50 disabled:pointer-events-none',
        'focus:outline-none focus:ring-2 focus:ring-primary/20',
        className
      )}
      style={{ boxShadow: 'var(--zen-shadow-card)' }}
    >
      {children}
    </button>
  );
}

interface TouchCardGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function TouchCardGroup({ children, className }: TouchCardGroupProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {children}
    </div>
  );
}
