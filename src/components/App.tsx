import { useMemo, useEffect } from 'react';
import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { retrieveLaunchParams, useSignal, isMiniAppDark, initDataState as _initDataState } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { usePostHog } from 'posthog-js/react';

import { routes } from '@/navigation/routes.tsx';
import { UserProvider } from '@/contexts/UserContext';

export function App() {
  const lp = useMemo(() => retrieveLaunchParams(), []);
  const isDark = useSignal(isMiniAppDark);
  const posthog = usePostHog();
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);

  // Identify user as soon as possible
  useEffect(() => {
    console.log('🔍 [POSTHOG] App level - PostHog instance:', posthog);
    console.log('🔍 [POSTHOG] App level - User data (initDataState):', user);
    console.log('🔍 [POSTHOG] App level - Environment vars:', {
      key: import.meta.env.VITE_PUBLIC_POSTHOG_KEY ? 'present' : 'missing',
      host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST
    });
    
    if (posthog && user?.id) {
      console.log('🔍 [POSTHOG] Identifying user immediately:', user.id.toString());
      
      // Get distinct ID before identification
      console.log('🔍 [POSTHOG] Distinct ID BEFORE identification:', posthog.get_distinct_id());
      
      posthog.identify(user.id.toString(), {
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username
      });
      
      console.log('✅ [POSTHOG] User identification completed for:', user.id.toString());
      
      // Check distinct ID after a short delay to allow processing
      setTimeout(() => {
        console.log('🔍 [POSTHOG] Distinct ID AFTER identification (delayed):', posthog.get_distinct_id());
      }, 100);
      
      // Also check immediately
      console.log('🔍 [POSTHOG] Distinct ID AFTER identification (immediate):', posthog.get_distinct_id());
      
    } else if (posthog && !user?.id) {
      console.log('⏳ [POSTHOG] Waiting for user data...');
    } else {
      console.warn('⚠️ [POSTHOG] Cannot identify user:', { posthog: !!posthog, userId: user?.id });
    }
  }, [posthog, user]);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <UserProvider>
        <HashRouter>
          <Routes>
            {routes.map((route) => <Route key={route.path} {...route} />)}
            <Route path="*" element={<Navigate to="/"/>}/>
          </Routes>
        </HashRouter>
      </UserProvider>
    </AppRoot>
  );
}
