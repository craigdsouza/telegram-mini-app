import { useMemo, useState, useEffect } from 'react';
import {
  initDataRaw as _initDataRaw,
  initDataState as _initDataState,
  useSignal,
} from '@telegram-apps/sdk-react';
import { OnboardingTester } from '@/components/DevTools';
import { ProfileSettingsPanel } from './ProfileSettingsPanel';

export const ProfilePanel = () => {
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);

  // State for internal user ID
  const [internalUserId, setInternalUserId] = useState<number | null>(null);
  const [userIdLoading, setUserIdLoading] = useState(false);
  const [userIdError, setUserIdError] = useState<string | null>(null);

  // Fetch internal user ID from backend
  useEffect(() => {
    if (!user?.id) return;
    setUserIdLoading(true);
    setUserIdError(null);
    const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
    const url = `${apiUrl}/api/user/${user.id}`;
    console.log('[ProfilePanel] Fetching internal user ID for telegram ID:', user.id, url);
    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        setInternalUserId(data.id);
        console.log('[ProfilePanel] Got internal user ID:', data.id);
      })
      .catch((err) => {
        setUserIdError('Failed to fetch internal user ID');
        setInternalUserId(null);
        console.error('[ProfilePanel] Error fetching internal user ID:', err);
      })
      .finally(() => setUserIdLoading(false));
  }, [user?.id]);

  if (!initDataRaw || !user) {
    return null;
  }

  if (userIdLoading) {
    return <div style={{ color: '#888', fontSize: 16, textAlign: 'center' }}>Loading user info...</div>;
  }
  if (userIdError) {
    return <div style={{ color: '#e74c3c', fontSize: 16, textAlign: 'center' }}>Error: {userIdError}</div>;
  }
  
  return (
    <div>
      {internalUserId && <ProfileSettingsPanel userId={internalUserId} initDataRaw={initDataRaw} />}
      <OnboardingTester />
    </div>
  );
}; 