import React, { useState, useEffect} from 'react';
import { usePostHogEvents } from '@/utils/posthogEvents';
import './BudgetView.css';

interface BudgetViewProps {
  totalExpenses: number;
  budget: number | null;
  currentDate: number;
  daysInMonth: number;
  budgetPercentage: number;
  datePercentage: number;
  isFamily?: boolean;
  familyMembers?: number;
  customPeriod?: boolean;
  periodStart?: string;
  periodEnd?: string;
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
//   currency: string;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  totalExpenses,
  budget,
  currentDate,
  daysInMonth,
  budgetPercentage,
  datePercentage,
  isFamily = false,
  // familyMembers = 1,
  customPeriod = false,
  // periodStart,
  // periodEnd,
  currentMonth,
  onPreviousMonth,
  onNextMonth,
//   currency
}) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem('budgetViewExpanded');
    return saved ? JSON.parse(saved) : false;
  });
  const [isPressed, setIsPressed] = useState(false);
  const { trackBudgetViewExpanded } = usePostHogEvents();
  
  // Save expanded state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('budgetViewExpanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  if (!budget || budget <= 0) {
    return (
      <div className="budgetview-empty">
        No budget set. Use /budget to set your monthly budget.
      </div>
    );
  }

  const isOverBudget = budgetPercentage > 100;
  const progressColor = isOverBudget ? 'over' : 'normal';

  const handleClick = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // Track when user expands the budget view
    if (newExpandedState) {
      trackBudgetViewExpanded({
        is_family: isFamily,
        custom_period: customPeriod,
        budget_percentage: budgetPercentage,
        is_over_budget: budgetPercentage > 100
      });
    }
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

  const handlePreviousMonth = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the budget expand/collapse
    onPreviousMonth();
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the budget expand/collapse
    onNextMonth();
  };

  // Build CSS classes
  const cardClasses = [
    'budgetview-root',
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
      {/* Header */}
      <div className="budgetview-header">
        <div className="budgetview-title-row">
          <button 
            className="budgetview-nav-button budgetview-nav-prev"
            onClick={handlePreviousMonth}
            aria-label="Previous month"
          >
            ‹
          </button>
          <h3 className="budgetview-title">
            {isFamily ? (
              <>
                👨‍👩‍👧‍👦 Family Budget
              </>
            ) : (
              <>Budget Progress</>
            )}
          </h3>
          <button 
            className="budgetview-nav-button budgetview-nav-next"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
        <div className="budgetview-subtitle-row">
          <span className="budgetview-month">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <span className="budgetview-day">
            {customPeriod ? (
              <>
                Day {currentDate} of {daysInMonth} <small className="budgetview-period-info"> (Custom period) </small>
              </>
            ) : (
              <>
                {currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear() 
                  ? `Day ${currentDate} of ${daysInMonth}`
                  : `Month of ${daysInMonth} days`
                }
              </>
            )}
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="budgetview-progress-container">
        {/* Main Progress Bar */}
        <div className="budgetview-progress-bar">
          {/* Budget Progress Fill */}
          <div className={`budgetview-progress-fill ${progressColor}`} style={{width: `${Math.min(budgetPercentage, 100)}%`}} />
          {/* Date Indicator Line */}
          <div className="budgetview-date-indicator" style={{left: `${datePercentage}%`}} />
        </div>
      </div>

      {/* Budget Details - Only show when expanded */}
      {isExpanded && (
        <div className="budgetview-details">
          <div>
            <span className="budgetview-spent-label">Spent: </span>
            <span className={`budgetview-spent${isOverBudget ? ' over' : ''}`}>
              ₹{totalExpenses.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="budgetview-budget-label">Budget: </span>
            <span className="budgetview-budget">₹{budget.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Progress Percentage - Only show when expanded */}
      {isExpanded && (
        <div className={`budgetview-percent${isOverBudget ? ' over' : ''}`}>
          {budgetPercentage.toFixed(1)}% of budget used
        </div>
      )}

      {/* Warning if over budget - Only show when expanded */}
      {isExpanded && isOverBudget && (
        <div className="budgetview-warning">
          ⚠️ You're over budget by ₹{(totalExpenses - budget).toLocaleString()}
        </div>
      )}
    </div>
  );
}; 