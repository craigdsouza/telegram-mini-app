import { useMemo, useState } from 'react';
import viteLogo from '/vite.svg';
import {
  initDataRaw as _initDataRaw,
  initDataState as _initDataState,
  useSignal,
} from '@telegram-apps/sdk-react';
import { Calendar } from '../../components/Calendar/Calendar';


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
  const user = useMemo(() => initDataState?.user, [initDataState]);

  // State for which banner item is selected
  const [selected, setSelected] = useState<'streak' | 'settings'>('streak');

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
      display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f9f9f9'
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: 64, padding: '0 24px', background: '#fff', borderBottom: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <img src={viteLogo} alt="Logo" style={{ width: 40, height: 40, marginRight: 16 }} />
        <span style={{ fontSize: 22, fontWeight: 600, color: '#333' }}>Hi {user.first_name}!</span>
      </div>

      {/* Congratulatory Banner */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
        color: '#155724',
        fontWeight: 600,
        fontSize: 16,
        textAlign: 'center',
        padding: '12px 0',
        boxShadow: '0 2px 8px rgba(67,233,123,0.08)',
        borderBottom: '1px solid #b2f2e5',
        letterSpacing: 0.2,
      }}>
        Congratulations on taking a big step forward towards responsible finance!
      </div>

      {/* Central Large Div */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 0,
        background: '#f9f9f9',
        borderBottom: '1px solid #eee'
      }}>
        {/* Central content goes here (blank for now) */}
        <Calendar />
      </div>

      {/* Bottom Banner */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 64,
        background: '#fff',
        borderTop: '1px solid #eee',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.02)'
      }}>
        <button
          onClick={() => setSelected('streak')}
          style={{
            background: selected === 'streak' ? '#e0f7fa' : 'transparent',
            border: 'none',
            fontSize: 18,
            fontWeight: 500,
            color: selected === 'streak' ? '#00796b' : '#333',
            padding: '8px 24px',
            borderRadius: 12,
            cursor: 'pointer',
            outline: 'none',
            transition: 'background 0.2s'
          }}
        >
          🏆 Streak
        </button>
        <button
          onClick={() => setSelected('settings')}
          style={{
            background: selected === 'settings' ? '#e0f7fa' : 'transparent',
            border: 'none',
            fontSize: 18,
            fontWeight: 500,
            color: selected === 'settings' ? '#00796b' : '#333',
            padding: '8px 24px',
            borderRadius: 12,
            cursor: 'pointer',
            outline: 'none',
            transition: 'background 0.2s'
          }}
        >
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
};
