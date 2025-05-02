import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function EmailDetail() {
  const { id } = useParams();
  const [email, setEmail] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/emailDetail/${id}`)
      .then(res => setEmail(res.data))
      .catch(() => setError('Failed to load email.'));
  }, [id]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!email) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h2>{email.subject}</h2>
      <p><strong>From:</strong> {email.from}</p>
      <p><strong>Date:</strong> {email.date}</p>
      <hr />
      <pre style={{ whiteSpace: 'pre-wrap' }}>{email.body}</pre>
    </div>
  );
}
