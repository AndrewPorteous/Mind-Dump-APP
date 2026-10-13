import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Plus, Clock, Bug, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DailyTask } from '@/types/planning';
import { Quadrant } from '@/types';

type DailyStep = 'dump' | 'estimate' | 'buffer' | 'review';

const STEPS: { id: DailyStep; title: string; subtitle: string }[] = [
  { id: 'dump', title: 'Dump', subtitle: 'List your tasks' },
  { id: 'estimate', title: 'Estimate', subtitle: 'Time per task' },
  { id: 'buffer', title: 'Buffer', subtitle: 'Keep 40% free' },
  { id: 'review', title: 'Review', subtitle: 'Your day plan' },
];

const QUADRANT_ORDER: Record<Quadrant, number> = { Q1: 0, Q2: 1, Q3: 2, Q4: 3 };
const QUADRANT_STYLES: Record<Quadrant, string> = {
  Q1: 'bg-red-500/10 text-red-600 border-red-500/30',
  Q2: 'bg-green-500/10 text-green-600 border-green-500/30',
  Q3: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  Q4: 'bg-gray-400/10 text-gray-500 border-gray-400/30',
};

export function DailyPlan() {
  const { setStep, getDailyPlan, addDailyPlan, updateDailyPlan, tasks } = useApp();

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLabel = format(new Date(), 'EEEE, MMMM d');

  const [currentStep, setCurrentStep] = useState<DailyStep>('dump');
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [availableMinutes, setAvailableMinutes] = useState(480);

  useEffect(() => {
    const existing = getDailyPlan(today);
    if (existing) {
      setDailyTasks(existing.tasks);
      setAvailableMinutes(existing.totalAvailableMinutes);
    } else {
      const importedTasks: DailyTask[] = tasks
        .filter(t => t.quadrant === 'Q1' || t.quadrant === 'Q2')
        .slice(0, 5)
        .map(t => ({
          id: crypto.randomUUID(),
          text: t.text,
          estMinutes: t.estMinutes,
          quadrant: t.quadrant,
          completed: false,
          carriedForward: false,
        }));
      setDailyTasks(importedTasks);
    }
  }, [getDailyPlan, today, tasks]);

  const totalPlannedMinutes = useMemo(
    () => dailyTasks.reduce((sum, t) => sum + t.estMinutes, 0),
    [dailyTasks]
  );

  const bufferPercentage = useMemo(
    () => Math.round((totalPlannedMinutes / availableMinutes) * 100),
    [totalPlannedMinutes, availableMinutes]
  );

  const isOverBuffer = bufferPercentage > 60;

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const task: DailyTask = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      estMinutes: 30,
      quadrant: 'Q2',
      completed: false,
      carriedForward: false,
    };
    setDailyTasks([...dailyTasks, task]);
    setNewTaskText('');
  };

  const updateTask = (id: string, updates: Partial<DailyTask>) => {
    setDailyTasks(dailyTasks.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const removeTask = (id: string) => {
    setDailyTasks(dailyTasks.filter(t => t.id !== id));
  };

  const toggleComplete = (id: string) => {
    setDailyTasks(dailyTasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleSave = () => {
    const existing = getDailyPlan(today);
    if (existing) {
      updateDailyPlan(existing.id, {
        tasks: dailyTasks,
        totalAvailableMinutes: availableMinutes,
        bufferUsed: bufferPercentage,
      });
    } else {
      addDailyPlan({
        date: today,
        tasks: dailyTasks,
        totalAvailableMinutes: availableMinutes,
        bufferUsed: bufferPercentage,
      });
    }
    setStep('dashboard');
  };

  const stepIndex = STEPS.findIndex(s => s.id === currentStep);
  const goNext = () => {
    const next = STEPS[stepIndex + 1];
    if (next) setCurrentStep(next.id);
  };
  const goBack = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setCurrentStep(prev.id);
  };

  // Sort by quadrant Q1 -> Q4 for review
  const sortedTasks = useMemo(
    () =>
      [...dailyTasks].sort(
        (a, b) => (QUADRANT_ORDER[a.quadrant ?? 'Q2'] - QUADRANT_ORDER[b.quadrant ?? 'Q2'])
      ),
    [dailyTasks]
  );

  return (
    <div className="screen-container-scroll">
      <div className="py-4">
        <button
          onClick={() => (stepIndex > 0 ? goBack() : setStep('dashboard'))}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{stepIndex > 0 ? 'Back' : 'Dashboard'}</span>
        </button>
      </div>

      <div className="flex gap-1 mb-4">
        {STEPS.map((step, idx) => (
          <div
            key={step.id}
            className={cn(
              'flex-1 h-1 rounded-full transition-colors',
              idx <= stepIndex ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>

      <div className="text-center mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{todayLabel}</p>
        <h1 className="text-xl font-semibold text-foreground">{STEPS[stepIndex].title}</h1>
        <p className="text-muted-foreground text-sm">{STEPS[stepIndex].subtitle}</p>
      </div>

      <div className="flex-1 py-4 animate-fade-in">
        {currentStep === 'dump' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                placeholder="Add a task..."
                className="flex-1 bg-secondary/50 border-0"
              />
              <button onClick={addTask} className="p-2 bg-primary text-primary-foreground rounded-lg">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {dailyTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-card rounded-lg shadow-zen">
                  <span className="flex-1 text-foreground">{task.text}</span>
                  <div className="flex gap-1">
                    {(['Q1', 'Q2', 'Q3', 'Q4'] as Quadrant[]).map((q) => (
                      <button
                        key={q}
                        onClick={() => updateTask(task.id, { quadrant: q })}
                        className={cn(
                          'w-7 h-7 rounded-md text-[11px] font-bold border transition-colors',
                          (task.quadrant ?? 'Q2') === q
                            ? QUADRANT_STYLES[q]
                            : 'bg-muted border-transparent text-muted-foreground'
                        )}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => removeTask(task.id)} className="text-muted-foreground hover:text-destructive">
                    ×
                  </button>
                </div>
              ))}
            </div>

            {dailyTasks.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">Add your tasks for today</p>
            )}
          </div>
        )}

        {currentStep === 'estimate' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <span>Total planned:</span>
              <span className="font-medium text-foreground">
                {Math.floor(totalPlannedMinutes / 60)}h {totalPlannedMinutes % 60}m
              </span>
            </div>

            {dailyTasks.map((task) => (
              <div key={task.id} className="p-4 bg-card rounded-lg shadow-zen space-y-3">
                <p className="font-medium text-foreground">{task.text}</p>
                <div className="flex items-center gap-4">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Slider
                    value={[task.estMinutes]}
                    onValueChange={([v]) => updateTask(task.id, { estMinutes: v })}
                    min={5}
                    max={180}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-foreground w-12 text-right">{task.estMinutes}m</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentStep === 'buffer' && (
          <div className="space-y-6">
            <div className="p-4 bg-card rounded-lg shadow-zen">
              <p className="text-sm text-muted-foreground mb-2">Available hours today:</p>
              <div className="flex items-center gap-4">
                <Slider
                  value={[availableMinutes]}
                  onValueChange={([v]) => setAvailableMinutes(v)}
                  min={60}
                  max={720}
                  step={30}
                  className="flex-1"
                />
                <span className="text-lg font-semibold text-foreground w-16 text-right">
                  {Math.floor(availableMinutes / 60)}h
                </span>
              </div>
            </div>

            <div className="p-4 bg-card rounded-lg shadow-zen space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Buffer used:</span>
                <span className={cn('text-lg font-semibold', isOverBuffer ? 'text-destructive' : 'text-primary')}>
                  {bufferPercentage}%
                </span>
              </div>
              <Progress value={Math.min(bufferPercentage, 100)} className={cn('h-3', isOverBuffer && '[&>div]:bg-destructive')} />
              <p className="text-xs text-muted-foreground">Rule: Keep 40% buffer for unexpected tasks and breaks.</p>
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg flex items-start gap-3">
              <Bug className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Eat the Frog First</p>
                <p className="text-sm text-muted-foreground">
                  Start with your most important Q1 task when your energy is highest.
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Day Plan</p>

            {sortedTasks.map((task) => {
              const q = task.quadrant ?? 'Q2';
              return (
                <div
                  key={task.id}
                  className={cn(
                    'flex items-center gap-3 p-4 bg-card rounded-lg shadow-zen',
                    task.completed && 'opacity-50'
                  )}
                >
                  <button onClick={() => toggleComplete(task.id)}>
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={cn('font-medium text-foreground', task.completed && 'line-through')}>{task.text}</p>
                    <p className="text-xs text-muted-foreground">{task.estMinutes}min</p>
                  </div>
                  <span
                    className={cn(
                      'w-9 h-7 rounded-md flex items-center justify-center text-[11px] font-bold border',
                      QUADRANT_STYLES[q]
                    )}
                  >
                    {q}
                  </span>
                </div>
              );
            })}

            <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Daily Rules:</p>
              <ul className="space-y-1">
                <li>• 2-minute rule: If it takes less, do it now</li>
                <li>• Power Hour: Block 1h for deep work</li>
                <li>• Unfinished tasks carry forward tomorrow</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="pb-8 space-y-3">
        {currentStep !== 'review' ? (
          <ZenButton onClick={goNext} disabled={dailyTasks.length === 0}>
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </ZenButton>
        ) : (
          <ZenButton onClick={handleSave}>Save Day Plan</ZenButton>
        )}
      </div>
    </div>
  );
}
