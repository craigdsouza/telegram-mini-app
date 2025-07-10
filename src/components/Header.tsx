import React from 'react';
import viteLogo from '/vite.svg';

export const Header: React.FC<{ title?: string }> = ({ title = 'Missions' }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 64,
    padding: '0 24px',
    background: '#fff',
    borderBottom: '2px solid #ddd',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
  }}>
    <img src={viteLogo} alt="Logo" style={{ width: 40, height: 40, marginRight: 16 }} />
    <span style={{
      fontSize: 22,
      fontWeight: 600,
      color: '#333',
      fontFamily: 'var(--font-primary)',
      letterSpacing: 'var(--tracking-wide)'
    }}>{title}</span>
  </div>
); 