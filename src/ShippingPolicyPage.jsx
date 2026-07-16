import React from 'react';
import './LegalPages.css';

function ShippingPolicyPage({ onNavigate }) {
  return (
    <div className="legal-page-wrapper">
      <div className="legal-container">
        <h1 className="legal-title">Shipping Policy</h1>
        <p className="legal-effective">Effective Date: Jan 2026</p>
        
        <p className="legal-intro">
          Thank you for shopping with Swadyum. We are committed to delivering your orders safely and on time. Please review our shipping policy below to understand how we process and ship orders.
        </p>

        <div className="legal-section">
          <h2>1. Order Processing Time</h2>
          <ul>
            <li>All orders are processed within 24 Hrs after payment confirmation.</li>
            <li>Orders are processed on business days only (excluding Sundays and public holidays).</li>
            <li>Orders placed after business hours may be processed on the next working day.</li>
            <li>During peak seasons, sales events, or holidays, processing times may be slightly longer.</li>
            <li>You will receive a confirmation email once your order has been successfully placed.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>2. Shipping Methods</h2>
          <p>We ship orders through reliable courier and logistics partners.</p>
          <p>Available shipping options may include:</p>
          <ul>
            <li>Standard Shipping</li>
            <li>Express Shipping (if applicable)</li>
          </ul>
          <p>Shipping method availability may depend on your delivery location.</p>
        </div>

        <div className="legal-section">
          <h2>3. Delivery Timeframes</h2>
          <p>Estimated delivery times are as follows:</p>
          <ul>
            <li><strong>Standard Shipping:</strong> 6-7 BUSINESS DAYS</li>
            <li><strong>Express Shipping (if available):</strong> 3-4 BUSINESS DAYS</li>
          </ul>
          <p>Delivery timelines are estimates and may vary based on your location, courier performance, weather conditions, or other unforeseen circumstances.</p>
          <p>Please note that delivery times are calculated after the order processing period.</p>
        </div>

        <div className="legal-section">
          <h2>4. Shipping Costs</h2>
          <p>Shipping charges are calculated as follows:</p>
          <ul>
            <li><strong>Standard Shipping:</strong> ₹60</li>
            <li><strong>Express Shipping (if applicable):</strong> ₹120</li>
            <li><strong>Free Shipping</strong> on orders above ₹799</li>
          </ul>
          <p>The final shipping cost will be displayed at checkout before payment confirmation.</p>
        </div>

        <div className="legal-section">
          <h2>5. Tracking Information</h2>
          <p>Once your order has been shipped, you will receive:</p>
          <ul>
            <li>A shipping confirmation email</li>
            <li>A tracking number</li>
            <li>A link to track your shipment</li>
          </ul>
          <p>Tracking information may take up to 24 hours to become active after dispatch.</p>
        </div>

        <div className="legal-section">
          <h2>6. Delivery Issues and Delays</h2>
          <p>While we work with trusted courier partners, delays may occasionally occur due to:</p>
          <ul>
            <li>Weather conditions</li>
            <li>Natural disasters</li>
            <li>Logistics disruptions</li>
            <li>Incorrect or incomplete shipping details</li>
            <li>Remote or non-serviceable areas</li>
          </ul>
          <p>If your order is delayed beyond the estimated timeframe, please contact us at <strong>Swadyum@gmail.com</strong> with your order details.</p>
          <p>If a package is marked as delivered but not received, please notify us within 48 hours so we can initiate an investigation with the courier partner.</p>
          <p>We are not responsible for delays caused by incorrect address information provided at checkout.</p>
        </div>

        <div className="legal-section">
          <h2>7. International Shipping</h2>
          <p>We currently Do Not offer international shipping.</p>
        </div>

        <div className="legal-section">
          <h2>8. Failed Delivery Attempts</h2>
          <p>If delivery fails due to:</p>
          <ul>
            <li>Incorrect address</li>
            <li>Recipient unavailable</li>
            <li>Refusal to accept delivery</li>
          </ul>
          <p>The order may be returned to us. In such cases:</p>
          <ul>
            <li>Re-shipping charges may apply.</li>
            <li>Refunds (if applicable) may exclude shipping costs.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>9. Non-Returnable Food Products</h2>
          <p>All food products sold on Swadyum are non-returnable once delivered due to hygiene and food-safety reasons.</p>
          <ul>
            <li>We do not accept change-of-mind returns.</li>
            <li>We do not accept returns of opened or used jars.</li>
            <li>If your order arrives damaged, leaking, or incorrect, contact us within 24 hours with photos and order details.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>10. Damaged Packages</h2>
          <p>If your order arrives visibly damaged:</p>
          <ul>
            <li>Please refuse delivery if possible, or</li>
            <li>Take clear photos of the package and contents</li>
            <li>Contact us within 24 hours at <strong>Swadyum@gmail.com</strong></li>
          </ul>
          <p>We will review the issue and provide appropriate assistance.</p>
        </div>

      </div>
    </div>
  );
}

export default ShippingPolicyPage;
