# PostHog Event Tracking

This document describes the PostHog event tracking implementation for the Telegram Mini App.

## Overview

The app tracks user interactions related to expense management to understand user behavior and improve the product experience.

## Events Captured

### 1. `expense_added`
**Triggered when:** A user successfully adds an expense
**Properties:**
- `source` (string): Where the expense was added from ("add_expense_page" or "calendar_date_click")
- `timestamp` (string): ISO timestamp of when the event occurred

### 2. `expense_add_started`
**Triggered when:** A user clicks on the amount input field to start adding an expense
**Properties:**
- `source` (string): Where the expense addition was initiated ("add_expense_page" or "calendar_date_click")
- `selected_date` (string, optional): The selected date in YYYY-MM-DD format (for calendar clicks)
- `timestamp` (string): ISO timestamp of when the event occurred

### 3. `calendar_date_clicked`
**Triggered when:** A user clicks on a calendar date
**Properties:**
- `date` (number): The day of the month that was clicked (1-31)
- `has_existing_expenses` (boolean): Whether the clicked date already has expenses
- `action` (string): What action was taken ("show_expense_input" or "hide_expense_input")
- `timestamp` (string): ISO timestamp of when the event occurred

### 4. `budget_view_expanded`
**Triggered when:** A user clicks to expand the budget view card
**Properties:**
- `is_family` (boolean): Whether this is a family budget
- `custom_period` (boolean): Whether this is a custom budget period
- `budget_percentage` (number): Current budget usage percentage
- `is_over_budget` (boolean): Whether the user is over budget
- `timestamp` (string): ISO timestamp of when the event occurred

## Implementation Details

### PostHog Configuration
The app uses a **minimal identification approach** to ensure real-time event sending:

1. **PostHog loads normally** without any opt-out/opt-in cycles
2. **User identification happens** via `posthog.identify()` when Telegram user data is available
3. **No `reset()` calls** that could corrupt PostHog's internal batching mechanisms
4. **Events send immediately** without requiring page refresh

### Event Tracking Utility
All events are managed through the `usePostHogEvents` hook in `src/utils/posthogEvents.ts`. This provides:
- Consistent event naming
- Type-safe event properties
- Centralized logging
- Error handling for when PostHog is not available
- **Immediate event sending** via `posthog.flush()` calls

### Components with Event Tracking

1. **AddExpensePanel** (`src/panels/AddExpense/AddExpensePanel.tsx`)
   - Tracks successful expense additions from the dedicated page

2. **DashboardPanel** (`src/panels/Dashboard/DashboardPanel.tsx`)
   - Tracks calendar date clicks (showing/hiding expense input)
   - Tracks expense additions initiated from calendar clicks

3. **ExpensesInputTemplate** (`src/components/ExpensesInputTemplate/ExpensesInputTemplate.tsx`)
   - Tracks when user clicks on amount input field (triggers expense_add_started)
   - Handles both Add Expense page and Dashboard calendar variants

4. **BudgetView** (`src/components/BudgetView/BudgetView.tsx`)
   - Tracks when user expands the budget view card
   - Captures budget context (family, custom period, over budget status)

## Usage Examples

### Tracking an Expense Addition
```typescript
const { trackExpenseAdded } = usePostHogEvents();

trackExpenseAdded({
  source: "add_expense_page"
});
```

### Tracking a Calendar Date Click
```typescript
const { trackCalendarDateClicked } = usePostHogEvents();

trackCalendarDateClicked({
  date: 15,
  has_existing_expenses: true,
  action: "show_expense_input"
});
```

### Tracking Budget View Expansion
```typescript
const { trackBudgetViewExpanded } = usePostHogEvents();

trackBudgetViewExpanded({
  is_family: false,
  custom_period: false,
  budget_percentage: 75.5,
  is_over_budget: false
});
```

## PostHog Dashboard Insights

With these events, you can analyze:

1. **User Engagement:**
   - How often users add expenses
   - Which method they prefer (dedicated page vs calendar)

2. **User Journey:**
   - Conversion from clicking amount field to completing expense addition
   - Drop-off points in the expense addition flow

