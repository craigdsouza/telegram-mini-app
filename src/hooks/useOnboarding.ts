import { useState, useEffect } from 'react';
import { initDataState as _initDataState, initDataRaw as _initDataRaw, useSignal } from '@telegram-apps/sdk-react';
import { OnboardingProgress, isOnboardingComplete, getProgressPercentage } from '@/config/onboarding';

export interface OnboardingStatus {
  loading: boolean;
  error: string | null;
  progress: OnboardingProgress | null;
  currentStep: number;
  isComplete: boolean;
  progressPercentage: number;
  checkProgress: () => Promise<void>;
  completeStep: (stepId: number, stepData?: any) => Promise<void>;
  goToStep: (stepId: number) => Promise<void>;
}

export const useOnboarding = (): OnboardingStatus => {
  const initDataState = useSignal(_initDataState);
  const initDataRaw = useSignal(_initDataRaw);
  const user = initDataState?.user;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);

  const checkProgress = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
      const requestUrl = `${apiUrl}/api/user/${user.id}/onboarding`;
      
      console.log('🎯 [ONBOARDING] Checking progress from:', requestUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        const response = await fetch(requestUrl, {
          headers: {
            Authorization: `tma ${initDataRaw || ''}`,
            ...(import.meta.env.DEV ? { 'X-Dev-Bypass': 'true' } : {})
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        
        const data = await response.json();
        console.log('🎯 [ONBOARDING] Progress response:', data);
        
        setProgress(data.onboarding);
        
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        console.error('🎯 [ONBOARDING] Error checking progress:', fetchError);
        setError(fetchError.message || 'Failed to check onboarding progress');
      }
    } catch (err: any) {
      console.error('🎯 [ONBOARDING] Unexpected error:', err);
      setError(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const completeStep = async (stepId: number, stepData: any = {}) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
      const requestUrl = `${apiUrl}/api/user/${user.id}/onboarding`;
      
      console.log('🎯 [ONBOARDING] Completing step:', stepId, stepData);
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `tma ${initDataRaw || ''}`,
          ...(import.meta.env.DEV ? { 'X-Dev-Bypass': 'true' } : {})
        },
        body: JSON.stringify({ 
          action: 'complete', 
          step: stepId,
          stepData 
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      console.log('🎯 [ONBOARDING] Step completed:', data);
      
      // Update local progress
      if (data.user?.onboarding_progress) {
        setProgress(data.user.onboarding_progress);
      }
      
    } catch (error) {
      console.error('🎯 [ONBOARDING] Error completing step:', error);
      setError(error instanceof Error ? error.message : 'Failed to complete step');
    } finally {
      setLoading(false);
    }
  };

  const goToStep = async (stepId: number) => {
    if (!user?.id || !progress) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
      const requestUrl = `${apiUrl}/api/user/${user.id}/onboarding`;
      
      console.log('🎯 [ONBOARDING] Going to step:', stepId);
      
      // Update progress to set current_step
      const updatedProgress = {
        ...progress,
        current_step: stepId
      };
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `tma ${initDataRaw || ''}`,
          ...(import.meta.env.DEV ? { 'X-Dev-Bypass': 'true' } : {})
        },
        body: JSON.stringify({ 
          action: 'update', 
          progress: updatedProgress 
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      console.log('🎯 [ONBOARDING] Step navigation completed:', data);
      
      // Update local progress
      if (data.user?.onboarding_progress) {
        setProgress(data.user.onboarding_progress);
      }
      
    } catch (error) {
      console.error('🎯 [ONBOARDING] Error navigating to step:', error);
      setError(error instanceof Error ? error.message : 'Failed to navigate to step');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkProgress();
  }, [user?.id, initDataRaw]);

  return {
    loading,
    error,
    progress,
    currentStep: progress?.current_step || 0,
    isComplete: progress ? isOnboardingComplete(progress) : false,
    progressPercentage: progress ? getProgressPercentage(progress) : 0,
    checkProgress,
    completeStep,
    goToStep
  };
}; 