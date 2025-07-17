import React from 'react';

interface BudgetViewProps {
  totalExpenses: number;
  budget: number | null;
  currentDate: number;
  daysInMonth: number;
  budgetPercentage: number;
  datePercentage: number;
//   currency: string;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  totalExpenses,
  budget,
  currentDate,
  daysInMonth,
  budgetPercentage,
  datePercentage,
//   currency
}) => {
  if (!budget || budget <= 0) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: 'var(--color-text-dark)',
        fontFamily: 'var(--font-primary)',
        fontSize: 16,
        fontWeight: 500,
        background: 'var(--color-bg-light)',
        borderRadius: 12,
        margin: '16px 0',
        border: '2px solid var(--color-secondary)'
      }}>
        No budget set. Use /budget to set your monthly budget.
      </div>
    );
  }

  const isOverBudget = budgetPercentage > 100;
  const progressColor = isOverBudget ? '#e74c3c' : 'var(--color-primary)';

  return (
    <div style={{
      padding: '20px',
      background: 'var(--color-bg-light)',
      borderRadius: 12,
      margin: '16px 0',
      border: '2px solid var(--color-secondary)',
      fontFamily: 'var(--font-primary)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--color-text-dark)'
        }}>
          Budget Progress
        </h3>
        <span style={{
          fontSize: 14,
          color: 'var(--color-text-dark)',
          opacity: 0.8
        }}>
          Day {currentDate} of {daysInMonth}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div style={{
        position: 'relative',
        marginBottom: '16px'
      }}>
        {/* Main Progress Bar */}
        <div style={{
          height: 24,
          background: 'var(--color-secondary)',
          borderRadius: 12,
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Budget Progress Fill */}
          <div style={{
            height: '100%',
            width: `${Math.min(budgetPercentage, 100)}%`,
            background: progressColor,
            borderRadius: 12,
            transition: 'width 0.5s ease',
            position: 'relative'
          }} />
          
          {/* Date Indicator Line */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: `${datePercentage}%`,
            width: 2,
            height: '100%',
            background: 'var(--color-text-dark)',
            zIndex: 2
          }} />
        </div>
      </div>

      {/* Budget Details */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 14,
        color: 'var(--color-text-dark)'
      }}>
        <div>
          <span style={{ fontWeight: 500 }}>Spent: </span>
          <span style={{ 
            color: isOverBudget ? '#e74c3c' : 'var(--color-primary)',
            fontWeight: 600 
          }}>
            ₹{totalExpenses.toLocaleString()}
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 500 }}>Budget: </span>
          <span style={{ fontWeight: 600 }}>₹{budget.toLocaleString()}</span>
        </div>
      </div>

      {/* Progress Percentage */}
      <div style={{
        textAlign: 'center',
        marginTop: '12px',
        fontSize: 16,
        fontWeight: 600,
        color: isOverBudget ? '#e74c3c' : 'var(--color-primary)'
      }}>
        {budgetPercentage.toFixed(1)}% of budget used
      </div>

      {/* Warning if over budget */}
      {isOverBudget && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: '#fee',
          color: '#e74c3c',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 500,
          textAlign: 'center',
          border: '1px solid #fcc'
        }}>
          ⚠️ You're over budget by ₹{(totalExpenses - budget).toLocaleString()}
        </div>
      )}
    </div>
  );
}; 