import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, ArrowRight, Plus } from 'lucide-react';
import { VALUES_LIST, VALUE_LETTERS } from '@/data/values-list';
import { cn } from '@/lib/utils';

export function ValuesSelect() {
  const { setStep, selectedValues10, setSelectedValues10, customValues, setCustomValues } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build combined list: standard + custom values
  const customValueItems = customValues
    .map((label, i) => ({ id: `custom-${i}`, label }))
    .filter(v => v.label.trim() !== '');

  const allValues = [...VALUES_LIST, ...customValueItems];

  const filteredValues = allValues.filter((value) => {
    const matchesSearch = value.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLetter = !activeLetter || value.label[0].toUpperCase() === activeLetter;
    return matchesSearch && matchesLetter;
  });

  const toggleValue = (valueId: string) => {
    if (selectedValues10.includes(valueId)) {
      setSelectedValues10(selectedValues10.filter((id) => id !== valueId));
    } else if (selectedValues10.length < 10) {
      setSelectedValues10([...selectedValues10, valueId]);
    }
  };

  const updateCustomValue = (index: number, value: string) => {
    const newCustom = [...customValues];
    newCustom[index] = value;
    setCustomValues(newCustom);
  };

  const canContinue = selectedValues10.length === 10;

  return (
    <div className="screen-container-scroll">
      {/* Header */}
      <div className="py-4">
        <button
          onClick={() => setStep('purpose-summary')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Choose Your Values
        </h1>
        <p className="text-sm text-muted-foreground">
          Select 10 values that resonate with you
        </p>
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between py-3 border-b border-border mb-4">
        <span className="text-sm text-muted-foreground">Selected</span>
        <span className={cn(
          "text-lg font-semibold",
          canContinue ? "text-primary" : "text-foreground"
        )}>
          {selectedValues10.length}/10
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setActiveLetter(null); }}
          placeholder="Search values..."
          className="pl-10 bg-secondary/50 border-0"
        />
      </div>

      {/* Alphabetical navigation */}
      <div className="flex gap-1 overflow-x-auto pb-3 scrollbar-hide">
        <button
          onClick={() => setActiveLetter(null)}
          className={cn(
            "px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-all",
            !activeLetter 
              ? "bg-primary text-primary-foreground" 
              : "bg-secondary text-secondary-foreground"
          )}
        >
          All
        </button>
        {VALUE_LETTERS.map((letter) => (
          <button
            key={letter}
            onClick={() => setActiveLetter(activeLetter === letter ? null : letter)}
            className={cn(
              "px-2 py-1 rounded text-xs font-medium transition-all min-w-[28px]",
              activeLetter === letter
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Values grid */}
      <div className="flex-1 overflow-y-auto pb-4" ref={listRef}>
        <div className="grid grid-cols-3 gap-1.5">
          {filteredValues.map((value) => {
            const isSelected = selectedValues10.includes(value.id);
            const isDisabled = !isSelected && selectedValues10.length >= 10;
            
            return (
              <button
                key={value.id}
                onClick={() => !isDisabled && toggleValue(value.id)}
                disabled={isDisabled}
                className={cn(
                  "px-2 py-2.5 rounded-lg text-center transition-all text-sm",
                  isSelected 
                    ? "bg-primary text-primary-foreground shadow-zen font-medium" 
                    : "bg-card hover:bg-secondary/50",
                  isDisabled && "opacity-40 cursor-not-allowed"
                )}
              >
                {value.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom values section */}
      <div className="border-t border-border pt-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Plus className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Add your own values</span>
          <span className="text-xs text-muted-foreground">(max 3)</span>
        </div>
        <div className="space-y-2">
          {[0, 1, 2].map((index) => {
            const customId = `custom-${index}`;
            const hasValue = (customValues[index] || '').trim() !== '';
            const isSelected = selectedValues10.includes(customId);
            return (
              <div key={index} className="flex gap-2">
                <Input
                  value={customValues[index] || ''}
                  onChange={(e) => updateCustomValue(index, e.target.value)}
                  placeholder={`Custom value ${index + 1}`}
                  className="flex-1 bg-secondary/50 border-0 text-sm"
                />
                {hasValue && (
                  <button
                    onClick={() => toggleValue(customId)}
                    disabled={!isSelected && selectedValues10.length >= 10}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                      !isSelected && selectedValues10.length >= 10 && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 pb-8">
        <ZenButton 
          onClick={() => setStep('values-narrow')}
          disabled={!canContinue}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </ZenButton>
        {!canContinue && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Select {10 - selectedValues10.length} more value{10 - selectedValues10.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
