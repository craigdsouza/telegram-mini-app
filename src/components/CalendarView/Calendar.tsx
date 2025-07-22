import React, { useState, useEffect, useMemo } from 'react';
import {
  initDataRaw as _initDataRaw,
  initDataState as _initDataState,
  useSignal,
} from '@telegram-apps/sdk-react';
import { EntrySummary } from './EntrySummary';
import { BudgetView } from '../BudgetView/BudgetView';
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

export const Calendar: React.FC<{ entryDates?: number[] }> = ({ entryDates = [] }) => {
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);

  // Debug logging for Telegram mini app issues
  console.log('[DEBUG] initDataRaw:', initDataRaw);
  console.log('[DEBUG] initDataState:', initDataState);
  console.log('[DEBUG] user:', user);

  // console.log('entryDates prop:', entryDates, 'types:', entryDates.map(e => typeof e));
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
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

  return (
    <div className="calendar-root">
      <div className="calendar-title">
        {today.toLocaleString('default', { month: 'long' })}, {year}
      </div>
      <div className="calendar-weekdays-row">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="calendar-weekday-cell">{wd}</div>
        ))}
      </div>
      <div className="calendar-days-grid">
        {days.map((d, i) => {
          const isToday = d === today.getDate();
          const hasEntry = d !== null && entryDatesSet.has(d);
          let dayClass = 'calendar-day-cell';
          if (hasEntry) dayClass += ' has-entry';
          else if (isToday) dayClass += ' today';
          if (!d) dayClass += ' empty';
          return (
            <div key={i} className={dayClass}>{d || ''}</div>
          );
        })}
      </div>
      <EntrySummary
        entryCount={entryDates.length}
        totalDays={daysInMonth}
        monthName={today.toLocaleString('default', { month: 'long' })}
      />
    </div>
  );
}; 