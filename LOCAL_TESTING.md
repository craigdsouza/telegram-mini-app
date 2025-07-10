# Local Testing Guide for Telegram Mini App

This guide explains how to test your Telegram Mini App locally with specific user IDs, using a robust and safe mock environment setup.

---

## Setup

### 1. Add Your Test Users (Environment Variable)

**Do NOT hardcode test user IDs in source files.**

Add your test users as a JSON string in your `.env.local` file (which is gitignored):

```env
VITE_DEV_USERS=[
  {"id":123456789,"first_name":"Test User 1","last_name":"Smith","username":"testuser1","description":"User with no expenses yet"},
  {"id":987654321,"first_name":"Test User 2","last_name":"Johnson","username":"testuser2","description":"User with some expenses"}
]
```

- You can generate this JSON using any online tool or a script.
- Each object must have at least `id` and `first_name`.

### 2. Get Telegram User IDs

To get a user's Telegram ID:
1. Ask them to send a message to your bot
2. Check your bot logs or database for their user ID
3. Or use the Telegram API to get user information

### 3. Start Development Server

```bash
npm run dev
```

---

## Backend (Railway) Environment Variables

For local testing to work, you must set the following environment variables in your Railway telegram-api backend:

- `NODE_ENV=development` (or any value except `production`)
- `DEV_USER_IDS=123456789,987654321` (comma-separated list of test user IDs as numbers)

**Example:**
```
NODE_ENV=development
DEV_USER_IDS=123456789,987654321
```

If these are not set, the backend will not allow the dev bypass for your test users and you will get 401 errors.

---

## GitHub Safety: What to Commit and What to Ignore

**Never commit sensitive or local-only files to GitHub!**

### Files you MUST NOT commit (add to `.gitignore`):
- `.env.local` (contains your `VITE_DEV_USERS` and any local secrets)
- Any `.env` file with real user IDs, tokens, or secrets
- Any file containing real Telegram user IDs or sensitive data

**Your `.gitignore` should include:**
```
.env
.env.*
.env.local
```

### Files that are SAFE to commit:
- `src/mockEnv.ts` (contains only mock logic, no real user data)
- `src/components/DevTools/UserSwitcher.tsx` (logic for switching users, no real user data)
- `src/config/dev.ts` (as long as it does NOT contain hardcoded real user IDs)
- `LOCAL_TESTING.md` (this guide)

**Rule of thumb:**
- Only commit code and documentation, never secrets or real user data.
- Always check `.gitignore` before pushing.

---

## How the Mock Environment Works

- `src/mockEnv.ts` **always runs in development** and sets up a mock Telegram environment.
- On every page load, it:
  1. Checks `localStorage` for a key called `tma-dev-user`.
  2. If found, uses that user as the Telegram user for all API calls.
  3. If not found, falls back to a default user (`id: 1, first_name: 'Vladislav'`).
- The **UserSwitcher** (top-right in dev) lets you pick a test user. When you select a user:
  1. It saves the user to `localStorage` as `tma-dev-user`.
  2. Reloads the page, so `mockEnv.ts` picks up your selection.
- This ensures your selected user is always used for all API calls and UI.

---

## Testing Features

- Use the UserSwitcher to simulate different users and test:
  - Mission progress and feature unlocking
  - Calendar and category views
  - API integration and error handling

---

## Troubleshooting

- **If you see the default user (`Vladislav/id:1`) in logs:**
  - Make sure you have selected a user in the UserSwitcher.
  - Check your browser's `localStorage` for the `tma-dev-user` key.
  - Try clearing `localStorage` and selecting a user again.
- **If the app doesn't load:**
  - Make sure you are running in a browser (not SSR or Node).
  - Check the browser console for errors from `mockEnv.ts`.
- **If you get 401 errors from the backend:**
  - Make sure the user ID you selected is present in your backend's `DEV_USER_IDS` env variable (as a number).
  - Make sure `NODE_ENV` is not set to `production` in Railway.
  - Restart both frontend and backend after any `.env` changes.

---

## Resetting the Test User

- To reset to the default user, clear the `tma-dev-user` key from your browser's `localStorage` (DevTools > Application > Local Storage).
- Or simply select a different user in the UserSwitcher.

---

## Security Notes

- Test user IDs are only used in development
- Real authentication is used for API calls
- No test data is included in production builds
- `.env.local` is gitignored by default

---

## Production

The user switcher and mock environment are automatically disabled in production builds. The app will only work with real Telegram users in production. 