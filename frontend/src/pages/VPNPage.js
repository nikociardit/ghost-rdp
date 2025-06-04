import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function VPNPage() {
  const [servers, setServers] = useState([]);
  const [peers, setPeers] = useState([]);
  const [newServer, setNewServer] = useState({
    name: '',
    endpoint: '',
    public_key: '',
    private_key: '',
    address: ''
  });
  const [newPeer, setNewPeer] = useState({
    server_id: '',
    public_key: '',
    allowed_ips: '',
    preshared_key: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServers = () => {
    setLoading(true);
    axios.get('/api/wg/servers')
      .then(res => {
        setServers(res.data.servers);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load servers');
        setLoading(false);
      });
  };

  const fetchPeers = () => {
    axios.get('/api/wg/peers')
      .then(res => setPeers(res.data.peers))
      .catch(() => {}); // Silent fail
  };

  useEffect(() => {
    fetchServers();
    fetchPeers();
  }, []);

  const addServer = () => {
    if (!newServer.name || !newServer.endpoint || !newServer.public_key || !newServer.private_key || !newServer.address) return;
    axios.post('/api/wg/servers', newServer)
      .then(() => {
        setNewServer({ name: '', endpoint: '', public_key: '', private_key: '', address: '' });
        fetchServers();
      })
      .catch(() => alert('Error adding server'));
  };

  const deleteServer = (id) => {
    if (!window.confirm('Delete this server?')) return;
    axios.delete(`/api/wg/servers/${id}`)
      .then(() => fetchServers())
      .catch(() => alert('Error deleting server'));
  };

  const addPeer = () => {
    if (!newPeer.server_id || !newPeer.public_key || !newPeer.allowed_ips) return;
    axios.post('/api/wg/peers', newPeer)
      .then(() => {
        setNewPeer({ server_id: '', public_key: '', allowed_ips: '', preshared_key: '' });
        fetchPeers();
      })
      .catch(() => alert('Error adding peer'));
  };

  const deletePeer = (id) => {
    if (!window.confirm('Delete this peer?')) return;
    axios.delete(`/api/wg/peers/${id}`)
      .then(() => fetchPeers())
      .catch(() => alert('Error deleting peer'));
  };

  return (
    <div>
      <h1>WireGuard VPN</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <section style={{ marginBottom: '2rem' }}>
        <h2>Servers</h2>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Name"
            value={newServer.name}
            onChange={e => setNewServer(prev => ({ ...prev, name: e.target.value }))}
            style={{ marginRight: '0.5rem', padding: '0.3rem' }}
          />
          <input
            type="text"
            placeholder="Endpoint"
            value={newServer.endpoint}
            onChange={e => setNewServer(prev => ({ ...prev, endpoint: e.target.value }))}
            style={{ marginRight: '0.5rem', padding: '0.3rem' }}
          />
          <input
            type="text"
            placeholder="Public Key"
            value={newServer.public_key}
            onChange={e => setNewServer(prev => ({ ...prev, public_key: e.target.value }))}
            style={{ marginRight: '0.5rem', padding: '0.3rem', width: '10rem' }}
          />
          <input
            type="text"
            placeholder="Private Key"
            value={newServer.private_key}
            onChange={e => setNewServer(prev => ({ ...prev, private_key: e.target.value }))}
            style={{ marginRight: '0.5rem', padding: '0.3rem', width: '10rem' }}
          />
          <input
            type="text"
            placeholder="Address (e.g., 10.0.0.1/24)"
            value={newServer.address}
            onChange={e => setNewServer(prev => ({ ...prev, address: e.target.value }))}
            style={{ marginRight: '0.5rem', padding: '0.3rem' }}
          />
          <button onClick={addServer}>Add Server</button>
        </div>

        {loading ? (
          <p>Loading servers...</p>
        ) : (
          <table>
            <thead>
              <tr style={{ backgroundColor: '#1e1e1e' }}>
                <th>ID</th>
                <th>Name</th>
                <th>Endpoint</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {servers.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.endpoint}</td>
                  <td>{s.address}</td>
                  <td>
                    <button onClick={() => deleteServer(s.id)} style={{ backgroundColor: '#f44336', color: '#fff' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Peers</h2>
        <div style={{ marginBottom: '1rem' }}>
          <select
            value={newPeer.server_id}
            onChange={e => setNewPeer(prev => ({ ...prev, server_id: e.target.value }))}
            style={{ marginRight: '0.5rem', padding: '0.3rem' }}
          >
            <option value="">Select Server</option>
            {servers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Public Key"
            value={newPeer.public_key}
            onChange={e => setNewPeer(prev => ({ ...prev, public_key: e.target.value }))}
            style={{ marginRight: '0.5rem', padding: '0.3rem', width: '12rem' }}
          />
          <input
            type="text"
            placeholder="Allowed IPs (e.g., 10.0.0.2/32)"
            value={newPeer.allowed_ips}
            onChange={e => setNewPeer(prev => ({ ...prev, allowed_ips: e.target.value }))}
            style={{ marginRight: '0.5rem', padding: '0.3rem' }}
          />
          <input
            type="text"
            placeholder="Preshared Key (optional)"
            value={newPeer.preshared_key}
            onChange={e => setNewPeer(prev => ({ ...prev, preshared_key: e.target.value }))}
            style={{ marginRight: '0.5rem', padding: '0.3rem', width: '12rem' }}
          />
          <button onClick={addPeer}>Add Peer</button>
        </div>

        <table>
          <thead>
            <tr style={{ backgroundColor: '#1e1e1e' }}>
              <th>ID</th>
              <th>Server</th>
              <th>Public Key</th>
              <th>Allowed IPs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {peers.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{servers.find(s => s.id === p.server_id)?.name || p.server_id}</td>
                <td>{p.public_key}</td>
                <td>{p.allowed_ips}</td>
                <td>
                  <button onClick={() => deletePeer(p.id)} style={{ backgroundColor: '#f44336', color: '#fff' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
