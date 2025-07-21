import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomMenu } from '@/components/BottomMenu';
import { MissionsPanel } from '@/components/Missions/MissionsPanel';
// import { DashboardPanel } from '@/components/Dashboard/DashboardPanel';
import { Calendar } from '@/components/Dashboard/Calendar';
import { DashboardTable } from '@/components/Dashboard/DashboardTable';
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
    centralComponent = <DashboardTable />;
  }
  else if (activePanel === 'add') {
    centralComponent = (
      <div className="coming-soon-container">
        Add Expense form coming soon!
      </div>
    );
  }
  else if (activePanel === 'profile') {
    // Move Calendar (with BudgetView inside) to Profile tab
    centralComponent = <Calendar />;
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