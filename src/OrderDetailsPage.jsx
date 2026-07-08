import React, { useState, useEffect, useCallback } from 'react';
import './OrderDetailsPage.css';
import { mockDb } from './mockDb';
import shiprocketApi from './shiprocketApi';

function OrderDetailsPage({ onNavigate, orderId, currentUser }) {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liveTracking, setLiveTracking] = useState(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const data = await mockDb.getOrderById(orderId);
        setOrder(data);
        // Auto-fetch live tracking if AWB exists
        if (data?.trackingId) {
          fetchLiveTracking(data.trackingId);
        }
      } catch (e) {
        // fail silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const fetchLiveTracking = useCallback(async (awb) => {
    setIsTrackingLoading(true);
    setTrackingError(null);
    try {
      const res = await shiprocketApi.trackShipment(awb);
      const trackData = res?.tracking_data;

      if (trackData?.shipment_track_activities?.length) {
        // Map Shiprocket's activity format to our checkpoint format
        const activities = trackData.shipment_track_activities
          .slice()
          .reverse() // oldest first
          .map((act) => ({
            checkpoint: act.location || 'In Transit',
            status: act.activity || act.description || 'Update received',
            time: act.date ? new Date(act.date).toISOString() : new Date().toISOString(),
          }));
        setLiveTracking({
          activities,
          currentStatus:
            trackData.shipment_track?.[0]?.current_status ||
            trackData.shipment_status_id,
          etd: trackData.shipment_track?.[0]?.etd,
        });
      } else {
        setTrackingError('No tracking updates yet. Check back after dispatch.');
      }
    } catch (err) {
      setTrackingError('Could not reach tracking server. Is the proxy running?');
    } finally {
      setIsTrackingLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="order-details-page-wrapper">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div
            className="spinner"
            style={{ margin: '0 auto 1.5rem auto', borderTopColor: 'var(--primary-green)' }}
          ></div>
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
          <p>
            We couldn't retrieve details for order reference: <strong>#{orderId}</strong>.
          </p>
          <button className="back-btn" onClick={() => onNavigate('account')}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Timeline status
  const statusesList = ['placed', 'processing', 'shipped', 'delivered'];
  const currentStatus = order.status.toLowerCase();
  let statusIndex = 0;
  if (currentStatus === 'processing') statusIndex = 1;
  else if (currentStatus === 'shipped') statusIndex = 2;
  else if (currentStatus === 'delivered') statusIndex = 3;

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => window.print();

  // Decide which tracking history to show: live > local
  const checkpointData =
    liveTracking?.activities ||
    order.trackingHistory ||
    null;

  return (
    <div className="order-details-page-wrapper">
      <div className="details-container">

        {/* Breadcrumb */}
        <div className="details-breadcrumb">
          <span className="breadcrumb-link" onClick={() => onNavigate('account')}>
            Dashboard
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Order #{order.id}</span>
        </div>

        {/* Title & Actions */}
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
              ← Dashboard
            </button>
          </div>
        </div>

        {/* SECTION 1: Status Timeline */}
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
                delivered: 'Delivered',
              };
              const stepIcons = {
                placed: '📝',
                processing: '🏺',
                shipped: '🚚',
                delivered: '🎁',
              };

              return (
                <div
                  key={step}
                  className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                >
                  <div className="step-circle">
                    <span className="step-icon">{stepIcons[step]}</span>
                  </div>
                  <div className="step-label">
                    <strong>{stepLabels[step]}</strong>
                    {idx === 0 && <span className="step-sub">{formatDate(order.date)}</span>}
                    {idx === 1 && isActive && <span className="step-sub">Aged in Clay Pot</span>}
                    {idx === 2 && isActive && (
                      <span className="step-sub">
                        {order.courierName || 'Via Shiprocket'}
                      </span>
                    )}
                    {idx === 3 && isCompleted && (
                      <span className="step-sub">Handed to Buyer</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: Shiprocket Tracking Card */}
        {order.trackingId && (
          <section className="details-card courier-card">
            <div className="courier-card-header">
              <h3 className="card-sec-title" style={{ marginBottom: 0 }}>
                Tracking Information
              </h3>
              <div className="courier-header-actions">
                <span className="sr-powered-tag">🚚 Powered by Shiprocket</span>
                <button
                  className="refresh-tracking-btn"
                  onClick={() => fetchLiveTracking(order.trackingId)}
                  disabled={isTrackingLoading}
                >
                  {isTrackingLoading ? '⏳ Refreshing...' : '↻ Refresh Tracking'}
                </button>
              </div>
            </div>

            <div className="courier-grid" style={{ marginTop: '1.5rem' }}>
              <div className="courier-info-item">
                <span className="c-label">Courier Partner</span>
                <span className="c-val">{order.courierName || 'Shiprocket Courier'}</span>
              </div>
              <div className="courier-info-item">
                <span className="c-label">Tracking AWB</span>
                <span className="c-val highlight awb-mono">{order.trackingId}</span>
              </div>
              <div className="courier-info-item">
                <span className="c-label">Shipment Status</span>
                <span className="c-val">
                  {liveTracking?.currentStatus ||
                    (currentStatus === 'delivered'
                      ? 'Delivered successfully'
                      : 'In Transit')}
                </span>
              </div>
              <div className="courier-info-item">
                <span className="c-label">Estimated Delivery</span>
                <span className="c-val">
                  {liveTracking?.etd
                    ? formatDate(liveTracking.etd)
                    : currentStatus === 'delivered'
                    ? 'Delivered'
                    : '3–5 Business Days'}
                </span>
              </div>
            </div>

            {/* Label Download */}
            {order.labelUrl && (
              <div className="label-download-row">
                <a
                  href={order.labelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label-download-btn-full"
                >
                  🏷️ Download Shipping Label (PDF)
                </a>
              </div>
            )}

            {/* Live Tracking Checkpoints */}
            <div className="tracking-timeline-section">
              <h4 className="tracking-timeline-title">
                {liveTracking ? '📡 Live Tracking History' : '📍 Shipment Checkpoints'}
              </h4>

              {isTrackingLoading && (
                <div className="tracking-loading">
                  <div className="mini-spinner"></div>
                  <span>Fetching live data from Shiprocket...</span>
                </div>
              )}

              {trackingError && !isTrackingLoading && (
                <div className="tracking-error-notice">
                  ⚠️ {trackingError}
                </div>
              )}

              {!isTrackingLoading && checkpointData && checkpointData.length > 0 && (
                <div className="vertical-timeline-list">
                  {checkpointData.map((item, idx) => (
                    <div
                      key={idx}
                      className={`vt-row ${idx === checkpointData.length - 1 ? 'vt-latest' : ''}`}
                    >
                      <div className="vt-connector">
                        <div className="vt-dot"></div>
                        {idx < checkpointData.length - 1 && (
                          <div className="vt-line"></div>
                        )}
                      </div>
                      <div className="vt-content">
                        <strong className="vt-location">{item.checkpoint}</strong>
                        <span className="vt-status">{item.status}</span>
                        <span className="vt-time">{formatDate(item.time)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* SECTION 3: Tax Invoice */}
        <section className="invoice-print-sheet details-card">
          <div className="invoice-header">
            <div className="invoice-brand">
              <img src="/logo-01.webp" alt="Swadyum Logo" className="invoice-logo-img" />
              <p className="brand-tag">Artisanal Sun-Cured Heritage</p>
            </div>
            <div className="invoice-meta-info">
              <h2>TAX INVOICE</h2>
              <p>
                <strong>Invoice No:</strong> INV-{order.id.replace('ord_', '')}
              </p>
              <p>
                <strong>Invoice Date:</strong> {formatDate(order.date).split(' at ')[0]}
              </p>
              <p>
                <strong>Order Ref:</strong> {order.id}
              </p>
              {order.trackingId && (
                <p>
                  <strong>AWB (Shiprocket):</strong> {order.trackingId}
                </p>
              )}
            </div>
          </div>

          <div className="invoice-divider"></div>

          <div className="invoice-addresses-row">
            <div className="address-block seller-block">
              <h4>Sold By:</h4>
              <strong>Swadyum Foods Private Limited</strong>
              <p>Plot 402, Fraser Road Corridor,</p>
              <p>Fraser Road, Patna, Bihar - 800001</p>
              <p>
                <strong>GSTIN:</strong> 10AAECS1290K1Z9
              </p>
              <p>
                <strong>FSSAI Lic:</strong> 10424000109281
              </p>
            </div>
            <div className="address-block buyer-block">
              <h4>Billing & Shipping Address:</h4>
              <strong>{order.shippingDetails?.name}</strong>
              <p>{order.shippingDetails?.address}</p>
              <p>
                {order.shippingDetails?.city}, {order.shippingDetails?.state} -{' '}
                {order.shippingDetails?.zip}
              </p>
              <p>
                <strong>Phone:</strong>{' '}
                {order.shippingDetails?.phone || currentUser?.phone || '+91 98765 43210'}
              </p>
            </div>
          </div>

          <div className="invoice-divider"></div>

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

          <div className="invoice-footer-terms">
            <p>
              <strong>Payment Mode:</strong> {order.paymentMethod} (Status: Paid/Success)
            </p>
            {order.courierName && (
              <p>
                <strong>Shipped via:</strong> {order.courierName}
                {order.trackingId && ` | AWB: ${order.trackingId}`}
              </p>
            )}
            <p>
              Thank you for choosing Swadyum Pickles. This is a computer-generated tax invoice and
              requires no signature.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default OrderDetailsPage;
