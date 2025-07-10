import { useMemo, useState, useEffect } from 'react';
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

  // State for calendar entry dates
  const [entryDates, setEntryDates] = useState<number[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [datesError, setDatesError] = useState<string | null>(null);

  useEffect(() => {
    if (!initDataRaw || !user) return;
    const fetchEntryDates = async () => {
      console.log('📱 [FRONTEND] Starting calendar data fetch');
      console.log('📱 [FRONTEND] User data:', user);
      console.log('📱 [FRONTEND] Init data raw length:', initDataRaw?.length);
      
      setLoadingDates(true);
      setDatesError(null);
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1; // JS months are 0-based, API expects 1-based
        
        console.log('📱 [FRONTEND] Date parameters:', { year, month });
        
        const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
        const requestUrl = `${apiUrl}/api/user/${user.id}/expenses/dates?year=${year}&month=${month}`;
        
        console.log('📱 [FRONTEND] Request URL:', requestUrl);
        console.log('📱 [FRONTEND] Authorization header present:', !!initDataRaw);
        
        const startTime = Date.now();
        console.log('📱 [FRONTEND] Starting fetch request at:', new Date(startTime).toISOString());
        
        // Create an AbortController for timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('📱 [FRONTEND] Request timeout after 30 seconds');
          controller.abort();
        }, 30000); // 30 second timeout
        
        try {
          const response = await fetch(requestUrl, {
            headers: {
              Authorization: `tma ${initDataRaw}`,
              ...(import.meta.env.DEV ? { 'X-Dev-Bypass': 'true' } : {})
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          const endTime = Date.now();
          const duration = endTime - startTime;
          console.log('📱 [FRONTEND] Fetch completed in:', duration, 'ms');
          console.log('📱 [FRONTEND] Response status:', response.status);
          console.log('📱 [FRONTEND] Response ok:', response.ok);
          console.log('📱 [FRONTEND] Response headers:', Object.fromEntries(response.headers.entries()));
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('📱 [FRONTEND] Response not ok, error text:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
          
          const data = await response.json();
          console.log('📱 [FRONTEND] Response data:', data);
          console.log('📱 [FRONTEND] Days array:', data.days);
          console.log('📱 [FRONTEND] Days array type:', typeof data.days);
          console.log('📱 [FRONTEND] Days array is array:', Array.isArray(data.days));
          
          const processedDays = Array.isArray(data.days) ? data.days : [];
          console.log('📱 [FRONTEND] Processed days:', processedDays);
          
          setEntryDates(processedDays);
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          
          if (fetchError.name === 'AbortError') {
            console.error('📱 [FRONTEND] Request was aborted due to timeout');
            setDatesError('Request timeout - please try again');
          } else if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
            console.error('📱 [FRONTEND] Network error:', fetchError.message);
            setDatesError('Network error - please check your connection');
          } else {
            console.error('📱 [FRONTEND] Fetch error:', fetchError);
            setDatesError(fetchError.message || 'Unknown error');
          }
        } finally {
          setLoadingDates(false);
        }
      } catch (err: any) {
        console.error('📱 [FRONTEND] Error fetching calendar data:', err);
        console.error('📱 [FRONTEND] Error message:', err.message);
        console.error('📱 [FRONTEND] Error stack:', err.stack);
        setDatesError(err.message || 'Unknown error');
      }
    };
    fetchEntryDates();
  }, [initDataRaw, user]);

  if (!initDataRaw || !user) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f9f9f9',
        letterSpacing: 0.2,
      }}>
        <img src={viteLogo} alt="Vite logo" style={{ width: 120, marginBottom: 24 }} />
        <h2 style={{ 
          color: '#e74c3c', 
          fontSize: 24, 
          fontWeight: 600,
          fontFamily: 'var(--font-primary)',
          letterSpacing: 'var(--tracking-wide)'
        }}>Error</h2>
        <p style={{ 
          color: '#666', 
          fontSize: 16,
          fontFamily: 'var(--font-primary)',
          fontWeight: 'var(--font-normal)'
        }}>Could not get user data from Telegram</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: '#f9f9f9'
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 64,
        padding: '0 24px',
        background: '#fff',
        borderBottom: '1px solid #eee',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        letterSpacing: 0.2,
      }}>
        <img src={viteLogo} alt="Logo" style={{ width: 40, height: 40, marginRight: 16 }} />
        <span style={{ 
          fontSize: 22, 
          fontWeight: 600, 
          color: '#333',
          fontFamily: 'var(--font-primary)',
          letterSpacing: 'var(--tracking-wide)'
        }}>Hi {user.first_name}!</span>
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
        letterSpacing: 'var(--tracking-wide)',
        fontFamily: 'var(--font-primary)'
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
        {loadingDates ? (
          <div style={{ color: '#888', fontSize: 16 }}>Loading calendar...</div>
        ) : datesError ? (
          <div style={{ color: '#e74c3c', fontSize: 16 }}>Error loading calendar: {datesError}</div>
        ) : (
          <Calendar entryDates={entryDates} />
        )}
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
