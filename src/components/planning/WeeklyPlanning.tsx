import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, ArrowRight, Plus, Trophy, BookOpen, Target, CheckCircle2 } from 'lucide-react';
import { getWeek, startOfWeek, endOfWeek, format } from 'date-fns';
import { cn } from '@/lib/utils';

type WeeklyStep = 'review' | 'plan';

export function WeeklyPlanning() {
  const { 
    setStep, 
    getWeeklyPlan, 
    addWeeklyPlan, 
    updateWeeklyPlan,
    goals,
    rankedValues
  } = useApp();
  
  const now = new Date();
  const currentWeek = getWeek(now);
  const currentYear = now.getFullYear();
  
  const [weekStep, setWeekStep] = useState<WeeklyStep>('review');
  
  // Review state
  const [wins, setWins] = useState<string[]>(['', '', '']);
  const [lessons, setLessons] = useState<string[]>(['', '']);
  const [valuesAligned, setValuesAligned] = useState(true);
  
  // Plan state
  const [priorities, setPriorities] = useState<string[]>(['', '', '']);
  const [focusOutcomes, setFocusOutcomes] = useState<string[]>(['', '', '']);
  const [q2Commitments, setQ2Commitments] = useState<string[]>(['', '']);

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weekLabel = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

  const handleSaveReview = () => {
    const existing = getWeeklyPlan(currentYear, currentWeek - 1);
    if (existing) {
      updateWeeklyPlan(existing.id, {
        wins: wins.filter(w => w.trim()),
        lessons: lessons.filter(l => l.trim()),
        valuesAligned,
      });
    }
    setWeekStep('plan');
  };

  const handleSavePlan = () => {
    const existing = getWeeklyPlan(currentYear, currentWeek);
    const outcomeObjects = focusOutcomes
      .filter(o => o.trim())
      .map((text, idx) => ({
        id: `focus-${idx}`,
        text,
        completed: false,
      }));

    if (existing) {
      updateWeeklyPlan(existing.id, {
        priorities: priorities.filter(p => p.trim()),
        focusOutcomes: outcomeObjects,
        q2Commitments: q2Commitments.filter(c => c.trim()),
      });
    } else {
      addWeeklyPlan({
        year: currentYear,
        week: currentWeek,
        wins: wins.filter(w => w.trim()),
        lessons: lessons.filter(l => l.trim()),
        valuesAligned,
        priorities: priorities.filter(p => p.trim()),
        focusOutcomes: outcomeObjects,
        q2Commitments: q2Commitments.filter(c => c.trim()),
      });
    }
    setStep('planning-daily');
  };

  if (weekStep === 'review') {
    return (
      <div className="screen-container-scroll">
        <div className="py-4">
          <button
            onClick={() => setStep('dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Dashboard</span>
          </button>
        </div>

        <div className="flex-1 py-6 space-y-6 animate-fade-in">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Step 1 of 2
            </p>
            <h1 className="text-2xl font-semibold text-foreground">
              Review Last Week
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Reflect before you plan
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                What were your wins?
              </label>
              {wins.map((win, idx) => (
                <Input
                  key={idx}
                  value={win}
                  onChange={(e) => {
                    const newWins = [...wins];
                    newWins[idx] = e.target.value;
                    setWins(newWins);
                  }}
                  placeholder={`Win ${idx + 1}`}
                  className="bg-secondary/50 border-0"
                />
              ))}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                What lessons did you learn?
              </label>
              {lessons.map((lesson, idx) => (
                <Input
                  key={idx}
                  value={lesson}
                  onChange={(e) => {
                    const newLessons = [...lessons];
                    newLessons[idx] = e.target.value;
                    setLessons(newLessons);
                  }}
                  placeholder={`Lesson ${idx + 1}`}
                  className="bg-secondary/50 border-0"
                />
              ))}
            </div>

            <div className="flex items-center justify-between p-4 bg-card rounded-lg shadow-zen">
              <div>
                <p className="font-medium text-foreground text-sm">
                  Did you live by your values?
                </p>
                {rankedValues.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {rankedValues.slice(0, 3).join(', ')}
                  </p>
                )}
              </div>
              <Switch
                checked={valuesAligned}
                onCheckedChange={setValuesAligned}
              />
            </div>
          </div>
        </div>

        <div className="pb-8 space-y-3">
          <ZenButton onClick={handleSaveReview}>
            Continue to Plan
            <ArrowRight className="w-4 h-4 ml-2" />
          </ZenButton>
          <button
            onClick={() => setWeekStep('plan')}
            className="zen-button-ghost w-full text-sm"
          >
            Skip Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-container-scroll">
      <div className="py-4">
        <button
          onClick={() => setWeekStep('review')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Review</span>
        </button>
      </div>

      <div className="flex-1 py-6 space-y-6 animate-fade-in">
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Step 2 of 2
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            Plan This Week
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {weekLabel}
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Top 3 Priorities
            </label>
            {priorities.map((priority, idx) => (
              <Input
                key={idx}
                value={priority}
                onChange={(e) => {
                  const newPriorities = [...priorities];
                  newPriorities[idx] = e.target.value;
                  setPriorities(newPriorities);
                }}
                placeholder={`Priority ${idx + 1}`}
                className="bg-secondary/50 border-0"
              />
            ))}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Weekly Focus Outcomes (1-3)
            </label>
            <p className="text-xs text-muted-foreground">
              What do you want to accomplish by the end of this week?
            </p>
            {focusOutcomes.map((outcome, idx) => (
              <Input
                key={idx}
                value={outcome}
                onChange={(e) => {
                  const newOutcomes = [...focusOutcomes];
                  newOutcomes[idx] = e.target.value;
                  setFocusOutcomes(newOutcomes);
                }}
                placeholder={`Outcome ${idx + 1}`}
                className="bg-secondary/50 border-0"
              />
            ))}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Q2 Commitments
            </label>
            <p className="text-xs text-muted-foreground">
              Important but not urgent tasks you'll make time for
            </p>
            {q2Commitments.map((commitment, idx) => (
              <Input
                key={idx}
                value={commitment}
                onChange={(e) => {
                  const newCommitments = [...q2Commitments];
                  newCommitments[idx] = e.target.value;
                  setQ2Commitments(newCommitments);
                }}
                placeholder={`Q2 task ${idx + 1}`}
                className="bg-secondary/50 border-0"
              />
            ))}
          </div>

          {goals.length > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">
                Your Goals for reference:
              </p>
              <div className="flex flex-wrap gap-2">
                {goals.slice(0, 5).map((goal) => (
                  <span
                    key={goal.id}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                  >
                    {goal.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pb-8 space-y-3">
        <ZenButton onClick={handleSavePlan}>
          Save & Start Daily Planning
        </ZenButton>
      </div>
    </div>
  );
}
