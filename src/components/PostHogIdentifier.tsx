import { useEffect, useRef } from 'react';
import { usePostHog } from 'posthog-js/react';
import { initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';

export const PostHogIdentifier: React.FC = () => {
  const posthog = usePostHog();
  const initDataState = useSignal(_initDataState);
  const user = initDataState?.user;
  const hasIdentified = useRef(false);

  useEffect(() => {
    if (posthog && user?.id && !hasIdentified.current) {
      console.log('🆔 [POSTHOG_ID] Starting user identification...');
      console.log('🆔 [POSTHOG_ID] User data:', user);
      
      // Force a complete reset and re-identification
      console.log('🆔 [POSTHOG_ID] Force resetting PostHog...');
      posthog.reset();
      
      // Wait a bit for reset to complete, then identify
      setTimeout(() => {
        console.log('🆔 [POSTHOG_ID] Setting up user identification...');
        
        // First opt in to enable capturing and autocapture
        posthog.opt_in_capturing();
        console.log('🆔 [POSTHOG_ID] Enabled capturing and autocapture');
        
        // Now identify with Telegram ID
        console.log('🆔 [POSTHOG_ID] Identifying user with Telegram ID:', user.id.toString());
        posthog.identify(user.id.toString(), {
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          telegram_id: user.id.toString(),
          platform: 'telegram_mini_app',
          source: 'telegram_webapp'
        });
        
        // Add delay after identify to ensure PostHog's internal state is ready
        // This is the fix suggested by PostHog support for batching issues
        setTimeout(() => {
          console.log('🆔 [POSTHOG_ID] PostHog internal state should now be ready (150ms delay)');
          hasIdentified.current = true;
        }, 150);
        
        // Verify identification worked with multiple checks
        setTimeout(() => {
          const newId = posthog.get_distinct_id();
          console.log('🆔 [POSTHOG_ID] Verification (250ms) - New distinct ID:', newId);
          console.log('🆔 [POSTHOG_ID] Identification successful?', newId === user.id.toString());
        }, 250);
        
        setTimeout(() => {
          const newId = posthog.get_distinct_id();
          console.log('🆔 [POSTHOG_ID] Verification (650ms) - New distinct ID:', newId);
          console.log('🆔 [POSTHOG_ID] Identification successful?', newId === user.id.toString());
          
          if (newId !== user.id.toString()) {
            console.error('🆔 [POSTHOG_ID] IDENTIFICATION FAILED - Still using random ID!');
            console.error('🆔 [POSTHOG_ID] Expected:', user.id.toString(), 'Got:', newId);
          } else {
            // Test autocapture by sending a test event
            console.log('🆔 [POSTHOG_ID] Testing autocapture with a test event...');
            posthog.capture('autocapture_test', {
              user_id: user.id.toString(),
              test_type: 'autocapture_verification'
            });
            
            // Test our custom event
            console.log('🆔 [POSTHOG_ID] Testing custom event...');
            posthog.capture('test_custom_event', {
              user_id: user.id.toString(),
              test_type: 'custom_event_verification',
              timestamp: new Date().toISOString()
            });
          }
        }, 500);
      }, 100);
    }
  }, [posthog, user]);

  return null; // This component doesn't render anything
}; 