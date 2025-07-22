import React from 'react';
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
  familyMembers = 1,
//   currency
}) => {
  if (!budget || budget <= 0) {
    return (
      <div className="budgetview-empty">
        No budget set. Use /budget to set your monthly budget.
      </div>
    );
  }

  const isOverBudget = budgetPercentage > 100;
  const progressColor = isOverBudget ? 'over' : 'normal';

  return (
    <div className="budgetview-root">
      {/* Header */}
      <div className="budgetview-header">
        <h3 className="budgetview-title">
          {isFamily ? (
            <>
              👨‍👩‍👧‍👦 Family Budget{familyMembers > 1 ? ` (${familyMembers} members)` : ''}
            </>
          ) : (
            <>Budget Progress</>
          )}
        </h3>
        <span className="budgetview-day">
          Day {currentDate} of {daysInMonth}
        </span>
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

      {/* Budget Details */}
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

      {/* Progress Percentage */}
      <div className={`budgetview-percent${isOverBudget ? ' over' : ''}`}>
        {budgetPercentage.toFixed(1)}% of budget used
      </div>

      {/* Warning if over budget */}
      {isOverBudget && (
        <div className="budgetview-warning">
          ⚠️ You're over budget by ₹{(totalExpenses - budget).toLocaleString()}
        </div>
      )}
    </div>
  );
}; 