import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { WHEEL_DOMAINS } from '@/data/wheel-domains';
import { GoalHorizon, WheelDomain } from '@/types/alignment';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export function GoalsCreate() {
  const { setStep, getLowestWheelDomains, addGoal, removeGoal, goals } = useApp();
  const [selectedDomain, setSelectedDomain] = useState<WheelDomain | null>(null);
  const [title, setTitle] = useState('');
  const [why, setWhy] = useState('');
  const [horizon, setHorizon] = useState<GoalHorizon>('3months');

  const lowDomains = getLowestWheelDomains(6);
  const suggestedDomains = lowDomains.length > 0 ? lowDomains : WHEEL_DOMAINS.map(d => d.id) as WheelDomain[];

  const handleAddGoal = () => {
    if (selectedDomain && title.trim()) {
      addGoal({ domain: selectedDomain, title, why, horizon, linkedValues: [], linkedPurpose: false });
      setTitle(''); setWhy(''); setSelectedDomain(null);
      toast({
        title: "Goal Added",
        description: "Your goal has been saved.",
      });
    }
  };

  return (
    <div className="screen-container-scroll">
      <button onClick={() => setStep('goals-intro')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-4">
        <ArrowLeft className="w-4 h-4" /><span className="text-sm">Back</span>
      </button>
      
      <h1 className="text-xl font-semibold text-foreground mb-4">Create a Goal</h1>

      <div className="flex-1 space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Life Area</label>
          <div className="flex flex-wrap gap-2">
            {suggestedDomains.slice(0, 4).map((domainId) => {
              const domain = WHEEL_DOMAINS.find(d => d.id === domainId);
              return domain && (
                <button key={domainId} onClick={() => setSelectedDomain(domainId)}
                  className={cn("px-3 py-2 rounded-lg text-sm", selectedDomain === domainId ? "bg-primary text-primary-foreground" : "bg-secondary")}>
                  {domain.emoji} {domain.label}
                </button>
              );
            })}
          </div>
          {lowDomains.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Suggested based on your Life Wheel scores
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">What do you want to achieve?</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Run a 5K" className="bg-secondary/50 border-0" />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Why is this important?</label>
          <Textarea value={why} onChange={(e) => setWhy(e.target.value)} placeholder="e.g., To improve my health and energy levels" className="bg-secondary/50 border-0" />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Timeline</label>
          <div className="flex gap-2">
            {(['3months', '12months', '3-5years'] as GoalHorizon[]).map((h) => (
              <button key={h} onClick={() => setHorizon(h)}
                className={cn("px-3 py-2 rounded-lg text-sm flex-1", horizon === h ? "bg-primary text-primary-foreground" : "bg-secondary")}>
                {h === '3months' ? '3 months' : h === '12months' ? '1 year' : '3-5 years'}
              </button>
            ))}
          </div>
        </div>

        {goals.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">Your goals ({goals.length})</p>
            <div className="space-y-2">
              {goals.map((g) => (
                <div key={g.id} className="p-3 bg-card rounded-lg text-sm flex items-center justify-between gap-2">
                  <span className="flex-1">{g.title}</span>
                  <button
                    onClick={() => removeGoal(g.id)}
                    className="p-1.5 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-6 pb-8 space-y-3">
        <button onClick={handleAddGoal} disabled={!selectedDomain || !title.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 bg-secondary text-secondary-foreground rounded-lg disabled:opacity-50">
          <Plus className="w-4 h-4" /> Add Goal
        </button>
        <ZenButton onClick={() => setStep('dashboard')}>Done</ZenButton>
      </div>
    </div>
  );
}
