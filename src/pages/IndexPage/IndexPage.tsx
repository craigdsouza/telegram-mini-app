import { useEffect, useState } from 'react';
import viteLogo from '/vite.svg';
import { retrieveLaunchParams } from '@telegram-apps/sdk';

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

interface User {
  id: number;
  telegram_user_id: number;
  first_name: string;
  last_name: string;
  created_at: string;
  last_active: string;
}

export const IndexPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('🔍 Starting to fetch user data with server validation...');
        
        // Get init data from Telegram SDK
        const { initDataRaw } = retrieveLaunchParams();
        console.log('🔍 Init data raw:', initDataRaw);
        
        if (!initDataRaw) {
          setError('Could not get init data from Telegram');
          setLoading(false);
          return;
        }

        // Send init data to our API for validation
        const apiUrl = 'https://telegram-api-production-b3ef.up.railway.app/api/user/validate';
        console.log('🔗 Calling API for validation:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `tma ${initDataRaw}`
          }
        });
        
        console.log('📡 API response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `API request failed: ${response.status}`);
        }
        
        const userData: User = await response.json();
        console.log('✅ Validated user data from API:', userData);
        setUser(userData);
      } catch (err) {
        console.error('❌ Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f9f9f9'
      }}>
        <img src={viteLogo} alt="Vite logo" style={{ width: 120, marginBottom: 24 }} />
        <h2 style={{ color: '#333', fontSize: 24, fontWeight: 600 }}>Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f9f9f9'
      }}>
        <img src={viteLogo} alt="Vite logo" style={{ width: 120, marginBottom: 24 }} />
        <h2 style={{ color: '#e74c3c', fontSize: 24, fontWeight: 600 }}>Error</h2>
        <p style={{ color: '#666', fontSize: 16 }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f9f9f9'
    }}>
      <img src={viteLogo} alt="Vite logo" style={{ width: 120, marginBottom: 24 }} />
      <h1 style={{ color: '#333', fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
        Hi {user?.first_name || 'there'}! 👋
      </h1>
      <p style={{ color: '#888', fontSize: 16, marginBottom: 32 }}>
        Welcome to your expense tracking app
      </p>
      <p style={{ color: '#888', fontSize: 16, marginBottom: 32 }}>
        Exciting things coming soon!
      </p>
      <div style={{ color: '#666', fontSize: 14, textAlign: 'center' }}>
        <p>User ID: {user?.telegram_user_id}</p>
        <p>Member since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</p>
      </div>
    </div>
  );
};
