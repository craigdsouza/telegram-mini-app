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

  const handleSendMessage = () => {
    if (amount.trim() && description.trim()) {
      // TODO: Handle message sending logic
      console.log('Sending expense:', { date: selectedDate, mode: selectedMode, category: selectedCategory, amount, description });
      setAmount('');
      setDescription('');
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
          <ExpensesTable userId={internalUserId} initDataRaw={initDataRaw} />
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
              placeholder="veggies from the supermarket"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <button 
            className="send-button"
            onClick={handleSendMessage}
            disabled={!amount.trim() || !description.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}; 