import { useMemo, useState, useEffect } from 'react';
import {
  initDataRaw as _initDataRaw,
  initDataState as _initDataState,
  useSignal,
} from '@telegram-apps/sdk-react';
import { MissionCard } from '@/components/MissionCard/MissionCard';
import excitedSquirrelImg from '@/../assets/excited-squirrel.png';

export const MissionsPanel = () => {
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);

  const [missionProgress, setMissionProgress] = useState({
    babySteps: 0,
    juniorAnalyst: 0,
    budgetSet: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showParsed, setShowParsed] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Add summary logging whenever missionProgress changes
  useEffect(() => {
    console.log('📊 [MISSIONS SUMMARY] Current state:', {
      missionProgress,
      loading,
      error,
      user: user?.id,
      hasUser: !!user,
      hasInitData: !!initDataRaw
    });
  }, [missionProgress, loading, error, user, initDataRaw]);

  const missions = [
    {
      id: 'babySteps',
      title: 'Baby Steps',
      description: 'Record expenses for 3+ days to unlock Calendar View',
      icon: '👶',
      target: 3,
      featureUnlocked: 'Calendar View'
    },
    {
      id: 'juniorAnalyst',
      title: 'Junior Budget Analyst',
      description: 'Record expenses for 7+ days AND set a monthly budget with /budget to unlock Budget View',
      icon: '📊',
      target: 8, // 7 expense days + 1 budget task
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
        console.log('🔍 [MISSIONS] Fetching from URL:', requestUrl);
        console.log('🔍 [MISSIONS] User ID:', user.id);
        
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
          
          console.log('🔍 [MISSIONS] Response status:', response.status);
          console.log('🔍 [MISSIONS] Response ok:', response.ok);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('🔍 [MISSIONS] API Error:', errorText);
            throw new Error(errorText);
          }
          
          const data = await response.json();
          console.log('🔍 [MISSIONS] Raw API response:', data);
          
          const newProgress = {
            babySteps: data.babySteps || 0,
            juniorAnalyst: data.juniorAnalyst || 0,
            budgetSet: data.budgetSet || false
          };
          
          console.log('🔍 [MISSIONS] Parsed progress:', newProgress);
          setMissionProgress(newProgress);
          
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          console.error('🔍 [MISSIONS] Fetch error:', fetchError);
          setError(fetchError.message || 'Failed to load mission progress');
        } finally {
          setLoading(false);
        }
      } catch (err: any) {
        console.error('🔍 [MISSIONS] General error:', err);
        setError(err.message || 'Failed to load mission progress');
      }
    };
    fetchMissionProgress();
  }, [initDataRaw, user]);

  // Helper to parse and pretty-print debug info
  const prettyDebugInfo = useMemo(() => {
    if (!error) return null;
    try {
      return (
        <div style={{ fontSize: 14 }}>
          <b>initDataRaw (decoded):</b> <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-all',margin:0}}>{decodeURIComponent(String(initDataRaw))}</pre>
          <b>initDataState:</b> <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-all',margin:0}}>{JSON.stringify(initDataState, null, 2)}</pre>
          <b>user:</b> <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-all',margin:0}}>{JSON.stringify(user, null, 2)}</pre>
          <b>API URL:</b> <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-all',margin:0}}>{`${import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app'}/api/user/${user?.id}/missions`}</pre>
        </div>
      );
    } catch (e) {
      return <span>Failed to parse debug info.</span>;
    }
  }, [initDataRaw, initDataState, user, error]);

  // Helper to copy debug info
  const handleCopyDebug = () => {
    const debugText = `initDataRaw: ${String(initDataRaw)}\ninitDataState: ${JSON.stringify(initDataState)}\nuser: ${JSON.stringify(user)}\nAPI URL: ${import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app'}/api/user/${user?.id}/missions`;
    navigator.clipboard.writeText(debugText).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(null), 1500);
    }, () => {
      setCopySuccess('Failed to copy');
      setTimeout(() => setCopySuccess(null), 1500);
    });
  };

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
        <img src={excitedSquirrelImg} alt="Excited Squirrel" style={{ width: 120, marginBottom: 24 }} />
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
      background: 'var(--color-bg-light)'
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
          <div style={{
            marginTop: 12,
            textAlign: 'left',
            fontSize: 13,
            color: '#b94a48',
            background: '#fff6f6',
            borderRadius: 8,
            padding: 8,
            wordBreak: 'break-all',
            maxHeight: 200,
            overflowY: 'auto',
            marginLeft: 'auto',
            marginRight: 'auto',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button onClick={handleCopyDebug} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, border: '1px solid #b94a48', background: '#fff', color: '#b94a48', cursor: 'pointer' }}>Copy</button>
              <button onClick={() => setShowParsed((v) => !v)} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, border: '1px solid #b94a48', background: '#fff', color: '#b94a48', cursor: 'pointer' }}>{showParsed ? 'Raw' : 'Parse'}</button>
              {copySuccess && <span style={{ fontSize: 12, color: '#388e3c', marginLeft: 8 }}>{copySuccess}</span>}
            </div>
            {showParsed ? prettyDebugInfo : (
              <>
                <b>Debug Info:</b><br/>
                <b>initDataRaw:</b> <code style={{wordBreak:'break-all'}}>{String(initDataRaw)}</code><br/>
                <b>initDataState:</b> <code style={{wordBreak:'break-all'}}>{JSON.stringify(initDataState)}</code><br/>
                <b>user:</b> <code style={{wordBreak:'break-all'}}>{JSON.stringify(user)}</code><br/>
                <b>API URL:</b> <code style={{wordBreak:'break-all'}}>{`${import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app'}/api/user/${user?.id}/missions`}</code><br/>
              </>
            )}
          </div>
        </div>
      )}
      {/* Missions List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }}>
        {missions.map((mission) => {
          // Get progress values with proper typing
          const babyStepsProgress = missionProgress.babySteps;
          const juniorAnalystProgress = missionProgress.juniorAnalyst;
          const budgetSet = missionProgress.budgetSet;
          
          // Mission completion logic
          let isCompleted = false;
          let progress = 0;
          
          if (mission.id === 'babySteps') {
            progress = babyStepsProgress;
            isCompleted = progress >= mission.target;
          } else if (mission.id === 'juniorAnalyst') {
            // Junior Budget Analyst: 7 expense days + 1 budget task = 8 total
            const expenseProgress = Math.min(juniorAnalystProgress, 7); // Cap at 7
            const budgetProgress = budgetSet ? 1 : 0;
            progress = expenseProgress + budgetProgress;
            isCompleted = progress >= mission.target;
          }
          
          const isUnlocked = mission.id === 'babySteps' || mission.id === 'juniorAnalyst' ? true : false; // adjust logic as needed
          
          // Add detailed logging for each mission
          console.log(`🎯 [MISSION ${mission.id.toUpperCase()}]`, {
            title: mission.title,
            progress: progress,
            target: mission.target,
            budgetSet: budgetSet,
            isCompleted: isCompleted,
            isUnlocked: isUnlocked,
            progressPercentage: Math.round((progress / mission.target) * 100)
          });
          
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
              budgetSet={mission.id === 'juniorAnalyst' ? budgetSet : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}; 