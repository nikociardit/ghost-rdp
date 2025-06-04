import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    axios.get('/api/users')
      .then(res => {
        setUsers(res.data.users);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load users');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = () => {
    if (!newUsername.trim()) return;
    axios.post('/api/users', { username: newUsername.trim() })
      .then(() => {
        setNewUsername('');
        fetchUsers();
      })
      .catch(err => {
        alert(err.response?.data?.description || 'Error adding user');
      });
  };

  const toggleEnabled = (user) => {
    axios.put(`/api/users/${user.id}`, { enabled: !user.enabled })
      .then(() => fetchUsers())
      .catch(() => alert('Error updating user'));
  };

  const deleteUser = (userId) => {
    if (!window.confirm('Delete this user?')) return;
    axios.delete(`/api/users/${userId}`)
      .then(() => fetchUsers())
      .catch(() => alert('Error deleting user'));
  };

  return (
    <div>
      <h1>Users</h1>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="New username"
          value={newUsername}
          onChange={e => setNewUsername(e.target.value)}
          style={{ marginRight: '0.5rem', padding: '0.3rem' }}
        />
        <button onClick={addUser}>Add User</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Loading users...</p>
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
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={u.enabled}
                    onChange={() => toggleEnabled(u)}
                  />
                </td>
                <td>
                  <button onClick={() => deleteUser(u.id)} style={{ backgroundColor: '#f44336', color: '#fff' }}>
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
