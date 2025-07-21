import React from 'react';
import { Calendar, User, Bell, Plus } from 'lucide-react';
import scribblingSquirrelImg from '@/../assets/scribbling-squirrel.png';

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
      label: 'You', // relabel Profile to 'You'
      icon: '👤',
      key: 'profile',
      onClick: () => onMenuSelect('profile'),
      disabled: false, // enable the Profile/You tab
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

  // Function to get icon color based on active state
  const getIconColor = (itemKey: string) => {
    return active === itemKey ? 'var(--color-primary)' : 'var(--color-text-dark)';
  };

  // Function to render the appropriate icon
  const renderIcon = (item: any) => {
    const iconColor = getIconColor(item.key);
    const iconSize = 24;

    switch (item.key) {
      case 'missions':
        return (
          <img 
            src={scribblingSquirrelImg} 
            alt="Scribbling Squirrel" 
            style={{ 
              width: 32, 
              height: 32, 
              marginBottom: 2,
              opacity: active === item.key ? 1 : 0.7,
              transition: 'opacity 0.2s'
            }} 
          />
        );
      case 'dashboard':
        return (
          <Calendar 
            size={iconSize} 
            color={iconColor} 
            style={{ 
              marginBottom: 2,
              opacity: item.disabled ? 0.25 : 1,
              transition: 'opacity 0.2s'
            }} 
          />
        );
      case 'profile':
        return (
          <User 
            size={iconSize} 
            color={iconColor} 
            style={{ 
              marginBottom: 2,
              opacity: item.disabled ? 0.25 : 1,
              transition: 'opacity 0.2s'
            }} 
          />
        );
      case 'notifications':
        return (
          <Bell 
            size={iconSize} 
            color={iconColor} 
            style={{ 
              marginBottom: 2,
              opacity: item.disabled ? 0.25 : 1,
              transition: 'opacity 0.2s'
            }} 
          />
        );
      default:
        return <span style={{ fontSize: 24, marginBottom: 2 }}>{item.icon}</span>;
    }
  };

  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      <nav
        style={{
          position: 'relative',
          height: 80,
          background: 'var(--color-bg-light)',
          borderTop: '2px solid var(--color-primary)',
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
                    background: 'var(--color-bg-light)',
                    border: 'none',
                    borderRadius: '50%',
                    width: arcRadius * 2,
                    height: arcRadius * 2,
                    boxShadow: '0 4px 16px rgba(0,121,107,0.15)',
                    color: 'var(--color-text-dark)',
                    fontSize: 32,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    outline: 'none',
                    zIndex: 4,
                  }}
                >
                  <Plus 
                    size={48} 
                    color="var(--color-text-dark)" 
                    style={{ 
                      opacity: item.disabled ? 0.25 : 1,
                      transition: 'opacity 0.2s'
                    }} 
                  />
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
                background: 'var(--color-bg-light)',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: active === item.key ? 'var(--color-primary)' : 'var(--color-text-dark)',
                fontSize: 18,
                fontWeight: 600,
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                outline: 'none',
                minWidth: 60,
                transition: 'color 0.2s, opacity 0.2s',
                marginTop: 16,
              }}
            >
              {renderIcon(item)}
              <span style={{ 
                fontSize: 13, 
                letterSpacing: 0.2,
                opacity: item.disabled ? 0.25 : 1,
                transition: 'opacity 0.2s'
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}; 