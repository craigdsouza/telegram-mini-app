// Development configuration for local testing
// WARNING: Do NOT commit real Telegram user IDs to source control. Use .env.local for test users.
export interface TestUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  description?: string; // Optional description for easier identification
}

// Load test users from environment variable as JSON
export const TEST_USERS: TestUser[] = (() => {
  const raw = import.meta.env.VITE_DEV_USERS;
  console.log('[DEV] Raw TEST_USERS:', raw); // Targeted debug log
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      console.log('[DEV] Parsed TEST_USERS:', arr); // Targeted debug log
      return arr.filter(u => typeof u.id === 'number' && !!u.first_name);
    }
    return [];
  } catch (e) {
    console.warn('Failed to parse VITE_DEV_USERS:', e);
    return [];
  }
})();

// Development settings
export const DEV_CONFIG = {
  // Enable/disable development features
  enableUserSwitcher: import.meta.env.DEV, // Set to true to enable user switcher if env is set to dev
  enableDebugLogs: import.meta.env.DEV,
  
  // API configuration for development
  apiUrl: import.meta.env.VITE_LOCAL_API_URL,
  
  // Mock data settings
  useMockData: false, // Set to true to use mock data instead of API calls
  
  // Timeout settings
  apiTimeout: 30000, // 30 seconds
};

// Helper function to get test user by ID
export const getTestUser = (id: number): TestUser | undefined => {
  return TEST_USERS.find(user => user.id === id);
};

// Helper function to validate if a user ID is a test user
export const isTestUser = (id: number): boolean => {
  return TEST_USERS.some(user => user.id === id);
}; 