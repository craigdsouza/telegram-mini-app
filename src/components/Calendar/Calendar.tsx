import React from 'react';

// Helper to get days in month
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Helper to get the weekday of the first day of the month (0 = Sunday, 6 = Saturday)
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const Calendar: React.FC = () => {
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

  return (
    <div style={{ width: '100%', maxWidth: 340, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 16 }}>
      <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
        {today.toLocaleString('default', { month: 'long' })} {year}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {WEEKDAYS.map((wd) => (
          <div key={wd} style={{ textAlign: 'center', color: '#888', fontWeight: 500, fontSize: 14 }}>{wd}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {days.map((d, i) => (
          <div key={i} style={{
            height: 32,
            textAlign: 'center',
            lineHeight: '32px',
            borderRadius: 6,
            background: d === today.getDate() ? '#e0f7fa' : 'transparent',
            color: d === today.getDate() ? '#00796b' : '#333',
            fontWeight: d === today.getDate() ? 700 : 400,
            opacity: d ? 1 : 0.3,
            fontSize: 15,
          }}>
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  );
}; 