import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AddressSection.css';

const sheetVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

const cardFlipVariants = {
    rest: { rotateY: 0 },
    tap: { rotateY: 5, transition: { duration: 0.15 } },
};

export default function AddressSection({
    currentUser,
    addresses,
    loading,
    selectedAddress,
    onSelectAddress,
    onSaveNewAddress,
    pinCode,
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showNewForm, setShowNewForm] = useState(false);
    const [formData, setFormData] = useState({
        label: 'Home',
        full_name: currentUser?.name || '',
        phone: currentUser?.phone || '',
        email: currentUser?.email || '',
        house_number: '',
        street: '',
        area: '',
        city: '',
        state: '',
        pin_code: pinCode || '',
        is_default: addresses.length === 0,
    });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const handleFormChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFormError('');
    };

    const handleSaveNew = async (e) => {
        e.preventDefault();
        if (!formData.full_name || !formData.phone || !formData.street || !formData.city || !formData.state || !formData.pin_code) {
            setFormError('Please fill all required fields');
            return;
        }
        setSaving(true);
        const result = await onSaveNewAddress(formData);
        setSaving(false);
        if (result) {
            setShowNewForm(false);
        } else {
            setFormError('Failed to save address. Please try again.');
        }
    };

    const summaryText = selectedAddress
        ? `${selectedAddress.full_name}, ${selectedAddress.city} ${selectedAddress.pin_code}`
        : 'Add delivery address';

    return (
        <div className="address-section">
            {/* Collapsed summary */}
            <button
                className="address-toggle"
                onClick={() => setIsExpanded(!isExpanded)}
                type="button"
            >
                <div className="address-toggle-left">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="address-toggle-label">Shipping to:</span>
                    <span className="address-toggle-summary">{summaryText}</span>
                </div>
                <span className={`addr-chevron ${isExpanded ? 'open' : ''}`}>▼</span>
            </button>

            {/* Expanded address sheet */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className="address-sheet"
                        variants={sheetVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                    >
                        {loading ? (
                            <p className="address-loading">Loading saved addresses...</p>
                        ) : (
                            <>
                                {/* Saved addresses */}
                                {addresses.length > 0 && !showNewForm && (
                                    <div className="address-saved-list">
                                        <p className="address-list-label">Saved Addresses</p>
                                        {addresses.map((addr) => {
                                            const isSelected = selectedAddress && selectedAddress.id === addr.id;
                                            return (
                                                <motion.button
                                                    key={addr.id}
                                                    className={`address-card ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => onSelectAddress(addr)}
                                                    variants={cardFlipVariants}
                                                    whileTap="tap"
                                                    type="button"
                                                >
                                                    <div className="address-card-top">
                                                        <span className="address-card-name">{addr.full_name}</span>
                                                        <span className="address-card-label">{addr.label}</span>
                                                        {addr.is_default && (
                                                            <span className="address-card-default">Default</span>
                                                        )}
                                                    </div>
                                                    <p className="address-card-detail">
                                                        {[addr.house_number, addr.street, addr.area].filter(Boolean).join(', ')}
                                                    </p>
                                                    <p className="address-card-detail">
                                                        {addr.city}, {addr.state} {addr.pin_code}
                                                    </p>
                                                    <p className="address-card-phone">📞 {addr.phone}</p>
                                                    {isSelected && (
                                                        <div className="address-card-check">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* New address form */}
                                {showNewForm ? (
                                    <motion.form
                                        className="address-new-form"
                                        onSubmit={handleSaveNew}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <h4 className="address-form-title">New Address</h4>
                                        {formError && <p className="address-form-error">{formError}</p>}

                                        <div className="addr-form-row split">
                                            <div className="addr-field">
                                                <label>Full Name *</label>
                                                <input
                                                    type="text"
                                                    value={formData.full_name}
                                                    onChange={(e) => handleFormChange('full_name', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="addr-field">
                                                <label>Phone *</label>
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => handleFormChange('phone', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="addr-field">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleFormChange('email', e.target.value)}
                                            />
                                        </div>

                                        <div className="addr-form-row split">
                                            <div className="addr-field">
                                                <label>House/Flat No.</label>
                                                <input
                                                    type="text"
                                                    value={formData.house_number}
                                                    onChange={(e) => handleFormChange('house_number', e.target.value)}
                                                />
                                            </div>
                                            <div className="addr-field">
                                                <label>Street/Area *</label>
                                                <input
                                                    type="text"
                                                    value={formData.street}
                                                    onChange={(e) => handleFormChange('street', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="addr-form-row split">
                                            <div className="addr-field">
                                                <label>City *</label>
                                                <input
                                                    type="text"
                                                    value={formData.city}
                                                    onChange={(e) => handleFormChange('city', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="addr-field">
                                                <label>State *</label>
                                                <input
                                                    type="text"
                                                    value={formData.state}
                                                    onChange={(e) => handleFormChange('state', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="addr-field">
                                            <label>PIN Code *</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                value={formData.pin_code}
                                                onChange={(e) => handleFormChange('pin_code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                required
                                                placeholder="6-digit PIN"
                                            />
                                        </div>

                                        <div className="addr-form-actions">
                                            <button type="submit" className="addr-save-btn" disabled={saving}>
                                                {saving ? 'Saving...' : 'Save & Select'}
                                            </button>
                                            <button
                                                type="button"
                                                className="addr-cancel-btn"
                                                onClick={() => setShowNewForm(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </motion.form>
                                ) : (
                                    <button
                                        className="address-add-new-btn"
                                        onClick={() => setShowNewForm(true)}
                                        type="button"
                                    >
                                        + Add New Address
                                    </button>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}