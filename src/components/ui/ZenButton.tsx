import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/useHaptic';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ZenButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const ZenButton = forwardRef<HTMLButtonElement, ZenButtonProps>(
  ({ className, variant = 'primary', size = 'default', children, onClick, disabled, ...props }, ref) => {
    const { impact } = useHaptic();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        impact('light');
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        className={cn(
          variant === 'primary' && 'zen-button-primary',
          variant === 'secondary' && 'zen-button-secondary',
          variant === 'ghost' && 'zen-button-ghost',
          size === 'sm' && 'py-2 text-sm',
          size === 'lg' && 'py-5 text-lg',
          className
        )}
        onClick={handleClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ZenButton.displayName = 'ZenButton';
