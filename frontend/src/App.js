import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import NavBar from './components/NavBar';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import TasksPage from './pages/TasksPage';
import AlertsPage from './pages/AlertsPage';
import SupportPage from './pages/SupportPage';
import VPNPage from './pages/VPNPage';
import WindowsUsersPage from './pages/WindowsUsersPage';
import LogsPage from './pages/LogsPage';
import SetupPage from './pages/SetupPage';

export default function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flexGrow: 1, backgroundColor: '#121212' }}>
        <NavBar />
        <main style={{ padding: '1rem 2rem' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/vpn" element={<VPNPage />} />
            <Route path="/windows-users" element={<WindowsUsersPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/setup" element={<SetupPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
