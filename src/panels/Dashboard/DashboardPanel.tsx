import { useEffect, useMemo, useState } from 'react';
import { initDataRaw as _initDataRaw, initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';
import { BudgetView } from '@/components/BudgetView/BudgetView';
import { Calendar } from '@/components/CalendarView/Calendar';
import './DashboardPanel.css';

export const DashboardPanel = () => {
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);

  const [budgetData, setBudgetData] = useState<any>(null);
  const [loadingBudget, setLoadingBudget] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  // State for entry dates (needed for Calendar)
  const [entryDates, setEntryDates] = useState<number[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [datesError, setDatesError] = useState<string | null>(null);

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
  }, [initDataRaw, user]);

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
      <Calendar entryDates={entryDates} />
    </div>
  );
}; 