import { useMemo, useState, useEffect } from 'react';
import {
  initDataRaw as _initDataRaw,
  initDataState as _initDataState,
  useSignal,
} from '@telegram-apps/sdk-react';
import { MissionCard } from './MissionCard';
import viteLogo from '/vite.svg';

export const MissionsPanel = () => {
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);

  const [missionProgress, setMissionProgress] = useState({
    babySteps: 0,
    juniorAnalyst: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const missions = [
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
      description: 'Use /budget to specify your monthly budget and unlock Budget View',
      icon: '📊',
      target: 7,
      featureUnlocked: 'Budget View'
    }
  ];

  useEffect(() => {
    if (!initDataRaw || !user) return;
    const fetchMissionProgress = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
        const requestUrl = `${apiUrl}/api/user/${user.id}/missions`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        try {
          const response = await fetch(requestUrl, {
            headers: {
              Authorization: `tma ${initDataRaw}`,
              ...(import.meta.env.DEV ? { 'X-Dev-Bypass': 'true' } : {})
            },
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (!response.ok) throw new Error(await response.text());
          const data = await response.json();
          setMissionProgress({
            babySteps: data.babySteps || 0,
            juniorAnalyst: data.juniorAnalyst || 0
          });
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          setError(fetchError.message || 'Failed to load mission progress');
        } finally {
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load mission progress');
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
      flex: 1,
      padding: '24px',
      overflowY: 'auto',
      background: '#f9f9f9'
    }}>
      
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
          marginBottom: 24,
          fontFamily: 'var(--font-primary)',
          fontWeight: 500,
          fontSize: 15,
          textAlign: 'center',
        }}>
          Error: {error}
        </div>
      )}
      {/* Missions List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }}>
        {missions.map((mission) => {
          const progress = missionProgress[mission.id as keyof typeof missionProgress] || 0;
          const isCompleted = progress >= mission.target;
          const isUnlocked = mission.id === 'babySteps' || mission.id === 'juniorAnalyst' ? true : false; // adjust logic as needed
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
    </div>
  );
}; 