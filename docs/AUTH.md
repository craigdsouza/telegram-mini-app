# Authentication Documentation

## 📑 Table of Contents

- [🚀 Quickstart](#-quickstart)
  - [Overview](#overview)
  - [How It Works](#how-it-works)
  - [Essential Components](#essential-components)
  - [Required Environment Variables](#required-environment-variables)
- [📋 Detailed Authentication Flow](#-detailed-authentication-flow)
  - [1. Frontend Initialization](#1-frontend-initialization)
  - [2. API Authentication](#2-api-authentication)
  - [3. Backend Validation](#3-backend-validation)
- [🔧 Development Features](#-development-features)
  - [Development Bypass](#development-bypass)
  - [Test Users Configuration](#test-users-configuration)
- [📊 Data Structures](#-data-structures)
  - [User Object (from Telegram)](#user-object-from-telegram)
  - [Database User Record](#database-user-record)
  - [API Response Examples](#api-response-examples)
- [🛡️ Security Considerations](#️-security-considerations)
  - [Init Data Validation](#init-data-validation)
  - [Development Security](#development-security)
  - [Database Security](#database-security)
- [🔄 Authentication Flow Diagram](#-authentication-flow-diagram)
- [🚨 Common Issues & Solutions](#-common-issues--solutions)
- [📚 API Endpoints Reference](#-api-endpoints-reference)
  - [Authentication Required Endpoints](#authentication-required-endpoints)
  - [Public Endpoints](#public-endpoints)
- [🔧 Setup Instructions](#-setup-instructions)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
  - [3. Database Setup](#3-database-setup)
- [📝 Best Practices](#-best-practices)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Security](#security)

---

## 🚀 Quickstart

### Overview
This Telegram Mini App uses **Telegram's built-in authentication system** via init data validation. Users are automatically authenticated when they open the app through Telegram, with no manual login required.

### How It Works
1. **User opens app** → Telegram provides `initDataRaw` with user info
2. **App validates** → Backend verifies the data using your bot token
3. **User authenticated** → App can access user-specific data and features

### Essential Components
- **Frontend**: `@telegram-apps/sdk-react` for Telegram integration
- **Backend**: `@telegram-apps/init-data-node` for validation
- **Database**: PostgreSQL with `users` table storing Telegram user IDs

### Required Environment Variables
```bash
# Backend (.env)
TELEGRAM_BOT_TOKEN=your_bot_token_here
DATABASE_PUBLIC_URL=postgresql://...
DEV_USER_IDS=123456789,987654321  # For development testing

# Frontend (.env.local)
VITE_API_URL=https://your-api-url.com
VITE_DEV_USERS=[{"id":123456789,"first_name":"Test User"}]
```

---

## 📋 Detailed Authentication Flow [↑](#-table-of-contents)

### 1. Frontend Initialization

#### SDK Setup
```typescript
// src/init.ts
import { init as initSDK, restoreInitData } from '@telegram-apps/sdk-react';

export async function init() {
  initSDK();
  restoreInitData(); // Restores init data from Telegram
}
```

#### User Data Access
```typescript
// Any component
import { initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';

export const MyComponent = () => {
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);
  
  // user contains: { id, first_name, last_name, username, etc. }
};
```

### 2. API Authentication

#### Authorization Header Format
All API requests must include:
```
Authorization: tma <initDataRaw>
```

#### Example API Call
```typescript
const response = await fetch('/api/user/123456789/missions', {
  headers: {
    Authorization: `tma ${initDataRaw}`,
    ...(import.meta.env.DEV ? { 'X-Dev-Bypass': 'true' } : {})
  }
});
```

### 3. Backend Validation

#### Middleware Function
```javascript
// telegram-api/index.js
const validateTelegramInitData = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const [authType, initDataRaw] = authHeader.split(' ');
  
  if (authType !== 'tma') {
    return res.status(401).json({ error: 'Invalid authorization type' });
  }
  
  // Validate using bot token
  validate(initDataRaw, BOT_TOKEN, { expiresIn: 3600 });
  
  // Parse validated data
  const initData = parse(initDataRaw);
  req.validatedInitData = initData;
  next();
};
```

#### User ID Matching
```javascript
// Ensure authenticated user matches requested user
if (req.validatedInitData.user.id !== telegramId) {
  return res.status(403).json({ error: 'Forbidden: user mismatch' });
}
```

---

## 🔧 Development Features [↑](#-table-of-contents)

### Development Bypass
For local development without Telegram:

#### Frontend Setup
```typescript
// src/mockEnv.ts
if (import.meta.env.DEV) {
  mockTelegramEnv({
    user: { id: 1, first_name: 'Test User' },
    initDataRaw: 'mock_init_data_string'
  });
}
```

#### Backend Bypass
```javascript
// Add header to bypass validation
headers: {
  'X-Dev-Bypass': 'true'
}
```

#### User Switcher Component
```typescript
// src/components/DevTools/UserSwitcher.tsx
// Allows switching between test users in development
```

### Test Users Configuration
```typescript
// src/config/dev.ts
export const TEST_USERS: TestUser[] = [
  { id: 123456789, first_name: 'Test User 1' },
  { id: 987654321, first_name: 'Test User 2' }
];
```

---

## 📊 Data Structures [↑](#-table-of-contents)

### User Object (from Telegram)
```typescript
interface TelegramUser {
  id: number;           // Telegram user ID (e.g., 123456789)
  first_name: string;   // User's first name
  last_name?: string;   // User's last name (optional)
  username?: string;    // Telegram username (optional)
  language_code?: string; // User's language
  is_premium?: boolean; // Premium user status
  photo_url?: string;   // Profile photo URL
}
```

### Database User Record
```sql
-- users table structure
CREATE TABLE users (
  id SERIAL PRIMARY KEY,           -- Internal user ID
  telegram_user_id BIGINT UNIQUE,  -- Telegram user ID
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);
```

### API Response Examples

#### User Validation Response
```json
{
  "id": 1,
  "telegram_user_id": 123456789,
  "first_name": "John",
  "last_name": "Doe",
  "created_at": "2024-01-01T12:00:00.000Z",
  "last_active": "2024-01-01T12:00:00.000Z"
}
```

#### Mission Progress Response
```json
{
  "babySteps": 5,
  "juniorAnalyst": 3,
  "budgetSet": true
}
```

---

## 🛡️ Security Considerations [↑](#-table-of-contents)

### Init Data Validation
- **Signature verification**: Uses HMAC-SHA-256 with bot token
- **Expiration**: Init data expires after 1 hour
- **User matching**: API validates user ID matches authenticated user

### Development Security
- **Dev bypass**: Only works in development mode
- **Test users**: Limited to specific user IDs
- **Environment separation**: Production ignores dev headers

### Database Security
- **User isolation**: Each user can only access their own data
- **SQL injection protection**: Uses parameterized queries
- **Connection pooling**: Secure database connections

---

## 🔄 Authentication Flow Diagram [↑](#-table-of-contents)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Telegram  │    │   Mini App  │    │    API      │    │  Database   │
│   Client    │    │  Frontend   │    │  Backend    │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. User opens     │                   │                   │
       │    mini app       │                   │                   │
       │                   │                   │                   │
       │ 2. Provides       │                   │                   │
       │    initDataRaw    │                   │                   │
       │                   │                   │                   │
       │                   │ 3. API request    │                   │
       │                   │    with auth      │                   │
       │                   │    header         │                   │
       │                   │                   │                   │
       │                   │                   │ 4. Validate       │
       │                   │                   │    init data      │
       │                   │                   │                   │
       │                   │                   │ 5. Extract user   │
       │                   │                   │    info           │
       │                   │                   │                   │
       │                   │                   │ 6. Query user     │
       │                   │                   │    data           │
       │                   │                   │                   │
       │                   │                   │                   │ 7. Return
       │                   │                   │                   │    user data
       │                   │                   │                   │
       │                   │ 8. Response       │                   │
       │                   │    with data      │                   │
       │                   │                   │                   │
```

---

## 🚨 Common Issues & Solutions [↑](#-table-of-contents)

### Issue: "No authorization header"
**Cause**: Frontend not sending Authorization header
**Solution**: Ensure `initDataRaw` is available and included in headers

### Issue: "Invalid init data"
**Cause**: Expired or invalid init data
**Solution**: Refresh the mini app or check bot token configuration

### Issue: "User not found in database"
**Cause**: User hasn't been registered via the bot
**Solution**: User must first interact with the bot to be created in database

### Issue: "Forbidden: user mismatch"
**Cause**: Requested user ID doesn't match authenticated user
**Solution**: Ensure API calls use the authenticated user's ID

### Issue: Development bypass not working
**Cause**: Missing environment variables or incorrect setup
**Solution**: Check `DEV_USER_IDS` and `X-Dev-Bypass` header

---

## 📚 API Endpoints Reference [↑](#-table-of-contents)

### Authentication Required Endpoints

#### GET `/api/user/:telegramId`
Get user information by Telegram ID
```bash
curl -H "Authorization: tma <initDataRaw>" \
     https://api.example.com/api/user/123456789
```

#### GET `/api/user/:telegramId/missions`
Get user's mission progress
```bash
curl -H "Authorization: tma <initDataRaw>" \
     https://api.example.com/api/user/123456789/missions
```

#### GET `/api/user/:telegramId/onboarding`
Get user's onboarding progress
```bash
curl -H "Authorization: tma <initDataRaw>" \
     https://api.example.com/api/user/123456789/onboarding
```

#### POST `/api/user/:telegramId/onboarding`
Update onboarding progress
```bash
curl -X POST \
     -H "Authorization: tma <initDataRaw>" \
     -H "Content-Type: application/json" \
     -d '{"action":"complete","step":1}' \
     https://api.example.com/api/user/123456789/onboarding
```

### Public Endpoints [↑](#-table-of-contents)

#### GET `/ping`
Health check (no auth required)
```bash
curl https://api.example.com/ping
```

#### GET `/health`
Railway health check (no auth required)
```bash
curl https://api.example.com/health
```

---

## 🔧 Setup Instructions [↑](#-table-of-contents)

### 1. Backend Setup
```bash
# Install dependencies
npm install @telegram-apps/init-data-node express cors pg

# Set environment variables
TELEGRAM_BOT_TOKEN=your_bot_token
DATABASE_PUBLIC_URL=postgresql://...
DEV_USER_IDS=123456789,987654321

# Start server
npm start
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install @telegram-apps/sdk-react @telegram-apps/telegram-ui

# Set environment variables
VITE_API_URL=https://your-api-url.com
VITE_DEV_USERS=[{"id":123456789,"first_name":"Test User"}]

# Start development server
npm run dev
```

### 3. Database Setup
```sql
-- Ensure users table exists
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  telegram_user_id BIGINT UNIQUE NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);
```

---

## 📝 Best Practices [↑](#-table-of-contents)

### Frontend
- Always check if `initDataState` is available before making API calls
- Handle authentication errors gracefully
- Use development bypass only in development mode
- Implement proper loading states during authentication

### Backend
- Always validate init data before processing requests
- Implement user ID matching for security
- Use proper error handling and logging
- Set appropriate CORS headers

### Security
- Never expose bot token in frontend code
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Regularly rotate bot tokens

---

*Last Updated: 26 July 2025*
*Version: 1.0* 