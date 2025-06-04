import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = () => {
    setLoading(true);
    axios.get('/api/support')
      .then(res => {
        setTickets(res.data.tickets);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load tickets');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const addTicket = () => {
    if (!newTicket.title.trim() || !newTicket.description.trim()) return;
    axios.post('/api/support', newTicket)
      .then(() => {
        setNewTicket({ title: '', description: '' });
        fetchTickets();
      })
      .catch(() => alert('Error adding ticket'));
  };

  const updateStatus = (ticket, status) => {
    axios.put(`/api/support/${ticket.id}`, { status })
      .then(() => fetchTickets())
      .catch(() => alert('Error updating ticket'));
  };

  const deleteTicket = (ticketId) => {
    if (!window.confirm('Delete this ticket?')) return;
    axios.delete(`/api/support/${ticketId}`)
      .then(() => fetchTickets())
      .catch(() => alert('Error deleting ticket'));
  };

  return (
    <div>
      <h1>Support Tickets</h1>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Title"
          value={newTicket.title}
          onChange={e => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
          style={{ marginRight: '0.5rem', padding: '0.3rem' }}
        />
        <input
          type="text"
          placeholder="Description"
          value={newTicket.description}
          onChange={e => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
          style={{ marginRight: '0.5rem', padding: '0.3rem' }}
        />
        <button onClick={addTicket}>Add Ticket</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Loading tickets...</p>
      ) : (
        <table>
          <thead>
            <tr style={{ backgroundColor: '#1e1e1e' }}>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.title}</td>
                <td>{t.description}</td>
                <td>{t.status}</td>
                <td>
                  <button onClick={() => updateStatus(t, 'open')}>Open</button>
                  <button onClick={() => updateStatus(t, 'in-progress')}>In Progress</button>
                  <button onClick={() => updateStatus(t, 'closed')}>Close</button>
                  <button onClick={() => deleteTicket(t.id)} style={{ backgroundColor: '#f44336', color: '#fff' }}>
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
