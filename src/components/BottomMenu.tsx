import React from 'react';

interface BottomMenuProps {
  active: 'missions' | 'calendar' | 'settings';
  onMenuSelect: (panel: 'missions' | 'calendar' | 'settings') => void;
}

export const BottomMenu: React.FC<BottomMenuProps> = ({ active, onMenuSelect }) => {
  const menuItems = [
    {
      label: 'Home',
      icon: '🏠',
      key: 'missions',
      onClick: () => onMenuSelect('missions'),
      disabled: false,
    },
    {
      label: 'Calendar',
      icon: '📅',
      key: 'calendar',
      onClick: () => onMenuSelect('calendar'),
      disabled: false,
    },
    {
      label: 'Settings',
      icon: '⚙️',
      key: 'settings',
      onClick: () => onMenuSelect('settings'),
      disabled: true,
    },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: 64,
        background: '#fff',
        borderTop: '1px solid #eee',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.02)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 100,
      }}
    >
      {menuItems.map((item) => (
        <button
          key={item.key}
          onClick={item.onClick}
          disabled={item.disabled}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: active === item.key ? '#00796b' : '#888',
            fontSize: 18,
            fontWeight: 600,
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            outline: 'none',
            opacity: item.disabled ? 0.5 : 1,
            minWidth: 60,
            transition: 'color 0.2s, opacity 0.2s',
          }}
        >
          <span style={{ fontSize: 24, marginBottom: 2 }}>{item.icon}</span>
          <span style={{ fontSize: 13, letterSpacing: 0.2 }}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}; 