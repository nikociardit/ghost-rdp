import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = () => {
    setLoading(true);
    axios.get('/api/tasks')
      .then(res => {
        setTasks(res.data.tasks);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load tasks');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = () => {
    if (!newDescription.trim()) return;
    axios.post('/api/tasks', { description: newDescription.trim() })
      .then(() => {
        setNewDescription('');
        fetchTasks();
      })
      .catch(err => {
        alert(err.response?.data?.description || 'Error adding task');
      });
  };

  const updateStatus = (task, status) => {
    axios.put(`/api/tasks/${task.id}`, { status })
      .then(() => fetchTasks())
      .catch(() => alert('Error updating task'));
  };

  const deleteTask = (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    axios.delete(`/api/tasks/${taskId}`)
      .then(() => fetchTasks())
      .catch(() => alert('Error deleting task'));
  };

  return (
    <div>
      <h1>Tasks</h1>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="New task description"
          value={newDescription}
          onChange={e => setNewDescription(e.target.value)}
          style={{ marginRight: '0.5rem', padding: '0.3rem' }}
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <table>
          <thead>
            <tr style={{ backgroundColor: '#1e1e1e' }}>
              <th>ID</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.description}</td>
                <td>{t.status}</td>
                <td>
                  <button onClick={() => updateStatus(t, 'pending')}>Pending</button>
                  <button onClick={() => updateStatus(t, 'in-progress')}>In Progress</button>
                  <button onClick={() => updateStatus(t, 'completed')}>Completed</button>
                  <button onClick={() => deleteTask(t.id)} style={{ backgroundColor: '#f44336', color: '#fff' }}>
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
