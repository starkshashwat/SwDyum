import React from 'react';
import './LegalPages.css';

function PrivacyPolicyPage({ onNavigate }) {
  return (
    <div className="legal-page-wrapper">
      <div className="legal-container">
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-effective">Effective Date: 2026</p>
        
        <p className="legal-intro">
          At Swadyum, we value your trust and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and safeguard your data when you visit or make a purchase from our website.<br/><br/>
          By using our website, you agree to the terms outlined in this Privacy Policy.
        </p>

        <div className="legal-section">
          <h2>1. Information We Collect</h2>
          <p>When you interact with our website, we may collect the following types of information:</p>
          
          <h3>a) Personal Information</h3>
          <ul>
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Billing and shipping address</li>
            <li>Payment details (processed securely through third-party payment gateways)</li>
            <li>Order history</li>
          </ul>

          <h3>b) Non-Personal Information</h3>
          <ul>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Pages visited and browsing behavior</li>
            <li>Referring website</li>
          </ul>

          <h3>c) Transaction Information</h3>
          <ul>
            <li>Products purchased</li>
            <li>Order value</li>
            <li>Payment method</li>
            <li>Delivery details</li>
          </ul>

          <p><strong>We collect this information when you:</strong></p>
          <ul>
            <li>Place an order</li>
            <li>Create an account</li>
            <li>Subscribe to newsletters</li>
            <li>Contact customer support</li>
            <li>Browse our website</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use your information for legitimate business purposes, including:</p>
          <ul>
            <li>Processing and fulfilling orders</li>
            <li>Providing customer support</li>
            <li>Sending order confirmations and updates</li>
            <li>Improving website functionality and user experience</li>
            <li>Preventing fraud and unauthorized transactions</li>
            <li>Sending promotional emails or offers (only if you opt in)</li>
            <li>Complying with legal and regulatory obligations</li>
          </ul>
          <p><strong>We do not sell or rent your personal information to third parties.</strong></p>
        </div>

        <div className="legal-section">
          <h2>3. Cookies and Tracking Technologies</h2>
          <p>Our website uses cookies and similar tracking technologies to enhance your browsing experience.</p>
          <p><strong>Cookies help us:</strong></p>
          <ul>
            <li>Remember your preferences</li>
            <li>Keep items in your cart</li>
            <li>Analyze website traffic</li>
            <li>Improve website performance</li>
            <li>Provide relevant advertisements</li>
          </ul>
          <p>You can disable cookies through your browser settings. However, doing so may limit certain website functionalities.</p>
        </div>

        <div className="legal-section">
          <h2>4. Third-Party Services</h2>
          <p>We may use trusted third-party services to operate our business efficiently, including:</p>
          <ul>
            <li>Payment gateways</li>
            <li>Shipping and logistics partners</li>
            <li>Analytics providers (such as Google Analytics)</li>
            <li>Marketing and email service providers</li>
            <li>E-commerce platform providers</li>
          </ul>
          <p>These third parties only receive information necessary to perform their services and are obligated to maintain confidentiality and security.</p>
          <p>Please note that third-party services may have their own privacy policies, and we recommend reviewing them.</p>
        </div>

        <div className="legal-section">
          <h2>5. Data Security</h2>
          <p>We implement reasonable administrative, technical, and physical safeguards to protect your personal information from:</p>
          <ul>
            <li>Unauthorized access</li>
            <li>Alteration</li>
            <li>Disclosure</li>
            <li>Misuse</li>
          </ul>
          <p>All payment transactions are processed through secure and encrypted gateways. While we strive to protect your data, no method of transmission over the internet is 100% secure. Therefore, we cannot guarantee absolute security.</p>
        </div>

        <div className="legal-section">
          <h2>6. Data Retention</h2>
          <p>We retain your information only as long as necessary to:</p>
          <ul>
            <li>Fulfill your orders</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce our agreements</li>
          </ul>
          <p>Once no longer required, your data is securely deleted or anonymized.</p>
        </div>

        <div className="legal-section">
          <h2>7. Customer Rights</h2>
          <p>Under applicable Indian laws, including the Information Technology Act, 2000 and related rules, you have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your personal data (subject to legal requirements)</li>
            <li>Withdraw consent for marketing communications</li>
            <li>Raise concerns regarding misuse of your data</li>
          </ul>
          <p>To exercise these rights, contact us using the details below.</p>
        </div>

        <div className="legal-section">
          <h2>8. Children’s Privacy</h2>
          <p>Our website is not intended for individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that such data has been collected, we will take appropriate steps to delete it.</p>
        </div>

        <div className="legal-section">
          <h2>9. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy periodically to reflect changes in business practices, legal requirements, or operational updates. Any changes will be posted on this page with a revised effective date.</p>
        </div>

        <div className="legal-section contact-section">
          <h2>10. Contact Information</h2>
          <p>If you have any questions, concerns, or requests regarding this Privacy Policy, you may contact us at:</p>
          <p>
            <strong>Business Name:</strong> Swadyum<br/>
            <strong>Email:</strong> Swadyum@gmail.com<br/>
            <strong>Registered Address:</strong> Arrah bhojpur, Bihar
          </p>
        </div>

      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
