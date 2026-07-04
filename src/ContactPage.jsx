import React, { useState } from 'react';
import './ContactPage.css';

function ContactPage({ onNavigate }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  const toggleFaq = (index) => {
    setActiveFaq(prev => (prev === index ? null : index));
  };

  const faqs = [
    {
      q: "What is the shelf life of Swadyum pickles?",
      a: "Our pickles have a natural shelf life of 12 to 18 months because they are sun-cured and preserved naturally with cold-pressed mustard oil and salt. Always use a clean, dry spoon to avoid contamination."
    },
    {
      q: "Do you use chemical preservatives or artificial colors?",
      a: "No. We have a strict zero-chemical promise. We do not use vinegar, chemical stabilizers, or synthetic colors. The vibrant colors come entirely from local chillies, turmeric, and solar maturation."
    },
    {
      q: "Are the pickles stored in plastic jars?",
      a: "Absolutely not. All Swadyum pickles are matured in traditional earthen jars (martabans) and shipped in premium, heavy-duty glass jars to retain flavor purity and ensure chemical-free storage."
    },
    {
      q: "How long does shipping take?",
      a: "We ship PAN-India. Standard delivery takes 3 to 5 business days for metro cities and 5 to 7 days for regional districts."
    },
    {
      q: "Do you offer corporate or wedding gifting chests?",
      a: "Yes! We specialize in custom festive chests, wedding tokens, and corporate gifts styled with Madhubani motifs. Contact us at support@swadyum.com or via WhatsApp to explore options."
    }
  ];

  return (
    <div className="contact-page-wrapper">
      
      {/* 1. HERO BANNER */}
      <section className="contact-hero-section" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.65)), url('/about_us.png')` }}>
        <div className="contact-hero-container">
          <span className="contact-hero-subtitle">~ Get In Touch ~</span>
          <h1 className="contact-hero-title">Contact Swadyum</h1>
          <p className="contact-hero-desc">Have questions about our traditional recipes, order deliveries, or corporate gifting? We are here to help.</p>
        </div>
      </section>

      {/* 2. MAIN LAYOUT: CONTACT DETAILS & FORM */}
      <section className="contact-main-section">
        <div className="contact-container">
          <div className="contact-grid-split">
            
            {/* Left Column: Contact info */}
            <div className="contact-info-column">
              <span className="section-subtitle">~ Connect ~</span>
              <h2 className="section-headline">Reach Our Kitchens</h2>
              <p className="contact-intro-text">Our packaging boutique is located in Patna, Bihar. Connect instantly on WhatsApp or drop us a line below.</p>
              
              {/* WhatsApp-First CTA — Primary Contact Method */}
              <div className="whatsapp-box">
                <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="contact-whatsapp-btn">
                  <span className="wa-icon">💬</span> Chat instantly on WhatsApp
                </a>
              </div>

              <div className="contact-cards-list">
                
                <div className="info-card">
                  <div className="ic-icon">📞</div>
                  <div className="ic-content">
                    <h4>Phone Number</h4>
                    <p>+91 98765 43210</p>
                    <p>+91 612 234567</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="ic-icon">✉️</div>
                  <div className="ic-content">
                    <h4>Email Address</h4>
                    <p>support@swadyum.com</p>
                    <p>orders@swadyum.com</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="ic-icon">📍</div>
                  <div className="ic-content">
                    <h4>Office Address</h4>
                    <p>Swadyum Foods Private Limited</p>
                    <p>402, Heritage Plaza, Fraser Road,</p>
                    <p>Patna, Bihar - 800001</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="ic-icon">🕒</div>
                  <div className="ic-content">
                    <h4>Business Hours</h4>
                    <p>Monday - Saturday: 09:00 AM - 06:00 PM IST</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: Contact Form */}
            <div className="contact-form-column">
              <div className="contact-form-card">
                <h3 className="form-heading">Send a Message</h3>
                
                {submitted ? (
                  <div className="contact-submit-success">
                    <span className="success-checkmark">✓</span>
                    <h3>Thank you!</h3>
                    <p>Your message has been received. Our team will get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="contact-inquiry-form">
                    <div className="form-group">
                      <label htmlFor="name">Your Name *</label>
                      <input 
                        type="text" 
                        id="name"
                        name="name" 
                        value={form.name}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                        placeholder="E.g. Siddharth Raj"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input 
                        type="email" 
                        id="email"
                        name="email" 
                        value={form.email}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                        placeholder="E.g. siddharth@gmail.com"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="subject">Subject</label>
                      <input 
                        type="text" 
                        id="subject"
                        name="subject" 
                        value={form.subject}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="E.g. Bulk gifting order inquiry"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">Message *</label>
                      <textarea 
                        id="message"
                        name="message" 
                        rows="6"
                        value={form.message}
                        onChange={handleInputChange}
                        required
                        className="form-control textarea"
                        placeholder="How can we help you?"
                      ></textarea>
                    </div>

                    <button type="submit" className="contact-submit-btn">Send Message</button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FAQ ACCORDION SECTION */}
      <section className="contact-faq-section">
        <div className="faq-container">
          <div className="section-header-centered">
            <span className="section-subtitle">~ FAQ ~</span>
            <h2 className="section-headline">Frequently Asked Questions</h2>
          </div>

          <div className="faq-accordion-list">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={`faq-accordion-item ${activeFaq === idx ? 'active' : ''}`}
                onClick={() => toggleFaq(idx)}
              >
                <div className="faq-question-bar">
                  <h3>{faq.q}</h3>
                  <span className="faq-toggle-arrow">▼</span>
                </div>
                <div className="faq-answer-panel">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. GOOGLE MAPS EMBED CONTAINER */}
      <section className="contact-map-section">
        <div className="map-container">
          <div className="map-frame">
            {/* Stylized placeholder for Google Maps */}
            <div className="map-placeholder-bg">
              <div className="map-marker-glow"></div>
              <div className="map-overlay-details">
                <span className="mod-logo">🏺</span>
                <h3>Swadyum Head Office</h3>
                <p>Patna, Fraser Road, Bihar</p>
                <span className="mod-coordinates">25.6112° N, 85.1384° E</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default ContactPage;
