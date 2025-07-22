import { useState } from 'react';
import { Header } from '@/panels/HeaderMenu/Header';
import { BottomMenu } from '@/panels/BottomMenu/BottomMenu';
import { MissionsPanel } from '@/panels/Missions/MissionsPanel';
import { ProfilePanel } from '@/panels/Profile/ProfilePanel';
import { DashboardPanel } from '@/panels/Dashboard/DashboardPanel';
import './HomePage.css';

export const HomePage = () => {
  // Set 'profile' as the default active panel
  const [activePanel, setActivePanel] = useState<'missions' | 'dashboard' | 'add' | 'profile' | 'notifications'>('profile');

  const panelTitles: Record<typeof activePanel, string> = {
    missions: 'Missions',
    dashboard: 'Dashboard',
    add: 'Add Expense',
    profile: 'You', // relabel Profile to 'You'
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
    centralComponent = <ProfilePanel />;
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
      <div className="homepage-central">
        {centralComponent}
      </div>
      <BottomMenu active={activePanel} onMenuSelect={setActivePanel} />
    </div>
  );
}; 