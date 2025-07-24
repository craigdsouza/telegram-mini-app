// UserSwitcher.tsx
// This component is used to switch between test users in development mode.
// It is only visible in development mode and when enabled.
// It is used to test the app with different users.
// It is also used to store the selected user in localStorage for mockEnv.ts to pick up.
// It is also used to reload the page to apply the new user data.

import { useState } from 'react';
import { TEST_USERS, TestUser, DEV_CONFIG } from '@/config/dev';
import './UserSwitcher.css';

interface UserSwitcherProps {
  onUserChange: (user: TestUser) => void;
}

export const UserSwitcher: React.FC<UserSwitcherProps> = ({ onUserChange }) => {
  // Targeted debug log
  console.log('[DEV] UserSwitcher available TEST_USERS:', TEST_USERS);

  // Initialize state from localStorage or default to first user
  const [selectedUserId, setSelectedUserId] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('tma-dev-user');
      if (stored) {
        const user = JSON.parse(stored);
        console.log('[DEV] UserSwitcher initializing from localStorage:', user);
        return user.id;
      }
    } catch (e) {
      console.warn('[DEV] UserSwitcher failed to parse stored user:', e);
    }
    console.log('[DEV] UserSwitcher using default user (first in list)');
    return TEST_USERS[0]?.id || 0;
  });

  const handleUserChange = (userId: number) => {
    const user = TEST_USERS.find(u => u.id === userId);
    console.log('[DEV] UserSwitcher handleUserChange:', user);
    if (user) {
      // Set the selected user in the state
      setSelectedUserId(userId);
      // Call the onUserChange callback to update the user in the app
      onUserChange(user);
      // Store the selected user in localStorage for mockEnv.ts to pick up
      localStorage.setItem('tma-dev-user', JSON.stringify(user));
      // Reload the page to apply the new user data
      // This is necessary to ensure that the new user data is applied to the app
      // and to ensure that the app is using the correct user data
      window.location.reload();
    }
  };
  

  // Only show in development mode AND when enabled AND there are test users
  if (!DEV_CONFIG.enableUserSwitcher || TEST_USERS.length === 0) {
    return null;
  }

  return (
    <div className="user-switcher">
      <div className="user-switcher-header">
        <span className="user-switcher-title">
          🧪 Dev: Switch User
        </span>
      </div>
      <select
        value={selectedUserId}
        onChange={(e) => handleUserChange(Number(e.target.value))}
        className="user-switcher-select"
      >
        {TEST_USERS.map(user => (
          <option key={user.id} value={user.id}>
            {user.first_name} {user.last_name || ''} (@{user.username || 'no-username'})
            {user.description ? ` - ${user.description}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}; 