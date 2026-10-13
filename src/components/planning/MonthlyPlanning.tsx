import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, X, Calendar, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function MonthlyPlanning() {
  const { 
    setStep, 
    getMonthlyPlan, 
    addMonthlyPlan, 
    updateMonthlyPlan,
    goals 
  } = useApp();
  
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  
  const [whatMatters, setWhatMatters] = useState('');
  const [successCriteria, setSuccessCriteria] = useState('');
  const [outcomes, setOutcomes] = useState<string[]>(['', '', '']);

  const handleMonthClick = (month: number) => {
    const existing = getMonthlyPlan(selectedYear, month + 1);
    if (existing) {
      setWhatMatters(existing.whatMatters);
      setSuccessCriteria(existing.successCriteria);
      setOutcomes(existing.outcomes.map(o => o.text).slice(0, 3));
    } else {
      setWhatMatters('');
      setSuccessCriteria('');
      setOutcomes(['', '', '']);
    }
    setSelectedMonth(month);
  };

  const handleSave = () => {
    if (selectedMonth === null) return;
    
    const existing = getMonthlyPlan(selectedYear, selectedMonth + 1);
    const outcomeObjects = outcomes
      .filter(o => o.trim())
      .map((text, idx) => ({
        id: `outcome-${idx}`,
        text,
        completed: false,
      }));

    if (existing) {
      updateMonthlyPlan(existing.id, {
        whatMatters,
        successCriteria,
        outcomes: outcomeObjects,
      });
    } else {
      addMonthlyPlan({
        year: selectedYear,
        month: selectedMonth + 1,
        whatMatters,
        successCriteria,
        outcomes: outcomeObjects,
        linkedGoals: [],
      });
    }
    setSelectedMonth(null);
  };

  const updateOutcome = (index: number, value: string) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = value;
    setOutcomes(newOutcomes);
  };

  if (selectedMonth !== null) {
    return (
      <div className="screen-container-scroll">
        <div className="py-4">
          <button
            onClick={() => setSelectedMonth(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Year</span>
          </button>
        </div>

        <div className="flex-1 py-6 space-y-6 animate-fade-in">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground">
              {MONTHS[selectedMonth]} {selectedYear}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Set your intention for this month
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                What matters most this month?
              </label>
              <Textarea
                value={whatMatters}
                onChange={(e) => setWhatMatters(e.target.value)}
                placeholder="Focus on what would make the biggest difference..."
                className="min-h-[80px] resize-none bg-secondary/50 border-0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                What would make this month successful?
              </label>
              <Textarea
                value={successCriteria}
                onChange={(e) => setSuccessCriteria(e.target.value)}
                placeholder="Describe your ideal outcome..."
                className="min-h-[80px] resize-none bg-secondary/50 border-0"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Top 3 Outcomes
              </label>
              {outcomes.map((outcome, idx) => (
                <Input
                  key={idx}
                  value={outcome}
                  onChange={(e) => updateOutcome(idx, e.target.value)}
                  placeholder={`Outcome ${idx + 1}`}
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
          <ZenButton onClick={handleSave}>
            Save {MONTHS[selectedMonth]}
          </ZenButton>
        </div>
      </div>
    );
  }

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

      <div className="flex-1 py-6 animate-fade-in">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-4 mb-2">
            <button
              onClick={() => setSelectedYear(selectedYear - 1)}
              className="text-muted-foreground hover:text-foreground"
            >
              ←
            </button>
            <h1 className="text-2xl font-semibold text-foreground">
              {selectedYear}
            </h1>
            <button
              onClick={() => setSelectedYear(selectedYear + 1)}
              className="text-muted-foreground hover:text-foreground"
            >
              →
            </button>
          </div>
          <p className="text-muted-foreground text-sm">
            Plan your year, month by month
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {MONTHS.map((month, idx) => {
            const plan = getMonthlyPlan(selectedYear, idx + 1);
            const isCurrentMonth = idx === now.getMonth() && selectedYear === now.getFullYear();
            
            return (
              <button
                key={month}
                onClick={() => handleMonthClick(idx)}
                className={cn(
                  'p-4 rounded-lg text-left transition-all',
                  'bg-card shadow-zen hover:shadow-zen-lg',
                  isCurrentMonth && 'ring-2 ring-primary',
                  plan && 'border-l-4 border-primary'
                )}
              >
                <p className="font-medium text-foreground text-sm">{month.slice(0, 3)}</p>
                {plan && plan.outcomes.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {plan.outcomes.length} outcomes
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pb-8">
        <ZenButton onClick={() => setStep('planning-weekly')} variant="secondary">
          Go to Weekly Planning
        </ZenButton>
      </div>
    </div>
  );
}
