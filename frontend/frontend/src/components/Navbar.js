import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <nav style={{
      background: '#f8f9fa',
      padding: '10px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'fixed',
      width: '100%',
      top: 0,
      zIndex: 1000
    }}>
      <h2 style={{ margin: 0 }}>📬 SafeInbox</h2>
      <div>
        <Link to="/" style={linkStyle}>Home</Link>
        {isLoggedIn && <Link to="/dashboard" style={linkStyle}>Dashboard</Link>}
        {isLoggedIn && (
          <button onClick={handleLogout} style={{ ...linkStyle, backgroundColor: '#dc3545' }}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

const linkStyle = {
  margin: '0 10px',
  padding: '8px 15px',
  backgroundColor: '#007bff',
  color: 'white',
  borderRadius: '5px',
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer'
};
