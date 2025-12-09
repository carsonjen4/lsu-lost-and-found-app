import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/BrowseItems.css";
import lsuFoundLogo from '../images/lsulogo.png';
import lsuFoundCampus from '../images/lsucampus.jpg';
import { supabase } from '../config/supabase';

const BrowseItemsPage = () => {
  const navigate = useNavigate();
  
  // Current user state - Fixed as Carson Jenkins
  const [currentUser] = useState({
    id: crypto.randomUUID(),
    email: "cjenk52@lsu.edu",
    name: "Carson Jenkins"
  });

  // Filter states
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Claim modal states
  const [claimMessage, setClaimMessage] = useState("");
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [submittingClaim, setSubmittingClaim] = useState(false);

  // Filter options
  const locationOptions = ["All Locations", "Parking Lot", "Student Union", "Restroom", "Library", "Patrick F Taylor Hall", "Other"];
  const categoryOptions = ["All Categories", "Bags", "Books", "Electronics", "Clothes", "Misc"];
  const sortOptions = [
    { value: "newest", label: "Newest to Oldest" },
    { value: "oldest", label: "Oldest to Newest" }
  ];

  // Helper functions
  const calculateTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Fetch items from Supabase
  const fetchItems = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('items')
        .select('*');
      
      if (selectedSort === "newest") {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: true });
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching items:', error);
        setItems([]);
        return;
      }
      
      // Map items to display format
      const normalizedItems = (data || []).map(item => ({
        id: item.id,
        title: item.title?.trim() || 'Untitled Item',
        category: item.category?.trim() || 'Misc',
        location: item.location?.trim() || 'Other',
        description: item.description?.trim() || 'No description available',
        status: item.status?.trim() || 'found',
        email: item.email?.trim() || 'unknown',
        image_url: item.image_url?.trim() || null,
        created_at: item.created_at,
        timeAgo: calculateTimeAgo(item.created_at),
        dateFound: formatDate(item.created_at),
        isAvailableForClaim: !['claimed', 'pending_claim'].includes((item.status || '').toLowerCase())
      }));
      
      setItems(normalizedItems);
      
    } catch (error) {
      console.error('Error in fetchItems:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch items on mount and when sort changes
  useEffect(() => {
    fetchItems();
  }, [selectedSort]);

  // ORIGINAL WORKING CLAIM FUNCTION
  const handleClaimSubmit = async () => {
    if (!claimMessage.trim()) {
      alert("Please enter a message explaining why this item is yours.");
      return;
    }

    if (!selectedItem) {
      alert("No item selected.");
      return;
    }

    if (!currentUser.id) {
      alert("Please log in to submit a claim.");
      return;
    }

    setSubmittingClaim(true);

    try {
      // ORIGINAL WORKING CODE
      const claimData = {
        item_id: selectedItem.id,
        claimer_id: currentUser.id,
        message: claimMessage,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Submitting claim:', claimData);

      // Insert into claims table
      const { data, error } = await supabase
        .from('claims')
        .insert([claimData])
        .select();

      if (error) {
        console.error('Error:', error);
        
        // Simple error handling like original
        if (error.message.includes('duplicate')) {
          alert('You have already claimed this item!');
        } else if (error.message.includes('foreign key')) {
          alert('This item may have been removed from the database. Please refresh the page.');
        } else {
          alert(`Failed to submit claim: ${error.message}`);
        }
        return;
      }

      console.log('Claim submitted:', data);

      // Update item status
      try {
        await supabase
          .from('items')
          .update({ 
            status: 'pending_claim',
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedItem.id);
      } catch (updateErr) {
        console.log('Note: Item status update optional');
      }

      alert(`✅ Success! Claim submitted for "${selectedItem.title}"\n\nThe finder will email you and accept or deny your claim.`);
      
      // Reset
      setShowClaimModal(false);
      setClaimMessage("");
      setSelectedItem(null);
      fetchItems();
      
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSubmittingClaim(false);
    }
  };

  // Simple claim button click handler
  const handleClaimClick = (item) => {
    if (!item || !item.id) {
      alert("Invalid item selected.");
      return;
    }

    if (!currentUser.id) {
      alert("Please log in to submit a claim.");
      return;
    }

    if (!item.isAvailableForClaim) {
      alert(`This item cannot be claimed. Current status: ${item.status.toUpperCase()}`);
      return;
    }

    setSelectedItem(item);
    setShowClaimModal(true);
    setClaimMessage("");
  };

  // Apply filters to items
  const getFilteredItems = () => {
    if (!items.length) return [];
    
    let filtered = [...items];
    
    if (selectedLocation !== "All Locations") {
      if (selectedLocation === "Other") {
        filtered = filtered.filter(item => item.location === "Other");
      } else {
        filtered = filtered.filter(item => item.location === selectedLocation);
      }
    }
    
    if (selectedCategory !== "All Categories") {
      if (selectedCategory === "Misc") {
        filtered = filtered.filter(item => item.category === "Misc");
      } else {
        filtered = filtered.filter(item => item.category === selectedCategory);
      }
    }
    
    return filtered;
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedLocation("All Locations");
    setSelectedCategory("All Categories");
    setSelectedSort("newest");
  };

  // Handle Home button click
  const handleHomeClick = () => {
    navigate('/');
  };

  // Refresh data
  const handleRefresh = () => {
    fetchItems();
  };

  // Test claim function (optional - remove in production)
  const testClaimFunction = async () => {
    try {
      // Create a test claim
      const testData = {
        item_id: crypto.randomUUID(),
        claimer_id: currentUser.id,
        message: 'Test claim from debug button',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('claims')
        .insert([testData]);
        
      if (error) {
        alert(`Test failed: ${error.message}`);
      } else {
        alert('✅ Test claim inserted successfully!');
      }
    } catch (err) {
      alert(`Test error: ${err.message}`);
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="browse-container">
      {/* LSU Logo in top left corner */}
      <div className="corner-logo">
        <img src={lsuFoundLogo} alt="LSU Logo" className="lsu-corner-logo" />
      </div>

      {/* Home Button in top right */}
      <button className="home-button" onClick={handleHomeClick}>
        Home
      </button>

      {/* Refresh Button */}
      <button 
        className="refresh-button"
        onClick={handleRefresh}
        disabled={loading}
        style={{
          position: 'fixed',
          top: '15px',
          right: '100px',
          background: '#461D7C',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.8rem',
          zIndex: 100,
          fontWeight: 'bold'
        }}
      >
        {loading ? 'Loading...' : 'Refresh'}
      </button>

      {/* Main Header */}
      <header className="main-header">
        <h1>Browse Items</h1>
      </header>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="filter-row">
            {/* Sort Filter */}
            <div className="filter-group">
              <h3 className="filter-title">Sort By</h3>
              <div className="filter-options">
                {sortOptions.map((sort) => (
                  <button
                    key={sort.value}
                    className={`filter-btn ${selectedSort === sort.value ? 'active' : ''}`}
                    onClick={() => setSelectedSort(sort.value)}
                    disabled={loading}
                  >
                    {sort.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <h3 className="filter-title">Category</h3>
              <div className="filter-options">
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                    disabled={loading}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="filter-group">
              <h3 className="filter-title">Location</h3>
              <div className="filter-options">
                {locationOptions.map((location) => (
                  <button
                    key={location}
                    className={`filter-btn ${selectedLocation === location ? 'active' : ''}`}
                    onClick={() => setSelectedLocation(location)}
                    disabled={loading}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="filter-actions">
            <button className="reset-btn" onClick={resetFilters} disabled={loading}>
              Reset Filters
            </button>
            <div className="results-count">
              {loading ? 'Loading...' : `${filteredItems.length} items found`}
            </div>
          </div>
        </div>
      </div>

      {/* Items Section with Campus Background */}
      <div 
        className="items-background-section"
        style={{ backgroundImage: `url(${lsuFoundCampus})` }}
      >
        <div className="items-background-overlay">
          {/* Loading State */}
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading items from database...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="no-items-message">
              <h3>No items found in database</h3>
              <p>The database appears to be empty or there was an error loading items.</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="no-items-message">
              <h3>No items match your filters</h3>
              <p>Try adjusting your filters or check back later!</p>
            </div>
          ) : (
            /* Items Grid */
            <div className="items-grid">
              {filteredItems.map((item) => (
                <div key={item.id} className="item-card">
                  {/* Item Image */}
                  {item.image_url ? (
                    <div className="item-image-container">
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="item-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/300x200/461D7C/FFFFFF?text=No+Image";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="item-image-container">
                      <div className="no-image-placeholder">
                        No Image
                      </div>
                    </div>
                  )}
                  
                  <div className="item-content">
                    {/* Category Badge */}
                    <div className="item-category">
                      {item.category}
                    </div>
                    
                    {/* Item Title */}
                    <h3 className="item-title">{item.title}</h3>
                    
                    {/* Item Description */}
                    <p className="item-description">
                      {item.description}
                    </p>
                    
                    {/* Item Details */}
                    <div className="item-details">
                      <div className="detail">
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">{item.location}</span>
                      </div>
                      <div className="detail">
                        <span className="detail-label">Found:</span>
                        <span className="detail-value">{item.timeAgo}</span>
                      </div>
                      <div className="detail">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">{item.dateFound}</span>
                      </div>
                      <div className="detail">
                        <span className="detail-label">Status:</span>
                        <span className={`detail-value status-${item.status}`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="detail">
                        <span className="detail-label">Contact:</span>
                        <span className="detail-value">
                          {item.email === 'unknown' ? 'unknown' : item.email}
                        </span>
                      </div>
                    </div>
                    
                    {/* Claim Button */}
                    <div className="item-actions">
                      <button 
                        className="claim-btn"
                        onClick={() => handleClaimClick(item)}
                        disabled={!item.isAvailableForClaim || submittingClaim}
                      >
                        {item.status === 'claimed' ? 'Already Claimed' : 
                         item.status === 'pending_claim' ? 'Claim Pending' : 'Claim Item'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <footer className="main-footer">
        <nav className="footer-nav">
          <Link to="/">Home</Link>
          <Link to="/lost">Report Lost</Link>
          <Link to="/found">Report Found</Link>
          <Link to="/browse" className="active">Browse Items</Link>
        </nav>
        <div className="footer-info">
          <p>LSU Lost & Found System</p>
        </div>
      </footer>

      {/* Claim Modal */}
      {showClaimModal && selectedItem && (
        <div className="claim-modal-overlay">
          <div className="claim-modal">
            <div className="modal-header">
              <h3>Claim {selectedItem.title}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowClaimModal(false)}
                disabled={submittingClaim}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>Please provide details to verify this item belongs to you:</p>
              
              <div className="item-preview">
                <strong>Item Details:</strong>
                <div><strong>Category:</strong> {selectedItem.category}</div>
                <div><strong>Location Found:</strong> {selectedItem.location}</div>
                <div><strong>Description:</strong> {selectedItem.description}</div>
                <div><strong>Current Holder:</strong> {selectedItem.email === 'unknown' ? 'unknown' : selectedItem.email}</div>
              </div>
              
              <div className="claim-message">
                <label htmlFor="claimMessage">
                  <strong>Verification Message:</strong>
                  <span className="helper-text">Describe how you can prove this is your item</span>
                </label>
                <textarea
                  id="claimMessage"
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  placeholder="Example: 'This has a small scratch on the left side and contained my calculus notes...'"
                  rows={4}
                  maxLength={500}
                  disabled={submittingClaim}
                />
                <div className="char-count">
                  {claimMessage.length}/500 characters
                </div>
              </div>
              
              <div className="claimer-info">
                <strong>Claiming as:</strong>
                <div>Carson Jenkins (cjenk52@lsu.edu)</div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowClaimModal(false)}
                disabled={submittingClaim}
              >
                Cancel
              </button>
              <button 
                className="submit-btn"
                onClick={handleClaimSubmit}
                disabled={!claimMessage.trim() || submittingClaim}
              >
                {submittingClaim ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseItemsPage;