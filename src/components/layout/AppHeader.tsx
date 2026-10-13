import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/useHaptic';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  large?: boolean;
  className?: string;
}

export function AppHeader({ 
  title, 
  subtitle,
  showBack = false, 
  onBack, 
  rightAction,
  large = false,
  className 
}: AppHeaderProps) {
  const { impact } = useHaptic();

  const handleBack = () => {
    impact('light');
    onBack?.();
  };

  return (
    <header className={cn(
      "sticky top-0 z-40",
      "bg-background/80 backdrop-blur-xl backdrop-saturate-150",
      "border-b border-primary/20",
      className
    )}>
      <div className="pt-safe" />
      <div className={cn(
        "flex items-center justify-between px-4",
        large ? "h-14" : "h-12"
      )}>
        {showBack ? (
          <button 
            onClick={handleBack} 
            className="p-2 -ml-2 active:bg-muted/50 rounded-full transition-colors flex items-center gap-0.5"
          >
            <ChevronLeft className="w-6 h-6 text-primary" />
            <span className="text-sm text-primary font-medium">Back</span>
          </button>
        ) : (
          <div className="w-16" />
        )}
        
        <div className="flex flex-col items-center flex-1">
          <h1 className={cn(
            "font-semibold text-foreground truncate",
            large ? "text-lg" : "text-base"
          )}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        {rightAction || <div className="w-16" />}
      </div>
    </header>
  );
}
