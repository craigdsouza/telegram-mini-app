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

  // Identify user when app loads
  useEffect(() => {
    console.log('🔍 [POSTHOG] App level - PostHog instance:', posthog);
    console.log('🔍 [POSTHOG] App level - User data (initDataState):', user);
    console.log('🔍 [POSTHOG] App level - Environment vars:', {
      key: import.meta.env.VITE_PUBLIC_POSTHOG_KEY ? 'present' : 'missing',
      host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST
    });
    
    if (posthog && user?.id) {
      console.log('🔍 [POSTHOG] Attempting to identify user with data:', {
        distinct_id: user.id.toString(),
        properties: {
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username
        }
      });
      
      posthog.identify(user.id.toString());
      
      console.log('✅ [POSTHOG] User identification called for:', user.id.toString());
      console.log('✅ [POSTHOG] Check PostHog dashboard for person profile creation');
      
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
