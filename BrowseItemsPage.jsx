import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/BrowseItems.css";
import ClaimButton from "./Claim/ClaimButton";
import lsuFoundLogo from '../images/lsulogo.png';
import lsuFoundCampus from '../images/lsucampus.jpg';

const BrowseItemsPage = () => {
  const [currentUser] = useState({
    id: "test-user-123",
    email: "student@lsu.edu",
    name: "Test Student"
  });

  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [filteredItems, setFilteredItems] = useState([]);
  const [claimMessage, setClaimMessage] = useState("");
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch data from Supabase (mock data for now)
  const fetchItems = async () => {
    // Mock data matching your image
    const mockItems = [
      {
        id: 1,
        title: "AirPods Pro Case",
        status: "found",
        category: "Electronics",
        location: "Middleton Library",
        description: "White AirPods case with slight scratches. Found near the entrance.",
        user_id: "owner-456",
        dateFound: "2025-12-01",
        timeAgo: "2 days ago",
        studentName: "Modalized (firmly)",
        date_added: "2025-12-01T10:30:00Z"
      },
      {
        id: 2,
        title: "Grey Backpack",
        status: "found",
        category: "Bags & Backpacks",
        location: "Student Union",
        description: "Grey JanSport backpack found in the food court. Contains notebooks and a water bottle.",
        user_id: "owner-789",
        dateFound: "2025-11-30",
        timeAgo: "3 days ago",
        studentName: "Student Name",
        date_added: "2025-11-30T14:15:00Z"
      },
      {
        id: 3,
        title: "LSU Water Bottle",
        status: "found",
        category: "Personal Items",
        location: "Tiger Stadium",
        description: "Purple LSU water bottle left in section 405. Has some stickers on it.",
        user_id: "owner-101",
        dateFound: "2025-11-29",
        timeAgo: "4 days ago",
        studentName: "John Doe",
        date_added: "2025-11-29T09:45:00Z"
      },
      {
        id: 4,
        title: "Calculus Textbook",
        status: "found",
        category: "Books",
        location: "Lockett Hall",
        description: "Calculus 3 textbook left in classroom 216. Has notes in margins.",
        user_id: "owner-112",
        dateFound: "2025-11-28",
        timeAgo: "5 days ago",
        studentName: "Jane Smith",
        date_added: "2025-11-28T16:20:00Z"
      },
      {
        id: 5,
        title: "iPhone Charger",
        status: "lost",
        category: "Electronics",
        location: "Patrick Taylor Hall",
        description: "White Apple lightning cable lost in computer lab.",
        user_id: "owner-131",
        dateFound: "2025-11-27",
        timeAgo: "6 days ago",
        studentName: "Alex Johnson",
        date_added: "2025-11-27T11:10:00Z"
      },
      {
        id: 6,
        title: "Student ID Card",
        status: "claimed",
        category: "Personal Items",
        location: "Union Square",
        description: "Student ID found near the bookstore. Name partially visible.",
        user_id: "owner-415",
        dateFound: "2025-11-26",
        timeAgo: "1 week ago",
        studentName: "Taylor Davis",
        date_added: "2025-11-26T13:45:00Z"
      }
    ];
    
    setFilteredItems(mockItems);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Filter items based on selected filters
  const applyFilters = () => {
    let filtered = [...filteredItems];
    
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (selectedLocation !== "All Locations") {
      filtered = filtered.filter(item => item.location === selectedLocation);
    }
    
    if (selectedStatus !== "All Status") {
      filtered = filtered.filter(item => item.status === selectedStatus.toLowerCase());
    }
    
    return filtered;
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory("All Categories");
    setSelectedLocation("All Locations");
    setSelectedStatus("All Status");
  };

  // Handle claim button click
  const handleClaimClick = (item) => {
    setSelectedItem(item);
    setShowClaimModal(true);
    setClaimMessage("");
  };

  // Submit claim with message
  const handleClaimSubmit = async () => {
    if (!claimMessage.trim()) {
      alert("Please enter a message explaining why this item is yours.");
      return;
    }

    // Here you would submit to Supabase
    console.log("Claim submitted for:", selectedItem.title);
    console.log("Claim message:", claimMessage);
    console.log("Claimed by:", currentUser.name);
    
    // Mock submission - in real app, you would:
    // const { data, error } = await supabase
    //   .from('claims')
    //   .insert({
    //     item_id: selectedItem.id,
    //     user_id: currentUser.id,
    //     message: claimMessage,
    //     status: 'pending'
    //   });
    
    alert(`Claim submitted for ${selectedItem.title}! Our team will review your claim.`);
    setShowClaimModal(false);
    setClaimMessage("");
    setSelectedItem(null);
  };

  // Mock filter options
  const categories = ["All Categories", "Electronics", "Bags & Backpacks", "Personal Items", "Books", "Clothing", "Other"];
  const locations = ["All Locations", "Middleton Library", "Student Union", "Tiger Stadium", "Lockett Hall", "Patrick Taylor Hall", "Union Square"];
  const statuses = ["All Status", "Found", "Lost", "Claimed"];

  const displayedItems = applyFilters();

  return (
    <div className="browse-container">
      {/* LSU Logo in top left corner */}
      <div className="logo-container">
        <img src={lsuFoundLogo} alt="LSU Logo" className="top-left-logo" />
      </div>

      {/* Compact Header */}
      <header className="main-header">
        <h1>Browse Items</h1>
      </header>

      {/* Compact Filter Section */}
      <div className="filter-section">
        <div className="filter-boxes">
          {/* Category Filter */}
          <div className="filter-box">
            <div className="filter-label">Category</div>
            <div className="filter-options">
              {categories.map((category) => (
                <div
                  key={category}
                  className={`filter-option ${selectedCategory === category ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </div>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div className="filter-box">
            <div className="filter-label">Location</div>
            <div className="filter-options">
              {locations.map((location) => (
                <div
                  key={location}
                  className={`filter-option ${selectedLocation === location ? 'selected' : ''}`}
                  onClick={() => setSelectedLocation(location)}
                >
                  {location}
                </div>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="filter-box">
            <div className="filter-label">Status</div>
            <div className="filter-options">
              {statuses.map((status) => (
                <div
                  key={status}
                  className={`filter-option ${selectedStatus === status ? 'selected' : ''}`}
                  onClick={() => setSelectedStatus(status)}
                >
                  {status}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Actions - Compact */}
        <div className="filter-actions">
          <button className="reset-button" onClick={resetFilters}>
            Reset
          </button>
          <div className="filter-results">
            {displayedItems.length} items
          </div>
        </div>
      </div>

      {/* Main content with campus background */}
      <div 
        className="items-background"
        style={{ backgroundImage: `url(${lsuFoundCampus})` }}
      >
        <div className="items-overlay">
          {/* Items list - horizontal layout */}
          <div className="items-list">
            {displayedItems.length > 0 ? (
              displayedItems.map((item) => (
                <div key={item.id} className="item-card">
                  <div className="item-header">
                    <h3 className="item-title">{item.title}</h3>
                    <div className={`item-status-badge status-${item.status}`}>
                      {item.status.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="item-details">
                    <div className="detail-row">
                      <span className="detail-label">Category:</span>
                      <span className="detail-value">{item.category}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{item.location}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">{item.timeAgo}</span>
                    </div>
                    {item.studentName && (
                      <div className="detail-row">
                        <span className="detail-label">Student Name:</span>
                        <span className="detail-value">{item.studentName}</span>
                      </div>
                    )}
                    <div className="detail-row description">
                      <span className="detail-label">Description:</span>
                      <span className="detail-value">{item.description}</span>
                    </div>
                  </div>
                  
                  <div className="item-actions">
                    <button 
                      className="claim-button"
                      onClick={() => handleClaimClick(item)}
                      disabled={item.status === 'claimed'}
                    >
                      {item.status === 'claimed' ? 'Already Claimed' : 'Claim Item'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-items">
                No items found matching your filters.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && selectedItem && (
        <div className="claim-modal-overlay">
          <div className="claim-modal">
            <div className="modal-header">
              <h3>Claim {selectedItem.title}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowClaimModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>Please provide details to verify this item belongs to you:</p>
              
              <div className="item-preview">
                <strong>Item Details:</strong>
                <div>Category: {selectedItem.category}</div>
                <div>Location Found: {selectedItem.location}</div>
                <div>Description: {selectedItem.description}</div>
              </div>
              
              <div className="claim-message">
                <label htmlFor="claimMessage">
                  <strong>Verification Message:</strong>
                  <span className="helper-text">Describe how you can prove this is your item (e.g., specific markings, contents, etc.)</span>
                </label>
                <textarea
                  id="claimMessage"
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  placeholder="Example: 'This has a small scratch on the left side and contained my calculus notes with my name on them...'"
                  rows={4}
                />
                <div className="char-count">
                  {claimMessage.length}/500 characters
                </div>
              </div>
              
              <div className="claimer-info">
                <strong>Claiming as:</strong>
                <div>{currentUser.name} ({currentUser.email})</div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowClaimModal(false)}
              >
                Cancel
              </button>
              <button 
                className="submit-button"
                onClick={handleClaimSubmit}
                disabled={!claimMessage.trim()}
              >
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <footer className="navigation-footer">
        <nav className="footer-nav">
          <Link to="/">Home</Link>
          <Link to="/lost">Report Lost</Link>
          <Link to="/found">Report Found</Link>
          <Link to="/browse" className="active">Browse Items</Link>
        </nav>
      </footer>
    </div>
  );
};

export default BrowseItemsPage;