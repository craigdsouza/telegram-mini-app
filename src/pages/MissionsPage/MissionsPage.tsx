import { useMemo, useState, useEffect } from 'react';
import viteLogo from '/vite.svg';
import {
  initDataRaw as _initDataRaw,
  initDataState as _initDataState,
  useSignal,
} from '@telegram-apps/sdk-react';
import { MissionCard } from '../../components/Missions';

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

interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  featureUnlocked: string;
}

export const MissionsPage = () => {
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);

  // State for mission progress
  const [missionProgress, setMissionProgress] = useState({
    babySteps: 0,
    juniorAnalyst: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Define missions
  const missions: Mission[] = [
    {
      id: 'babySteps',
      title: 'Baby Steps',
      description: 'Record expenses for 3 different days to unlock Calendar View',
      icon: '👶',
      target: 3,
      featureUnlocked: 'Calendar View'
    },
    {
      id: 'juniorAnalyst',
      title: 'Junior Budget Analyst',
      description: 'Use 7 different expense categories to unlock Category View',
      icon: '📊',
      target: 7,
      featureUnlocked: 'Category View'
    }
  ];

  // Fetch mission progress from API
  useEffect(() => {
    if (!initDataRaw || !user) return;
    
    const fetchMissionProgress = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('📱 [FRONTEND] Starting mission progress fetch');
        console.log('📱 [FRONTEND] User data:', user);
        console.log('📱 [FRONTEND] Init data raw length:', initDataRaw?.length);
        
        const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
        const requestUrl = `${apiUrl}/api/user/${user.id}/missions`;
        
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
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('📱 [FRONTEND] Response not ok, error text:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
          
          const data = await response.json();
          console.log('📱 [FRONTEND] Response data:', data);
          
          const progress = {
            babySteps: data.babySteps || 0,
            juniorAnalyst: data.juniorAnalyst || 0
          };
          
          console.log('📱 [FRONTEND] Processed mission progress:', progress);
          setMissionProgress(progress);
          
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          
          if (fetchError.name === 'AbortError') {
            console.error('📱 [FRONTEND] Request was aborted due to timeout');
            throw new Error('Request timeout - please try again');
          } else if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
            console.error('📱 [FRONTEND] Network error:', fetchError.message);
            throw new Error('Network error - please check your connection');
          } else {
            console.error('📱 [FRONTEND] Fetch error:', fetchError);
            throw fetchError;
          }
        }
      } catch (err: any) {
        console.error('📱 [FRONTEND] Error fetching mission progress:', err);
        console.error('📱 [FRONTEND] Error message:', err.message);
        console.error('📱 [FRONTEND] Error stack:', err.stack);
        setError(err.message || 'Failed to load mission progress');
      } finally {
        setLoading(false);
      }
    };

    fetchMissionProgress();
  }, [initDataRaw, user]);

  if (!initDataRaw || !user) {
    return (
      <div style={{
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        background: '#f9f9f9'
      }}>
        <img src={viteLogo} alt="Vite logo" style={{ width: 120, marginBottom: 24 }} />
        <h2 style={{ color: '#e74c3c', fontSize: 24, fontWeight: 600 }}>Error</h2>
        <p style={{ color: '#666', fontSize: 16 }}>Could not get user data from Telegram</p>
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
        borderBottom: '2px solid #ddd', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <img src={viteLogo} alt="Logo" style={{ width: 40, height: 40, marginRight: 16 }} />
        <span style={{ 
          fontSize: 22, 
          fontWeight: 600, 
          color: '#333',
          fontFamily: 'var(--font-primary)',
          letterSpacing: 'var(--tracking-wide)'
        }}>Missions</span>
      </div>

      {/* Welcome Banner */}
      {/* <div style={{
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
        🎯 Complete missions to unlock new features!
      </div> */}

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        background: '#f9f9f9'
      }}>
        {/* User Greeting */}
        <div style={{
          background: '#f9f9f9',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '2px solid #eee'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            color: '#333',
            marginBottom: 8,
            fontFamily: 'var(--font-primary)',
            letterSpacing: 'var(--tracking-wide)',
            lineHeight: 'var(--leading-tight)'
          }}>
            Welcome back, {user.first_name}! 👋
          </h2>
          <p style={{
            margin: 0,
            fontSize: 14,
            color: '#666',
            lineHeight: 'var(--leading-relaxed)',
            fontFamily: 'var(--font-primary)',
            fontWeight: 'var(--font-normal)'
          }}>
            Keep tracking your expenses to unlock a future with more financial certainty!
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#666',
            fontSize: 16,
            fontFamily: 'var(--font-primary)',
            fontWeight: 'var(--font-normal)'
          }}>
            Loading your mission progress...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: 16,
            borderRadius: 8,
            marginBottom: 16,
            border: '1px solid #ffcdd2',
            fontFamily: 'var(--font-primary)',
            fontWeight: 'var(--font-normal)'
          }}>
            Error: {error}
          </div>
        )}

        {/* Missions List */}
        {!loading && !error && (
          <div>
            <h3 style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              color: '#333',
              marginBottom: 16,
              fontFamily: 'var(--font-primary)',
              letterSpacing: 'var(--tracking-wide)',
              lineHeight: 'var(--leading-tight)'
            }}>
              Your Missions
            </h3>
            
            {missions.map((mission) => {
              const progress = missionProgress[mission.id as keyof typeof missionProgress] || 0;
              const isCompleted = progress >= mission.target;
              const isUnlocked = true; // All missions are unlocked for now
              
              return (
                <MissionCard
                  key={mission.id}
                  id={mission.id}
                  title={mission.title}
                  description={mission.description}
                  icon={mission.icon}
                  progress={progress}
                  target={mission.target}
                  isCompleted={isCompleted}
                  isUnlocked={isUnlocked}
                />
              );
            })}
          </div>
        )}

        {/* Motivational Footer */}
        <div style={{
          background: '#f9f9f9',
          borderRadius: 12,
          padding: 20,
          marginTop: 24,
          textAlign: 'center',
          border: '5px solidrgb(255, 233, 143)'
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🚀</div>
          <h4 style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: '#e65100',
            marginBottom: 8,
            fontFamily: 'var(--font-primary)',
            letterSpacing: 'var(--tracking-wide)',
            lineHeight: 'var(--leading-tight)'
          }}>
            Ready to level up?
          </h4>
          <p style={{
            margin: 0,
            fontSize: 14,
            color: '#bf360c',
            lineHeight: 'var(--leading-relaxed)',
            fontFamily: 'var(--font-primary)',
            fontWeight: 'var(--font-normal)'
          }}>
            Start tracking your expenses to unlock powerful features and insights!
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        display: 'flex',
        background: '#fff',
        borderTop: '1px solid #eee',
        padding: '12px 24px'
      }}>
        <button style={{
          flex: 1,
          background: '#2196F3',
          color: '#333',
          border: 'none',
          borderRadius: 8,
          padding: '12px',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          marginRight: 8,
          fontFamily: 'var(--font-primary)',
          letterSpacing: 'var(--tracking-wide)'
        }}>
          📝 Add Expense
        </button>
        <button style={{
          flex: 1,
          background: '#f9f9f9',
          color: '#333',
          border: '2px solid #ddd',
          borderRadius: 8,
          padding: '12px',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          marginLeft: 8,
          fontFamily: 'var(--font-primary)',
          letterSpacing: 'var(--tracking-wide)'
        }}>
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
}; 