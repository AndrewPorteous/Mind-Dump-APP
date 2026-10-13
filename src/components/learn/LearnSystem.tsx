import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ArrowLeft,
  Brain,
  Grid3X3,
  Compass,
  Heart,
  PieChart,
  Target,
  Sun,
  Calendar,
  ChevronRight,
  ChevronDown,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppStep } from '@/types';

type LearnEntry = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  title: string;
  tagline: string;
  body: string;
  goStep?: AppStep;
  goLabel?: string;
};

const ENTRIES: LearnEntry[] = [
  {
    id: 'mind-dump',
    icon: Brain,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    title: 'Mind Dump',
    tagline: 'Empty your head onto the page',
    body: 'Writing down every open loop, worry, idea or task frees working memory. You think more clearly once your mind no longer has to remember everything. One thought per line — no judgment, no order.',
    goStep: 'mind-dump',
    goLabel: 'Open Mind Dump',
  },
  {
    id: 'matrix',
    icon: Grid3X3,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    title: 'Time Matrix (Eisenhower)',
    tagline: 'Prioritize by urgency and importance',
    body: 'Each task lands in one of four quadrants. Q1 Do Now (urgent + important). Q2 Schedule (important, not urgent — where growth happens). Q3 Delegate (urgent, not important). Q4 Eliminate. Successful people spend most of their time in Q2.',
    goStep: 'time-matrix-intro',
    goLabel: 'See Full Explanation',
  },
  {
    id: 'purpose',
    icon: Compass,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    title: 'Purpose',
    tagline: 'Your why — the compass for decisions',
    body: 'A purpose statement is a short sentence that captures why you do what you do. It makes decisions easier: every choice can be measured against it. You can paste one you already have, or answer 7 guided questions to craft yours.',
    goStep: 'purpose-intro',
    goLabel: 'Define My Purpose',
  },
  {
    id: 'values',
    icon: Heart,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    title: 'Values',
    tagline: 'How you want to live',
    body: 'From a list of 214 values, you eliminate progressively to keep your top 5. These are your non-negotiables — the "how" of every goal. Choosing what to remove is harder than what to keep, and that\'s the point.',
    goStep: 'values-select',
    goLabel: 'Choose My Values',
  },
  {
    id: 'wheel',
    icon: PieChart,
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    title: 'Life Wheel',
    tagline: 'Where you stand in 8 life areas',
    body: 'Rate each of 8 areas from 1 to 10: Physical Environment, Career, Finances, Health, Family & Friends, Romance, Personal Growth, Fun. The visual reveals imbalance instantly — that\'s where to focus next.',
    goStep: 'wheel-scores',
    goLabel: 'Score My Wheel',
  },
  {
    id: 'goals',
    icon: Target,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    title: 'Goals',
    tagline: 'Purpose + Wheel + Values = Goals',
    body: 'Meaningful goals come from the intersection of three layers: your Purpose (why), your Wheel (which area needs focus), and your Values (how you act). Goals built this way feel aligned, not arbitrary.',
    goStep: 'goals-create',
    goLabel: 'Create a Goal',
  },
  {
    id: 'savers',
    icon: Sun,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    title: 'SAVERS Routine',
    tagline: 'A configurable morning ritual',
    body: 'Silence, Affirmations, Visualization, Exercise, Reading, Scribing. A short morning sequence to set state before the day pulls you. You enable only the elements that suit you — no all-or-nothing.',
    goStep: 'savers-setup',
    goLabel: 'Set Up SAVERS',
  },
  {
    id: 'planning',
    icon: Calendar,
    color: 'text-primary',
    bg: 'bg-primary/10',
    title: 'Daily Planning',
    tagline: 'Plan with breathing room',
    body: 'Five steps: Dump, Estimate, Buffer, Prioritize (A/B/C), Review. Rule of thumb: plan around 60% of your day. The remaining 40% absorbs the unexpected. A fully packed day is a fragile day.',
    goStep: 'planning-daily',
    goLabel: 'Plan My Day',
  },
];

export function LearnSystem() {
  const { setStep } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="screen-container-scroll pb-4">
      <button
        onClick={() => setStep('dashboard')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="pb-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Learn the System</h1>
            <p className="text-sm text-muted-foreground">Understand each tool, at your own pace</p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 animate-slide-up">
        {ENTRIES.map((e) => {
          const Icon = e.icon;
          const open = openId === e.id;
          return (
            <div
              key={e.id}
              className="bg-card rounded-2xl border border-border/20 overflow-hidden"
              style={{ boxShadow: 'var(--zen-shadow-card)' }}
            >
              <button
                onClick={() => setOpenId(open ? null : e.id)}
                className="w-full flex items-center gap-3 p-4 text-left active:bg-muted/30 transition-colors"
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', e.bg)}>
                  <Icon className={cn('w-5 h-5', e.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{e.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{e.tagline}</p>
                </div>
                {open ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {open && (
                <div className="px-4 pb-4 pt-1 animate-fade-in">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{e.body}</p>
                  {e.goStep && (
                    <button
                      onClick={() => setStep(e.goStep!)}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {e.goLabel ?? 'Open'} →
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
