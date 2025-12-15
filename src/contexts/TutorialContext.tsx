
import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface TutorialStep {
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface TutorialContextType {
  isActive: boolean;
  currentStepIndex: number;
  steps: TutorialStep[];
  startTutorial: (steps: TutorialStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  hasSeenTutorial: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('vitrinex_tutorial_completed');
    if (seen) {
      setHasSeenTutorial(true);
    }
  }, []);

  const startTutorial = useCallback((newSteps: TutorialStep[]) => {
    setSteps(newSteps);
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      skipTutorial(); // End if it's the last step
    }
  }, [currentStepIndex, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const skipTutorial = useCallback(() => {
    setIsActive(false);
    setHasSeenTutorial(true);
    localStorage.setItem('vitrinex_tutorial_completed', 'true');
  }, []);

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStepIndex,
        steps,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        hasSeenTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
