import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import './ModeSelector.css';

interface ModeSelectorProps {
  value: 'UPI' | 'CASH' | 'DEBIT CARD' | 'CREDIT CARD';
  onChange: (value: 'UPI' | 'CASH' | 'DEBIT CARD' | 'CREDIT CARD') => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: Array<{ value: 'UPI' | 'CASH' | 'DEBIT CARD' | 'CREDIT CARD'; display: string }> = [
    { value: 'UPI', display: 'BY UPI' },
    { value: 'CASH', display: 'IN CASH' },
    { value: 'DEBIT CARD', display: 'BY DEBIT CARD' },
    { value: 'CREDIT CARD', display: 'BY CREDIT CARD' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: 'UPI' | 'CASH' | 'DEBIT CARD' | 'CREDIT CARD') => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === value) || options[0];

  return (
    <div className="mode-selector-container" ref={dropdownRef}>
      <button
        className="mode-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="mode-selector-value">{selectedOption.display}</span>
        <ChevronUp 
          size={16} 
          className={`mode-selector-chevron ${isOpen ? 'open' : ''}`}
        />
      </button>
      
      {isOpen && (
        <div className="mode-selector-dropdown">
          {options.map((option) => (
            <button
              key={option.value}
              className={`mode-selector-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
              type="button"
            >
              {option.display}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 