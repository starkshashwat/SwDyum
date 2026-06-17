import React, { useState, useEffect } from 'react';
import './OrderDetailsPage.css';
import { mockDb } from './mockDb';

function OrderDetailsPage({ onNavigate, orderId, currentUser }) {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const data = await mockDb.getOrderById(orderId);
        setOrder(data);
      } catch (e) {
        // fail silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="order-details-page-wrapper">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem auto', borderTopColor: 'var(--primary-green)' }}></div>
          <p style={{ color: 'var(--muted-text)', fontWeight: '600' }}>Loading Order Details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-page-wrapper">
        <div className="order-not-found-card">
          <h2>Order Not Found</h2>
          <p>We couldn't retrieve details for order reference: <strong>#{orderId}</strong>.</p>
          <button className="back-btn" onClick={() => onNavigate('account')}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Determine active steps for horizontal timeline
  const statusesList = ['placed', 'processing', 'shipped', 'delivered'];
  
  // Map database status string to active index
  const currentStatus = order.status.toLowerCase();
  let statusIndex = 0;
  if (currentStatus === 'processing') statusIndex = 1;
  else if (currentStatus === 'shipped') statusIndex = 2;
  else if (currentStatus === 'delivered') statusIndex = 3;

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="order-details-page-wrapper">
      <div className="details-container">
        
        {/* Navigation Breadcrumb */}
        <div className="details-breadcrumb">
          <span className="breadcrumb-link" onClick={() => onNavigate('account')}>Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Order #{order.id}</span>
        </div>

        {/* Dashboard Title & Actions Row */}
        <div className="order-title-actions-row">
          <div>
            <h1 className="order-main-title">Order Details</h1>
            <span className="order-timestamp">Placed on {formatDate(order.date)}</span>
          </div>
          <div className="action-buttons-group">
            <button className="btn-secondary" onClick={handlePrint}>
              🖨️ Print Invoice
            </button>
            <button className="btn-primary" onClick={() => onNavigate('account')}>
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* SECTION 1: ORDER TRACKING TIMELINE */}
        <section className="details-card timeline-card">
          <h3 className="card-sec-title">Order Status</h3>
          <div className="timeline-horizontal">
            {statusesList.map((step, idx) => {
              const isCompleted = idx <= statusIndex;
              const isActive = idx === statusIndex;
              
              const stepLabels = {
                placed: 'Order Placed',
                processing: 'Sun Curing & Packaging',
                shipped: 'Shipped (In Transit)',
                delivered: 'Delivered'
              };

              const stepIcons = {
                placed: '📝',
                processing: '🏺',
                shipped: '🚚',
                delivered: '🎁'
              };

              return (
                <div key={step} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                  <div className="step-circle">
                    <span className="step-icon">{stepIcons[step]}</span>
                  </div>
                  <div className="step-label">
                    <strong>{stepLabels[step]}</strong>
                    {idx === 0 && <span className="step-sub">{formatDate(order.date)}</span>}
                    {idx === 1 && isActive && <span className="step-sub">Aged in Clay Pot</span>}
                    {idx === 2 && isActive && <span className="step-sub">Via BlueDart Air</span>}
                    {idx === 3 && isCompleted && <span className="step-sub">Handed to Buyer</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: COURIER TRACKING DATA */}
        {order.trackingId && (
          <section className="details-card courier-card">
            <h3 className="card-sec-title">Tracking Information</h3>
            <div className="courier-grid">
              <div className="courier-info-item">
                <span className="c-label">Courier Partner:</span>
                <span className="c-val">{order.courierName || 'BlueDart Express'}</span>
              </div>
              <div className="courier-info-item">
                <span className="c-label">Tracking ID:</span>
                <span className="c-val highlight">{order.trackingId}</span>
              </div>
              <div className="courier-info-item">
                <span className="c-label">Status:</span>
                <span className="c-val">
                  {currentStatus === 'delivered' ? 'Shipment delivered safely.' : 'In Transit. Out for delivery.'}
                </span>
              </div>
              <div className="courier-info-item">
                <span className="c-label">Estimated Delivery:</span>
                <span className="c-val">
                  {currentStatus === 'delivered' ? 'Delivered successfully' : 'Within 2-3 Business Days'}
                </span>
              </div>
            </div>

            {/* Vertical Shipment Checkpoints Timeline */}
            {order.trackingHistory && (
              <div className="tracking-checkpoints-log" style={{ marginTop: '2.5rem', borderTop: '1px solid #eef0f2', paddingTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '1.2rem', fontSize: '0.95rem', color: 'var(--dark-text)' }}>Shipment History Checkpoints</h4>
                <div className="vertical-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {order.trackingHistory.map((history, hidx) => (
                    <div key={hidx} className="checkpoint-row" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                      <span className="checkpoint-bullet" style={{ color: 'var(--primary-green)', fontSize: '1rem' }}>✦</span>
                      <div className="checkpoint-details">
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--dark-text)' }}>
                          {history.checkpoint} - <span style={{ fontWeight: '500', color: 'var(--muted-text)' }}>{history.status}</span>
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>{formatDate(history.time)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* SECTION 3: INVOICE COMPONENT */}
        <section className="invoice-print-sheet details-card">
          
          {/* Invoice Header */}
          <div className="invoice-header">
            <div className="invoice-brand">
              <img src="/logo-01.png" alt="Swadyum Logo" className="invoice-logo-img" />
              <p className="brand-tag">Artisanal Sun-Cured Heritage</p>
            </div>
            <div className="invoice-meta-info">
              <h2>TAX INVOICE</h2>
              <p><strong>Invoice No:</strong> INV-{order.id.replace('ord_', '')}</p>
              <p><strong>Invoice Date:</strong> {formatDate(order.date).split(' at ')[0]}</p>
              <p><strong>Order Ref:</strong> {order.id}</p>
            </div>
          </div>

          <div className="invoice-divider"></div>

          {/* Seller / Buyer Details */}
          <div className="invoice-addresses-row">
            <div className="address-block seller-block">
              <h4>Sold By:</h4>
              <strong>Swadyum Foods Private Limited</strong>
              <p>Plot 402, Fraser Road Corridor,</p>
              <p>Fraser Road, Patna, Bihar - 800001</p>
              <p><strong>GSTIN:</strong> 10AAECS1290K1Z9</p>
              <p><strong>FSSAI Lic:</strong> 10424000109281</p>
            </div>
            <div className="address-block buyer-block">
              <h4>Billing & Shipping Address:</h4>
              <strong>{order.shippingDetails.name}</strong>
              <p>{order.shippingDetails.address}</p>
              <p>{order.shippingDetails.city}, {order.shippingDetails.state} - {order.shippingDetails.zip}</p>
              <p><strong>Phone:</strong> {currentUser?.phone || '+91 98765 43210'}</p>
            </div>
          </div>

          <div className="invoice-divider"></div>

          {/* Items Table */}
          <table className="invoice-items-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Item Description</th>
                <th>Weight Size</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th className="align-right">Net Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className="item-name-col">
                    <strong>{item.name}</strong>
                    <span className="item-sub-desc">Artisanal Clay-Aged Pickle</span>
                  </td>
                  <td>{item.weight}</td>
                  <td>₹{item.price}</td>
                  <td>{item.quantity}</td>
                  <td className="align-right">₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculations Breakdown */}
          <div className="invoice-totals-section">
            <div className="totals-table">
              <div className="totals-row">
                <span>Subtotal:</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="totals-row">
                <span>GST (5% Included):</span>
                <span>₹{Math.round(order.subtotal * 0.05)}</span>
              </div>
              <div className="totals-row">
                <span>Delivery Charge:</span>
                <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
              </div>
              <div className="totals-row invoice-grand-total">
                <strong>Total Payable Amount:</strong>
                <strong>₹{order.total}</strong>
              </div>
            </div>
          </div>

          <div className="invoice-divider"></div>

          {/* Invoice Footer terms */}
          <div className="invoice-footer-terms">
            <p><strong>Payment Mode:</strong> {order.paymentMethod} (Status: Paid/Success)</p>
            <p>Thank you for choosing Swadyum Pickles. This is a computer-generated tax invoice and requires no signature.</p>
          </div>

        </section>

      </div>
    </div>
  );
}

export default OrderDetailsPage;
