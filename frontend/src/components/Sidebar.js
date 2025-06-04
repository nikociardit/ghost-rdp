import React from 'react';
import { NavLink } from 'react-router-dom';

const linkStyle = ({ isActive }) => ({
  display: 'block',
  padding: '1rem 1.5rem',
  color: isActive ? '#00e676' : '#ccc',
  textDecoration: 'none',
  fontWeight: 'bold',
  borderLeft: isActive ? '4px solid #00e676' : '4px solid transparent',
  transition: 'all 0.3s ease',
  margin: '0.2rem 0'
});

export default function Sidebar() {
  return (
    <nav style={{ width: '240px', backgroundColor: '#1e1e1e', height: '100vh', position: 'sticky', top: 0 }}>
      <h2 style={{ padding: '1rem', color: '#00e676', fontFamily: 'monospace' }}>ghost-rdp</h2>
      <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
      <NavLink to="/users" style={linkStyle}>Users</NavLink>
      <NavLink to="/tasks" style={linkStyle}>Tasks</NavLink>
      <NavLink to="/alerts" style={linkStyle}>Alerts</NavLink>
      <NavLink to="/support" style={linkStyle}>Support</NavLink>
      <NavLink to="/vpn" style={linkStyle}>VPN (WireGuard)</NavLink>
      <NavLink to="/windows-users" style={linkStyle}>Windows Users</NavLink>
      <NavLink to="/logs" style={linkStyle}>Logs</NavLink>
      <NavLink to="/setup" style={linkStyle}>Setup</NavLink>
    </nav>
  );
}
