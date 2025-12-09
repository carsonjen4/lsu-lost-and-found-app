// src/components/ItemsPage.jsx 
import React, { useState, useEffect } from 'react';
//import { supabase } from '../config/supabase';
import ClaimButton from './Claim/ClaimButton';
import './ItemsPage.css';

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); // Will come from auth

  useEffect(() => {
    fetchItems();
  
  }, []);

  const fetchItems = async () => {
    // TEMPORARY: Use mock data since supabase import is commented out
    // This is just for testing claim components
    const mockItems = [
      {
        id: '1',
        title: 'Lost iPhone 13',
        description: 'Black iPhone with blue case, cracked screen',
        category: 'Electronics',
        status: 'found',
        location: 'Student Union',
        created_at: new Date().toISOString(),
        user_id: 'owner-123' // Different from currentUser
      },
      {
        id: '2',
        title: 'Found LSU ID Card',
        description: 'Purple Tiger Card with picture',
        category: 'ID',
        status: 'found',
        location: 'Middleton Library',
        created_at: new Date().toISOString(),
        user_id: 'owner-456'
      },
      {
        id: '3',
        title: 'Lost Backpack',
        description: 'Red Nike backpack with laptop compartment',
        category: 'Bag',
        status: 'lost',
        location: 'Union Square',
        created_at: new Date().toISOString(),
        user_id: 'owner-789'
      }
    ];
    
    setItems(mockItems);
    setLoading(false);
    
    // TEMPORARY USER FOR TESTING
    setCurrentUser({
      id: 'test-user-999',
      email: 'student@lsu.edu',
      name: 'Test Student'
    });
    
    /* 
    // REAL CODE (when supabase is uncommented):
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setItems(data || []);
    setLoading(false);
    */
  };

  // CSS classes
  
  if (loading) {
    return (
      <div className="items-loading">
        <div className="loading-spinner"></div>
        <p>Loading items...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="items-page">
        <h1>Browse Lost & Found Items</h1>
        <div className="items-empty">
          <p>No items found. Be the first to report a lost or found item!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="items-page">
      <h1>Browse Lost & Found Items</h1>
      
      {}
      <div className="items-controls">
        <input 
          type="text" 
          placeholder="Search items..." 
          className="search-box"
          // Add onChange handler 
        />
        <div className="filter-controls">
          <button className="filter-button active">All</button>
          <button className="filter-button">Lost</button>
          <button className="filter-button">Found</button>
        </div>
      </div>

      <div className="items-grid">
        {items.map(item => (
          <div key={item.id} className="item-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            
            {}
            <div className="item-meta">
              <span className={`meta-badge status-${item.status}`}>
                {item.status.toUpperCase()}
              </span>
              {item.category && (
                <span className="meta-badge">{item.category}</span>
              )}
            </div>
            
            {item.location && (
              <p className="item-location">📍 {item.location}</p>
            )}
            
            {item.created_at && (
              <p className="item-date">
                📅 {new Date(item.created_at).toLocaleDateString()}
              </p>
            )}
            {}
            
            {}
            <div className="claim-section">
              <ClaimButton item={item} currentUser={currentUser} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemsPage;