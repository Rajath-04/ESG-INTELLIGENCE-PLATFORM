import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import InvestorDashboard from './pages/InvestorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    const savedRole = localStorage.getItem('role');

    if (token && savedUsername && savedRole) {
      setIsAuthenticated(true);
      setUsername(savedUsername);
      setUserRole(savedRole);
    }
  }, []);

  const handleLogin = (token, user, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', user);
    localStorage.setItem('role', role);
    setIsAuthenticated(true);
    setUsername(user);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUsername('');
    setUserRole('');
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} replace />
            ) : (
              <Landing onLogin={handleLogin} />
            )
          }
        />

        {/* Investor Dashboard */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated && userRole === 'investor' ? (
              <InvestorDashboard username={username} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            isAuthenticated && userRole === 'admin' ? (
              <AdminDashboard username={username} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
