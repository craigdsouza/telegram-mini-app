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
  // Use default persistence with custom domain
  persistence: 'localStorage+cookie' as const, // Use default persistence
  cookie_domain: '.craigdsouza.in', // Replace with your actual domain
  loaded: (posthog: any) => {
    console.log('🎉 [POSTHOG] PostHog loaded callback triggered');
    console.log('🎉 [POSTHOG] Current distinct ID after load:', posthog.get_distinct_id());
    console.log('🎉 [POSTHOG] Current URL:', window.location.href);
    console.log('🎉 [POSTHOG] Current domain:', window.location.hostname);
    console.log('🎉 [POSTHOG] PostHog config:', {
      api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
      persistence: 'localStorage+cookie',
      cookie_domain: '.craigdsouza.in'
    });
  }
}

// Enhanced domain debugging logs
console.log('🌐 [DOMAIN DEBUG] Mini app starting...');
console.log('🌐 [DOMAIN DEBUG] Current window.location:', {
  href: window.location.href,
  hostname: window.location.hostname,
  protocol: window.location.protocol,
  pathname: window.location.pathname,
  search: window.location.search,
  hash: window.location.hash
});
console.log('🌐 [DOMAIN DEBUG] Expected custom domain: finance.craigdsouza.in');
console.log('🌐 [DOMAIN DEBUG] Expected Railway domain: telegram-mini-app-production-8aae.up.railway.app');
console.log('🌐 [DOMAIN DEBUG] Is custom domain?', window.location.hostname === 'finance.craigdsouza.in');
console.log('🌐 [DOMAIN DEBUG] Is Railway domain?', window.location.hostname === 'telegram-mini-app-production-8aae.up.railway.app');
console.log('🌐 [DOMAIN DEBUG] User agent:', navigator.userAgent);
console.log('🌐 [DOMAIN DEBUG] Referrer:', document.referrer);

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
