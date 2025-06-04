import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = () => {
    setLoading(true);
    axios.get('/api/logs')
      .then(res => {
        setLogs(res.data.logs);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load logs');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
    // Poll every 5 seconds for new logs
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Logs</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Loading logs...</p>
      ) : (
        <div style={{ maxHeight: '60vh', overflowY: 'scroll', backgroundColor: '#1e1e1e', padding: '1rem', borderRadius: '8px' }}>
          {logs.map(l => (
            <div key={l.id} style={{ marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
              <small style={{ color: '#888' }}>{new Date(l.timestamp).toLocaleString()}</small>
              <p>[{l.level}] {l.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
