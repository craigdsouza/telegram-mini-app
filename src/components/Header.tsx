import React from 'react';
import excitedSquirrelImg from '@/../assets/excited-squirrel.png';

export const Header: React.FC<{ title?: string }> = ({ title = 'Missions' }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 64,
    padding: '0 24px',
    background: 'var(--color-bg-light)',
    borderBottom: '2px solid var(--color-primary)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
  }}>
    <img src={excitedSquirrelImg} alt="Excited Squirrel" style={{ width: 40, height: 40, marginRight: 16 }} />
    <span style={{
      fontSize: 22,
      fontWeight: 600,
      color: 'var(--color-text-dark)',
      fontFamily: 'var(--font-primary)',
      letterSpacing: 'var(--tracking-wide)'
    }}>{title}</span>
  </div>
); 