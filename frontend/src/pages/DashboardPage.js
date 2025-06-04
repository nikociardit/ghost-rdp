import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch some summary info: count of users, tasks, open tickets, peers, etc.
    axios.get('/api/dashboard-stats')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(() => {
        setStats(null);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {loading ? (
        <p>Loading stats...</p>
      ) : stats ? (
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
          <div style={{ flex: 1, padding: '1rem', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
            <h3>Users</h3>
            <p>{stats.user_count}</p>
          </div>
          <div style={{ flex: 1, padding: '1rem', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
            <h3>Tasks</h3>
            <p>{stats.task_count}</p>
          </div>
          <div style={{ flex: 1, padding: '1rem', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
            <h3>Open Tickets</h3>
            <p>{stats.open_ticket_count}</p>
          </div>
          <div style={{ flex: 1, padding: '1rem', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
            <h3>WG Peers</h3>
            <p>{stats.wg_peer_count}</p>
          </div>
        </div>
      ) : (
        <p style={{ color: 'red' }}>Failed to load dashboard stats.</p>
      )}
    </div>
  );
}
