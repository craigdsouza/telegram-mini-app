import { useEffect, useMemo, useState } from 'react';
import { initDataRaw as _initDataRaw, initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';
import './ExpensesTable.css';

function getCustomMonthRange(today: Date, start: number | null, end: number | null) {
  // If no custom, fallback to calendar month
  if (!start || !end) {
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const first = new Date(year, month - 1, 1);
    const last = new Date(year, month, 0);
    return { startDate: first, endDate: last };
  }
  // If start <= today, period started this month
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  let startDate = new Date(year, month - 1, start);
  let endDate = new Date(year, month - 1, end);
  if (start > end) {
    // Period spans two months
    if (today.getDate() >= start) {
      // Current period: start this month, end next month
      endDate = new Date(year, month, end);
    } else {
      // Current period: start last month, end this month
      startDate = new Date(year, month - 2, start);
    }
  }
  return { startDate, endDate };
}

export const ExpensesTable = () => {
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);

  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthStart, setMonthStart] = useState<number | null>(null);
  const [monthEnd, setMonthEnd] = useState<number | null>(null);

  useEffect(() => {
    if (!initDataRaw || !user) return;
    const fetchSettingsAndExpenses = async () => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date();
        const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
        const initDataHeader = {
          Authorization: `tma ${initDataRaw}`,
          ...(import.meta.env.DEV ? { 'X-Dev-Bypass': 'true' } : {})
        };
        // Fetch user settings
        const settingsRes = await fetch(`${apiUrl}/api/user/${user.id}/settings`, { headers: initDataHeader });
        let start: number | null = null;
        let end: number | null = null;
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          start = settingsData.settings.month_start;
          end = settingsData.settings.month_end;
        }
        setMonthStart(start);
        setMonthEnd(end);
        // Calculate date range
        const { startDate, endDate } = getCustomMonthRange(today, start, end);
        // Fetch expenses for this range
        const requestUrl = `${apiUrl}/api/user/${user.id}/expenses/range?start=${startDate.toISOString().slice(0,10)}&end=${endDate.toISOString().slice(0,10)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        const response = await fetch(requestUrl, {
          headers: initDataHeader,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }
        const data = await response.json();
        setExpenses(data.expenses || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load expenses');
      } finally {
        setLoading(false);
      }
    };
    fetchSettingsAndExpenses();
  }, [initDataRaw, user]);

  return (
    <div className="expenses-table-container">
      <div className="expenses-table-title">
        Expenses This Month
      </div>
      {loading ? (
        <div className="expenses-table-loading">Loading...</div>
      ) : error ? (
        <div className="expenses-table-error">Error: {error}</div>
      ) : (
        <table className="expenses-table">
          <thead>
            <tr className="expenses-table-header-row">
              <th className="expenses-table-header-cell left">Date</th>
              <th className="expenses-table-header-cell right">Amount</th>
              <th className="expenses-table-header-cell left">Category</th>
              <th className="expenses-table-header-cell left">Description</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={4} className="expenses-table-empty">No expenses found for this month.</td>
              </tr>
            ) : (
              expenses.map((exp, idx) => (
                <tr key={exp.id || idx} className={`expenses-table-row ${idx % 2 === 0 ? 'even' : 'odd'}`}> 
                  <td className="expenses-table-cell date">{exp.date}</td>
                  <td className="expenses-table-cell right highlight">&#8377;{Number(exp.amount).toLocaleString()}</td>
                  <td className="expenses-table-cell">{exp.category || '-'}</td>
                  <td className="expenses-table-cell">{exp.description || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}; 