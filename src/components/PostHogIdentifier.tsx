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
      console.log('🆔 [POSTHOG_ID] Starting minimal user identification...');
      console.log('🆔 [POSTHOG_ID] User data:', user);
      
      // Minimal identification approach - no reset, no opt_out/opt_in cycle
      console.log('🆔 [POSTHOG_ID] Identifying user with Telegram ID:', user.id.toString());
      posthog.identify(user.id.toString(), {
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        telegram_id: user.id.toString(),
        platform: 'telegram_mini_app',
        source: 'telegram_webapp'
      });
      
      hasIdentified.current = true;
      
      // Verify identification worked
      setTimeout(() => {
        const newId = posthog.get_distinct_id();
        console.log('🆔 [POSTHOG_ID] Verification - New distinct ID:', newId);
        console.log('🆔 [POSTHOG_ID] Identification successful?', newId === user.id.toString());
        
        if (newId !== user.id.toString()) {
          console.error('🆔 [POSTHOG_ID] IDENTIFICATION FAILED - Still using random ID!');
          console.error('🆔 [POSTHOG_ID] Expected:', user.id.toString(), 'Got:', newId);
        } else {
          console.log('🆔 [POSTHOG_ID] Identification successful! Events should now work in real-time.');
          
          // Test event to verify real-time sending
          console.log('🆔 [POSTHOG_ID] Testing real-time event...');
          posthog.capture('minimal_identification_test', {
            user_id: user.id.toString(),
            test_type: 'minimal_approach',
            timestamp: new Date().toISOString()
          });
        }
      }, 100);
    }
  }, [posthog, user]);

  return null; // This component doesn't render anything
}; 