import { useEffect, useState } from 'react';
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

interface ExpensesTableProps {
  userId: number;
  initDataRaw: string;
}

export const ExpensesTable: React.FC<ExpensesTableProps> = ({ userId, initDataRaw }) => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthStart, setMonthStart] = useState<number | null>(null);
  const [monthEnd, setMonthEnd] = useState<number | null>(null);
  console.log(monthStart, monthEnd);
  
  useEffect(() => {
    if (!initDataRaw || !userId) return;
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
        const settingsRes = await fetch(`${apiUrl}/api/user/${userId}/settings`, { headers: initDataHeader });
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
        let expenses = [];
        if (start && startDate.toISOString().slice(0,10) !== new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0,10)) {
          // Use custom range endpoint if custom start date is set and not the 1st of the month
          const requestUrl = `${apiUrl}/api/user/${userId}/expenses/range?start=${startDate.toISOString().slice(0,10)}&end=${endDate.toISOString().slice(0,10)}`;
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
          expenses = data.expenses || [];
        } else {
          // Use current month endpoint if no custom start date
          const year = today.getFullYear();
          const month = today.getMonth() + 1;
          // NOTE: This endpoint expects the Telegram user ID, not internal. You may need to pass it as a prop if needed.
          // For now, fallback to internal user ID for both endpoints for consistency.
          const requestUrl = `${apiUrl}/api/user/${userId}/expenses/current-month?year=${year}&month=${month}`;
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
          expenses = data.expenses || [];
        }
        setExpenses(expenses);
      } catch (err: any) {
        setError(err.message || 'Failed to load expenses');
      } finally {
        setLoading(false);
      }
    };
    fetchSettingsAndExpenses();
  }, [initDataRaw, userId]);

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
                  <td className="expenses-table-cell amount highlight">&#8377;{Number(exp.amount).toLocaleString()}</td>
                  <td className="expenses-table-cell category">{exp.category || '-'}</td>
                  <td className="expenses-table-cell description">{exp.description || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}; 