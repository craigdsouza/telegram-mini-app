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
        
        // First opt in to enable capturing
        posthog.opt_in_capturing();
        
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
        
        hasIdentified.current = true;
        
        // Verify identification worked with multiple checks
        setTimeout(() => {
          const newId = posthog.get_distinct_id();
          console.log('🆔 [POSTHOG_ID] Verification (100ms) - New distinct ID:', newId);
          console.log('🆔 [POSTHOG_ID] Identification successful?', newId === user.id.toString());
        }, 100);
        
        setTimeout(() => {
          const newId = posthog.get_distinct_id();
          console.log('🆔 [POSTHOG_ID] Verification (500ms) - New distinct ID:', newId);
          console.log('🆔 [POSTHOG_ID] Identification successful?', newId === user.id.toString());
          
          if (newId !== user.id.toString()) {
            console.error('🆔 [POSTHOG_ID] IDENTIFICATION FAILED - Still using random ID!');
            console.error('🆔 [POSTHOG_ID] Expected:', user.id.toString(), 'Got:', newId);
          }
        }, 500);
      }, 100);
    }
  }, [posthog, user]);

  return null; // This component doesn't render anything
}; 