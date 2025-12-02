import React, { useState } from 'react';
import ClaimButton from './ClaimButton';
import ClaimsManager from './ClaimsManager';

const ClaimDemo = () => {
  const [currentUser] = useState({
    id: 'user-123',
    email: 'student@lsu.edu',
    name: 'Test Student'
  });

  const demoItems = [
    {
      id: 'item-1',
      title: 'Lost iPhone 13',
      description: 'Black iPhone with blue case',
      user_id: 'owner-456', // Different from currentUser
      status: 'found',
      category: 'electronics',
      location: 'Student Union',
      created_at: new Date().toISOString()
    },
    {
      id: 'item-2',
      title: 'Found LSU ID Card',
      description: 'Purple Tiger Card',
      user_id: 'owner-789',
      status: 'found',
      category: 'ID',
      location: 'Library',
      created_at: new Date().toISOString()
    }
  ];

  return (
    <div className="demo-container">
      <h1>🎯 Person 3 - Claim System Demo</h1>
      
      <div className="test-section">
        <h2>✅ Test 1: Claim Button Functionality</h2>
        {demoItems.map(item => (
          <div key={item.id} className="demo-item">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <ClaimButton item={item} currentUser={currentUser} />
          </div>
        ))}
      </div>

      <div className="test-section">
        <h2>✅ Test 2: Claims Manager Dashboard</h2>
        <ClaimsManager currentUser={{ id: 'owner-456', email: 'owner@lsu.edu' }} />
      </div>

      <div className="test-section">
        <h2>✅ Test 3: Database Verification</h2>
        <button onClick={async () => {
          const { data } = await supabase.from('claims').select('count');
          alert(`Total claims in database: ${data?.[0]?.count || 0}`);
        }}>
          Check Claims Count
        </button>
      </div>
    </div>
  );
};

export default ClaimDemo;