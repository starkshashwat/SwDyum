import React from 'react';
import './LegalPages.css';

function ReturnPolicyPage({ onNavigate }) {
  return (
    <div className="legal-page-wrapper">
      <div className="legal-container">
        <h1 className="legal-title">Return & Refund Policy</h1>
        <p className="legal-effective">Effective Date: Jan 2026</p>
        
        <p className="legal-intro">
          At Swadyum, customer satisfaction is important to us. If you are not fully satisfied with your purchase, please review the policy below to understand your return and refund options.
        </p>

        <div className="legal-section">
          <h2>1. Return Eligibility Criteria</h2>
          <p>To be eligible for a return:</p>
          <ul>
            <li>The return request must be made within 5 DAYS from the date of delivery.</li>
            <li>The product must be unused, unopened, and in its original packaging.</li>
            <li>The item must be in the same condition as received.</li>
            <li>Proof of purchase (order number or invoice) must be provided.</li>
          </ul>
          <p>We reserve the right to reject returns that do not meet the above conditions.</p>
        </div>

        <div className="legal-section">
          <h2>2. Non-Returnable Items</h2>
          <p>The following items are not eligible for return:</p>
          <ul>
            <li>Opened or used products</li>
            <li>Items damaged due to misuse or improper handling</li>
            <li>Perishable goods (if applicable)</li>
            <li>Products marked as “Non-Returnable” at the time of purchase</li>
            <li>Gift cards or promotional items</li>
          </ul>
          <p>These restrictions are in place to ensure hygiene, safety, and product integrity.</p>
        </div>

        <div className="legal-section">
          <h2>3. Return Process</h2>
          <p>To initiate a return:</p>
          <ul>
            <li>Email us at <strong>Swadyum@gmail.com</strong> with:</li>
            <ul>
              <li>Your order number</li>
              <li>Product name</li>
              <li>Reason for return</li>
              <li>Clear photos (if applicable)</li>
            </ul>
            <li>Once approved, we will provide return instructions.</li>
            <li>Returns sent without prior approval may not be accepted.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>4. Return Shipping Costs</h2>
          <ul>
            <li>If the return is due to a defective, damaged, or incorrect product received, we will bear the return shipping cost.</li>
            <li>If the return is due to personal preference or change of mind, return shipping costs may be borne by the customer.</li>
            <li>Shipping charges paid at the time of order are non-refundable unless the return is due to our error.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>5. Refund Process</h2>
          <p>Once we receive and inspect the returned item:</p>
          <ul>
            <li>You will be notified of approval or rejection.</li>
            <li>If approved, the refund will be processed to the original payment method within 4-5 working days.</li>
            <li>Processing time may vary depending on your bank or payment provider.</li>
            <li>Refunds will include only the product price unless otherwise stated.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>6. Exchanges</h2>
          <p>We offer exchanges under the following conditions:</p>
          <ul>
            <li>The product received is damaged or defective.</li>
            <li>The wrong item was delivered.</li>
          </ul>
          <p>If you wish to request an exchange, please contact us at <strong>Swadyum@gmail.com</strong> within 5 Days of delivery.</p>
          <p>Exchanges are subject to product availability.</p>
        </div>

        <div className="legal-section">
          <h2>7. Damaged or Defective Products</h2>
          <p>If you receive a damaged, defective, or incorrect item:</p>
          <ul>
            <li>Notify us within 24–48 hours of delivery.</li>
            <li>Provide clear photos and order details via email.</li>
            <li>Do not use the product.</li>
          </ul>
          <p>After verification, we will offer a replacement, exchange, or refund as appropriate.</p>
        </div>

        <div className="legal-section">
          <h2>8. Late or Missing Refunds</h2>
          <p>If you have not received your refund within the expected timeframe:</p>
          <ul>
            <li>Check your bank account.</li>
            <li>Contact your payment provider.</li>
            <li>If the issue persists, contact us at <strong>Swadyum@gmail.com</strong> for assistance.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>9. Cancellation Policy</h2>
          <p>Orders may be cancelled before dispatch. Once shipped, cancellations are not permitted and the standard return process must be followed.</p>
        </div>

        <div className="legal-section contact-section">
          <p>We aim to make the return process simple, transparent, and fair. If you have any questions regarding this policy, please contact us at:</p>
          <p><strong>Email:</strong> Swadyum@gmail.com</p>
        </div>

      </div>
    </div>
  );
}

export default ReturnPolicyPage;
