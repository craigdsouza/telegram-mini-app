import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomMenu } from '@/components/BottomMenu';
import { MissionsPanel } from '@/components/Missions/MissionsPanel';
import { DashboardPanel } from '@/components/Dashboard/DashboardPanel';
import './HomePage.css';

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
      <div className="coming-soon-container">
        Add Expense form coming soon!
      </div>
    );
  }
  else if (activePanel === 'profile') {
    centralComponent = (
      <div className="coming-soon-container">
        Profile coming soon!
      </div>
    );
  } else if (activePanel === 'notifications') {
    centralComponent = (
      <div className="coming-soon-container">
        Notifications coming soon!
      </div>
    );
  }

  return (
    <div className="homepage-root">
      <Header title={panelTitles[activePanel]} />
      {centralComponent}
      <BottomMenu active={activePanel} onMenuSelect={setActivePanel} />
    </div>
  );
}; 