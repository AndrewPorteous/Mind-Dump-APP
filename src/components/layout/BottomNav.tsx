import { useApp } from '@/context/AppContext';
import { Brain, Grid3X3, Target, Home, MoreHorizontal, Sparkles, Calendar, Sun, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppStep } from '@/types';
import { useHaptic } from '@/hooks/useHaptic';
import { useState } from 'react';
import { AlchemistBadge } from '@/components/ui/Logo';
import { useWelcome } from '@/hooks/useWelcome';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  step: AppStep;
}

const mainNavItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, step: 'dashboard' },
  { id: 'dump', label: 'Mind Dump', icon: Brain, step: 'mind-dump' },
  { id: 'matrix', label: 'Matrix', icon: Grid3X3, step: 'time-matrix' },
  { id: 'goals', label: 'Goals', icon: Target, step: 'goals-intro' },
];

const moreNavItems: NavItem[] = [
  { id: 'purpose', label: 'Purpose & Values', icon: Sparkles, step: 'purpose-intro' },
  { id: 'wheel', label: 'Life Wheel', icon: TrendingUp, step: 'wheel-intro' },
  { id: 'monthly', label: 'Monthly Planning', icon: Calendar, step: 'planning-monthly' },
  { id: 'weekly', label: 'Weekly Planning', icon: Calendar, step: 'planning-weekly' },
  { id: 'daily', label: 'Daily Planning', icon: Calendar, step: 'planning-daily' },
  { id: 'savers', label: 'SAVERS Routine', icon: Sun, step: 'savers-setup' },
];

const NAV_VISIBLE_STEPS: AppStep[] = [
  'dashboard', 'mind-dump', 'mind-dump-sort', 'time-matrix-intro', 'time-matrix',
  'purpose-intro', 'purpose-questions', 'purpose-summary',
  'values-select', 'values-narrow', 'values-rank',
  'wheel-intro', 'wheel-scores', 'wheel-chart',
  'goals-intro', 'goals-create', 'goals-summary',
  'planning-monthly', 'planning-weekly', 'planning-daily',
  'savers-setup', 'savers-daily', 'settings', 'learn-system',
];

export function BottomNav() {
  const { currentStep, setStep } = useApp();
  const { impact } = useHaptic();
  const [showMore, setShowMore] = useState(false);
  const { openWelcome } = useWelcome();

  if (!NAV_VISIBLE_STEPS.includes(currentStep)) return null;

  const isActive = (step: AppStep) => currentStep === step;

  const handleNavPress = (step: AppStep) => {
    impact('light');
    setStep(step);
  };

  const handleMorePress = (step: AppStep) => {
    impact('light');
    setStep(step);
    setShowMore(false);
  };

  // Determine active tab for the indicator
  const getActiveIndex = () => {
    const idx = mainNavItems.findIndex(item => isActive(item.step));
    return idx >= 0 ? idx : -1;
  };

  const activeIndex = getActiveIndex();

  return (
    <>
      {/* More Sheet */}
      {showMore && (
        <>
          <div 
            className="bottom-sheet-overlay"
            onClick={() => setShowMore(false)} 
          />
          <div className="bottom-sheet">
            <div className="bottom-sheet-handle" />
            <div className="px-4 pt-2 pb-2">
              <h3 className="text-base font-semibold text-foreground mb-1">More</h3>
            </div>
            <div className="px-2 pb-safe">
              {/* Title page, reachable from anywhere */}
              <button
                onClick={() => { impact('light'); setShowMore(false); openWelcome(); }}
                className="w-full flex items-center gap-4 px-4 py-3 mb-1 rounded-xl border border-primary/25 bg-primary/5 hover:bg-primary/10 active:bg-primary/15 transition-colors"
              >
                <AlchemistBadge className="w-10 h-10" />
                <span className="flex-1 text-left">
                  <span className="block text-base text-foreground font-medium">Welcome page</span>
                  <span className="block text-xs text-muted-foreground">The Alchemist Path title page</span>
                </span>
              </button>
              {moreNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMorePress(item.step)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl active:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <span className="text-base text-foreground font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-background/85 backdrop-blur-xl backdrop-saturate-150 border-t border-primary/25">
          <div className="max-w-lg mx-auto px-2 pb-safe">
            <div className="flex items-center justify-around h-16 relative">
              {mainNavItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.step);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavPress(item.step)}
                    className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 transition-all active:scale-90"
                  >
                    <div className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200",
                      active && "bg-primary/12"
                    )}>
                      <Icon className={cn(
                        'w-[22px] h-[22px] transition-all duration-200',
                        active ? 'text-primary' : 'text-muted-foreground'
                      )} />
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium transition-colors duration-200",
                      active ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
              
              {/* More tab */}
              <button
                onClick={() => { impact('light'); setShowMore(true); }}
                className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 transition-all active:scale-90"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <MoreHorizontal className="w-[22px] h-[22px] text-muted-foreground" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">More</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
