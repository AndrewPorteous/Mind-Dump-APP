import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { ArrowLeft, ArrowRight, X, Check } from 'lucide-react';
import { getValueLabel } from '@/data/values-list';
import { cn } from '@/lib/utils';

export function ValuesNarrow() {
  const { setStep, selectedValues10, selectedValues5, setSelectedValues5, customValues } = useApp();

  const selectedValueObjects = selectedValues10.map((id) => ({
    id,
    label: getValueLabel(id, customValues),
  }));

  const toggleValue = (valueId: string) => {
    if (selectedValues5.includes(valueId)) {
      setSelectedValues5(selectedValues5.filter((id) => id !== valueId));
    } else if (selectedValues5.length < 5) {
      setSelectedValues5([...selectedValues5, valueId]);
    }
  };

  const canContinue = selectedValues5.length === 5;

  return (
    <div className="screen-container-scroll">
      {/* Header */}
      <div className="py-4">
        <button
          onClick={() => setStep('values-select')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Narrow to Your Core 5
        </h1>
        <p className="text-sm text-muted-foreground">
          From your 10 values, keep only the 5 that are most essential to who you are
        </p>
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between py-3 border-b border-border mb-6">
        <span className="text-sm text-muted-foreground">Keeping</span>
        <span className={cn(
          "text-lg font-semibold",
          canContinue ? "text-primary" : "text-foreground"
        )}>
          {selectedValues5.length}/5
        </span>
      </div>

      {/* Instructions */}
      <div className="bg-secondary/30 rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> Think about which values you would never compromise, 
          even under pressure. Those are your core values.
        </p>
      </div>

      {/* Values list */}
      <div className="flex-1 space-y-3 animate-fade-in">
        {selectedValueObjects.map((value, index) => {
          const isKept = selectedValues5.includes(value.id);
          const isDisabled = !isKept && selectedValues5.length >= 5;
          
          return (
            <button
              key={value.id}
              onClick={() => !isDisabled && toggleValue(value.id)}
              disabled={isDisabled}
              className={cn(
                "w-full p-4 rounded-lg text-left transition-all flex items-center justify-between animate-slide-up",
                isKept 
                  ? "bg-primary text-primary-foreground shadow-zen" 
                  : "bg-card hover:bg-secondary/50",
                isDisabled && "opacity-40 cursor-not-allowed"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="font-medium">{value.label}</span>
              {isKept ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="pt-6 pb-8">
        <ZenButton 
          onClick={() => setStep('values-rank')}
          disabled={!canContinue}
        >
          Rank Your Values
          <ArrowRight className="w-4 h-4 ml-2" />
        </ZenButton>
        {!canContinue && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            {selectedValues5.length < 5 
              ? `Select ${5 - selectedValues5.length} more value${5 - selectedValues5.length !== 1 ? 's' : ''}`
              : 'Remove some values to continue'}
          </p>
        )}
      </div>
    </div>
  );
}
