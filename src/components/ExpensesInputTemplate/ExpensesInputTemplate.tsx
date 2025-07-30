import React, { useState} from 'react';
import { Send } from 'lucide-react';
import { DateSelector } from '@/components/DateSelector/DateSelector';
import { DateDisplay } from '@/components/DateSelector/DateDisplay';
import { ModeSelector } from '@/components/ModeSelector/ModeSelector';
import { CategorySelector } from '@/components/CategorySelector/CategorySelector';
import { usePostHogEvents } from '@/utils/posthogEvents';
import './ExpensesInputTemplate.css';

interface ExpensesInputTemplateProps {
  onSubmit: (expenseData: {
    date: string;
    amount: number;
    category: string;
    description: string | null;
    mode: 'UPI' | 'CASH' | 'DEBIT CARD' | 'CREDIT CARD';
  }) => void;
  isSubmitting?: boolean;
  successMessage?: string;
  errorMessage?: string;
  onDismissMessage?: () => void;
  variant?: 'default' | 'dashboard';
  selectedDate?: string; // YYYY-MM-DD format for dashboard variant
}

export const ExpensesInputTemplate: React.FC<ExpensesInputTemplateProps> = ({ 
  onSubmit, 
  isSubmitting = false,
  successMessage,
  errorMessage,
  onDismissMessage,
  variant = 'default',
  selectedDate
}) => {
  const [selectedDateOption, setSelectedDateOption] = useState<'TODAY' | 'YESTERDAY'>('TODAY');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMode, setSelectedMode] = useState<'UPI' | 'CASH' | 'DEBIT CARD' | 'CREDIT CARD'>('UPI');
  const [selectedCategory, setSelectedCategory] = useState<string>('Groceries');
  const { trackExpenseAddStarted } = usePostHogEvents();



  const handleSendMessage = () => {
    if (amount.trim() && !isSubmitting) {
      let expenseDate: string;
      
      if (variant === 'dashboard' && selectedDate) {
        // Use the selected date from calendar
        expenseDate = selectedDate;
      } else {
        // Use the date selector logic
        expenseDate = selectedDateOption === 'TODAY' ? new Date().toISOString().slice(0, 10) : 
              new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      }

      const expenseData = {
        date: expenseDate,
        amount: parseFloat(amount),
        category: selectedCategory,
        description: description.trim() || null,
        mode: selectedMode
      };

      onSubmit(expenseData);
      
      // Reset form
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

  const handleAmountClick = () => {
    // Track when user clicks on amount input to start adding expense
    trackExpenseAddStarted({
      source: variant === 'dashboard' ? 'calendar_date_click' : 'add_expense_page',
      selected_date: variant === 'dashboard' ? selectedDate : undefined
    });
  };

  // Build CSS classes
  const containerClasses = [
    'template-input-container',
    variant === 'dashboard' ? 'dashboard' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className="template-input-wrapper">
        {!successMessage && !errorMessage ? (
          <>
            <div className="template-text">
              {variant === 'dashboard' && selectedDate ? (
                <DateDisplay date={selectedDate} />
              ) : (
                <DateSelector value={selectedDateOption} onChange={setSelectedDateOption} />
              )}
              <span className="template-text-part"> I spent </span>
              <input
                type="text"
                className="amount-input"
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
                onKeyPress={handleKeyPress}
                onClick={handleAmountClick}
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
          </>
        ) : (
          <div className="message-content">
            <span className="message-icon">
              {successMessage ? '✅' : '❌'}
            </span>
            <span className="message-text">
              {successMessage || errorMessage}
            </span>
            <button 
              className="ok-button"
              onClick={onDismissMessage}
            >
              OK
            </button>
            {errorMessage && (
              <button 
                className="copy-button"
                onClick={() => {
                  navigator.clipboard.writeText(errorMessage);
                }}
              >
                Copy
              </button>
            )}
          </div>
        )}
      </div>


    </div>
  );
}; 