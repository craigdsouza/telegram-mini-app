import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import './DateSelector.css';

interface DateSelectorProps {
  value: 'TODAY' | 'YESTERDAY';
  onChange: (value: 'TODAY' | 'YESTERDAY') => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: Array<{ value: 'TODAY' | 'YESTERDAY'; label: string }> = [
    { value: 'TODAY', label: 'TODAY' },
    { value: 'YESTERDAY', label: 'YESTERDAY' }
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

  const handleSelect = (optionValue: 'TODAY' | 'YESTERDAY') => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="date-selector-container" ref={dropdownRef}>
      <button
        className="date-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="date-selector-value">{value}</span>
        <ChevronUp 
          size={16} 
          className={`date-selector-chevron ${isOpen ? 'open' : ''}`}
        />
      </button>
      
      {isOpen && (
        <div className="date-selector-dropdown">
          {options.map((option) => (
            <button
              key={option.value}
              className={`date-selector-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 