import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomMenu } from '@/components/BottomMenu';
import { MissionsPanel } from '@/components/Missions/MissionsPanel';
import { DashboardPanel } from '@/components/Dashboard/DashboardPanel';

export const HomePage = () => {
  const [activePanel, setActivePanel] = useState<'missions' | 'dashboard' | 'add' | 'profile' | 'notifications'>('missions');

  const panelTitles: Record<typeof activePanel, string> = {
    missions: 'Missions',
    dashboard: 'Dashboard',
    add: 'Add Expense',
    profile: 'Profile',
    notifications: 'Notifications',
  };

  let centralComponent = null;
  if (activePanel === 'missions') {
    centralComponent = <MissionsPanel />;
  } else if (activePanel === 'dashboard') {
    centralComponent = <DashboardPanel />;
  }
  else if (activePanel === 'add') {
    centralComponent = (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 18 }}>
        Add Expense form coming soon!
      </div>
    );
  }
  else if (activePanel === 'profile') {
    centralComponent = (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 18 }}>
        Profile coming soon!
      </div>
    );
  } else if (activePanel === 'notifications') {
    centralComponent = (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 18 }}>
        Notifications coming soon!
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
      <Header title={panelTitles[activePanel]} />
      {centralComponent}
      <BottomMenu active={activePanel} onMenuSelect={setActivePanel} />
    </div>
  );
}; 