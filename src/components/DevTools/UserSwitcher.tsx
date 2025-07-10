import { useState } from 'react';
import { TEST_USERS, TestUser, DEV_CONFIG } from '@/config/dev';

interface UserSwitcherProps {
  onUserChange: (user: TestUser) => void;
}

export const UserSwitcher: React.FC<UserSwitcherProps> = ({ onUserChange }) => {
  // Targeted debug log
  console.log('[DEV] UserSwitcher available TEST_USERS:', TEST_USERS);

  const [selectedUserId, setSelectedUserId] = useState<number>(TEST_USERS[0]?.id || 0);
  const [isVisible, setIsVisible] = useState(false);

  const handleUserChange = (userId: number) => {
    const user = TEST_USERS.find(u => u.id === userId);
    console.log('[DEV] UserSwitcher handleUserChange:', user);
    if (user) {
      setSelectedUserId(userId);
      onUserChange(user);
      // Store the selected user in localStorage for mockEnv.ts to pick up
      localStorage.setItem('tma-dev-user', JSON.stringify(user));
      // Reload the page to apply the new user data
      window.location.reload();
    }
  };
  

  // Only show in development mode and when enabled
  if (!DEV_CONFIG.enableUserSwitcher || TEST_USERS.length === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      zIndex: 9999,
      background: '#fff',
      border: '2px solid #ddd',
      borderRadius: 8,
      padding: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      minWidth: 200,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#333',
        }}>
          🧪 Dev: Switch User
        </span>
        <button
          onClick={() => setIsVisible(!isVisible)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 16,
            cursor: 'pointer',
            color: '#666',
          }}
        >
          {isVisible ? '▼' : '▶'}
        </button>
      </div>
      {isVisible && (
        <div>
          <select
            value={selectedUserId}
            onChange={(e) => handleUserChange(Number(e.target.value))}
            style={{
              width: '100%',
              padding: 8,
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            {TEST_USERS.map(user => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name || ''} (@{user.username || 'no-username'})
                {user.description ? ` - ${user.description}` : ''}
              </option>
            ))}
          </select>
          <div style={{
            fontSize: 10,
            color: '#666',
            marginTop: 4,
          }}>
            Current: {TEST_USERS.find(u => u.id === selectedUserId)?.first_name}
          </div>
        </div>
      )}
    </div>
  );
}; 