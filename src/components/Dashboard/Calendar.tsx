import React, { useState, useEffect, useMemo } from 'react';
import {
  initDataRaw as _initDataRaw,
  initDataState as _initDataState,
  useSignal,
} from '@telegram-apps/sdk-react';
import { EntrySummary } from './EntrySummary';
import { BudgetView } from './BudgetView';

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

  const [isBudgetExpanded, setIsBudgetExpanded] = useState(false);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [loadingBudget, setLoadingBudget] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);

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

  // For debugging: log each day and check if it's in entryDates
  // days.forEach((d) => {
  //   if (d !== null) {
  //     console.log(`Day: ${d}, typeof: ${typeof d}, in entryDates:`, entryDatesSet.has(d));
  //   }
  // });

  // Fetch budget data when expanded
  useEffect(() => {
    if (!isBudgetExpanded || !initDataRaw || !user) return;
    
    const fetchBudgetData = async () => {
      setLoadingBudget(true);
      setBudgetError(null);
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1; // Convert to 1-indexed
        
        const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
        const requestUrl = `${apiUrl}/api/user/${user.id}/budget/current-month?year=${year}&month=${month}`;
        console.log('💰 [BUDGET] Fetching from URL:', requestUrl);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        try {
          const response = await fetch(requestUrl, {
            headers: {
              Authorization: `tma ${initDataRaw}`,
              ...(import.meta.env.DEV ? { 'X-Dev-Bypass': 'true' } : {})
            },
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          console.log('💰 [BUDGET] Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('💰 [BUDGET] API Error:', errorText);
            throw new Error(errorText);
          }
          
          const data = await response.json();
          console.log('💰 [BUDGET] Raw API response:', data);
          setBudgetData(data);
          
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          console.error('💰 [BUDGET] Fetch error:', fetchError);
          setBudgetError(fetchError.message || 'Failed to load budget data');
        } finally {
          setLoadingBudget(false);
        }
      } catch (err: any) {
        console.error('💰 [BUDGET] General error:', err);
        setBudgetError(err.message || 'Failed to load budget data');
        setLoadingBudget(false);
      }
    };
    
    fetchBudgetData();
  }, [isBudgetExpanded, initDataRaw, user]);

  const handleBudgetClick = () => {
    setIsBudgetExpanded(!isBudgetExpanded);
  };

  const handleMouseDown = () => {
    // Add pressed effect similar to mission cards
  };

  const handleMouseUp = () => {
    // Remove pressed effect
  };

  return (
    <div style={{ 
      width: 'calc(100% - 36px)', 
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
      
      {/* Budget View Banner */}
      <div 
        style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: 'var(--color-primary)',
          color: 'var(--color-text-light)',
          borderRadius: 8,
          cursor: 'pointer',
          textAlign: 'center',
          fontWeight: 600,
          fontSize: 16,
          fontFamily: 'var(--font-primary)',
          transition: 'all 0.3s ease',
          userSelect: 'none'
        }}
        onClick={handleBudgetClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {isBudgetExpanded ? 'Hide Budget View' : 'Budget View'}
      </div>

      {/* Budget View (Expandable) */}
      {isBudgetExpanded && (
        <div style={{
          animation: 'slideDown 0.3s ease-out',
          overflow: 'hidden'
        }}>
          {loadingBudget && (
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
              Loading budget data...
            </div>
          )}
          
          {budgetError && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#e74c3c',
              fontFamily: 'var(--font-primary)',
              fontSize: 16,
              fontWeight: 500,
              background: '#fee',
              borderRadius: 12,
              margin: '16px 0',
              border: '2px solid #fcc'
            }}>
              Error: {budgetError}
              <div style={{
                marginTop: 12,
                textAlign: 'left',
                fontSize: 13,
                color: '#b94a48',
                background: '#fff6f6',
                borderRadius: 8,
                padding: 8,
                wordBreak: 'break-all',
                maxHeight: 200,
                overflowY: 'auto',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                <b>Debug Info:</b><br/>
                <b>initDataRaw:</b> <code style={{wordBreak:'break-all'}}>{String(initDataRaw)}</code><br/>
                <b>initDataState:</b> <code style={{wordBreak:'break-all'}}>{JSON.stringify(initDataState)}</code><br/>
                <b>user:</b> <code style={{wordBreak:'break-all'}}>{JSON.stringify(user)}</code><br/>
                <b>API URL:</b> <code style={{wordBreak:'break-all'}}>{budgetData?.apiUrl || ''}</code><br/>
              </div>
            </div>
          )}
          
          {!loadingBudget && !budgetError && (
            <BudgetView
              totalExpenses={budgetData?.totalExpenses || 0}
              budget={budgetData?.budget || null}
              currentDate={budgetData?.currentDate || today.getDate()}
              daysInMonth={budgetData?.daysInMonth || daysInMonth}
              budgetPercentage={budgetData?.budgetPercentage || 0}
              datePercentage={budgetData?.datePercentage || 0}
              isFamily={budgetData?.isFamily || false}
              familyMembers={budgetData?.familyMembers || 1}
            />
          )}
        </div>
      )}

      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
              max-height: 0;
            }
            to {
              opacity: 1;
              transform: translateY(0);
              max-height: 500px;
            }
          }
        `}
      </style>
    </div>
  );
}; 