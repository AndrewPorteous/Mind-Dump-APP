import { cn } from '@/lib/utils';

interface BadgeProps {
  className?: string;
}

/** Official round badge logo (public/alchemist-path-logo.webp). Used in every logo slot. */
export function AlchemistBadge({ className }: BadgeProps) {
  return (
    <img
      src="/alchemist-path-logo.webp"
      alt="The Alchemist Path — Seven-Step System for Financial Independence"
      className={cn('rounded-full object-cover shrink-0', className)}
      draggable={false}
    />
  );
}

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Badge plus wordmark, for page headers. */
export function Logo({ size = 'md', className }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-9 h-9', text: 'text-[11px]', gap: 'gap-2.5' },
    md: { icon: 'w-11 h-11', text: 'text-sm', gap: 'gap-3' },
    lg: { icon: 'w-14 h-14', text: 'text-lg', gap: 'gap-3' },
  };

  const s = sizes[size];

  return (
    <div className={cn('flex items-center', s.gap, className)}>
      <AlchemistBadge className={cn(s.icon, 'shadow-[0_0_12px_-2px_hsl(var(--primary)/0.5)]')} />
      <span className={cn(s.text, 'font-display font-semibold tracking-[0.22em] uppercase gold-text')}>
        The Alchemist Path
      </span>
    </div>
  );
}
