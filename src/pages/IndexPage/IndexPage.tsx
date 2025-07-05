import viteLogo from '/vite.svg';

export const IndexPage = () => {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f9f9f9'
    }}>
      <img src={viteLogo} alt="Vite logo" style={{ width: 120, marginBottom: 24 }} />
      <h1 style={{ color: '#333', fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Craig's expense tracking app</h1>
      <p style={{ color: '#888', fontSize: 16, marginBottom: 32 }}>Exciting things coming soon!</p>
    </div>
  );
};
