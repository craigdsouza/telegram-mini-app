import React, { useState, useMemo } from 'react';
import { initDataRaw as _initDataRaw, initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';
import { ExpensesInputTemplate } from '@/components/ExpensesInputTemplate/ExpensesInputTemplate';
import { ExpensesTable } from '@/components/TableView/ExpensesTable';
import { useUser } from '@/contexts/UserContext';
import { usePostHogEvents } from '@/utils/posthogEvents';
import './AddExpensePanel.css';

export const AddExpensePanel: React.FC = () => {
  const { internalUserId, isLoading: userLoading, error: userError } = useUser();
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);
  const { trackExpenseAddStarted, trackExpenseAdded } = usePostHogEvents();
  console.log('💰 [ADD EXPENSE]: trackExpenseAddStarted', trackExpenseAddStarted);
  console.log('💰 [ADD EXPENSE] User:', internalUserId, user);



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
      
      // Track successful expense addition
      trackExpenseAdded({
        source: 'add_expense_page'
      });
      
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

  return (
    <div className="add-expense-panel-root">
      {/* Expenses Table */}
      <div className="expenses-table-container-header">
        <h2>Expenses this month</h2>
      </div>
      <div className="expenses-table-container">
        {userLoading ? (
          <div className="expenses-loading">Loading user info...</div>
        ) : userError ? (
          <div className="expenses-error">Error: {userError}</div>
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