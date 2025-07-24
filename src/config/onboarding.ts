export interface OnboardingStep {
  id: number;
  key: string;
  title: string;
  description: string;
  component: string; // Route or component name
  required: boolean;
  skipable: boolean;
  estimatedTime?: number; // in seconds
}

export interface OnboardingProgress {
  current_step: number;
  completed_steps: number[];
  total_steps: number;
  step_data: Record<string, any>;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 0,
    key: 'welcome',
    title: 'Welcome',
    description: 'Get started with your expense tracking journey',
    component: 'WelcomePage',
    required: true,
    skipable: false,
    estimatedTime: 30
  },
  {
    id: 1,
    key: 'pledge',
    title: 'Take the Pledge',
    description: 'Commit to financial responsibility',
    component: 'PledgePage',
    required: true,
    skipable: false,
    estimatedTime: 45
  }
];

// Helper functions for working with onboarding steps
export const getStepByKey = (key: string): OnboardingStep | undefined => {
  return ONBOARDING_STEPS.find(step => step.key === key);
};

export const getStepById = (id: number): OnboardingStep | undefined => {
  return ONBOARDING_STEPS.find(step => step.id === id);
};

export const getCurrentStep = (progress: OnboardingProgress): OnboardingStep | undefined => {
  return getStepById(progress.current_step);
};

export const getNextStep = (progress: OnboardingProgress): OnboardingStep | undefined => {
  const nextId = progress.current_step + 1;
  return getStepById(nextId);
};

export const getPreviousStep = (progress: OnboardingProgress): OnboardingStep | undefined => {
  const prevId = progress.current_step - 1;
  return prevId >= 0 ? getStepById(prevId) : undefined;
};

export const isStepCompleted = (progress: OnboardingProgress, stepId: number): boolean => {
  return progress.completed_steps.includes(stepId);
};

export const isOnboardingComplete = (progress: OnboardingProgress): boolean => {
  const requiredSteps = ONBOARDING_STEPS.filter(step => step.required);
  return requiredSteps.every(step => isStepCompleted(progress, step.id));
};

export const getProgressPercentage = (progress: OnboardingProgress): number => {
  const completedRequired = ONBOARDING_STEPS
    .filter(step => step.required && isStepCompleted(progress, step.id))
    .length;
  const totalRequired = ONBOARDING_STEPS.filter(step => step.required).length;
  return totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0;
};

export const getEstimatedTimeRemaining = (progress: OnboardingProgress): number => {
  const remainingSteps = ONBOARDING_STEPS
    .filter(step => step.id >= progress.current_step && step.required && !isStepCompleted(progress, step.id));
  return remainingSteps.reduce((total, step) => total + (step.estimatedTime || 0), 0);
}; 