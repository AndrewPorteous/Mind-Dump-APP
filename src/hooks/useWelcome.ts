import { useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { AppStep } from '@/types';
import { readLocal, writeLocal } from '@/data/alchemy';

const RETURN_KEY = 'alchemist-return-step';

/** Open the welcome (title) page from anywhere and come back to where you were. */
export function useWelcome() {
  const { currentStep, setStep } = useApp();

  const openWelcome = useCallback(() => {
    if (currentStep !== 'welcome') writeLocal(RETURN_KEY, currentStep);
    setStep('welcome');
  }, [currentStep, setStep]);

  const returnFromWelcome = useCallback(() => {
    setStep(readLocal<AppStep>(RETURN_KEY, 'dashboard'));
  }, [setStep]);

  return { openWelcome, returnFromWelcome };
}
