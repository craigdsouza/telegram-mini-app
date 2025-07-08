import React, { useMemo, useState, useEffect } from 'react';
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
        // For now, we'll use mock data until the API is implemented
        // TODO: Replace with actual API call
        const mockProgress = {
          babySteps: 1, // Mock: user has recorded expenses for 1 day
          juniorAnalyst: 3 // Mock: user has used 3 different categories
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setMissionProgress(mockProgress);
      } catch (err: any) {
        console.error('Error fetching mission progress:', err);
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
        borderBottom: '1px solid #eee', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <img src={viteLogo} alt="Logo" style={{ width: 40, height: 40, marginRight: 16 }} />
        <span style={{ fontSize: 22, fontWeight: 600, color: '#333' }}>Missions</span>
      </div>

      {/* Welcome Banner */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontWeight: 600,
        fontSize: 16,
        textAlign: 'center',
        padding: '16px 24px',
        boxShadow: '0 2px 8px rgba(102,126,234,0.2)',
        borderBottom: '1px solid #5a6fd8'
      }}>
        🎯 Complete missions to unlock new features!
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '24px',
        overflowY: 'auto'
      }}>
        {/* User Greeting */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #eee'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            color: '#333',
            marginBottom: 8
          }}>
            Welcome back, {user.first_name}! 👋
          </h2>
          <p style={{
            margin: 0,
            fontSize: 14,
            color: '#666',
            lineHeight: 1.5
          }}>
            Keep tracking your expenses to unlock powerful features and become a finance expert!
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#666',
            fontSize: 16
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
            border: '1px solid #ffcdd2'
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
              marginBottom: 16
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
          background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
          borderRadius: 12,
          padding: 20,
          marginTop: 24,
          textAlign: 'center',
          border: '1px solid #ffcc02'
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🚀</div>
          <h4 style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: '#e65100',
            marginBottom: 8
          }}>
            Ready to level up?
          </h4>
          <p style={{
            margin: 0,
            fontSize: 14,
            color: '#bf360c',
            lineHeight: 1.4
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
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '12px',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          marginRight: 8
        }}>
          📝 Add Expense
        </button>
        <button style={{
          flex: 1,
          background: '#f5f5f5',
          color: '#666',
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: '12px',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          marginLeft: 8
        }}>
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
}; 