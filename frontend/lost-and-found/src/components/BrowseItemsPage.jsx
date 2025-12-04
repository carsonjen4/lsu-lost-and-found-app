import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/BrowseItems.css";
import lsuFoundLogo from '../images/lsulogo.png';
import lsuFoundCampus from '../images/lsucampus.jpg';
import { supabase } from '../config/supabase';

const BrowseItemsPage = () => {
  const navigate = useNavigate();
  
  
  const [currentUser, setCurrentUser] = useState({
    id: null,
    email: null,
    name: null
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

  
  useEffect(() => {
    const initUser = () => {
      const userId = crypto.randomUUID();
      setCurrentUser({
        id: userId,
        email: "cjenk52@lsu.edu",
        name: "Carson Jenkins"
      });
    };
    
    initUser();
  }, []);


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
      
      // Map items to display
      const formattedItems = data.map(item => {
        
        const normalizedCategory = item.category && item.category.trim() !== '' 
          ? item.category 
          : 'Misc';
        
        
        const normalizedLocation = item.location && item.location.trim() !== ''
          ? item.location
          : 'Other';
        
       
        const normalizedEmail = item.email && item.email.trim() !== ''
          ? item.email
          : 'unknown';
        
        return {
          id: item.id,
          title: item.title,
          category: normalizedCategory,
          location: normalizedLocation,
          description: item.description,
          status: item.status,
          email: normalizedEmail,
          image_url: item.image_url,
          created_at: item.created_at,
          timeAgo: calculateTimeAgo(item.created_at),
          dateFound: formatDate(item.created_at),
          // Keep original for reference
          originalCategory: item.category,
          originalLocation: item.location,
          originalEmail: item.email
        };
      });
      
      setItems(formattedItems);
      
    } catch (error) {
      console.error('Error in fetchItems:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculating functions
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

  
  useEffect(() => {
    fetchItems();
  }, [selectedSort]);

  // Check if user has already claimed an item
  const checkExistingClaim = async (itemId, claimerId) => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('id, status, created_at, message')
        .eq('item_id', itemId)
        .eq('claimer_id', claimerId)
        .limit(1);

      if (error) {
        console.error('Error checking existing claim:', error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      console.error('Error in checkExistingClaim:', err);
      return null;
    }
  };

  //Claim button click - Check for existing claim first
  const handleClaimClick = async (item) => {
    if (!currentUser.id) {
      alert("Please log in to submit a claim.");
      return;
    }

    // Check if user already claimed this item
    const existingClaim = await checkExistingClaim(item.id, currentUser.id);
    
    if (existingClaim) {
      const claimDate = new Date(existingClaim.created_at).toLocaleDateString();
      const claimTime = new Date(existingClaim.created_at).toLocaleTimeString();
      
      alert(`⚠️ You Already Tried to Claim This!\n\nItem: ${item.title}\n\nYou submitted a claim on ${claimDate} at ${claimTime}\nStatus: ${existingClaim.status.toUpperCase()}\n\nYou cannot claim the same item multiple times.`);
      return;
    }

    
    setSelectedItem(item);
    setShowClaimModal(true);
    setClaimMessage("");
  };

  // Submit claim
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
      
      let claimerId = currentUser.id;
      
      
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(claimerId)) {
        claimerId = crypto.randomUUID();
      }

      
      const existingClaim = await checkExistingClaim(selectedItem.id, claimerId);
      if (existingClaim) {
        const claimDate = new Date(existingClaim.created_at).toLocaleDateString();
        alert(`⚠️ You Already Tried to Claim This!\n\nItem: ${selectedItem.title}\n\nYou already have a claim submitted on ${claimDate}.\nStatus: ${existingClaim.status.toUpperCase()}\n\nYou cannot claim the same item multiple times.`);
        setSubmittingClaim(false);
        return;
      }

      
      const claimData = {
        item_id: selectedItem.id,
        claimer_id: claimerId,
        message: claimMessage,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      
      const { data, error } = await supabase
        .from('claims')
        .insert([claimData])
        .select();

      if (error) {
        console.error('Error submitting claim:', error);
        
        // Handle duplicate constraint error
        if (error.code === '23505' && error.message.includes('unique_item_claimer')) {
          alert(`⚠️ You Already Tried to Claim This!\n\nItem: ${selectedItem.title}\n\nYou have already submitted a claim for this item.`);
        } else if (error.code === '23502') {
          alert(`Database error: Missing required field.\n\n${error.message}`);
        } else if (error.code === '23503') {
          alert(`Database error: Invalid item reference.`);
        } else {
          alert(`Failed to submit claim: ${error.message}`);
        }
        return;
      }

      // Update item status
      try {
        const { error: updateError } = await supabase
          .from('items')
          .update({ 
            status: 'pending_claim',
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedItem.id);

        if (updateError) {
          console.warn('Could not update item status:', updateError);
        }
      } catch (updateErr) {
        console.warn('Item status update failed:', updateErr);
      }

      
      alert(`✅ Success! Claim submitted for "${selectedItem.title}"\n\nThe finder will email you and accept or deny your claim.\n\nStatus: PENDING`);
      
      
      setShowClaimModal(false);
      setClaimMessage("");
      setSelectedItem(null);
      fetchItems();
      
    } catch (error) {
      console.error('Unexpected error in claim submission:', error);
      alert(`An unexpected error occurred:\n\n${error.message}`);
    } finally {
      setSubmittingClaim(false);
    }
  };

  // Apply filters to items
  const getFilteredItems = () => {
    let filtered = [...items];
    
    // Other filter
    if (selectedLocation !== "All Locations") {
      if (selectedLocation === "Other") {
        filtered = filtered.filter(item => 
          !item.originalLocation || item.originalLocation.trim() === ''
        );
      } else {
        // Filter for specific location
        filtered = filtered.filter(item => item.location === selectedLocation);
      }
    }
    
    // Misc Filter
    if (selectedCategory !== "All Categories") {
      if (selectedCategory === "Misc") {
        filtered = filtered.filter(item => 
          !item.originalCategory || item.originalCategory.trim() === ''
        );
      } else {
        // Filter for specific category
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

  // Home button click
  const handleHomeClick = () => {
    navigate('/');
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
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Filter - Updated with "Other" */}
            <div className="filter-group">
              <h3 className="filter-title">Location</h3>
              <div className="filter-options">
                {locationOptions.map((location) => (
                  <button
                    key={location}
                    className={`filter-btn ${selectedLocation === location ? 'active' : ''}`}
                    onClick={() => setSelectedLocation(location)}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="filter-actions">
            <button className="reset-btn" onClick={resetFilters}>
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
          ) : (
            /* Items Grid */
            <div className="items-grid">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
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
                      <h3 className="item-title">{item.title || 'Untitled Item'}</h3>
                      
                      {/* Item Description */}
                      <p className="item-description">
                        {item.description || 'No description available'}
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
                            {item.status ? item.status.toUpperCase() : 'UNKNOWN'}
                          </span>
                        </div>
                        {/* Always show contact */}
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
                          disabled={item.status === 'claimed' || item.status === 'pending_claim' || submittingClaim}
                        >
                          {item.status === 'claimed' ? 'Already Claimed' : 
                           item.status === 'pending_claim' ? 'Claim Pending' : 'Claim Item'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-items-message">
                  <h3>No items found</h3>
                  <p>Try adjusting your filters or check back later!</p>
                </div>
              )}
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
                {/* Show "unknown" if no email in database */}
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