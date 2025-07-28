import { useMemo } from 'react';
import {
  initDataRaw as _initDataRaw,
  initDataState as _initDataState,
  useSignal,
} from '@telegram-apps/sdk-react';
import { OnboardingTester } from '@/components/DevTools';
import { ProfileSettingsPanel } from './ProfileSettingsPanel';
import { useUser } from '@/contexts/UserContext';

export const ProfilePanel = () => {
  const { internalUserId, isLoading: userLoading, error: userError } = useUser();
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);

  console.log('💰 [PROFILE] User:', internalUserId, user);

  if (!initDataRaw || !user) {
    return null;
  }

  // Show loading state while user data is being fetched
  if (userLoading) {
    return <div style={{ color: '#888', fontSize: 16, textAlign: 'center' }}>Loading user info...</div>;
  }

  // Show error state if user data failed to load
  if (userError) {
    return <div style={{ color: '#e74c3c', fontSize: 16, textAlign: 'center' }}>Error: {userError}</div>;
  }
  
  return (
    <div>
      {internalUserId && <ProfileSettingsPanel userId={internalUserId} initDataRaw={initDataRaw} />}
      <OnboardingTester />
    </div>
  );
}; 