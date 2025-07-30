import { useEffect, useMemo, useState } from 'react';
import { initDataRaw as _initDataRaw, initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';
import { BudgetView } from '@/components/BudgetView/BudgetView';
import { Calendar } from '@/components/CalendarView/Calendar';
import { ExpensesInputTemplate } from '@/components/ExpensesInputTemplate/ExpensesInputTemplate';
import { ExpensesTable } from '@/components/TableView/ExpensesTable';
import { useUser } from '@/contexts/UserContext';
import { usePostHogEvents } from '@/utils/posthogEvents';
import './DashboardPanel.css';

export const DashboardPanel = () => {
  const { internalUserId, telegramUserId, isLoading: userLoading, error: userError } = useUser();
  console.log('💰 [DASHBOARD] User:', internalUserId, telegramUserId);
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);
  const { trackCalendarDateClicked, trackExpenseAddStarted, trackExpenseAdded } = usePostHogEvents();

  const [budgetData, setBudgetData] = useState<any>(null);
  const [loadingBudget, setLoadingBudget] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  // State for entry dates (needed for Calendar)
  const [entryDates, setEntryDates] = useState<number[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [datesError, setDatesError] = useState<string | null>(null);

  // State for selected date and components visibility
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [showExpensesComponents, setShowExpensesComponents] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State for ExpensesInputTemplate
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  // Handle date selection from calendar
  const handleDateClick = (date: number) => {
    if (selectedDate === date) {
      // If clicking the same date, toggle the components off
      setSelectedDate(null);
      setShowExpensesComponents(false);
      
      // Track calendar date click to hide expense input
      trackCalendarDateClicked({
        date,
        has_existing_expenses: entryDates.includes(date),
        action: 'hide_expense_input'
      });
    } else {
      // If clicking a different date, show the components
      setSelectedDate(date);
      setShowExpensesComponents(true);
      
      // Track calendar date click to show expense input
      trackCalendarDateClicked({
        date,
        has_existing_expenses: entryDates.includes(date),
        action: 'show_expense_input'
      });
    }
  };

  // Handle expense submission
  const handleExpenseSubmit = async (expenseData: {
    date: string;
    amount: number;
    category: string;
    description: string | null;
    mode: 'UPI' | 'CASH' | 'DEBIT CARD' | 'CREDIT CARD';
  }) => {
    setIsSubmitting(true);
    setSuccessMessage(undefined);
    setErrorMessage(undefined);

    try {
      // Send to backend
      const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
      const initDataHeader = {
        'Content-Type': 'application/json',
        Authorization: `tma ${initDataRaw}`,
        ...(import.meta.env.DEV ? { 'X-Dev-Bypass': 'true' } : {})
      };

      const response = await fetch(`${apiUrl}/api/expenses`, {
        method: 'POST',
        headers: initDataHeader,
        body: JSON.stringify(expenseData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save expense: ${errorText}`);
      }

      // Success - show message and trigger refresh
      const message = `Expense of ₹${expenseData.amount} recorded for ${expenseData.date} in ${expenseData.category}`;
      setSuccessMessage(message);
      
      // Trigger refresh of calendar and expenses table
      setRefreshTrigger(prev => prev + 1);
      
      // Track successful expense addition from calendar
      trackExpenseAdded({
        source: 'calendar_date_click'
      });
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle message dismissal
  const handleDismissMessage = () => {
    setSuccessMessage(undefined);
    setErrorMessage(undefined);
  };

  // Fetch entry dates for Calendar
  useEffect(() => {
    if (!initDataRaw || !user) return;
    const fetchEntryDates = async () => {
      setLoadingDates(true);
      setDatesError(null);
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
        const requestUrl = `${apiUrl}/api/user/${user.id}/expenses/dates?year=${year}&month=${month}`;
        console.log('💰 [DATES] Fetching from URL:', requestUrl);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        try {
          const response = await fetch(requestUrl, {
            headers: {
              Authorization: `tma ${initDataRaw}`,
              ...(import.meta.env.DEV ? { 'X-Dev-Bypass': 'true' } : {})
            },
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (!response.ok) throw new Error(await response.text());
          const data = await response.json();
          console.log('💰 [DATES] Response:', data);
          setEntryDates(Array.isArray(data.days) ? data.days : []);
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          setDatesError(fetchError.message || 'Unknown error');
        } finally {
          setLoadingDates(false);
        }
      } catch (err: any) {
        setDatesError(err.message || 'Unknown error');
      }
    };
    fetchEntryDates();
  }, [initDataRaw, user, refreshTrigger]); // Added refreshTrigger dependency

  useEffect(() => {
    if (!initDataRaw || !user) return;
    const fetchBudgetData = async () => {
      setLoadingBudget(true);
      setBudgetError(null);
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
        const requestUrl = `${apiUrl}/api/user/${user.id}/budget/current-month?year=${year}&month=${month}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        const response = await fetch(requestUrl, {
          headers: {
            Authorization: `tma ${initDataRaw}`,
            ...(import.meta.env.DEV ? { 'X-Dev-Bypass': 'true' } : {})
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }
        const data = await response.json();
        setBudgetData(data);
      } catch (err: any) {
        setBudgetError(err.message || 'Failed to load budget data');
      } finally {
        setLoadingBudget(false);
      }
    };
    fetchBudgetData();
  }, [initDataRaw, user]);

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  // Construct selected date string for API
  const selectedDateString = selectedDate ? 
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}` : 
    null;

  // Show loading state while user data is being fetched
  if (userLoading) {
    return <div style={{ color: '#888', fontSize: 16, textAlign: 'center' }}>Loading user data...</div>;
  }

  // Show error state if user data failed to load
  if (userError) {
    return <div style={{ color: '#e74c3c', fontSize: 16, textAlign: 'center' }}>Error loading user data: {userError}</div>;
  }

  if (loadingDates) {
    return <div style={{ color: '#888', fontSize: 16, textAlign: 'center' }}>Loading Dashboard...</div>;
  }
  if (datesError) {
    return <div style={{ color: '#e74c3c', fontSize: 16, textAlign: 'center' }}>Error loading Dashboard: {datesError}</div>;
  }

  return (
    <div className="dashboard-panel-root">
      {loadingBudget ? (
        <div className="dashboard-budget-loading">Loading budget data...</div>
      ) : budgetError ? (
        <div className="dashboard-budget-error">Error: {budgetError}</div>
      ) : (
        <BudgetView
          totalExpenses={budgetData?.totalExpenses || 0}
          budget={budgetData?.budget || null}
          currentDate={budgetData?.currentDate || today.getDate()}
          daysInMonth={budgetData?.daysInMonth || daysInMonth}
          budgetPercentage={budgetData?.budgetPercentage || 0}
          datePercentage={budgetData?.datePercentage || 0}
          isFamily={budgetData?.isFamily || false}
          familyMembers={budgetData?.familyMembers || 1}
          customPeriod={budgetData?.customPeriod || false}
          periodStart={budgetData?.periodStart}
          periodEnd={budgetData?.periodEnd}
        />
      )}
      
      {/* ExpensesInputTemplate - Show when a date is selected */}
      {showExpensesComponents && selectedDateString && (
        <ExpensesInputTemplate
          onSubmit={handleExpenseSubmit}
          isSubmitting={isSubmitting}
          successMessage={successMessage}
          errorMessage={errorMessage}
          onDismissMessage={handleDismissMessage}
          variant="dashboard"
          selectedDate={selectedDateString}
        />
      )}
      
      <Calendar entryDates={entryDates} onDateClick={handleDateClick} />
      
      {/* ExpensesTable - Show when a date is selected */}
      {showExpensesComponents && internalUserId && initDataRaw && (
        <ExpensesTable
          userId={internalUserId}
          initDataRaw={initDataRaw}
          selectedDate={selectedDateString}
          refreshTrigger={refreshTrigger}
        />
      )}
    </div>
  );
}; 