import { mockTelegramEnv, emitEvent } from '@telegram-apps/sdk-react';

// It is important, to mock the environment only for development purposes. When building the
// application, import.meta.env.DEV will become false, and the code inside will be tree-shaken,
// so you will not see it in your final bundle.

if (import.meta.env.DEV) {
  // Only run in browser
  if (typeof window !== 'undefined' && window.localStorage) {
    let user = undefined;
    try {
      const stored = window.localStorage.getItem('tma-dev-user');
      console.log('[DEV] mockEnv.ts stored:', stored);
      if (stored) {
        user = JSON.parse(stored);
        console.log('[DEV] mockEnv.ts using user from localStorage:', user);
      }
    } catch (e) {
      console.warn('[DEV] mockEnv.ts failed to parse tma-dev-user:', e);
    }
    if (!user) {
      user = { id: 1, first_name: 'Vladislav' };
      console.log('[DEV] mockEnv.ts using default user:', user);
    }

    const themeParams = {
      accent_text_color: '#6ab2f2',
      bg_color: '#17212b',
      button_color: '#5288c1',
      button_text_color: '#ffffff',
      destructive_text_color: '#ec3942',
      header_bg_color: '#17212b',
      hint_color: '#708499',
      link_color: '#6ab3f3',
      secondary_bg_color: '#232e3c',
      section_bg_color: '#17212b',
      section_header_text_color: '#6ab3f3',
      subtitle_text_color: '#708499',
      text_color: '#f5f5f5',
    } as const;
    const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;

    try {
      mockTelegramEnv({
        onEvent(e) {
          if (e[0] === 'web_app_request_theme') {
            return emitEvent('theme_changed', { theme_params: themeParams });
          }
          if (e[0] === 'web_app_request_viewport') {
            return emitEvent('viewport_changed', {
              height: window.innerHeight,
              width: window.innerWidth,
              is_expanded: true,
              is_state_stable: true,
            });
          }
          if (e[0] === 'web_app_request_content_safe_area') {
            return emitEvent('content_safe_area_changed', noInsets);
          }
          if (e[0] === 'web_app_request_safe_area') {
            return emitEvent('safe_area_changed', noInsets);
          }
        },
        launchParams: new URLSearchParams([
          ['tgWebAppThemeParams', JSON.stringify(themeParams)],
          ['tgWebAppData', new URLSearchParams([
            ['auth_date', (new Date().getTime() / 1000 | 0).toString()],
            ['hash', 'some-hash'],
            ['signature', 'some-signature'],
            ['user', JSON.stringify(user)],
          ]).toString()],
          ['tgWebAppVersion', '8.4'],
          ['tgWebAppPlatform', 'tdesktop'],
        ]),
      });
      console.log('[DEV] mockEnv.ts is running');
    } catch (err) {
      console.error('[DEV] mockEnv.ts failed to set up mockTelegramEnv:', err);
    }
    console.info(
      '⚠️ As long as the current environment was not considered as the Telegram-based one, it was mocked. Take a note, that you should not do it in production and current behavior is only specific to the development process. Environment mocking is also applied only in development mode. So, after building the application, you will not see this behavior and related warning, leading to crashing the application outside Telegram.',
    );
  } else {
    console.warn('[DEV] mockEnv.ts: window or localStorage not available. Skipping Telegram mock.');
  }
}
