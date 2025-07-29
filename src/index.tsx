// Include Telegram UI styles first to allow our code override the package CSS.
import '@telegram-apps/telegram-ui/dist/styles.css';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { Root } from '@/components/Root.tsx';
import { init } from '@/init.ts';
import { PostHogProvider } from 'posthog-js/react'

import './index.css';

// Mock the environment in case, we are outside Telegram.
import './mockEnv.ts';

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  debug: true, // Enable PostHog debug mode to see more details
  // Try default persistence with explicit configuration
  persistence: 'localStorage+cookie' as const, // Use default persistence
  cookie_domain: '.railway.app', // Explicitly set for Railway subdomains
  loaded: (posthog: any) => {
    console.log('🎉 [POSTHOG] PostHog loaded callback triggered');
    console.log('🎉 [POSTHOG] Current distinct ID after load:', posthog.get_distinct_id());
    console.log('🎉 [POSTHOG] Current URL:', window.location.href);
    console.log('🎉 [POSTHOG] Current domain:', window.location.hostname);
    console.log('🎉 [POSTHOG] PostHog config:', {
      api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
      persistence: 'localStorage+cookie',
      cookie_domain: '.railway.app'
    });
  }
}

const root = ReactDOM.createRoot(document.getElementById('root')!);

try {
  const launchParams = retrieveLaunchParams();
  const { tgWebAppPlatform: platform } = launchParams;
  const debug = (launchParams.tgWebAppStartParam || '').includes('platformer_debug')
    || import.meta.env.DEV;

  // Configure all application dependencies.
  await init({
    debug,
    eruda: debug && ['ios', 'android'].includes(platform),
    mockForMacOS: platform === 'macos',
  })
    .then(() => {
      root.render(
        <StrictMode>
          <PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY} options={options}>
            <Root/>
          </PostHogProvider>
        </StrictMode>,
      );
    });
} catch (e) {
  root.render(<EnvUnsupported/>);
}
