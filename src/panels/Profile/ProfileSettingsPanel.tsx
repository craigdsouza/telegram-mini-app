import React, { useState, useEffect } from 'react';
import './ProfileSettingsPanel.css';

interface ProfileSettingsPanelProps {
  userId: number;
  initDataRaw: string;
}

export const ProfileSettingsPanel: React.FC<ProfileSettingsPanelProps> = ({ userId, initDataRaw }) => {
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
        const fetchUrl = `${apiUrl}/api/user/${userId}/settings`;
        console.log('[ProfileSettingsPanel] Fetching user settings:', { userId, fetchUrl });
        const response = await fetch(fetchUrl, {
          headers: {
            Authorization: `tma ${initDataRaw}`,
            ...(import.meta.env.DEV ? { 'X-Dev-Bypass': 'true' } : {})
          }
        });
        if (!response.ok) {
          const text = await response.text();
          console.error('[ProfileSettingsPanel] Failed to fetch settings:', response.status, text);
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setMonthStart(data.settings.month_start !== null ? String(data.settings.month_start) : '');
      } catch (err: any) {
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchSettings();
  }, [userId, initDataRaw]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://telegram-api-production-b3ef.up.railway.app';
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
        body: JSON.stringify({ month_start: start, month_end: end })
      });
      if (!response.ok) {
        const text = await response.text();
        console.error('[ProfileSettingsPanel] Failed to save settings:', response.status, text);
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      console.log('[ProfileSettingsPanel] Settings saved:', data);
      setSuccess(true);
      setError(null);
    } catch (err: any) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-settings-panel-root">
      <h2 className="profile-settings-title">Profile Settings</h2>
      <div className="profile-settings-row">
        <label className="profile-settings-label">Month Start:</label>
        <input
          className="profile-settings-input"
          type="number"
          value={monthStart}
          onChange={(e) => setMonthStart(e.target.value)}
          disabled={loading || saving}
          placeholder="DEFAULT is 1st"
        />
      </div>
      <button
        className="profile-settings-save-btn"
        onClick={handleSave}
        disabled={saving || !monthStart}
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
      {error && <p className="profile-settings-error">{error}</p>}
      {success && <p className="profile-settings-success">Settings saved successfully!</p>}
    </div>
  );
};