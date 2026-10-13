import { useRef, useCallback } from 'react';
import { AppStep } from '@/types';

// Navigation hierarchy — higher index = deeper in the app
const STEP_DEPTH: Record<string, number> = {
  'onboarding-welcome': 0,
  'welcome': 0,
  'onboarding-how': 1,
  'onboarding-commitment': 2,
  'dashboard': 10,
  'settings': 11,
  'mind-dump': 20,
  'mind-dump-sort': 21,
  'time-matrix-intro': 30,
  'time-matrix': 31,
  'save-progress': 32,
  'email-consent': 33,
  'paywall': 34,
  'premium-overview': 33,
  'purpose-intro': 40,
  'purpose-questions': 41,
  'purpose-summary': 42,
  'values-select': 43,
  'values-narrow': 44,
  'values-rank': 45,
  'wheel-intro': 50,
  'wheel-scores': 51,
  'wheel-chart': 52,
  'goals-intro': 60,
  'goals-create': 61,
  'goals-summary': 62,
  'planning-monthly': 70,
  'planning-weekly': 71,
  'planning-daily': 72,
  'savers-setup': 80,
  'savers-daily': 81,
};

export type TransitionDirection = 'forward' | 'back' | 'none';

export function usePageTransition() {
  const prevStepRef = useRef<AppStep>('onboarding-welcome');
  const directionRef = useRef<TransitionDirection>('none');

  const getDirection = useCallback((from: AppStep, to: AppStep): TransitionDirection => {
    const fromDepth = STEP_DEPTH[from] ?? 0;
    const toDepth = STEP_DEPTH[to] ?? 0;
    
    // Going to dashboard from anywhere is "none" (tab switch)
    if (to === 'dashboard' && fromDepth >= 10) return 'none';
    
    // Tab switches between main nav items
    const mainTabs = ['dashboard', 'mind-dump', 'time-matrix', 'goals-intro'];
    if (mainTabs.includes(from) && mainTabs.includes(to)) return 'none';
    
    if (toDepth > fromDepth) return 'forward';
    if (toDepth < fromDepth) return 'back';
    return 'none';
  }, []);

  const recordTransition = useCallback((from: AppStep, to: AppStep) => {
    directionRef.current = getDirection(from, to);
    prevStepRef.current = to;
  }, [getDirection]);

  const getTransitionClass = useCallback((): string => {
    switch (directionRef.current) {
      case 'forward': return 'page-transition-forward';
      case 'back': return 'page-transition-back';
      default: return 'page-transition-none';
    }
  }, []);

  return {
    recordTransition,
    getTransitionClass,
    direction: directionRef.current,
  };
}
