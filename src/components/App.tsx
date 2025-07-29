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
    if (posthog && user?.id) {
      console.log('🔍 [POSTHOG] Identifying user immediately:', user.id.toString());
      posthog.identify(user.id.toString(), {
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username
      });
      console.log('✅ [POSTHOG] User identification completed for:', user.id.toString());
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
