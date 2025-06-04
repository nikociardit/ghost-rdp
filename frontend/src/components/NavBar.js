import React from 'react';

export default function NavBar() {
  return (
    <header style={{
      backgroundColor: '#1e1e1e',
      padding: '0.5rem 2rem',
      borderBottom: '1px solid #333',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div>ghost-rdp Admin Panel</div>
      <div>
        <span style={{ marginRight: '1rem' }}>Logged in as <strong>admin</strong></span>
        <button style={{
          backgroundColor: '#f44336',
          color: '#fff',
          border: 'none',
          padding: '0.3rem 0.6rem',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>Logout</button>
      </div>
    </header>
  );
}
