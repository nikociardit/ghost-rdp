import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SetupPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/setup-status')
      .then(res => {
        setStatus(res.data);
        setLoading(false);
      })
      .catch(() => {
        setStatus(null);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>Setup Status</h1>
      {loading ? (
        <p>Checking setup...</p>
      ) : status ? (
        <div style={{ backgroundColor: '#1e1e1e', padding: '1rem', borderRadius: '8px' }}>
          <p><strong>Database:</strong> {status.database}</p>
          <p><strong>WireGuard API:</strong> {status.wireguard_api}</p>
        </div>
      ) : (
        <p style={{ color: 'red' }}>Failed to check setup status.</p>
      )}
    </div>
  );
}
