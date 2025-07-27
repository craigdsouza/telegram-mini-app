import React, { useState, useEffect, useMemo } from 'react';
import { initDataRaw as _initDataRaw, initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';
import { ExpensesInputTemplate } from '@/components/ExpensesInputTemplate/ExpensesInputTemplate';
import { ExpensesTable } from '@/components/TableView/ExpensesTable';
import './AddExpensePanel.css';

export const AddExpensePanel: React.FC = () => {
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);

  // State for internal user ID (needed for ExpensesTable)
  const [internalUserId, setInternalUserId] = useState<number | null>(null);
  const [userIdLoading, setUserIdLoading] = useState(false);
  const [userIdError, setUserIdError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [highlightNewEntry, setHighlightNewEntry] = useState(false);
  const [newExpenseData, setNewExpenseData] = useState<{
    date: string;
    amount: number;
    category: string;
    description: string | null;
    mode: 'UPI' | 'CASH' | 'DEBIT CARD' | 'CREDIT CARD';
  } | null>(null);

  const handleExpenseSubmit = async (expenseData: {
    date: string;
    amount: number;
    category: string;
    description: string | null;
    mode: 'UPI' | 'CASH' | 'DEBIT CARD' | 'CREDIT CARD';
  }) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
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

      // Success - show message and trigger table refresh
      const message = `Expense of ₹${expenseData.amount} recorded for ${expenseData.date} in ${expenseData.category}`;
      setSuccessMessage(message);
      setRefreshTrigger(prev => prev + 1);
      console.log('[AddExpensePanel] Setting highlightNewEntry to true');
      setHighlightNewEntry(true);
      setNewExpenseData(expenseData);
      
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to save expense');
      console.error('Error saving expense:', error);
          } finally {
        setIsSubmitting(false);
      }
    };

  const handleDismissMessage = () => {
    console.log('[AddExpensePanel] handleDismissMessage called, setting highlightNewEntry to false');
    setSuccessMessage(null);
    setSubmitError(null);
    setHighlightNewEntry(false);
    setNewExpenseData(null);
  };



  // Fetch internal user ID from backend (needed for ExpensesTable)
  useEffect(() => {
    if (!user?.id) return;
    setUserIdLoading(true);
    setUserIdError(null);
    const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
    const url = `${apiUrl}/api/user/${user.id}`;
    console.log('[AddExpensePanel] Fetching internal user ID for telegram ID:', user.id, url);
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
        console.log('[AddExpensePanel] Got internal user ID:', data.id);
      })
      .catch((err) => {
        setUserIdError('Failed to fetch internal user ID');
        setInternalUserId(null);
        console.error('[AddExpensePanel] Error fetching internal user ID:', err);
      })
      .finally(() => setUserIdLoading(false));
  }, [user?.id]);

  return (
    <div className="add-expense-panel-root">
      {/* Expenses Table */}
      <div className="expenses-table-container-header">
        <h2>Expenses this month</h2>
      </div>
      <div className="expenses-table-container">
        {userIdLoading ? (
          <div className="expenses-loading">Loading user info...</div>
        ) : userIdError ? (
          <div className="expenses-error">Error: {userIdError}</div>
        ) : internalUserId && initDataRaw ? (
          <ExpensesTable 
            userId={internalUserId} 
            initDataRaw={initDataRaw} 
            refreshTrigger={refreshTrigger}
            highlightNewEntry={highlightNewEntry}
            newExpenseData={newExpenseData || undefined}
          />
        ) : null}
      </div>



      {/* Expenses Input Template */}
      <ExpensesInputTemplate 
        onSubmit={handleExpenseSubmit}
        isSubmitting={isSubmitting}
        successMessage={successMessage || undefined}
        errorMessage={submitError || undefined}
        onDismissMessage={handleDismissMessage}
      />
    </div>
  );
}; 