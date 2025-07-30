import { usePostHog } from 'posthog-js/react';

// Event names for consistency
export const POSTHOG_EVENTS = {
  EXPENSE_ADDED: 'expense_added',
  EXPENSE_ADD_STARTED: 'expense_add_started',
  CALENDAR_DATE_CLICKED: 'calendar_date_clicked',
  BUDGET_VIEW_EXPANDED: 'budget_view_expanded',
} as const;

// Event properties interface
export interface ExpenseAddedEvent {
  source: 'add_expense_page' | 'calendar_date_click';
}

export interface ExpenseAddStartedEvent {
  source: 'add_expense_page' | 'calendar_date_click';
  selected_date?: string;
}

export interface CalendarDateClickedEvent {
  date: number;
  has_existing_expenses: boolean;
  action: 'show_expense_input' | 'hide_expense_input';
}

export interface BudgetViewExpandedEvent {
  is_family: boolean;
  custom_period: boolean;
  budget_percentage: number;
  is_over_budget: boolean;
}

// Hook for PostHog event tracking
export const usePostHogEvents = () => {
  const posthog = usePostHog();

  const trackExpenseAdded = (eventData: ExpenseAddedEvent) => {
    if (!posthog) {
      console.warn('🎯 [POSTHOG EVENTS] PostHog not available for expense_added event');
      return;
    }

    console.log('🎯 [POSTHOG EVENTS] Tracking expense_added:', eventData);
    posthog.capture(POSTHOG_EVENTS.EXPENSE_ADDED, {
      ...eventData,
      timestamp: new Date().toISOString(),
    });
  };

  const trackExpenseAddStarted = (eventData: ExpenseAddStartedEvent) => {
    if (!posthog) {
      console.warn('🎯 [POSTHOG EVENTS] PostHog not available for expense_add_started event');
      return;
    }

    console.log('🎯 [POSTHOG EVENTS] Tracking expense_add_started:', eventData);
    posthog.capture(POSTHOG_EVENTS.EXPENSE_ADD_STARTED, {
      ...eventData,
      timestamp: new Date().toISOString(),
    });
  };

  const trackCalendarDateClicked = (eventData: CalendarDateClickedEvent) => {
    if (!posthog) {
      console.warn('🎯 [POSTHOG EVENTS] PostHog not available for calendar_date_clicked event');
      return;
    }

    console.log('🎯 [POSTHOG EVENTS] Tracking calendar_date_clicked:', eventData);
    posthog.capture(POSTHOG_EVENTS.CALENDAR_DATE_CLICKED, {
      ...eventData,
      timestamp: new Date().toISOString(),
    });
  };

  const trackBudgetViewExpanded = (eventData: BudgetViewExpandedEvent) => {
    if (!posthog) {
      console.warn('🎯 [POSTHOG EVENTS] PostHog not available for budget_view_expanded event');
      return;
    }

    console.log('🎯 [POSTHOG EVENTS] Tracking budget_view_expanded:', eventData);
    posthog.capture(POSTHOG_EVENTS.BUDGET_VIEW_EXPANDED, {
      ...eventData,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackExpenseAdded,
    trackExpenseAddStarted,
    trackCalendarDateClicked,
    trackBudgetViewExpanded,
  };
}; 