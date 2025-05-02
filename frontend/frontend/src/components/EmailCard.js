import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmailCard = ({ email }) => {
  const navigate = useNavigate();
  const { id, subject, from, date, isSpam, confidence } = email;

  const tagStyle = {
    padding: '5px 10px',
    borderRadius: '12px',
    color: 'white',
    fontWeight: 'bold',
  };

  const spamStyle = {
    ...tagStyle,
    backgroundColor: '#f44336',
  };

  const hamStyle = {
    ...tagStyle,
    backgroundColor: '#4caf50',
  };

  return (
    <div
      onClick={() => navigate(`/email/${id}`)}
      style={{ ...cardStyle, cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={leftSectionStyle}>
          <p><strong>From:</strong> {from}</p>
          <p><strong>Subject:</strong> {subject}</p>
        </div>
        <div style={rightSectionStyle}>
          <p><strong>Date:</strong> {new Date(date).toLocaleString()}</p>
          <p style={isSpam === 'spam' ? spamStyle : hamStyle}>
            {isSpam.toUpperCase()} | Confidence: {confidence}
          </p>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  border: '1px solid #ddd',
  padding: '15px',
  margin: '10px 0',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#fff',
};

const leftSectionStyle = {
  flex: 1,
};

const rightSectionStyle = {
  textAlign: 'right',
};

export default EmailCard;
