import React from 'react';

interface BottomMenuProps {
  active: 'missions' | 'dashboard' | 'add' | 'profile' | 'notifications';
  onMenuSelect: (panel: 'missions' | 'dashboard' | 'add' | 'profile' | 'notifications') => void;
}

export const BottomMenu: React.FC<BottomMenuProps> = ({ active, onMenuSelect }) => {
  const menuItems = [
    {
      label: 'Missions',
      icon: '🦫',
      key: 'missions',
      onClick: () => onMenuSelect('missions'),
      disabled: false,
    },
    {
      label: 'Dashboard',
      icon: '📅',
      key: 'dashboard',
      onClick: () => onMenuSelect('dashboard'),
      disabled: false,
    },
    {
      label: 'Add',
      icon: '➕',
      key: 'add',
      onClick: () => onMenuSelect('add'),
      disabled: true,
    },
    {
      label: 'Profile',
      icon: '👤',
      key: 'profile',
      onClick: () => onMenuSelect('profile'),
      disabled: true,
    },
    {
      label: 'Notifications',
      icon: '🔔',
      key: 'notifications',
      onClick: () => onMenuSelect('notifications'),
      disabled: true,
    },
  ];

  const arcRadius = 36; // px

  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      <nav
        style={{
          position: 'relative',
          height: 80,
          background: '#fff',
          borderTop: '1px solid #eee',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-around',
          paddingBottom: 8,
          zIndex: 2,
        }}
      >
        {menuItems.map((item) => {
          const isCenterButton = item.key === 'add';
          if (isCenterButton) {
            // Center the plus button absolutely over the nav
            return (
              <div
                key={item.key}
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translate(-50%, -32px)',
                  zIndex: 3,
                  background: 'transparent',
                  width: arcRadius * 2,
                  height: arcRadius * 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <button
                  onClick={item.onClick}
                  disabled={item.disabled}
                  style={{
                    background: '#69b3ac',
                    border: 'none',
                    borderRadius: '50%',
                    width: arcRadius * 2,
                    height: arcRadius * 2,
                    boxShadow: '0 4px 16px rgba(0,121,107,0.15)',
                    color: '#e0cfff',
                    fontSize: 32,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    outline: 'none',
                    opacity: item.disabled ? 1 : 1,
                    zIndex: 4,
                  }}
                >
                  {item.icon}
                </button>
              </div>
            );
          }
          // Normal menu items
          return (
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
                marginTop: 16,
              }}
            >
              <span style={{ fontSize: 24, marginBottom: 2 }}>{item.icon}</span>
              <span style={{ fontSize: 13, letterSpacing: 0.2 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}; 