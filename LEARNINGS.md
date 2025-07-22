# Telegram Mini App Learnings

## Problem: Mini App API Requests Not Reaching Backend on Specific Network

### Problem Statement
For a specific user (user 1), the Telegram mini app loaded in the Telegram mobile client was unable to fetch mission state, calendar, or budget data. The UI showed error messages like "Error: Failed to fetch" and no API requests appeared in the backend logs. However, the same user could load the mini app successfully in a browser or WebView, and other users had no issues on the same backend. When the user switched from WiFi to mobile data, the mini app worked correctly in Telegram mobile.

### Hypothesis 1: Backend or Database Bug
- The backend or database was rejecting requests for this user only.
- **Disproven:** The same user worked on a different device and in the browser; backend logs showed no incoming requests from the affected device.

### Hypothesis 2: Telegram Init Data or Dev Bypass Issue
- The dev bypass or stale init data was causing the backend to reject requests.
- **Disproven:** Removing the user from DEV_USER_IDS did not resolve the issue. The mini app was correctly receiving and parsing Telegram user info.

### Hypothesis 3: Telegram App or Device Cache/Session Issue
- The Telegram app on the affected device had a corrupted cache or session, preventing requests from being sent.
- **Disproven:** Clearing Telegram cache and reinstalling the app did not resolve the issue.

### Hypothesis 4: Network-Specific Blocking or Restriction
- The device's WiFi network was blocking or interfering with requests from the Telegram app's WebView, while mobile data allowed requests to go through.
- **Confirmed:** Switching from WiFi to mobile data immediately resolved the issue. API requests reached the backend and the mini app worked as expected.
- **Additional Finding:** Restarting the WiFi network resolved the issue and allowed API requests from the Telegram mini app to go through again, even on the same device and user.

### Learnings
- If API requests from a Telegram mini app are not reaching the backend (no logs at all), the issue is likely at the network or device level, not in the backend or app code.
- WiFi networks (especially in offices, public places, or with strict firewalls) can block or interfere with Telegram's in-app browser/WebView requests, even if other apps or browsers work fine.
- Always test mini app functionality on multiple networks (WiFi, mobile data) and devices to rule out network-specific issues.
- Add frontend and backend debug panels/logging to quickly distinguish between network, auth, and backend bugs.
- If a user reports "Failed to fetch" and you see no backend logs, ask them to try a different network or mobile data.
- **Sometimes, simply restarting the WiFi router/network can resolve unexplained connectivity issues for Telegram mini apps.**

## CSS Layout and Styling Learnings

### Problem Statement
Header and bottom menu (footer) should always be visible, but scrolling the main content caused them to disappear or overlap with content.

#### Solution
- Use `position: fixed` for header and bottom menu, with `top: 0` and `bottom: 0` respectively, and a high `z-index`.
- Wrap the central content in a div and set its height to `calc(100vh - [header height] - [footer height])` and `overflow-y: auto` so only this area scrolls.
- Remove unnecessary padding from the root container and use CSS variables for consistent sizing.

### Problem Statement
Bottom menu items were not evenly spaced across the width of the page.

#### Solution
- Use a flex container for the nav (`display: flex; width: 100%`).
- Use `justify-content: space-evenly` (or `space-between`, `space-around`) to distribute items evenly.

### Problem Statement
Component styles were scattered as inline styles, making maintenance and state-based styling difficult.

#### Solution
- Move all inline styles to CSS files named after the component (e.g., `Header.css`, `BottomMenu.css`).
- Use semantic class names and state-based classes (e.g., `.active`, `.disabled`).
- Use conditional `className` logic in React to apply state classes.

### Problem Statement
Disabling a button faded the entire button, but only the icon should appear faded when disabled.

#### Solution
- Remove `opacity` from the button’s disabled state.
- Use a CSS selector like `.center-button:disabled .center-button-icon { opacity: 0.25; }` to target only the icon inside a disabled button.
