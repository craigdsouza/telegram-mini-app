import React, { useMemo, useState } from 'react';
import {
  initDataRaw as _initDataRaw,
  initDataState as _initDataState,
  useSignal,
} from '@telegram-apps/sdk-react';
import { EntrySummary } from './EntrySummary';
import './Calendar.css';

// Helper to get days in month
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Helper to get the weekday of the first day of the month (0 = Sunday, 6 = Saturday)
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarProps {
  entryDates?: number[];
  onDateClick?: (date: number) => void;
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export const Calendar: React.FC<CalendarProps> = ({ 
  entryDates = [], 
  onDateClick,
  currentMonth,
  onPreviousMonth,
  onNextMonth
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPressed, setIsPressed] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);

  // Debug logging for Telegram mini app issues
  console.log('[DEBUG] initDataRaw:', initDataRaw);
  console.log('[DEBUG] initDataState:', initDataState);
  console.log('[DEBUG] user:', user);

  // console.log('entryDates prop:', entryDates, 'types:', entryDates.map(e => typeof e));
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  // Convert entryDates to numbers for robust comparison
  const entryDatesSet = new Set(entryDates.map(Number));

  // Build calendar grid
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null); // Empty cells for previous month
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }
  // Fill the last row with nulls if needed
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  const handleDateClick = (e: React.MouseEvent, date: number) => {
    e.stopPropagation(); // Prevent triggering the calendar expand/collapse
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date);
    }
  };

  const handlePreviousMonth = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the calendar expand/collapse
    onPreviousMonth();
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the calendar expand/collapse
    onNextMonth();
  };

  // Build CSS classes
  const cardClasses = [
    'calendar-root',
    isPressed ? 'pressed' : ''
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      <div className="calendar-title">
        <button 
          className="calendar-nav-button calendar-nav-prev"
          onClick={handlePreviousMonth}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="calendar-month-name">
          {currentMonth.toLocaleString('default', { month: 'long' })}, {year}
        </span>
        <button 
          className="calendar-nav-button calendar-nav-next"
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      
      {/* Calendar content - Only show when expanded */}
      {isExpanded && (
        <>
          <div className="calendar-weekdays-row">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="calendar-weekday-cell">{wd}</div>
            ))}
          </div>
          <div className="calendar-days-grid">
            {days.map((d, i) => {
              const today = new Date();
              const isToday = d === today.getDate() && 
                             currentMonth.getMonth() === today.getMonth() && 
                             currentMonth.getFullYear() === today.getFullYear();
              const hasEntry = d !== null && entryDatesSet.has(d);
              const isSelected = d === selectedDate;
              
              let dayClass = 'calendar-day-cell';
              if (hasEntry) dayClass += ' has-entry';
              if (isToday) dayClass += ' today';
              if (isSelected) dayClass += ' selected';
              if (!d) dayClass += ' empty';
              
              return (
                <div 
                  key={i} 
                  className={dayClass}
                  onClick={d !== null ? (e) => handleDateClick(e, d) : undefined}
                  style={d !== null ? { cursor: 'pointer' } : undefined}
                >
                  {d || ''}
                </div>
              );
            })}
          </div>
          <EntrySummary
            entryCount={entryDates.length}
            totalDays={daysInMonth}
            monthName={currentMonth.toLocaleString('default', { month: 'long' })}
          />
        </>
      )}
    </div>
  );
}; 