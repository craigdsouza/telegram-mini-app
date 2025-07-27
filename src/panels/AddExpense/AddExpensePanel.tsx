import React, { useState } from 'react';
import { Send, Plus } from 'lucide-react';
import { DateSelector } from '@/components/DateSelector/DateSelector';
import { ModeSelector } from '@/components/ModeSelector/ModeSelector';
import { CategorySelector } from '@/components/CategorySelector/CategorySelector';
import './AddExpensePanel.css';

export const AddExpensePanel: React.FC = () => {
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
                <p>Hi! I'm here to help you track your expenses. Use the template below to add your expense in one go!</p>
              </div>
              <div className="message-time">now</div>
            </div>
          </div>
        </div>
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