import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { Compass, ArrowLeft, ClipboardPaste } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export function PurposeIntro() {
  const { setStep, setPurposeStatement } = useApp();
  const [hasExisting, setHasExisting] = useState<boolean | null>(null);
  const [pastedPurpose, setPastedPurpose] = useState('');

  const handleSaveExisting = () => {
    if (pastedPurpose.trim()) {
      setPurposeStatement(pastedPurpose.trim());
      setStep('values-select');
    }
  };

  return (
    <div className="screen-container-scroll">
      {/* Back button */}
      <button
        onClick={() => setStep('dashboard')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="flex-1 flex flex-col justify-center animate-fade-in">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <Compass className="w-10 h-10 text-primary" />
        </div>

        {/* Content */}
        <h1 className="text-2xl font-semibold text-foreground text-center mb-4">
          Discover Your Purpose
        </h1>
        
        <p className="text-muted-foreground text-center mb-8 leading-relaxed">
          Your purpose is the compass that guides your decisions. 
          Do you already have a written purpose statement?
        </p>

        {hasExisting === null && (
          <div className="space-y-3 mb-12 animate-slide-up">
            <button
              onClick={() => setHasExisting(true)}
              className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl border border-border/20 text-left active:scale-[0.98] transition-all"
              style={{ boxShadow: 'var(--zen-shadow-card)' }}
            >
              <ClipboardPaste className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-foreground text-sm">Yes, I have one</p>
                <p className="text-xs text-muted-foreground">Paste it and move on</p>
              </div>
            </button>
            <button
              onClick={() => setHasExisting(false)}
              className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl border border-border/20 text-left active:scale-[0.98] transition-all"
              style={{ boxShadow: 'var(--zen-shadow-card)' }}
            >
              <Compass className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-foreground text-sm">No, help me find it</p>
                <p className="text-xs text-muted-foreground">7 questions, ~5-10 minutes</p>
              </div>
            </button>
          </div>
        )}

        {hasExisting === true && (
          <div className="space-y-4 mb-12 animate-slide-up">
            <Textarea
              value={pastedPurpose}
              onChange={(e) => setPastedPurpose(e.target.value)}
              placeholder="Paste or type your purpose statement here..."
              className="min-h-[120px] rounded-2xl border-border/30 bg-card"
            />
          </div>
        )}

        {hasExisting === false && (
          <div className="space-y-3 mb-12">
            {[
              'Gain clarity on what matters most',
              'Make decisions with confidence',
              'Align your goals with your values',
            ].map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-2 h-2 rounded-full bg-primary" />
                <p className="text-sm text-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3 pb-8">
        {hasExisting === null ? null : hasExisting ? (
          <>
            <ZenButton onClick={handleSaveExisting} disabled={!pastedPurpose.trim()}>
              Save & Continue
            </ZenButton>
            <button onClick={() => setHasExisting(null)} className="zen-button-ghost w-full text-sm">
              Back
            </button>
          </>
        ) : (
          <>
            <ZenButton onClick={() => setStep('purpose-questions')}>
              Start Discovery
            </ZenButton>
            <button onClick={() => setHasExisting(null)} className="zen-button-ghost w-full text-sm">
              Back
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Takes about 5-10 minutes
            </p>
          </>
        )}
      </div>
    </div>
  );
}
