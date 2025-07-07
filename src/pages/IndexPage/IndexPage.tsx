import { useMemo } from 'react';
import viteLogo from '/vite.svg';
import {
  initDataRaw as _initDataRaw,
  initDataState as _initDataState,
  useSignal,
} from '@telegram-apps/sdk-react';

// TypeScript declaration for Telegram WebApp API
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
          };
        };
      };
    };
  }
}

export const IndexPage = () => {
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);

  // Memoize user data
  const user = useMemo(() => initDataState?.user, [initDataState]);

  if (!initDataRaw || !user) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f9f9f9'
      }}>
        <img src={viteLogo} alt="Vite logo" style={{ width: 120, marginBottom: 24 }} />
        <h2 style={{ color: '#e74c3c', fontSize: 24, fontWeight: 600 }}>Error</h2>
        <p style={{ color: '#666', fontSize: 16 }}>Could not get user data from Telegram</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f9f9f9'
    }}>
      <img src={viteLogo} alt="Vite logo" style={{ width: 120, marginBottom: 24 }} />
      <h1 style={{ color: '#333', fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
        Hi {user.first_name || 'there'}! 👋
      </h1>
      <p style={{ color: '#888', fontSize: 16, marginBottom: 32 }}>
        Welcome to your expense tracking app
      </p>
      <div style={{ color: '#666', fontSize: 14, textAlign: 'center' }}>
        <p>User ID: {user.id}</p>
        <p>Username: {user.username || 'N/A'}</p>
      </div>
    </div>
  );
};