3. **Feature Usage:**
   - Calendar interaction patterns
   - Date selection behavior

4. **User Behavior:**
   - Expense addition frequency
   - Preferred entry method (default page vs calendar)
   - Budget monitoring patterns
   - Budget feature engagement

## Creating a PostHog Funnel

### Expense Addition Funnel Flowchart

```
User Journey for Expense Addition
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  0. PostHog identifies user                                │
│     ↓                                                      │
│     Event: $identify (Telegram user ID)                    │
│                                                             │
│  1. User clicks on amount input field                      │
│     ↓                                                      │
│     Event: expense_add_started                             │
│     (source: 'add_expense_page' or 'calendar_date_click')  │
│                                                             │
│  2. User fills form and submits                            │
│     ↓                                                      │
│     Event: expense_added                                   │
│     (source: 'add_expense_page' or 'calendar_date_click')  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### How to Create the Funnel in PostHog

1. **Go to PostHog Dashboard**
   - Navigate to "Insights" → "Funnels"

2. **Set up the Funnel Steps**
   - **Step 1:** Event = `$identify` (PostHog user identification)
   - **Step 2:** Event = `expense_add_started`
   - **Step 3:** Event = `expense_added`

3. **Configure Funnel Settings**
   - **Time Window:** 24 hours (or adjust as needed)
   - **Conversion Window:** 1 hour (time between steps)
   - **Breakdown:** By `source` property to see performance by entry method

4. **Optional Breakdowns**
   - **By Source:** Compare "add_expense_page" vs "calendar_date_click"
   - **By Date:** Track performance over time
   - **By User:** Identify high-performing users

### Expected Funnel Metrics

- **Step 1 → Step 2 Conversion Rate:** Should be 100% (all identified users should be able to interact)
- **Step 2 → Step 3 Conversion Rate:** Should be 70-90% for engaged users
- **Drop-off Analysis:** Users who click amount field but don't complete
- **Source Performance:** Which entry method has better completion rates

### Key Questions to Answer

1. **Are all users being properly identified by PostHog?**
2. **What's the conversion rate from starting to completing expense addition?**
3. **Which entry method (page vs calendar) has better completion rates?**
4. **Are there specific drop-off points in the expense addition flow?**
5. **How does the funnel performance vary by user segment?**

## Testing Events

To test that events are being captured correctly:

1. Open the browser console
2. Look for log messages starting with `🎯 [POSTHOG EVENTS]`
3. Check your PostHog dashboard for the events
4. Verify that user identification is working (events should be associated with Telegram user IDs)
5. **Verify real-time sending** - events should appear within 1-2 seconds without page refresh

### Troubleshooting

If events are not appearing in real-time:
- Check that PostHog is properly initialized (look for `🎉 [POSTHOG index.tsx]` logs)
- Verify user identification is successful (look for `🆔 [POSTHOG_ID]` logs)
- Ensure no `reset()` or opt-out/opt-in cycles are interfering with PostHog's internal state

## Future Enhancements

Potential additional events to consider:
- `expense_edited` - When users modify existing expenses
- `expense_deleted` - When users delete expenses
- `category_changed` - When users change expense categories
- `budget_viewed` - When users view budget information
- `calendar_viewed` - When users expand/collapse the calendar

## Lessons Learned

### What Worked
- **Minimal identification approach** - Simple `posthog.identify()` without complex state management
- **No `reset()` calls** - Avoids corrupting PostHog's internal batching mechanisms
- **No opt-out/opt-in cycles** - PostHog works best when left in its natural state
- **Immediate `flush()` calls** - Ensures events are sent right away

### What Didn't Work
- **Complex state management** with `reset()`, `opt_out_capturing()`, and `opt_in_capturing()`
- **PostHog method overrides** that broke core functionality
- **Excessive delays and timeouts** that didn't address the root cause

### Key Insight
**Real-time events worked with anonymous users but broke after implementing complex identification flows.** The solution was to keep PostHog's internal state intact and use the simplest possible identification method. 