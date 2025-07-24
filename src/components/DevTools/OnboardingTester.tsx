import { useMemo } from 'react';
import { initDataRaw as _initDataRaw, useSignal } from '@telegram-apps/sdk-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { ONBOARDING_STEPS } from '@/config/onboarding';
import './OnboardingTester.css';

export const OnboardingTester: React.FC = () => {
  const initDataRaw = useSignal(_initDataRaw);
  const user = useMemo(() => {
    // Get user from initDataRaw if available
    try {
      if (initDataRaw) {
        const decoded = decodeURIComponent(String(initDataRaw));
        const params = new URLSearchParams(decoded);
        const userStr = params.get('user');
        if (userStr) {
          return JSON.parse(userStr);
        }
      }
    } catch (e) {
      console.error('Error parsing user from initDataRaw:', e);
    }
    return null;
  }, [initDataRaw]);

  const { progress, currentStep, isComplete, progressPercentage, completeStep } = useOnboarding();

  const resetOnboarding = async () => {
    if (!user?.id) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
      const requestUrl = `${apiUrl}/api/user/${user.id}/onboarding`;
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `tma ${initDataRaw}`,
          ...(import.meta.env.DEV ? { 'X-Dev-Bypass': 'true' } : {})
        },
        body: JSON.stringify({ 
          action: 'reset',
          progress: {
            current_step: 0,
            completed_steps: [],
            total_steps: ONBOARDING_STEPS.length,
            step_data: {}
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      console.log('🎯 [ONBOARDING] Reset to beginning');
      window.location.reload(); // Refresh to trigger onboarding flow
      
    } catch (error) {
      console.error('🎯 [ONBOARDING] Error resetting onboarding:', error);
    }
  };

  const completeAllSteps = async () => {
    if (!user?.id) return;
    
    try {
      // Complete all steps sequentially
      for (const step of ONBOARDING_STEPS) {
        await completeStep(step.id, { test_completed: true });
      }
      console.log('🎯 [ONBOARDING] All steps completed');
      window.location.reload();
    } catch (error) {
      console.error('🎯 [ONBOARDING] Error completing all steps:', error);
    }
  };

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  const currentStepInfo = ONBOARDING_STEPS.find(step => step.id === currentStep);

  return (
    <div className="onboarding-tester">
      <h3 className="onboarding-tester-title">🧪 Onboarding Dev Tools</h3>
      
      <div className="onboarding-tester-status">
        <p><strong>Status:</strong> {isComplete ? 'Complete' : 'In Progress'}</p>
        <p><strong>Progress:</strong> {progressPercentage.toFixed(1)}%</p>
        <p><strong>Current Step:</strong> {currentStepInfo?.title || `Step ${currentStep}`}</p>
        <p><strong>Step:</strong> {currentStep + 1} of {ONBOARDING_STEPS.length}</p>
      </div>

      <div className="onboarding-tester-actions">
        <button 
          onClick={resetOnboarding}
          className="onboarding-tester-btn onboarding-tester-reset-btn"
        >
          Reset to Start
        </button>
        
        <button 
          onClick={completeAllSteps}
          className="onboarding-tester-btn onboarding-tester-complete-btn"
        >
          Complete All Steps
        </button>
      </div>

      <div className="onboarding-tester-steps">
        <h4>Step Navigation:</h4>
        {ONBOARDING_STEPS.map((step) => (
          <div key={step.id} className="onboarding-tester-step">
            <span className={`onboarding-tester-step-indicator ${currentStep === step.id ? 'current' : ''} ${progress?.completed_steps.includes(step.id) ? 'completed' : ''}`}>
              {step.id + 1}
            </span>
            <span className="onboarding-tester-step-title">{step.title}</span>
            <div className="onboarding-tester-step-actions">
              <button 
                onClick={() => completeStep(step.id, { test_completed: true })}
                className="onboarding-tester-step-btn"
                disabled={progress?.completed_steps.includes(step.id)}
              >
                Complete
              </button>
            </div>
          </div>
        ))}
      </div>

      {progress && (
        <div className="onboarding-tester-debug">
          <details>
            <summary>Debug Info</summary>
            <pre>{JSON.stringify(progress, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}; 