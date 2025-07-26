import React from 'react';
import { Check } from 'lucide-react';
import './CheckBoxList.css';

interface CheckBoxItem {
  text: string;
  completed: boolean;
}

interface CheckBoxListProps {
  items: CheckBoxItem[];
}

export const CheckBoxList: React.FC<CheckBoxListProps> = ({ items }) => {
  return (
    <div className="checkbox-list">
      {items.map((item, index) => (
        <div 
          key={index} 
          className={`checkbox-item ${item.completed ? 'completed' : 'incomplete'}`}
        >
          <div className="checkbox-icon">
            {item.completed && <Check size={14} />}
          </div>
          <span className="checkbox-text">{item.text}</span>
        </div>
      ))}
    </div>
  );
}; 