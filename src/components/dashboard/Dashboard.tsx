import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { MiniWheel } from './MiniWheel';
import { 
  Brain, 
  Grid3X3, 
  Settings,
  Compass,
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Sun, 
  Target,
  TrendingUp,
  ChevronRight,
  Loader2,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useHaptic } from '@/hooks/useHaptic';
import { useState, useCallback, useRef, useEffect } from 'react';
import { AlchemistBadge } from '@/components/ui/Logo';
import { useWelcome } from '@/hooks/useWelcome';

export function Dashboard() {
  const { 
    setStep, 
    user, 
    tasks, 
    getActiveItems, 
    purposeStatement,
    saversConfig,
    getSaversProgress,
    getDailyPlan,
    goals,
    wheelScores
  } = useApp();
  const { impact } = useHaptic();
  const { openWelcome } = useWelcome();

  // Pull to refresh
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const activeItems = getActiveItems();
  const isPaid = user?.paymentStatus === 'paid';
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysSaversProgress = getSaversProgress(today);
  const enabledSavers = saversConfig.filter(s => s.enabled).length;
  const saversPercent = enabledSavers > 0 
    ? Math.round((todaysSaversProgress.length / enabledSavers) * 100) 
    : 0;
  
  const todaysPlan = getDailyPlan(today);
  const completedTasks = todaysPlan?.tasks.filter(t => t.completed).length || 0;
  const totalTasks = todaysPlan?.tasks.length || 0;
  const q2Tasks = tasks.filter(t => t.quadrant === 'Q2').length;
  const hasWheelScores = Object.values(wheelScores).some(s => s > 1);

  const handleRefresh = useCallback(async () => {
    impact('medium');
    setRefreshing(true);
    // Simulate refresh - cloud sync will happen naturally
    await new Promise(r => setTimeout(r, 800));
    setRefreshing(false);
  }, [impact]);

  const navigateTo = useCallback((step: Parameters<typeof setStep>[0]) => {
    impact('light');
    setStep(step);
  }, [setStep, impact]);

  return (
    <div className="screen-container-scroll pb-4">
      {/* Pull indicator */}
      {refreshing && (
        <div className="flex items-center justify-center py-3 animate-fade-in">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}

      {/* Learn System bar */}
      <button
        onClick={() => navigateTo('learn-system')}
        className="mt-4 mb-3 w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-primary/8 border border-primary/15 active:scale-[0.98] transition-all"
      >
        <GraduationCap className="w-4 h-4 text-primary shrink-0" />
        <span className="text-sm font-medium text-foreground flex-1 text-left">Learn the System</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
      </button>

      {/* Header */}
      <div className="pb-3 animate-fade-in">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => { impact('light'); openWelcome(); }}
            className="shrink-0 rounded-full active:scale-95 transition-transform shadow-[0_0_14px_-2px_hsl(var(--primary)/0.5)]"
            aria-label="Open the welcome page"
            title="Welcome page"
          >
            <AlchemistBadge className="w-12 h-12" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground">
              Hey, {user?.firstName || 'there'} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isPaid ? '✨ Premium' : 'Free plan'}
            </p>
          </div>
          <button
            onClick={() => navigateTo('settings')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-muted/50 active:scale-95 transition-transform"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        {purposeStatement && (
          <div className="mt-3 p-3.5 bg-primary/8 rounded-2xl border border-primary/15">
            <p className="text-sm text-foreground italic leading-relaxed line-clamp-2">
              "{purposeStatement}"
            </p>
          </div>
        )}
      </div>

      {/* Today's Focus */}
      <div className="mb-5 animate-slide-up">
        <h2 className="native-section-header">Today's Focus</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {/* SAVERS */}
          <button
            onClick={() => navigateTo(enabledSavers > 0 ? 'savers-daily' : 'savers-setup')}
            className="bg-card rounded-2xl p-3.5 text-left active:scale-[0.97] transition-all border border-border/20"
            style={{ boxShadow: 'var(--zen-shadow-card)' }}
          >
            <Sun className="w-5 h-5 text-amber-500 mb-2" />
            <p className="font-semibold text-foreground text-xs">SAVERS</p>
            <p className="text-lg font-bold text-primary mt-0.5">
              {enabledSavers > 0 ? `${saversPercent}%` : 'Setup'}
            </p>
          </button>

          {/* Tasks */}
          <button
            onClick={() => navigateTo('planning-daily')}
            className="bg-card rounded-2xl p-3.5 text-left active:scale-[0.97] transition-all border border-border/20"
            style={{ boxShadow: 'var(--zen-shadow-card)' }}
          >
            <Target className="w-5 h-5 text-primary mb-2" />
            <p className="font-semibold text-foreground text-xs">Tasks</p>
            <p className="text-lg font-bold text-primary mt-0.5">
              {totalTasks > 0 ? `${completedTasks}/${totalTasks}` : '—'}
            </p>
          </button>

          {/* Wheel */}
          <button
            onClick={() => navigateTo(hasWheelScores ? 'wheel-chart' : 'wheel-intro')}
            className="bg-card rounded-2xl p-2 flex items-center justify-center active:scale-[0.97] transition-all border border-border/20"
            style={{ boxShadow: 'var(--zen-shadow-card)' }}
          >
            <MiniWheel scores={wheelScores} size={68} />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-5 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <div className="bg-card rounded-2xl p-3 text-center border border-border/20" style={{ boxShadow: 'var(--zen-shadow-card)' }}>
          <p className="text-2xl font-bold text-foreground">{activeItems.length}</p>
          <p className="text-[11px] text-muted-foreground">Items</p>
        </div>
        <div className="bg-card rounded-2xl p-3 text-center border border-border/20" style={{ boxShadow: 'var(--zen-shadow-card)' }}>
          <p className="text-2xl font-bold text-foreground">{goals.length}</p>
          <p className="text-[11px] text-muted-foreground">Goals</p>
        </div>
        <div className="bg-card rounded-2xl p-3 text-center border border-border/20" style={{ boxShadow: 'var(--zen-shadow-card)' }}>
          <p className="text-2xl font-bold text-primary">{q2Tasks}</p>
          <p className="text-[11px] text-muted-foreground">Q2 Tasks</p>
        </div>
      </div>

      {/* Go Deeper CTA */}
      {!purposeStatement && (
        <div className="mb-5 animate-slide-up" style={{ animationDelay: '75ms' }}>
          <button
            onClick={() => navigateTo('purpose-intro')}
            className="w-full flex items-center gap-4 bg-card rounded-2xl p-4 border border-primary/20 text-left active:scale-[0.97] transition-all"
            style={{ boxShadow: 'var(--zen-shadow-card)' }}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">Want to go further?</p>
              <p className="text-xs text-muted-foreground">Define your life purpose and align your goals.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/40 shrink-0" />
          </button>
        </div>
      )}

      {/* Modules */}
      <div className="flex-1 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h2 className="native-section-header">Modules</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <ModuleCard icon={Brain} title="Mind Dump" subtitle="Clear your inbox" color="text-violet-500" bgColor="bg-violet-500/10"
            onClick={() => navigateTo('mind-dump')} badge={activeItems.length > 0 ? `${activeItems.length}` : undefined} />
          <ModuleCard icon={Grid3X3} title="Time Matrix" subtitle="Prioritize tasks" color="text-blue-500" bgColor="bg-blue-500/10"
            onClick={() => navigateTo('time-matrix')} badge={tasks.length > 0 ? `${tasks.length}` : undefined} />
          <ModuleCard icon={Sparkles} title="Purpose" subtitle="Define your why" color="text-pink-500" bgColor="bg-pink-500/10"
            onClick={() => navigateTo('purpose-intro')} completed={!!purposeStatement} />
          <ModuleCard icon={TrendingUp} title="Life Wheel" subtitle="Balance areas" color="text-teal-500" bgColor="bg-teal-500/10"
            onClick={() => navigateTo(hasWheelScores ? 'wheel-chart' : 'wheel-scores')} completed={hasWheelScores} />
          <ModuleCard icon={Target} title="Goals" subtitle="Set objectives" color="text-orange-500" bgColor="bg-orange-500/10"
            onClick={() => navigateTo('goals-create')} badge={goals.length > 0 ? `${goals.length}` : undefined} />
          <ModuleCard icon={Calendar} title="Planning" subtitle="Month & Week" color="text-primary" bgColor="bg-primary/10"
            onClick={() => navigateTo('planning-monthly')} />
        </div>
      </div>

      {/* Upgrade CTA */}
      {!isPaid && (
        <div className="pt-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <button
            onClick={() => navigateTo('premium-overview')}
            className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold active:scale-[0.97] transition-all flex items-center justify-center gap-2"
            style={{ boxShadow: '0 4px 16px -4px hsl(35 80% 50% / 0.4)' }}
          >
            <Sparkles className="w-5 h-5" />
            Unlock Premium · €4.44
          </button>
        </div>
      )}
    </div>
  );
}

interface ModuleCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  onClick: () => void;
  badge?: string;
  completed?: boolean;
}

function ModuleCard({ icon: Icon, title, subtitle, color, bgColor, onClick, badge, completed }: ModuleCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative bg-card rounded-2xl p-4 flex flex-col items-start gap-2 text-left border border-border/20 active:scale-[0.97] transition-all"
      style={{ boxShadow: 'var(--zen-shadow-card)' }}
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bgColor)}>
        <Icon className={cn('w-5 h-5', color)} />
      </div>
      <div>
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
      
      {badge && (
        <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
      
      {completed && (
        <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-primary" />
      )}

      <ChevronRight className="absolute bottom-4 right-3 w-4 h-4 text-muted-foreground/40" />
    </button>
  );
}
