import { useEffect, useMemo, useState } from 'react';
import { initDataRaw as _initDataRaw, initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';
import { BudgetView } from '@/components/BudgetView/BudgetView';
import { ExpensesTable } from '../../components/TableView/ExpensesTable';
import './DashboardPanel.css';

export const DashboardPanel = () => {
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);

  const [budgetData, setBudgetData] = useState<any>(null);
  const [loadingBudget, setLoadingBudget] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  // New state for internal user ID
  const [internalUserId, setInternalUserId] = useState<number | null>(null);
  const [userIdLoading, setUserIdLoading] = useState(false);
  const [userIdError, setUserIdError] = useState<string | null>(null);

  // Fetch internal user ID from backend
  useEffect(() => {
    if (!user?.id) return;
    setUserIdLoading(true);
    setUserIdError(null);
    const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
    const url = `${apiUrl}/api/user/${user.id}`;
    console.log('[DashboardPanel] Fetching internal user ID for telegram ID:', user.id, url);
    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        setInternalUserId(data.id);
        console.log('[DashboardPanel] Got internal user ID:', data.id);
      })
      .catch((err) => {
        setUserIdError('Failed to fetch internal user ID');
        setInternalUserId(null);
        console.error('[DashboardPanel] Error fetching internal user ID:', err);
      })
      .finally(() => setUserIdLoading(false));
  }, [user?.id]);

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

  if (userIdLoading) {
    return <div style={{ color: '#888', fontSize: 16, textAlign: 'center' }}>Loading user info...</div>;
  }
  if (userIdError) {
    return <div style={{ color: '#e74c3c', fontSize: 16, textAlign: 'center' }}>Error: {userIdError}</div>;
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
      {internalUserId && initDataRaw && <ExpensesTable userId={internalUserId} initDataRaw={initDataRaw} />}
    </div>
  );
}; 