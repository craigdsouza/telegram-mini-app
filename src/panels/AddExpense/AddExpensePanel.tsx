import React, { useState, useEffect, useMemo } from 'react';
import { Send} from 'lucide-react';
import { initDataRaw as _initDataRaw, initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';
import { DateSelector } from '@/components/DateSelector/DateSelector';
import { ModeSelector } from '@/components/ModeSelector/ModeSelector';
import { CategorySelector } from '@/components/CategorySelector/CategorySelector';
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

  const [selectedDate, setSelectedDate] = useState<'TODAY' | 'YESTERDAY'>('TODAY');
  const [selectedMode, setSelectedMode] = useState<'UPI' | 'CASH' | 'DEBIT CARD' | 'CREDIT CARD'>('UPI');
  const [selectedCategory, setSelectedCategory] = useState<string>('Groceries');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSendMessage = async () => {
    if (amount.trim() && !isSubmitting) {
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        // Create expense object for API
        const expenseData = {
          date: selectedDate === 'TODAY' ? new Date().toISOString().slice(0, 10) : 
                new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          amount: parseFloat(amount),
          category: selectedCategory,
          description: description.trim() || null,
          mode: selectedMode
        };

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

        // Success - show message and reset form
        const message = `Expense of ₹${amount} recorded for ${selectedDate} in ${selectedCategory}`;
        setSuccessMessage(message);
        setShowSuccessMessage(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
          setSuccessMessage('');
        }, 3000);
        
        setAmount('');
        setDescription('');
        
        // Trigger ExpensesTable to reload data from database
        setRefreshTrigger(prev => prev + 1);
        
      } catch (error: any) {
        setSubmitError(error.message || 'Failed to save expense');
        console.error('Error saving expense:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
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
      {/* Messages Panel */}
      <div className="messages-panel">
        <div className="messages-container">
          {/* Welcome Message */}
          <div className="message bot-message">
            <div className="message-avatar">
              <span className="avatar-emoji">🦫</span>
            </div>
            <div className="message-content">
              <div className="message-bubble">
                <p>Hi! I'm here to help you track your expenses. This feature is still in development. <br></br>For now please continue to add expenses via the <b>bot</b> with the <b>/add</b> command!</p>
              </div>
              <div className="message-time">now</div>
            </div>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="message bot-message success-message">
              <div className="message-avatar">
                <span className="avatar-emoji">✅</span>
              </div>
              <div className="message-content">
                <div className="message-bubble success-bubble">
                  <p>{successMessage}</p>
                </div>
                <div className="message-time">now</div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="message bot-message error-message">
              <div className="message-avatar">
                <span className="avatar-emoji">❌</span>
              </div>
              <div className="message-content">
                <div className="message-bubble error-bubble">
                  <p>{submitError}</p>
                </div>
                <div className="message-time">now</div>
              </div>
            </div>
          )}
        </div>
      </div>

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
          />
        ) : null}
      </div>

      {/* Template Input */}
      <div className="template-input-container">
        <div className="template-input-wrapper">
          <div className="template-text">
            <DateSelector value={selectedDate} onChange={setSelectedDate} />
            <span className="template-text-part"> I spent </span>
            <input
              type="text"
              className="amount-input"
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
              onKeyPress={handleKeyPress}
            />
            <ModeSelector value={selectedMode} onChange={setSelectedMode} />
            <span className="template-text-part"> on </span>
            <CategorySelector value={selectedCategory} onChange={setSelectedCategory} />
            <span className="template-text-part">. Description - </span>
            <input
              type="text"
              className="description-input"
              placeholder="veggies from the supermarket (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
                      <button 
              className="send-button"
              onClick={handleSendMessage}
              disabled={!amount.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <div className="loading-spinner"></div>
              ) : (
                <Send size={20} />
              )}
            </button>
        </div>
      </div>
    </div>
  );
}; 