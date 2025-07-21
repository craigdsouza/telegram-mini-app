import { useMemo, useState, useEffect } from 'react';
import {
  initDataRaw as _initDataRaw,
  initDataState as _initDataState,
  useSignal,
} from '@telegram-apps/sdk-react';
import { Calendar } from './Calendar';

export const DashboardPanel = () => {
  const initDataRaw = useSignal(_initDataRaw);
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);

  const [entryDates, setEntryDates] = useState<number[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [datesError, setDatesError] = useState<string | null>(null);

  useEffect(() => {
    if (!initDataRaw || !user) return;
    const fetchEntryDates = async () => {
      setLoadingDates(true);
      setDatesError(null);
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
        const requestUrl = `${apiUrl}/api/user/${user.id}/expenses/dates?year=${year}&month=${month}`;
        console.log('💰 [DATES] Fetching from URL:', requestUrl);
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
          if (!response.ok) throw new Error(await response.text());
          const data = await response.json();
          setEntryDates(Array.isArray(data.days) ? data.days : []);
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          setDatesError(fetchError.message || 'Unknown error');
        } finally {
          setLoadingDates(false);
        }
      } catch (err: any) {
        setDatesError(err.message || 'Unknown error');
      }
    };
    fetchEntryDates();
  }, [initDataRaw, user]);

  if (!initDataRaw || !user) {
    return null;
  }

  if (loadingDates) {
    return <div style={{ color: '#888', fontSize: 16, textAlign: 'center' }}>Loading Dashboard...</div>;
  }
  if (datesError) {
    return <div style={{ color: '#e74c3c', fontSize: 16, textAlign: 'center' }}>Error loading Dashboard: {datesError}</div>;
  }
  return <Calendar entryDates={entryDates} />;
}; 