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
  days.forEach((d, i) => {
    if (d !== null) {
      console.log(`Day: ${d}, typeof: ${typeof d}, in entryDates:`, entryDates.includes(d));
    }
  });

  return (
    <div style={{ width: '100%', maxWidth: 340, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 16 }}>
      <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 20, marginBottom: 12, letterSpacing: 0.2 }}>
        {today.toLocaleString('default', { month: 'long' })}, {year}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {WEEKDAYS.map((wd) => (
          <div key={wd} style={{ textAlign: 'center', color: '#888', fontWeight: 500, fontSize: 14 }}>{wd}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {days.map((d, i) => {
          const isToday = d === today.getDate();
          const hasEntry = d !== null && entryDates.includes(d);
          let background = 'transparent';
          let color = '#333';
          let fontWeight = 400;
          if (hasEntry && isToday) {
            background = 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)';
            color = '#fff';
            fontWeight = 700;
          } else if (hasEntry) {
            background = '#FFD700'; // gold
            color = '#7a5a00'; // dark gold text
            fontWeight = 700;
          } else if (isToday) {
            background = '#ffe082';
            color = '#b26a00';
            fontWeight = 700;
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