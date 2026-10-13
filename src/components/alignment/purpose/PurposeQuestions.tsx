import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { PURPOSE_QUESTIONS, PURPOSE_QUESTION_GROUPS } from '@/data/purpose-questions';

export function PurposeQuestions() {
  const { setStep, purposeAnswers, setPurposeAnswer } = useApp();
  const [currentGroup, setCurrentGroup] = useState(0);

  const groups = PURPOSE_QUESTION_GROUPS;
  const currentQuestionIds = groups[currentGroup];
  const currentQuestions = currentQuestionIds.map(
    (id) => PURPOSE_QUESTIONS.find((q) => q.id === id)!
  );

  const progress = ((currentGroup + 1) / groups.length) * 100;
  const isLastGroup = currentGroup === groups.length - 1;

  const handleNext = () => {
    if (isLastGroup) {
      setStep('purpose-summary');
    } else {
      setCurrentGroup(currentGroup + 1);
    }
  };

  const handleBack = () => {
    if (currentGroup === 0) {
      setStep('purpose-intro');
    } else {
      setCurrentGroup(currentGroup - 1);
    }
  };

  const handleSkip = () => {
    setStep('dashboard');
  };

  const hasAnswers = currentQuestionIds.some(
    (id) => purposeAnswers[id] && purposeAnswers[id].trim().length > 0
  );

  return (
    <div className="screen-container-scroll">
      {/* Header */}
      <div className="py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <button
            onClick={handleSkip}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <span>Skip</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
        <Progress value={progress} className="h-1" />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Step {currentGroup + 1} of {groups.length}
        </p>
      </div>

      {/* Questions */}
      <div className="flex-1 py-6 space-y-8 animate-fade-in">
        {currentQuestions.map((question, index) => (
          <div 
            key={question.id} 
            className="space-y-3 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <h2 className="text-lg font-medium text-foreground">
              {question.question}
            </h2>
            <p className="text-sm text-muted-foreground">
              {question.explanation}
            </p>
            <Textarea
              value={purposeAnswers[question.id] || ''}
              onChange={(e) => setPurposeAnswer(question.id, e.target.value)}
              placeholder={question.placeholder}
              className="min-h-[100px] resize-none bg-secondary/50 border border-border focus-visible:ring-primary/20"
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="pb-8 space-y-3">
        <ZenButton onClick={handleNext} disabled={!hasAnswers}>
          {isLastGroup ? 'See Your Purpose' : 'Continue'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </ZenButton>
        <p className="text-xs text-muted-foreground text-center">
          You can return later to complete this
        </p>
      </div>
    </div>
  );
}
