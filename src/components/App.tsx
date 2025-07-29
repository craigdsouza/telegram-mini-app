import { useMemo, useEffect } from 'react';
import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { retrieveLaunchParams, useSignal, isMiniAppDark } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { usePostHog } from 'posthog-js/react';

import { routes } from '@/navigation/routes.tsx';
import { UserProvider } from '@/contexts/UserContext';

export function App() {
  const lp = useMemo(() => retrieveLaunchParams(), []);
  const isDark = useSignal(isMiniAppDark);
  const posthog = usePostHog();

  // Identify user when app loads
  useEffect(() => {
    console.log('🔍 [POSTHOG] App level - PostHog instance:', posthog);
    console.log('🔍 [POSTHOG] App level - User data:', lp.user);
    console.log('🔍 [POSTHOG] App level - Environment vars:', {
      key: import.meta.env.VITE_PUBLIC_POSTHOG_KEY ? 'present' : 'missing',
      host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST
    });
    
    const user = lp.user as any;
    if (posthog && user?.id) {
      posthog.identify(user.id.toString(), {
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username
      });
      console.log('✅ [POSTHOG] User identified at app level:', user.id, user.first_name);
    } else if (posthog && !user?.id) {
      console.log('⏳ [POSTHOG] Waiting for user data...');
      // Retry after a short delay
      const timer = setTimeout(() => {
        const retryUser = lp.user as any;
        if (retryUser?.id) {
          console.log('🔍 [POSTHOG] Retrying user identification...');
          posthog.identify(retryUser.id.toString(), {
            first_name: retryUser.first_name,
            last_name: retryUser.last_name,
            username: retryUser.username
          });
          console.log('✅ [POSTHOG] User identified on retry:', retryUser.id, retryUser.first_name);
        }
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      console.warn('⚠️ [POSTHOG] Cannot identify user:', { posthog: !!posthog, userId: user?.id });
    }
  }, [posthog, lp.user]);

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
