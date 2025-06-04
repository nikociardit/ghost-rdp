import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({ name: '', condition: '', action: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = () => {
    setLoading(true);
    axios.get('/api/alerts')
      .then(res => {
        setAlerts(res.data.alerts);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load alerts');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const addAlert = () => {
    if (!newAlert.name || !newAlert.condition || !newAlert.action) return;
    axios.post('/api/alerts', newAlert)
      .then(() => {
        setNewAlert({ name: '', condition: '', action: '' });
        fetchAlerts();
      })
      .catch(err => {
        alert(err.response?.data?.description || 'Error adding alert');
      });
  };

  const toggleEnabled = (alert) => {
    axios.put(`/api/alerts/${alert.id}`, { enabled: !alert.enabled })
      .then(() => fetchAlerts())
      .catch(() => alert('Error updating alert'));
  };

  const deleteAlert = (alertId) => {
    if (!window.confirm('Delete this alert?')) return;
    axios.delete(`/api/alerts/${alertId}`)
      .then(() => fetchAlerts())
      .catch(() => alert('Error deleting alert'));
  };

  return (
    <div>
      <h1>Alerts</h1>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Name"
          value={newAlert.name}
          onChange={e => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
          style={{ marginRight: '0.5rem', padding: '0.3rem' }}
        />
        <input
          type="text"
          placeholder="Condition"
          value={newAlert.condition}
          onChange={e => setNewAlert(prev => ({ ...prev, condition: e.target.value }))}
          style={{ marginRight: '0.5rem', padding: '0.3rem' }}
        />
        <input
          type="text"
          placeholder="Action"
          value={newAlert.action}
          onChange={e => setNewAlert(prev => ({ ...prev, action: e.target.value }))}
          style={{ marginRight: '0.5rem', padding: '0.3rem' }}
        />
        <button onClick={addAlert}>Add Alert</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Loading alerts...</p>
      ) : (
        <table>
          <thead>
            <tr style={{ backgroundColor: '#1e1e1e' }}>
              <th>ID</th>
              <th>Name</th>
              <th>Condition</th>
              <th>Action</th>
              <th>Enabled</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.name}</td>
                <td>{a.condition}</td>
                <td>{a.action}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={a.enabled}
                    onChange={() => toggleEnabled(a)}
                  />
                </td>
                <td>
                  <button onClick={() => deleteAlert(a.id)} style={{ backgroundColor: '#f44336', color: '#fff' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
