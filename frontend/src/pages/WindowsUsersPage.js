import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function WindowsUsersPage() {
  const [wins, setWins] = useState([]);
  const [newWin, setNewWin] = useState({ username: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWins = () => {
    setLoading(true);
    axios.get('/api/windows-users')
      .then(res => {
        setWins(res.data.windows_users);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load Windows users');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWins();
  }, []);

  const addWin = () => {
    if (!newWin.username.trim()) return;
    axios.post('/api/windows-users', newWin)
      .then(() => {
        setNewWin({ username: '' });
        fetchWins();
      })
      .catch(err => {
        alert(err.response?.data?.description || 'Error adding Windows user');
      });
  };

  const toggleEnabled = (win) => {
    axios.put(`/api/windows-users/${win.id}`, { enabled: !win.enabled })
      .then(() => fetchWins())
      .catch(() => alert('Error updating Windows user'));
  };

  const deleteWin = (winId) => {
    if (!window.confirm('Delete this Windows user?')) return;
    axios.delete(`/api/windows-users/${winId}`)
      .then(() => fetchWins())
      .catch(() => alert('Error deleting Windows user'));
  };

  return (
    <div>
      <h1>Windows Users</h1>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Username"
          value={newWin.username}
          onChange={e => setNewWin({ username: e.target.value })}
          style={{ marginRight: '0.5rem', padding: '0.3rem' }}
        />
        <button onClick={addWin}>Add Windows User</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Loading Windows users...</p>
      ) : (
        <table>
          <thead>
            <tr style={{ backgroundColor: '#1e1e1e' }}>
              <th>ID</th>
              <th>Username</th>
              <th>Enabled</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {wins.map(w => (
              <tr key={w.id}>
                <td>{w.id}</td>
                <td>{w.username}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={w.enabled}
                    onChange={() => toggleEnabled(w)}
                  />
                </td>
                <td>
                  <button onClick={() => deleteWin(w.id)} style={{ backgroundColor: '#f44336', color: '#fff' }}>
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
