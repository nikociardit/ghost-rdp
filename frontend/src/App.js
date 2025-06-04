import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [backendStatus, setBackendStatus] = useState(null);

  useEffect(() => {
    axios.get('/api/status')
      .then(response => setBackendStatus(response.data.message))
      .catch(() => setBackendStatus('Failed to connect to backend.'));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial', backgroundColor: '#121212', color: '#eee', minHeight: '100vh' }}>
      <h1>ghost-rdp Frontend</h1>
      <p>Status: {backendStatus || 'Loading...'}</p>
    </div>
  );
}

export default App;
