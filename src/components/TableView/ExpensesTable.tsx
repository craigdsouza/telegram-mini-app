import { useEffect, useMemo, useState } from 'react';
import { initDataRaw as _initDataRaw, initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';
import './ExpensesTable.css';

export const ExpensesTable = () => {
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);

  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initDataRaw || !user) return;
    const fetchExpenses = async () => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
        const requestUrl = `${apiUrl}/api/user/${user.id}/expenses/current-month?year=${year}&month=${month}`;
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
        setExpenses(data.expenses || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load expenses');
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
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