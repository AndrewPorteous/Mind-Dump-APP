import { AppProvider, useApp } from '@/context/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { usePageTransition } from '@/hooks/usePageTransition';
import { useEffect, useRef, useState } from 'react';
import { OnboardingWelcome } from '@/components/onboarding/OnboardingWelcome';
import { OnboardingHow } from '@/components/onboarding/OnboardingHow';
import { OnboardingCommitment } from '@/components/onboarding/OnboardingCommitment';
import { MindDumpInput } from '@/components/mind-dump/MindDumpInput';
import { MindDumpSort } from '@/components/mind-dump/MindDumpSort';
import { TimeMatrix } from '@/components/time-matrix/TimeMatrix';
import { ClarityCheck } from '@/components/onboarding/ClarityCheck';
import { TimeMatrixIntro } from '@/components/time-matrix/TimeMatrixIntro';
import { AuthPage } from '@/components/auth/AuthPage';
import { EmailTipsConsent } from '@/components/email/EmailTipsConsent';
import { Paywall } from '@/components/paywall/Paywall';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { BottomNav } from '@/components/layout/BottomNav';
import { PurposeIntro } from '@/components/alignment/purpose/PurposeIntro';
import { PurposeQuestions } from '@/components/alignment/purpose/PurposeQuestions';
import { PurposeSummary } from '@/components/alignment/purpose/PurposeSummary';
import { ValuesSelect } from '@/components/alignment/values/ValuesSelect';
import { ValuesNarrow } from '@/components/alignment/values/ValuesNarrow';
import { ValuesRank } from '@/components/alignment/values/ValuesRank';
import { WheelIntro } from '@/components/alignment/wheel/WheelIntro';
import { WheelScores } from '@/components/alignment/wheel/WheelScores';
import { WheelChart } from '@/components/alignment/wheel/WheelChart';
import { GoalsIntro } from '@/components/alignment/goals/GoalsIntro';
import { GoalsCreate } from '@/components/alignment/goals/GoalsCreate';
import { MonthlyPlanning } from '@/components/planning/MonthlyPlanning';
import { WeeklyPlanning } from '@/components/planning/WeeklyPlanning';
import { DailyPlan } from '@/components/planning/DailyPlan';
import { SaversSetup } from '@/components/planning/SaversSetup';
import { SaversDaily } from '@/components/planning/SaversDaily';
import { LearnSystem } from '@/components/learn/LearnSystem';
import { PremiumOverview } from '@/components/premium/PremiumOverview';
import { Loader2 } from 'lucide-react';
import { AlchemistBadge } from '@/components/ui/Logo';

const ONBOARDING_STEPS = [
  'onboarding-welcome',
  'onboarding-how',
  'onboarding-commitment',
];

function AppContent() {
  const { currentStep, setStep } = useApp();
  const { isAuthenticated, loading } = useAuth();
  const { recordTransition, getTransitionClass } = usePageTransition();
  const prevStepRef = useRef(currentStep);
  const [transitionKey, setTransitionKey] = useState(0);

  // Track step changes for page transitions
  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      recordTransition(prevStepRef.current, currentStep);
      prevStepRef.current = currentStep;
      setTransitionKey(k => k + 1);
    }
  }, [currentStep, recordTransition]);

  // Redirect authenticated users away from onboarding
  useEffect(() => {
    if (!loading && isAuthenticated && ONBOARDING_STEPS.includes(currentStep)) {
      setStep('dashboard');
    }
  }, [loading, isAuthenticated, currentStep, setStep]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-5 bg-zen-gradient">
        <AlchemistBadge className="w-28 h-28 animate-breathe shadow-[0_0_30px_-6px_hsl(var(--primary)/0.6)]" />
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'onboarding-welcome': return <OnboardingWelcome />;
      case 'welcome': return <OnboardingWelcome returning />;
      case 'onboarding-how': return <OnboardingHow />;
      case 'onboarding-commitment': return <OnboardingCommitment />;
      case 'mind-dump': return <MindDumpInput />;
      case 'mind-dump-sort': return <MindDumpSort />;
      case 'time-matrix-intro': return <TimeMatrixIntro />;
      case 'time-matrix': return <TimeMatrix />;
      case 'clarity-check': return <ClarityCheck />;
      case 'save-progress': 
        return <AuthPage 
          onBack={() => setStep('time-matrix')}
          onSuccess={() => setStep('dashboard')} 
          defaultMode="signup"
        />;
      case 'email-consent': return <EmailTipsConsent />;
      case 'paywall': return <Paywall />;
      case 'dashboard': return <Dashboard />;
      case 'settings': return <SettingsPage />;
      case 'learn-system': return <LearnSystem />;
      case 'premium-overview': return <PremiumOverview />;
      case 'purpose-intro': return <PurposeIntro />;
      case 'purpose-questions': return <PurposeQuestions />;
      case 'purpose-summary': return <PurposeSummary />;
      case 'values-select': return <ValuesSelect />;
      case 'values-narrow': return <ValuesNarrow />;
      case 'values-rank': return <ValuesRank />;
      case 'wheel-intro': return <WheelIntro />;
      case 'wheel-scores': return <WheelScores />;
      case 'wheel-chart': return <WheelChart />;
      case 'goals-intro': return <GoalsIntro />;
      case 'goals-create': return <GoalsCreate />;
      case 'goals-summary': return <Dashboard />;
      case 'planning-monthly': return <MonthlyPlanning />;
      case 'planning-weekly': return <WeeklyPlanning />;
      case 'planning-daily': return <DailyPlan />;
      case 'savers-setup': return <SaversSetup />;
      case 'savers-daily': return <SaversDaily />;
      default: return <OnboardingWelcome />;
    }
  };

  return (
    <div className="app-shell">
      {/* Main content with native scroll */}
      <main className="app-content scrollable">
        <div key={transitionKey} className={getTransitionClass()}>
          {renderStep()}
        </div>
      </main>
      
      {/* Bottom nav */}
      <BottomNav />
    </div>
  );
}

const Index = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default Index;
