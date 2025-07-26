import { useMemo, useState, useEffect } from 'react';
import {
  initDataRaw as _initDataRaw,
  initDataState as _initDataState,
  useSignal,
} from '@telegram-apps/sdk-react';
import { MissionCard } from '@/components/MissionCard/MissionCard';
import excitedSquirrelImg from '@/../assets/excited-squirrel.png';
import './MissionsPanel.css';

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
      <div className="missionspanel-error-root">
        <img src={excitedSquirrelImg} alt="Excited Squirrel" className="missionspanel-error-img" />
        <h2 className="missionspanel-error-title">Error</h2>
        <p className="missionspanel-error-desc">Could not get user data from Telegram</p>
      </div>
    );
  }

  return (
    <div className="missionspanel-root">
      
      {/* Loading State */}
      {loading && (
        <div className="missionspanel-loading">Loading your mission progress...</div>
      )}
      {/* Error State */}
      {error && (
        <div className="missionspanel-error">
          Error: {error}
          <div className="missionspanel-error-debug">
            <div className="missionspanel-error-debug-buttons">
              <button onClick={handleCopyDebug} className="missionspanel-error-debug-btn">Copy</button>
              <button onClick={() => setShowParsed((v) => !v)} className="missionspanel-error-debug-btn">{showParsed ? 'Raw' : 'Parse'}</button>
              {copySuccess && <span className="missionspanel-error-debug-success">{copySuccess}</span>}
            </div>
            {showParsed ? prettyDebugInfo : (
              <>
                <b>Debug Info:</b><br/>
                <b>initDataRaw:</b> <code>{String(initDataRaw)}</code><br/>
                <b>initDataState:</b> <code>{JSON.stringify(initDataState)}</code><br/>
                <b>user:</b> <code>{JSON.stringify(user)}</code><br/>
                <b>API URL:</b> <code>{`${import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app'}/api/user/${user?.id}/missions`}</code><br/>
              </>
            )}
          </div>
        </div>
      )}
      {/* Missions List */}
      <div className="missionspanel-list">
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
          
          // Create description items for CheckBoxList
          let descriptionItems: Array<{ text: string; completed: boolean }> | undefined;
          
          if (mission.id === 'babySteps') {
            descriptionItems = [
              {
                text: 'Record expenses for 3+ days',
                completed: babyStepsProgress >= 3
              }
            ];
          } else if (mission.id === 'juniorAnalyst') {
            const expenseDaysCompleted = Math.min(juniorAnalystProgress, 7);
            descriptionItems = [
              {
                text: 'Record expenses for 7+ days',
                completed: expenseDaysCompleted >= 7
              },
              {
                text: 'Set a monthly budget with /budget',
                completed: budgetSet
              }
            ];
          }
          
          // Add detailed logging for each mission
          console.log(`🎯 [MISSION ${mission.id.toUpperCase()}]`, {
            title: mission.title,
            progress: progress,
            target: mission.target,
            budgetSet: budgetSet,
            isCompleted: isCompleted,
            isUnlocked: isUnlocked,
            progressPercentage: Math.round((progress / mission.target) * 100),
            descriptionItems: descriptionItems
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
              descriptionItems={descriptionItems}
            />
          );
        })}
      </div>
    </div>
  );
}; 