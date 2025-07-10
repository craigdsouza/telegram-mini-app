import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomMenu } from '@/components/BottomMenu';
import { MissionsPanel } from '@/components/Missions/MissionsPanel';
import { CalendarPanel } from '@/components/Calendar/CalendarPanel';

export const HomePage = () => {
  const [activePanel, setActivePanel] = useState<'missions' | 'calendar' | 'settings'>('missions');

  let centralComponent = null;
  if (activePanel === 'missions') {
    centralComponent = <MissionsPanel />;
  } else if (activePanel === 'calendar') {
    centralComponent = <CalendarPanel />;
  } else {
    centralComponent = (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 18 }}>
        Settings coming soon!
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
      <Header />
      {centralComponent}
      <BottomMenu active={activePanel} onMenuSelect={setActivePanel} />
    </div>
  );
}; 