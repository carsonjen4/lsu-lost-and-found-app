// src/components/Claim/ClaimButton.jsx 
import React, { useState } from 'react';
import './Claim.css';

const ClaimButton = ({ item, currentUser }) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleClaim = async () => {
    setIsClaiming(true);
    alert(`Claim submitted for: ${item.title}`);
  
    setTimeout(() => {
      setIsClaiming(false);
      setShowForm(false);
    }, 1000);
  };

  if (!currentUser) {
    return (
      <button className="claim-button" disabled>
        🔒 Log in to Claim
      </button>
    );
  }

  return (
    <div className="claim-section">
      {!showForm ? (
        <button 
          className="claim-toggle-btn"
          onClick={() => setShowForm(true)}
        >
          🚩 Claim This Item
        </button>
      ) : (
        <div className="claim-form">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Why is this yours?"
            rows="3"
          />
          <div className="claim-actions">
            <button 
              onClick={handleClaim}
              disabled={isClaiming}
              className="claim-submit-btn"
            >
              {isClaiming ? 'Submitting...' : 'Submit Claim'}
            </button>
            <button 
              onClick={() => setShowForm(false)}
              className="claim-cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


export default ClaimButton;