import React from 'react';
import './LegalPages.css';

function TermsPage({ onNavigate }) {
  return (
    <div className="legal-page-wrapper">
      <div className="legal-container">
        <h1 className="legal-title">Terms of Service</h1>
        <p className="legal-effective">Effective Date: Jan 2026</p>
        
        <p className="legal-intro">
          Welcome to Swadyum. These Terms of Service (“Terms”) govern your access to and use of our website and services. By accessing, browsing, or purchasing from our website, you agree to be bound by these Terms.<br/><br/>
          If you do not agree with any part of these Terms, you must not use our website.
        </p>

        <div className="legal-section">
          <h2>1. Account Terms</h2>
          <p>To access certain features of our website, you may be required to create an account.</p>
          <p>By creating an account, you agree that:</p>
          <ul>
            <li>You will provide accurate, complete, and current information.</li>
            <li>You are at least 18 years of age or using the website under parental supervision.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You accept responsibility for all activities that occur under your account.</li>
          </ul>
          <p>We reserve the right to suspend or terminate accounts that provide false information or violate these Terms.</p>
        </div>

        <div className="legal-section">
          <h2>2. Pricing and Payment</h2>
          <ul>
            <li>All prices listed on the website are in Indian Rupees (INR) unless otherwise specified.</li>
            <li>Prices are subject to change without prior notice.</li>
            <li>We reserve the right to modify or discontinue products at any time.</li>
            <li>Applicable taxes and shipping charges may be added at checkout.</li>
            <li>Payments must be made through approved payment methods available on the website.</li>
            <li>Payment information is processed securely through third-party payment gateways.</li>
            <li>We are not responsible for payment failures caused by banking institutions or third-party payment processors.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>3. Product Descriptions</h2>
          <p>We strive to ensure that product descriptions, images, and pricing are accurate and up to date. However:</p>
          <ul>
            <li>Minor variations in color, texture, or packaging may occur.</li>
            <li>We do not warrant that product descriptions or other content are error-free.</li>
            <li>In the event of an error, we reserve the right to correct it and cancel affected orders.</li>
            <li>All products are subject to availability.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>4. Order Acceptance and Cancellation</h2>
          <p>Placing an order does not constitute automatic acceptance. We reserve the right to:</p>
          <ul>
            <li>Refuse or cancel any order at our discretion.</li>
            <li>Limit quantities purchased per person or per order.</li>
            <li>Cancel orders due to pricing errors, stock unavailability, or suspected fraudulent activity.</li>
          </ul>
          <p>If we cancel an order after payment has been processed, a refund will be issued through the original payment method within 3-4 business days.</p>
        </div>

        <div className="legal-section">
          <h2>5. Shipping and Delivery</h2>
          <ul>
            <li>We aim to process and dispatch orders within the timelines mentioned on our website.</li>
            <li>Delivery timelines are estimates and may vary based on location and logistics factors.</li>
            <li>Delays caused by courier partners, natural events, or unforeseen circumstances are beyond our control.</li>
            <li>Risk of loss and title for products pass to you upon delivery.</li>
            <li>Please ensure accurate shipping details at the time of placing your order. We are not responsible for delivery failures due to incorrect information provided by the customer.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>6. Food Product Policy</h2>
          <ul>
            <li>All Swadyum products sold on this website are food items and are non-returnable once delivered.</li>
            <li>We do not accept returns, change-of-mind exchanges, or opened-product refund requests.</li>
            <li>If you receive a damaged, leaking, defective, or incorrect order, contact us within 24 hours of delivery with clear photos and your order details.</li>
            <li>After review, we may offer a replacement, store credit, or refund at our sole discretion where the issue is verified.</li>
            <li>Orders may be cancelled only before dispatch.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>7. Prohibited Uses</h2>
          <p>You agree not to use our website:</p>
          <ul>
            <li>For unlawful purposes.</li>
            <li>To violate any applicable Indian laws or regulations.</li>
            <li>To transmit viruses or malicious code.</li>
            <li>To infringe upon intellectual property rights.</li>
            <li>To engage in fraudulent activities.</li>
            <li>To harass, abuse, or harm others.</li>
          </ul>
          <p>Violation of these terms may result in termination of access and possible legal action.</p>
        </div>

        <div className="legal-section">
          <h2>8. Intellectual Property</h2>
          <p>All content on this website, including text, images, logos, graphics, and design elements, is the property of Swadyum and protected under applicable intellectual property laws.</p>
          <p>Unauthorized reproduction, distribution, or commercial use is strictly prohibited.</p>
        </div>

        <div className="legal-section">
          <h2>9. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law:</p>
          <ul>
            <li>Swadyum shall not be liable for indirect, incidental, special, or consequential damages.</li>
            <li>Our total liability for any claim arising out of your use of the website or products shall not exceed the amount paid by you for the product in question.</li>
            <li>We do not guarantee uninterrupted or error-free website access.</li>
            <li>Use of our website and products is at your own risk.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>10. Indemnification</h2>
          <p>You agree to indemnify and hold harmless Swadyum, its directors, employees, and affiliates from any claims, damages, losses, or legal expenses arising out of your violation of these Terms or misuse of the website.</p>
        </div>

        <div className="legal-section">
          <h2>11. Governing Law and Jurisdiction</h2>
          <p>These Terms shall be governed by and interpreted in accordance with the laws of India.</p>
          <p>Any disputes arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the courts located in India.</p>
        </div>

        <div className="legal-section">
          <h2>12. Changes to Terms</h2>
          <p>We reserve the right to update or modify these Terms at any time without prior notice. Continued use of the website following changes constitutes acceptance of the revised Terms.</p>
        </div>

        <div className="legal-section contact-section">
          <h2>13. Contact Information</h2>
          <p>If you have questions regarding these Terms of Service, please contact:</p>
          <p>
            <strong>Business Name:</strong> Swadyum<br/>
            <strong>Email:</strong> Swadyum@gmail.com
          </p>
        </div>

      </div>
    </div>
  );
}

export default TermsPage;
