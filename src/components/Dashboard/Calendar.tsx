import React from 'react';
import { EntrySummary } from './EntrySummary';

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
  console.log('entryDates prop:', entryDates, 'types:', entryDates.map(e => typeof e));
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

  // For debugging: log each day and check if it's in entryDates
  days.forEach((d) => {
    if (d !== null) {
      console.log(`Day: ${d}, typeof: ${typeof d}, in entryDates:`, entryDatesSet.has(d));
    }
  });

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: 340, 
      margin: '24px auto 0 auto', 
      background: 'var(--color-secondary)', 
      borderRadius: 12, 
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
      padding: 16 
    }}>
      <div style={{ 
        textAlign: 'center', 
        fontWeight: 700, 
        fontSize: 20, 
        marginBottom: 12, 
        letterSpacing: 'var(--tracking-wide)',
        fontFamily: 'var(--font-primary)',
        color: 'var(--color-text-dark)'
      }}>
        {today.toLocaleString('default', { month: 'long' })}, {year}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {WEEKDAYS.map((wd) => (
          <div key={wd} style={{ 
            textAlign: 'center', 
            color: 'var(--color-text-dark)', 
            fontWeight: 500, 
            fontSize: 14,
            fontFamily: 'var(--font-primary)',
            opacity: 0.7
          }}>{wd}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {days.map((d, i) => {
          const isToday = d === today.getDate();
          const hasEntry = d !== null && entryDatesSet.has(d);
          let background = 'transparent';
          let color = 'var(--color-text-dark)';
          let fontWeight = 400;
          let border = 'none';
          if (hasEntry) {
            background = 'var(--color-primary)'; // squirrel orange fill
            color = 'var(--color-text-light)'; // light text on orange
            fontWeight = 700;
            border = 'none';
          } else if (isToday) {
            background = 'transparent';
            color = 'var(--color-primary)'; // squirrel orange text
            fontWeight = 700;
            border = '2px solid var(--color-primary)';
          }
          return (
            <div key={i} style={{
              height: 32,
              textAlign: 'center',
              lineHeight: '32px',
              borderRadius: 6,
              background,
              color,
              fontWeight,
              opacity: d ? 1 : 0.3,
              fontSize: 15,
              border,
              boxSizing: 'border-box',
              fontFamily: 'var(--font-primary)'
            }}>
              {d || ''}
            </div>
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