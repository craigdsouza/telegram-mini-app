import { useMemo, useEffect } from 'react';
import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { retrieveLaunchParams, useSignal, isMiniAppDark, initDataState as _initDataState } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { usePostHog } from 'posthog-js/react';

import { routes } from '@/navigation/routes.tsx';
import { UserProvider } from '@/contexts/UserContext';
import { PostHogIdentifier } from './PostHogIdentifier';

export function App() {
  const lp = useMemo(() => retrieveLaunchParams(), []);
  const isDark = useSignal(isMiniAppDark);
  const posthog = usePostHog();
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);



  // Basic PostHog status logging
  useEffect(() => {
    if (posthog && user?.id) {
      console.log('        [POSTHOG APP] App level - PostHog ready with user:', user.id);
    } else if (posthog && !user?.id) {
      console.log('        [POSTHOG APP] App level - Waiting for user data...');
    }
  }, [posthog, user]);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <UserProvider>
        <PostHogIdentifier />
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
