import React from 'react';
import './BudgetViewSkeleton.css';

export const BudgetViewSkeleton: React.FC = () => {
  return (
    <div className="budgetview-skeleton-root">
      <div className="budgetview-skeleton-header">
        <div className="budgetview-skeleton-nav-button budgetview-skeleton-nav-prev">‹</div>
        <div className="budgetview-skeleton-month">Loading...</div>
        <div className="budgetview-skeleton-nav-button budgetview-skeleton-nav-next">›</div>
      </div>
      
      <div className="budgetview-skeleton-content">
        <div className="budgetview-skeleton-progress-container">
          <div className="budgetview-skeleton-progress-bar">
            <div className="budgetview-skeleton-progress-fill"></div>
          </div>
          <div className="budgetview-skeleton-progress-text">
            <div className="budgetview-skeleton-amount">₹0</div>
            <div className="budgetview-skeleton-separator">/</div>
            <div className="budgetview-skeleton-budget">₹0</div>
          </div>
        </div>
        
        <div className="budgetview-skeleton-details">
          <div className="budgetview-skeleton-stat">
            <div className="budgetview-skeleton-stat-label"></div>
            <div className="budgetview-skeleton-stat-value"></div>
          </div>
          <div className="budgetview-skeleton-stat">
            <div className="budgetview-skeleton-stat-label"></div>
            <div className="budgetview-skeleton-stat-value"></div>
          </div>
        </div>
      </div>
    </div>
  );
}; 