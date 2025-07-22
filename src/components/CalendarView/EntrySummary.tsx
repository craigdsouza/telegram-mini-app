import React from 'react';

interface EntrySummaryProps {
  entryCount: number;
  totalDays: number;
  monthName: string;
}

export const EntrySummary: React.FC<EntrySummaryProps> = ({ entryCount, totalDays, monthName }) => {
  // Motivating message logic (can be enhanced)
  let message = '';
  if (entryCount === 0) message = "Let's get started! Add your first entry.";
  else if (entryCount < totalDays / 3) message = "Great start! Keep building your habit.";
  else if (entryCount < totalDays / 2) message = "You're making progress! Stay consistent.";
  else if (entryCount < totalDays * 0.8) message = "Awesome! You're on a roll.";
  else if (entryCount < totalDays) message = "Almost there! Finish the month strong.";
  else message = "Perfect streak! You're a finance champion!";

  return (
    <div style={{
      margin: '18px 0 0 0',
      padding: '12px 18px',
      background: 'linear-gradient(90deg, #fffbe6 0%, #ffe082 100%)',
      borderRadius: 10,
      boxShadow: '0 1px 4px rgba(255, 215, 0, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: 16,
      fontWeight: 500,
      color: '#7a5a00',
      gap: 16,
      fontFamily: 'var(--font-primary)'
    }}>
      <span style={{ fontFamily: 'var(--font-primary)' }}>{entryCount}/{totalDays} days in {monthName}</span>
      <span style={{ 
        fontSize: 15, 
        fontWeight: 400, 
        color: '#b26a00',
        fontFamily: 'var(--font-primary)'
      }}>{message}</span>
    </div>
  );
}; 