import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Sparkles, Edit3, Check } from 'lucide-react';
import { PURPOSE_QUESTIONS } from '@/data/purpose-questions';

export function PurposeSummary() {
  const { setStep, purposeAnswers, purposeStatement, setPurposeStatement } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatement, setEditedStatement] = useState('');

  // Generate a purpose statement from answers
  useEffect(() => {
    if (!purposeStatement) {
      const answers = Object.values(purposeAnswers).filter(Boolean);
      if (answers.length > 0) {
        // Create a simple statement based on key answers
        const flowAnswer = purposeAnswers['flow'] || '';
        const legacyAnswer = purposeAnswers['legacy'] || '';
        const problemsAnswer = purposeAnswers['problems'] || '';
        
        let generatedStatement = '';
        if (flowAnswer || problemsAnswer || legacyAnswer) {
          generatedStatement = `I am driven to help others by ${problemsAnswer || flowAnswer || 'making a difference'}. My purpose is to ${legacyAnswer || 'leave a positive impact'}.`;
        }
        setPurposeStatement(generatedStatement);
        setEditedStatement(generatedStatement);
      }
    } else {
      setEditedStatement(purposeStatement);
    }
  }, [purposeAnswers, purposeStatement, setPurposeStatement]);

  const handleSave = () => {
    setPurposeStatement(editedStatement);
    setIsEditing(false);
  };

  const handleContinue = () => {
    setStep('values-select');
  };

  const answeredQuestions = PURPOSE_QUESTIONS.filter(
    (q) => purposeAnswers[q.id] && purposeAnswers[q.id].trim().length > 0
  );

  return (
    <div className="screen-container-scroll">
      {/* Header */}
      <button
        onClick={() => setStep('dashboard')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to dashboard</span>
      </button>

      <div className="flex-1 py-6 animate-fade-in">
        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Your Purpose Statement
          </h1>
        </div>

        {/* Purpose Statement Card */}
        <div className="bg-card rounded-lg shadow-zen p-6 mb-8">
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={editedStatement}
                onChange={(e) => setEditedStatement(e.target.value)}
                className="min-h-[120px] resize-none bg-secondary/50 border-0 focus-visible:ring-primary/20 text-lg"
                placeholder="Write your purpose statement..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-foreground leading-relaxed italic">
                "{purposeStatement || 'Your purpose will appear here based on your answers.'}"
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit statement
              </button>
            </div>
          )}
        </div>

        {/* Summary of answers */}
        {answeredQuestions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Your Insights
            </h2>
            <div className="space-y-3">
              {answeredQuestions.slice(0, 3).map((question) => (
                <div key={question.id} className="bg-secondary/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    {question.question}
                  </p>
                  <p className="text-sm text-foreground">
                    {purposeAnswers[question.id]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pb-8 space-y-3">
        <ZenButton onClick={handleContinue}>
          Continue to Values
        </ZenButton>
        <button
          onClick={() => setStep('dashboard')}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          Save and return later
        </button>
      </div>
    </div>
  );
}
