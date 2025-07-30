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
      
      // Get current distinct ID
      const currentId = posthog.get_distinct_id();
      console.log('🆔 [POSTHOG_ID] Current distinct ID:', currentId);
      
      // Only identify if we haven't already or if the ID is different
      if (currentId !== user.id.toString()) {
        console.log('🆔 [POSTHOG_ID] Identifying user with Telegram ID:', user.id.toString());
        
        // Reset and identify
        posthog.reset();
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
        }, 200);
      } else {
        console.log('🆔 [POSTHOG_ID] User already identified with correct ID');
        hasIdentified.current = true;
      }
    }
  }, [posthog, user]);

  return null; // This component doesn't render anything
}; 