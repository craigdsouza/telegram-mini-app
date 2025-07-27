import React from 'react';
import { Calendar, User, Bell, Plus } from 'lucide-react';
import scribblingSquirrelImg from '@/../assets/scribbling-squirrel.png';
import './BottomMenu.css';

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
      disabled: false,
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

  // const arcRadius = 36; // px

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
            className={`icon-image ${active === item.key ? 'active' : ''}`}
          />
        );
      case 'dashboard':
        return (
          <Calendar 
            size={iconSize} 
            color={iconColor} 
            className={`icon-calendar ${active === item.key ? 'active' : ''}`}
          />
        );
      case 'add':
        return (
          <Plus 
            size={iconSize} 
            color={iconColor} 
            className={`icon-plus ${active === item.key ? 'active' : ''}`}
          />
        );
      case 'profile':
        return (
          <User 
            size={iconSize} 
            color={iconColor} 
            className={`icon-user ${active === item.key ? 'active' : ''}`}
          />
        );
      case 'notifications':
        return (
          <Bell 
            size={iconSize} 
            color={iconColor} 
            className={`icon-bell ${active === item.key ? 'active' : ''}`}
          />
        );
      default:
        return <span style={{ fontSize: 24, marginBottom: 2 }}>{item.icon}</span>;
    }
  };

  return (
    <div className="bottom-menu-root">
      <nav className="bottom-menu-nav">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={item.onClick}
            disabled={item.disabled}
            className={`menu-item-button ${active === item.key ? 'active' : ''}`}
          >
            {renderIcon(item)}
            <span className={`menu-item-label ${active === item.key ? 'active' : ''}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}; 