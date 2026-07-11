import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './ContactPage.css';

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

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

  return (
    <div className="contact-page-wrapper">

      {/* ════════════════════════════════════════════
          SECTION 1: HERO BANNER
      ════════════════════════════════════════════ */}
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <div className="contact-hero-bg" style={{ backgroundImage: 'url(/about_us.webp)' }} />
          <div className="contact-hero-overlay" />
          <motion.div
            className="contact-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="contact-hero-title">Get In <em>Touch</em></h1>
            <p className="contact-hero-subtitle">
              Whether you have a question about our heritage recipes, bulk orders, or corporate gifting, our team in Ara is ready to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 2: CONTACT SPLIT (INFO + FORM)
      ════════════════════════════════════════════ */}
      <section className="contact-main">
        <div className="contact-main-container">

          <div className="contact-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
            >
              <span className="contact-eyebrow">Connect With Us</span>
              <h2 className="contact-heading">Reach Our Kitchens</h2>
              <p className="contact-desc">
                Our packaging boutique is located in Patna, Bihar. Connect instantly on WhatsApp for immediate support, or drop us a line using the form.
              </p>

              <div className="contact-methods">

                <div className="contact-method">
                  <div className="method-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  </div>
                  <div className="method-details">
                    <h4>WhatsApp Support</h4>
                    <p>+91 8340528122</p>
                    <a href="https://wa.me/918340528122" target="_blank" rel="noopener noreferrer" className="method-link">Chat Now &rarr;</a>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <div className="method-details">
                    <h4>Email Address</h4>
                    <p>swadyum@gmail.com</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <div className="method-details">
                    <h4>Office Address</h4>
                    <p>Swadyum Foods</p>
                    <p>Bahiro, Arrah</p>
                    <p>Bhojpur, Bihar - 802301</p>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>

          <div className="contact-right">
            <motion.div
              className="contact-form-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="form-heading">Send a Message</h3>

              {submitted ? (
                <div className="contact-success">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <h4>Thank you!</h4>
                  <p>Your message has been received. Our team will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-group">
                    <label htmlFor="name">Your Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      required
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
                      placeholder="E.g. Bulk gifting order inquiry"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      value={form.message}
                      onChange={handleInputChange}
                      required
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>

                  <button type="submit" className="contact-submit-btn">
                    Send Message
                  </button>
                </form>
              )}
            </motion.div>
          </div>

        </div>
      </section>

    </div>
  );
}

export default ContactPage;
