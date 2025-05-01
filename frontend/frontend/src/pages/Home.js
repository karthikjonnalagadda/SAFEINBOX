import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Welcome to SafeInbox</h1>
      <p>Protect your inbox from spam with our real-time email classification system.</p>

      {/* LOGIN / REGISTER Buttons */}
      <div style={{ marginTop: '30px' }}>
        <Link to="/login">
          <button style={buttonStyle}>Login</button>
        </Link>
        <Link to="/register">
          <button style={{ ...buttonStyle, backgroundColor: '#28a745' }}>
            Register
          </button>
        </Link>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '10px 20px',
  margin: '0 10px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
};

