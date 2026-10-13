import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import {
  ArrowLeft,
  Sparkles,
  Brain,
  Grid3x3,
  Target,
  Heart,
  Compass,
  PieChart,
  Calendar,
  Sunrise,
  Database,
} from 'lucide-react';
import { AlchemistBadge } from '@/components/ui/Logo';

interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
}

interface FeatureGroup {
  title: string;
  items: FeatureItem[];
}

const FREE_FEATURES: FeatureItem[] = [
  { icon: Brain, label: 'Mind Dump', desc: 'Clear your head, anytime.' },
  { icon: Grid3x3, label: 'Time Matrix', desc: 'Sort what truly matters.' },
];

const PREMIUM_GROUPS: FeatureGroup[] = [
  {
    title: 'Self management',
    items: [
      { icon: Compass, label: 'Purpose', desc: 'Craft your mission statement.' },
      { icon: Heart, label: 'Values', desc: 'Identify your top 5 values.' },
      { icon: PieChart, label: 'Life Balance Wheel', desc: 'See where you stand.' },
      { icon: Target, label: 'Goals', desc: 'Aligned with purpose & values.' },
    ],
  },
  {
    title: 'Time management',
    items: [
      { icon: Calendar, label: 'Monthly · Weekly · Daily planning', desc: 'Plan from year to today.' },
      { icon: Sunrise, label: 'SAVERS ritual', desc: 'A grounded morning routine.' },
    ],
  },
  {
    title: 'History & sync',
    items: [
      { icon: Database, label: 'Saved sessions & cross-device sync', desc: 'Pick up where you left off.' },
    ],
  },
];

export function PremiumOverview() {
  const { setStep } = useApp();

  return (
    <div className="screen-container-scroll">
      <button
        onClick={() => setStep('dashboard')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Dashboard</span>
      </button>

      {/* Hero */}
      <div className="text-center pb-6 animate-fade-in">
        <AlchemistBadge className="w-20 h-20 mx-auto mb-4 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.6)]" />
        <h1 className="text-2xl font-semibold text-foreground mb-1">
          Self and Time Management
        </h1>
        <p className="text-sm text-muted-foreground">
          The full pack — one-time €4.44, lifetime access.
        </p>
      </div>

      {/* Free section */}
      <section className="pb-5 animate-slide-up">
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
          Always free
        </p>
        <div className="bg-card rounded-2xl shadow-zen p-4 space-y-3">
          {FREE_FEATURES.map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <f.icon className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Premium */}
      <section className="pb-5 animate-slide-up" style={{ animationDelay: '80ms' }}>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
          You unlock
        </p>
        <div className="space-y-3">
          {PREMIUM_GROUPS.map((group) => (
            <div
              key={group.title}
              className="bg-card rounded-2xl shadow-zen p-4"
            >
              <p className="text-sm font-semibold text-foreground mb-3">
                {group.title}
              </p>
              <div className="space-y-3">
                {group.items.map((f) => (
                  <div key={f.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <f.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Price card */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-center mb-6 animate-slide-up" style={{ animationDelay: '160ms' }}>
        <div className="text-4xl font-bold text-foreground mb-1">€4.44</div>
        <p className="text-sm text-muted-foreground">One-time · Lifetime access</p>
      </div>

      {/* Actions */}
      <div className="pb-8 space-y-2">
        <ZenButton onClick={() => setStep('paywall')}>
          <Sparkles className="w-4 h-4 mr-2" />
          Unlock for €4.44
        </ZenButton>
        <button
          onClick={() => setStep('dashboard')}
          className="zen-button-ghost w-full text-sm"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
