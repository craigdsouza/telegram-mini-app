import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { categoryData} from '@/data/categories';
import './CategorySelector.css';

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleSelect = (categoryValue: string) => {
    onChange(categoryValue);
    setIsOpen(false);
  };

  const selectedCategory = categoryData.find(cat => cat.value === value) || categoryData[0];

  return (
    <div className="category-selector-container" ref={dropdownRef}>
      <button
        className="category-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="category-selector-emoji">{selectedCategory.emoji}</span>
        <span className="category-selector-value">{selectedCategory.label}</span>
        <ChevronUp 
          size={16} 
          className={`category-selector-chevron ${isOpen ? 'open' : ''}`}
        />
      </button>
      
      {isOpen && (
        <div className="category-selector-dropdown">
          {categoryData.map((category) => (
            <button
              key={category.value}
              className={`category-selector-option ${value === category.value ? 'selected' : ''}`}
              onClick={() => handleSelect(category.value)}
              type="button"
            >
              <span className="category-option-emoji">{category.emoji}</span>
              <span className="category-option-label">{category.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 