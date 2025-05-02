import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import EmailCard from '../components/EmailCard';
import Loading from '../components/Loading';

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState('');
  const [allEmails, setAllEmails] = useState([]);
  const [displayedEmails, setDisplayedEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('latest');
  const [filterOption, setFilterOption] = useState('all');
  const [fetchingEmails, setFetchingEmails] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (!email) return (window.location.href = '/login');
    setUserEmail(email);
  }, []);

  const fetchEmails = async () => {
    setFetchingEmails(true);
    setErrorMessage('');
    try {
      const res = await axios.get('http://localhost:5000/api/emails');
      if (res.data?.emails) {
        setAllEmails(res.data.emails);
      } else {
        setErrorMessage('No emails found.');
        setAllEmails([]);
      }
    } catch (err) {
      console.error('❌ Failed to fetch emails:', err.message);
      setErrorMessage('Server error while fetching emails.');
    } finally {
      setFetchingEmails(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  useEffect(() => {
    let list = [...allEmails];

    if (filterOption !== 'all') {
      list = list.filter(e => e.isSpam === filterOption);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(e =>
        (e.subject || '').toLowerCase().includes(q) ||
        (e.from || '').toLowerCase().includes(q)
      );
    }

    if (sortOption === 'latest') {
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortOption === 'oldest') {
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortOption === 'sender') {
      list.sort((a, b) => (a.from || '').localeCompare(b.from || ''));
    }

    setDisplayedEmails(list);
  }, [allEmails, searchTerm, sortOption, filterOption]);

  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto', marginTop: '80px' }}>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <strong>Logged in as:</strong> {userEmail}
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📥 Inbox</h2>

        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          <button onClick={fetchEmails} style={buttonStyle}>🔄 Refresh</button>

          <input
            type="text"
            placeholder="Search by Subject or Sender"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={inputStyle}
          />

          <select value={filterOption} onChange={e => setFilterOption(e.target.value)} style={selectStyle}>
            <option value="all">All</option>
            <option value="ham">Ham</option>
            <option value="spam">Spam</option>
          </select>

          <select value={sortOption} onChange={e => setSortOption(e.target.value)} style={selectStyle}>
            <option value="latest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="sender">Sender (A-Z)</option>
          </select>
        </div>

        {errorMessage && (
          <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>
        )}

        {fetchingEmails ? (
          <Loading />
        ) : displayedEmails.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No emails to display.</p>
        ) : (
          displayedEmails.map(email => (
            <EmailCard key={email.id} email={email} />
          ))
        )}
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

const inputStyle = {
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ddd',
  width: '240px'
};

const selectStyle = {
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ddd'
};
