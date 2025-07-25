import React, { useState, useEffect } from 'react';
import './ProfileSettingsPanel.css';

interface ProfileSettingsPanelProps {
  userId: number;
}

export const ProfileSettingsPanel: React.FC<ProfileSettingsPanelProps> = ({ userId }) => {
  const [monthStart, setMonthStart] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
        const initDataRaw = (window as any)?.Telegram?.WebApp?.initData || '';
        const response = await fetch(`${apiUrl}/api/user/${userId}/settings`, {
          headers: {
            Authorization: `tma ${initDataRaw}`,
            ...(import.meta.env.DEV ? { 'X-Dev-Bypass': 'true' } : {})
          }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setMonthStart(data.settings.month_start !== null ? String(data.settings.month_start) : '');
      } catch (err: any) {
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchSettings();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
      const initDataRaw = (window as any)?.Telegram?.WebApp?.initData || '';
      const start = monthStart ? Number(monthStart) : null;
      // Calculate end: if start is 1, end is 31; else end is start-1
      const end = start === 1 ? 31 : (start ? start - 1 : null);
      const response = await fetch(`${apiUrl}/api/user/${userId}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `tma ${initDataRaw}`,
          ...(import.meta.env.DEV ? { 'X-Dev-Bypass': 'true' } : {})
        },
        body: JSON.stringify({
          month_start: start,
          month_end: end
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setSuccess(true);
    } catch (err: any) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  return (
    <div className="profile-settings-panel-root">
      <h3 className="profile-settings-title">Month Settings</h3>
      <div className="profile-settings-row">
        <label htmlFor="month-start" className="profile-settings-label">Start of Month</label>
        <input
          id="month-start"
          className="profile-settings-input"
          type="number"
          min={1}
          max={28}
          placeholder="DEFAULT"
          value={monthStart}
          onChange={e => setMonthStart(e.target.value)}
          disabled={loading || saving}
        />
      </div>
      {error && <div className="profile-settings-error">{error}</div>}
      <button
        className="profile-settings-save-btn"
        onClick={handleSave}
        disabled={loading || saving}
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
      {success && <div className="profile-settings-success">Saved!</div>}
    </div>
  );
}; 