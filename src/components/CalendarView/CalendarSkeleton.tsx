import React from 'react';
import './CalendarSkeleton.css';

export const CalendarSkeleton: React.FC = () => {
  // Generate skeleton calendar grid (6 weeks × 7 days)
  const skeletonDays = Array.from({ length: 42 }, (_, i) => i);

  return (
    <div className="calendar-skeleton-root">
      <div className="calendar-skeleton-title">
        <div className="calendar-skeleton-nav-button calendar-skeleton-nav-prev">‹</div>
        <div className="calendar-skeleton-month-name">Loading...</div>
        <div className="calendar-skeleton-nav-button calendar-skeleton-nav-next">›</div>
      </div>
      
      <div className="calendar-skeleton-weekdays-row">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((wd) => (
          <div key={wd} className="calendar-skeleton-weekday-cell">{wd}</div>
        ))}
      </div>
      
      <div className="calendar-skeleton-days-grid">
        {skeletonDays.map((i) => (
          <div 
            key={i} 
            className="calendar-skeleton-day-cell"
          >
            <div className="calendar-skeleton-day-number"></div>
          </div>
        ))}
      </div>
      
      <div className="calendar-skeleton-summary">
        <div className="calendar-skeleton-summary-text"></div>
      </div>
    </div>
  );
}; 