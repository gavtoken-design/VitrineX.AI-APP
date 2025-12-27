
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
  isWelcomeOpen: boolean;
  isGuidesEnabled: boolean;
  currentStepIndex: number;
  steps: TutorialStep[];
  completedModules: Record<string, boolean>;

  startTutorial: (moduleId: string, steps: TutorialStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  closeWelcome: () => void;
  resetTutorials: () => void;
  toggleGuides: (enabled: boolean) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false); // Controls the initial welcome modal
  const [isGuidesEnabled, setIsGuidesEnabled] = useState(true);

  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>([]);

  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({});

  // Load state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('vitrinex_onboarding_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setCompletedModules(parsed.completedModules || {});
        setIsGuidesEnabled(parsed.isGuidesEnabled ?? true);

        // If it's the very first time (no keys), or explicit flag missing
        if (!parsed.hasSeenWelcome) {
          setIsWelcomeOpen(true);
        }
      } catch (e) {
        setIsWelcomeOpen(true);
      }
    } else {
      // First access ever
      setIsWelcomeOpen(true);
    }
  }, []);

  // Persist state helper
  const saveState = useCallback((updates: Partial<{ completedModules: Record<string, boolean>, isGuidesEnabled: boolean, hasSeenWelcome: boolean }>) => {
    const currentState = JSON.parse(localStorage.getItem('vitrinex_onboarding_state') || '{}');
    const newState = { ...currentState, ...updates };
    localStorage.setItem('vitrinex_onboarding_state', JSON.stringify(newState));
  }, []);

  const closeWelcome = useCallback(() => {
    setIsWelcomeOpen(false);
    saveState({ hasSeenWelcome: true });
  }, [saveState]);

  const toggleGuides = useCallback((enabled: boolean) => {
    setIsGuidesEnabled(enabled);
    saveState({ isGuidesEnabled: enabled });
  }, [saveState]);

  const startTutorial = useCallback((moduleId: string, newSteps: TutorialStep[]) => {
    // Only start if guides are enabled AND this module hasn't been completed yet (or if forced, but for now auto-start logic)
    // Warning: logic inside components should check `completedModules` before calling startTutorial to avoid loops, 
    // but we double check here.
    if (!moduleId || !newSteps || !newSteps.length) return;

    // We strictly check the boolean state inside the component calling this, 
    // but the context stores the "active" state.
    setCurrentModuleId(moduleId);
    setSteps(newSteps);
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const skipTutorial = useCallback(() => {
    if (currentModuleId) {
      const newCompleted = { ...completedModules, [currentModuleId]: true };
      setCompletedModules(newCompleted);
      saveState({ completedModules: newCompleted });
    }
    setIsActive(false);
    setCurrentModuleId(null);
  }, [currentModuleId, completedModules, saveState]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      skipTutorial(); // End if it's the last step
    }
  }, [currentStepIndex, steps.length, skipTutorial]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const resetTutorials = useCallback(() => {
    setCompletedModules({});
    saveState({ completedModules: {}, hasSeenWelcome: false });
    setIsWelcomeOpen(true);
    setIsActive(false);
    window.location.reload();
  }, [saveState]);

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        isWelcomeOpen,
        isGuidesEnabled,
        currentStepIndex,
        steps,
        completedModules,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        closeWelcome,
        resetTutorials,
        toggleGuides
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
