import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import './Claim.css';

const ClaimsManager = ({ currentUser }) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchUserClaims();
      setupRealtimeUpdates();
    }
  }, [currentUser]);

  const fetchUserClaims = async () => {
    try {
      setLoading(true);
      
      // Fetch claims where current user owns the items
      const { data, error: fetchError } = await supabase
        .from('claims')
        .select(`
          *,
          items:item_id(
            id,
            title,
            description,
            image_url,
            user_id
          ),
          claimer:claimer_id(
            id,
            name,
            email
          )
        `)
        .eq('items.user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setClaims(data || []);
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    const subscription = supabase
      .channel('claims-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'claims'
        }, 
        () => {
          // Refresh claims when any change occurs
          fetchUserClaims();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const updateClaimStatus = async (claimId, newStatus) => {
    try {
      setError('');
      
      const { error: updateError } = await supabase
        .from('claims')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', claimId);

      if (updateError) throw updateError;

      // Refresh the list
      fetchUserClaims();
      
      alert(`✅ Claim ${newStatus} successfully!`);

    } catch (err) {
      console.error('Error updating claim:', err);
      setError('Failed to update claim status');
    }
  };

  if (loading) {
    return <div className="loading">Loading claims...</div>;
  }

  return (
    <div className="claims-manager">
      <h2>📋 Claims on Your Items</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {claims.length === 0 ? (
        <p className="no-claims">No claims on your items yet.</p>
      ) : (
        <div className="claims-list">
          {claims.map(claim => (
            <div key={claim.id} className={`claim-card status-${claim.status}`}>
              <div className="claim-header">
                <h3>📦 {claim.items?.title}</h3>
                <span className={`status-badge ${claim.status}`}>
                  {claim.status}
                </span>
              </div>
              
              <div className="claim-details">
                <p><strong>👤 From:</strong> {claim.claimer?.name} ({claim.claimer?.email})</p>
                <p><strong>📅 Submitted:</strong> {new Date(claim.created_at).toLocaleString()}</p>
                <p><strong>💬 Message:</strong></p>
                <div className="claim-message">{claim.message}</div>
              </div>

              {claim.status === 'pending' && (
                <div className="claim-actions">
                  <button 
                    onClick={() => updateClaimStatus(claim.id, 'approved')}
                    className="btn-approve"
                  >
                    ✅ Approve Claim
                  </button>
                  <button 
                    onClick={() => updateClaimStatus(claim.id, 'rejected')}
                    className="btn-reject"
                  >
                    ❌ Reject Claim
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClaimsManager;