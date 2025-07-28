import React from 'react';
import './DateDisplay.css';

interface DateDisplayProps {
  date: string; // YYYY-MM-DD format
}

export const DateDisplay: React.FC<DateDisplayProps> = ({ date }) => {
  // Format the date for display (e.g., "2024-12-15" -> "Dec 15, 2024")
  const formatDateForDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      // Fallback to original format if parsing fails
      return dateString;
    }
  };

  return (
    <div className="date-display-container">
      <span className="date-display-value">
        {formatDateForDisplay(date)}
      </span>
    </div>
  );
}; 