import { useEffect, useMemo, useState } from 'react';
import { initDataRaw as _initDataRaw, initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';

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
    <div style={{ width: '100%', maxWidth: 400, margin: '24px auto', background: 'var(--color-bg-light)', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16, textAlign: 'center', fontFamily: 'var(--font-primary)', color: 'var(--color-text-dark)' }}>
        Expenses This Month
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--color-text-dark)', fontFamily: 'var(--font-primary)' }}>Loading...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', color: '#e74c3c', fontFamily: 'var(--font-primary)' }}>Error: {error}</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-primary)', fontSize: 15 }}>
          <thead>
            <tr style={{ background: 'var(--color-secondary)' }}>
              <th style={{ padding: 8, borderRadius: 4, textAlign: 'left' }}>Date</th>
              <th style={{ padding: 8, borderRadius: 4, textAlign: 'right' }}>Amount</th>
              <th style={{ padding: 8, borderRadius: 4, textAlign: 'left' }}>Category</th>
              <th style={{ padding: 8, borderRadius: 4, textAlign: 'left' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 16, color: 'var(--color-text-dark)', opacity: 0.7 }}>
                  No expenses found for this month.
                </td>
              </tr>
            ) : (
              expenses.map((exp, idx) => (
                <tr key={exp.id || idx} style={{ background: idx % 2 === 0 ? 'var(--color-bg-light)' : 'var(--color-secondary)', transition: 'background 0.2s' }}>
                  <td style={{ padding: 8 }}>{exp.date}</td>
                  <td style={{ padding: 8, textAlign: 'right', color: 'var(--color-primary)', fontWeight: 600 }}>&#8377;{Number(exp.amount).toLocaleString()}</td>
                  <td style={{ padding: 8 }}>{exp.category || '-'}</td>
                  <td style={{ padding: 8 }}>{exp.description || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}; 