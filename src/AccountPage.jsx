import React, { useState, useEffect } from 'react';
import './AccountPage.css';
import { mockDb } from './mockDb';
import { supabase } from './supabaseClient';

function AccountPage({ onNavigate, currentUser, setCurrentUser }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  
  // Profile Form States
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Address Form States
  const [addressData, setAddressData] = useState({
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    zip: currentUser?.zip || ''
  });
  const [addressSuccess, setAddressSuccess] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Fetch orders on load or tab change
  useEffect(() => {
    const fetchOrders = async () => {
      if (currentUser) {
        const customerOrders = await mockDb.getOrdersByCustomer(currentUser.id);
        // Sort orders by date descending
        customerOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(customerOrders);
      }
    };
    fetchOrders();
  }, [currentUser, activeTab]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess(false);
    setProfileError('');

    if (!profileData.name.trim() || !profileData.email.trim() || !profileData.phone.trim()) {
      setProfileError('All profile fields are required.');
      return;
    }

    const updated = await mockDb.updateCustomer(currentUser.id, {
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone
    });

    if (updated) {
      setCurrentUser(updated);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } else {
      setProfileError('Failed to update profile.');
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressSuccess(false);
    setAddressError('');

    if (!addressData.address.trim() || !addressData.city.trim() || !addressData.state.trim() || !addressData.zip.trim()) {
      setAddressError('All address fields are required.');
      return;
    }

    if (!/^\d{6}$/.test(addressData.zip)) {
      setAddressError('ZIP/PIN code must be exactly 6 digits.');
      return;
    }

    const updated = await mockDb.updateCustomer(currentUser.id, {
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      zip: addressData.zip
    });

    if (updated) {
      setCurrentUser(updated);
      setAddressSuccess(true);
      setTimeout(() => setAddressSuccess(false), 3000);
    } else {
      setAddressError('Failed to update address.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    onNavigate('home');
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleDeleteRequest = async () => {
    const confirmDelete = window.prompt('Are you sure you want to delete your account? Type "DELETE" to confirm.');
    if (confirmDelete !== 'DELETE') {
      alert('Deletion cancelled.');
      return;
    }

    setIsDeleting(true);
    setDeleteStatus('Submitting request...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch('https://dligrptvajjsbzlcpjsk.supabase.co/functions/v1/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ reason: 'Self-service deletion' })
      });

      if (!response.ok) {
        throw new Error('Failed to submit deletion request');
      }

      setDeleteStatus('Request submitted successfully. You will be logged out.');
      setTimeout(handleLogout, 3000);
    } catch (err) {
      console.error(err);
      setDeleteStatus('Error submitting request. Please try again or email support.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="account-page-wrapper">
      <div className="account-container">
        
        {/* Banner/Header */}
        <div className="account-header">
          <span className="section-subtitle">~ My Swadyum ~</span>
          <h1 className="section-headline">Customer Dashboard</h1>
          <p className="account-intro">
            Welcome back, <strong>{currentUser?.name}</strong>. Manage your profiles, addresses, and orders.
          </p>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="account-grid-layout">
          
          {/* Left: Sidebar Navigation */}
          <aside className="account-sidebar">
            <div className="sidebar-header-card">
              <div className="user-avatar-circle">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <h3 className="user-sidebar-name">{currentUser?.name}</h3>
              <span className="user-sidebar-role">Artisanal Collector</span>
            </div>

            <nav className="sidebar-nav-menu">
              <button 
                className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <span className="sidebar-nav-icon">👤</span> Profile Information
              </button>
              <button 
                className={`sidebar-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <span className="sidebar-nav-icon">🏺</span> Order History
                {orders.length > 0 && <span className="sidebar-order-badge">{orders.length}</span>}
              </button>
              <button 
                className={`sidebar-nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <span className="sidebar-nav-icon">📍</span> Shipping Addresses
              </button>
              <button 
                className={`sidebar-nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
                onClick={() => setActiveTab('privacy')}
              >
                <span className="sidebar-nav-icon">🛡️</span> Privacy & Data
              </button>
              <div className="sidebar-menu-divider"></div>
              <button 
                className="sidebar-nav-item logout-nav-item"
                onClick={handleLogout}
              >
                <span className="sidebar-nav-icon">🚪</span> Sign Out
              </button>
            </nav>
          </aside>

          {/* Right: Tab Panels Area */}
          <main className="account-main-content">
            
            {/* Panel 1: Profile Tab */}
            {activeTab === 'profile' && (
              <div className="content-tab-card">
                <h2 className="tab-title">Profile Information</h2>
                <p className="tab-description">Update your personal contact details below to keep your records updated.</p>
                <div className="tab-divider"></div>

                {(!currentUser?.name || !currentUser?.email) && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700 font-medium">
                          Please complete your profile to continue. We need your Full Name and Email Address.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="tab-form">
                  {profileSuccess && <div className="form-success-banner">✓ Profile updated successfully!</div>}
                  {profileError && <div className="form-error-banner">{profileError}</div>}

                  <div className="tab-form-row">
                    <div className="tab-form-group">
                      <label htmlFor="profile-name">Full Name</label>
                      <input 
                        type="text" 
                        id="profile-name" 
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="tab-form-row split">
                    <div className="tab-form-group">
                      <label htmlFor="profile-email">Email Address</label>
                      <input 
                        type="email" 
                        id="profile-email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="tab-form-group">
                      <label htmlFor="profile-phone">Phone Number</label>
                      <input 
                        type="tel" 
                        id="profile-phone" 
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <button type="submit" className="tab-save-btn">Save Profile Updates</button>
                </form>
              </div>
            )}

            {/* Panel 2: Orders Tab */}
            {activeTab === 'orders' && (
              <div className="content-tab-card">
                <h2 className="tab-title">Order History</h2>
                <p className="tab-description">Monitor your pending deliveries and review receipt histories.</p>
                <div className="tab-divider"></div>

                {orders.length === 0 ? (
                  <div className="empty-orders-view">
                    <div className="empty-orders-icon">🏺</div>
                    <h3>No Orders Placed Yet</h3>
                    <p>It looks like you haven't ordered any of our sun-cured pickles yet.</p>
                    <button className="empty-orders-cta" onClick={() => onNavigate('shop')}>
                      Visit Our Shop
                    </button>
                  </div>
                ) : (
                  <div className="orders-table-wrapper">
                    <table className="orders-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Order Date</th>
                          <th>Status</th>
                          <th>Items</th>
                          <th>Total Paid</th>
                          <th className="action-header">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td className="order-id-cell">#{order.id}</td>
                            <td>{formatDate(order.date)}</td>
                            <td>
                              <span className={`status-badge ${order.status.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="order-items-cell">
                              {order.items.map(item => `${item.name} (${item.weight})`).join(', ')}
                            </td>
                            <td className="order-total-cell">₹{order.total}</td>
                            <td className="action-cell">
                              <button 
                                className="order-details-view-btn"
                                onClick={() => onNavigate(`order-details-${order.id}`)}
                              >
                                View Details ➔
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Panel 3: Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="content-tab-card">
                <h2 className="tab-title">Default Shipping Location</h2>
                <p className="tab-description">Configure your primary address details to automatically speed up checkouts.</p>
                <div className="tab-divider"></div>

                <form onSubmit={handleAddressSubmit} className="tab-form">
                  {addressSuccess && <div className="form-success-banner">✓ Address details saved successfully!</div>}
                  {addressError && <div className="form-error-banner">{addressError}</div>}

                  <div className="tab-form-row">
                    <div className="tab-form-group">
                      <label htmlFor="addr-street">Street Address</label>
                      <textarea 
                        id="addr-street" 
                        value={addressData.address}
                        onChange={(e) => setAddressData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="House Number, Building Name, Street Name"
                      />
                    </div>
                  </div>

                  <div className="tab-form-row split-three">
                    <div className="tab-form-group">
                      <label htmlFor="addr-city">City</label>
                      <input 
                        type="text" 
                        id="addr-city" 
                        value={addressData.city}
                        onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div className="tab-form-group">
                      <label htmlFor="addr-state">State</label>
                      <input 
                        type="text" 
                        id="addr-state" 
                        value={addressData.state}
                        onChange={(e) => setAddressData(prev => ({ ...prev, state: e.target.value }))}
                      />
                    </div>
                    <div className="tab-form-group">
                      <label htmlFor="addr-zip">ZIP/PIN Code</label>
                      <input 
                        type="text" 
                        id="addr-zip" 
                        maxLength="6"
                        value={addressData.zip}
                        onChange={(e) => setAddressData(prev => ({ ...prev, zip: e.target.value }))}
                      />
                    </div>
                  </div>

                  <button type="submit" className="tab-save-btn">Save Address Changes</button>
                </form>
              </div>
            )}

            {/* Panel 4: Privacy & Data Tab */}
            {activeTab === 'privacy' && (
              <div className="content-tab-card">
                <h2 className="tab-title">Privacy & Data</h2>
                <p className="tab-description">Manage your data and account settings.</p>
                <div className="tab-divider"></div>

                <div className="danger-zone">
                  <h3>Danger Zone</h3>
                  <div className="danger-zone-content">
                    <div>
                      <h4>Delete Account & Personal Data</h4>
                      <p>Once you delete your account, there is no going back. Please be certain.</p>
                      <p className="meta-compliance-note">This will permanently revoke any active WhatsApp sessions and remove your personal information.</p>
                    </div>
                    <button 
                      className="btn-danger" 
                      onClick={handleDeleteRequest}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Processing...' : 'Delete Account'}
                    </button>
                  </div>
                  {deleteStatus && (
                    <div className={`form-banner ${deleteStatus.includes('Error') ? 'form-error-banner' : 'form-success-banner'}`} style={{ marginTop: '15px' }}>
                      {deleteStatus}
                    </div>
                  )}
                </div>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}

export default AccountPage;
