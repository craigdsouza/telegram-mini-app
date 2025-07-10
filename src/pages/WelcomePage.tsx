import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import squirrelImg from '@/../assets/excited-squirrel.png';
import { initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';

export const WelcomePage: React.FC = () => {
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);
  const firstName = user?.first_name || 'Squirrel';
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #f9fafb 0%, #e0f7fa 100%)',
        padding: 0,
        position: 'relative',
      }}
    >
      <div style={{ flex: 1 }} />
      <img
        src={squirrelImg}
        alt="Excited Squirrel"
        style={{
          width: 220,
          height: 220,
          objectFit: 'contain',
          marginBottom: 32,
          marginTop: 32,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0)', // transparent background
        }}
      />
      <h1
        style={{
          fontFamily: 'var(--font-primary, Nunito, Inter, sans-serif)',
          fontWeight: 800,
          fontSize: 36,
          color: '#2d3a4a',
          margin: 0,
          marginBottom: 16,
          letterSpacing: 0.5,
          textAlign: 'center',
        }}
      >
        {`Welcome ${firstName}!`}
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-primary, Nunito, Inter, sans-serif)',
          fontWeight: 500,
          fontSize: 20,
          color: '#4f5b6b',
          margin: 0,
          marginBottom: 40,
          textAlign: 'center',
          maxWidth: 340,
        }}
      >
        Your journey to fun, simple expense tracking starts here.
      </p>
      <div style={{ flex: 2 }} />
      <button
        onClick={() => navigate('/home')}
        style={{
          width: '90%',
          maxWidth: 320,
          margin: '0 auto 40px auto',
          padding: '18px 0',
          background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 22,
          border: 'none',
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(67,233,123,0.10)',
          cursor: 'pointer',
          letterSpacing: 0.5,
          fontFamily: 'var(--font-primary, Nunito, Inter, sans-serif)',
          transition: 'background 0.2s',
        }}
      >
        Let's go!
      </button>
    </div>
  );
}; 