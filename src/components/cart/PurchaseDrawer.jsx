import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import usePurchaseState from './hooks/usePurchaseState';
import usePinVerification from './hooks/usePinVerification';
import useAddresses from './hooks/useAddresses';
import useCouponValidation from './hooks/useCouponValidation';
import useFbtRecommendations from './hooks/useFbtRecommendations';
import useRazorpayCheckout from './hooks/useRazorpayCheckout';
import FreeShippingBar from './modules/FreeShippingBar';
import CartItems from './modules/CartItems';
import AddressSection from './modules/AddressSection';
import CouponSection from './modules/CouponSection';
import OrderSummary from './modules/OrderSummary';
import FrequentlyBoughtTogether from './modules/FrequentlyBoughtTogether';
import SmartCheckoutAssistant from './modules/SmartCheckoutAssistant';
import CheckoutFooter from './modules/CheckoutFooter';
import RazorpayTransition from './modules/RazorpayTransition';
import './PurchaseDrawer.css';

const FREE_SHIPPING_THRESHOLD = 799;

const drawerTransition = { type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.32 };

export default function PurchaseDrawer({
    isOpen,
    onClose,
    cart,
    updateCartQty,
    removeFromCart,
    addToCart,
    onNavigate,
    currentUser,
    clearCart,
    onOpenLogin,
}) {
    // ─── State Machine ───
    const purchaseState = usePurchaseState();

    // ─── PIN Verification ───
    const pinVerification = usePinVerification();

    // ─── Addresses ───
    const {
        addresses,
        loading: addressesLoading,
        selectedAddress,
        selectAddress,
        saveNewAddress,
    } = useAddresses(currentUser);

    // ─── Coupon ───
    const {
        appliedCoupon,
        isApplying: couponApplying,
        error: couponError,
        applyCoupon,
        removeCoupon,
        calculateDiscount,
    } = useCouponValidation();

    // ─── FBT ───
    const { products: fbtProducts, loading: fbtLoading } = useFbtRecommendations(cart);

    // ─── Razorpay ───
    const razorpay = useRazorpayCheckout({
        currentUser,
        clearCart,
        onClose,
        onNavigate,
    });

    // ─── Computed Values ───
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : subtotal > 0 ? 50 : 0;
    const discount = calculateDiscount(subtotal);
    const total = Math.max(0, subtotal - discount + shipping);

    // ─── Mobile drag state ───
    const [dragState, setDragState] = useState('closed'); // closed | half | full
    const dragConstraintsRef = useRef(null);

    // ─── Reset when drawer closes ───
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                purchaseState.reset();
                pinVerification.reset();
                razorpay.reset();
                setDragState('closed');
            }, 350);
        } else {
            setDragState('full');
        }
    }, [isOpen]);

    // ─── Body scroll lock ───
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            const handlePopState = () => onClose();
            window.history.pushState({ drawerOpen: true }, '');
            window.addEventListener('popstate', handlePopState);
            return () => {
                document.body.style.overflow = 'unset';
                window.removeEventListener('popstate', handlePopState);
                if (window.history.state?.drawerOpen) window.history.back();
            };
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    // ─── PIN verification handler ───
    const handleVerifyPin = useCallback(
        (pin) => {
            purchaseState.transition('checking_pin');
            pinVerification.verifyPin(pin).then(() => {
                if (pinVerification.status === 'deliverable') {
                    purchaseState.transition('pin_valid');
                } else if (pinVerification.status === 'not_deliverable') {
                    purchaseState.transition('pin_invalid');
                }
            });
        },
        [pinVerification, purchaseState]
    );

    // ─── Coupon handlers ───
    const handleApplyCoupon = useCallback(
        (code) => {
            purchaseState.transition('applying_coupon');
            applyCoupon(code).then(() => {
                // State will be updated by the hook's internal state change
                purchaseState.transition('coupon_applied');
            });
        },
        [applyCoupon, purchaseState]
    );

    const handleRemoveCoupon = useCallback(() => {
        removeCoupon();
        purchaseState.transition('idle');
    }, [removeCoupon, purchaseState]);

    // ─── Checkout handler ───
    const handleSecureCheckout = useCallback(() => {
        if (!currentUser) {
            onClose();
            onOpenLogin();
            return;
        }

        // Build form data from selected address
        const formData = selectedAddress
            ? {
                name: selectedAddress.full_name,
                email: selectedAddress.email || currentUser.email || '',
                phone: selectedAddress.phone,
                address: [selectedAddress.house_number, selectedAddress.street, selectedAddress.area]
                    .filter(Boolean)
                    .join(', '),
                city: selectedAddress.city,
                state: selectedAddress.state,
                zip: selectedAddress.pin_code,
            }
            : {
                name: currentUser.name || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                address: currentUser.address || '',
                city: currentUser.city || '',
                state: currentUser.state || '',
                zip: currentUser.zip || '',
            };

        // 700ms Razorpay transition
        purchaseState.transition('processing', { message: 'Preparing Secure Payment...' });

        setTimeout(() => {
            razorpay.initiateCheckout({
                formData,
                subtotal,
                shipping,
                discountAmount: discount,
                total,
                appliedCoupon,
                cart,
            });
        }, 700);
    }, [
        currentUser,
        selectedAddress,
        subtotal,
        shipping,
        discount,
        total,
        appliedCoupon,
        cart,
        purchaseState,
        razorpay,
        onClose,
        onOpenLogin,
    ]);

    // ─── FBT add handler ───
    const handleFbtAdd = useCallback(
        (product, weight, qty, subscription) => {
            addToCart(product, weight, qty, subscription, false);
        },
        [addToCart]
    );

    // ─── Mobile drag handlers ───
    const handleDragEnd = useCallback(
        (_event, info) => {
            const { offset, velocity } = info;
            const threshold = 100;

            if (offset.y > threshold || velocity.y > 500) {
                if (dragState === 'half') {
                    onClose();
                    setDragState('closed');
                } else if (dragState === 'full') {
                    setDragState('half');
                }
            } else if (offset.y < -threshold || velocity.y < -500) {
                if (dragState === 'half') {
                    setDragState('full');
                }
            }
        },
        [dragState, onClose]
    );

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="purchase-drawer-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.55 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        className={`purchase-drawer ${isMobile ? 'mobile' : ''} ${dragState === 'half' ? 'half-open' : ''}`}
                        initial={isMobile ? { y: '100%', opacity: 1 } : { x: 40, opacity: 0 }}
                        animate={
                            isMobile
                                ? dragState === 'half'
                                    ? { y: '50%', opacity: 1 }
                                    : { y: 0, opacity: 1 }
                                : { x: 0, opacity: 1 }
                        }
                        exit={isMobile ? { y: '100%', opacity: 1 } : { x: '100%', opacity: 0 }}
                        transition={drawerTransition}
                        drag={isMobile ? 'y' : false}
                        dragConstraints={dragConstraintsRef}
                        dragElastic={0.1}
                        onDragEnd={handleDragEnd}
                        ref={dragConstraintsRef}
                    >
                        {/* Mobile drag handle */}
                        {isMobile && (
                            <div className="purchase-drawer-drag-handle">
                                <div className="drag-pill" />
                            </div>
                        )}

                        {/* ─── HEADER ─── */}
                        <div className="purchase-drawer-header">
                            <button className="purchase-header-back" onClick={onClose} type="button">
                                ← Continue Shopping
                            </button>
                            <h2 className="purchase-header-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                                Your Cart ({totalItems})
                            </h2>
                            <button className="purchase-header-close" onClick={onClose} type="button">
                                ✕
                            </button>
                        </div>
                        {/* Floating Promo Banner */}
                        <div className="floating-promo-banner">
                            <span>Use code <strong>WELCOME10</strong> for 10% OFF!</span>
                        </div>

                        {/* ─── SCROLLABLE CONTENT ─── */}
                        <div className="purchase-drawer-content">
                            {/* Free Shipping Progress Bar */}
                            {cart.length > 0 && <FreeShippingBar subtotal={subtotal} />}

                            {/* Cart Items */}
                            <CartItems
                                cart={cart}
                                updateCartQty={updateCartQty}
                                removeFromCart={removeFromCart}
                            />

                            {/* Address Section */}
                            {cart.length > 0 && (
                                <AddressSection
                                    currentUser={currentUser}
                                    addresses={addresses}
                                    loading={addressesLoading}
                                    selectedAddress={selectedAddress}
                                    onSelectAddress={selectAddress}
                                    onSaveNewAddress={saveNewAddress}
                                    pinCode={pinVerification.pinCode}
                                />
                            )}

                            {/* Frequently Bought Together */}
                            {cart.length > 0 && (
                                <FrequentlyBoughtTogether
                                    products={fbtProducts}
                                    loading={fbtLoading}
                                    onAddToCart={handleFbtAdd}
                                />
                            )}

                            {/* Coupon Section */}
                            {cart.length > 0 && (
                                <CouponSection
                                    appliedCoupon={appliedCoupon}
                                    isApplying={couponApplying}
                                    error={couponError}
                                    onApply={handleApplyCoupon}
                                    onRemove={handleRemoveCoupon}
                                    discount={discount}
                                />
                            )}

                            {/* Order Summary */}
                            {cart.length > 0 && (
                                <OrderSummary
                                    cart={cart}
                                    subtotal={subtotal}
                                    shipping={shipping}
                                    discount={discount}
                                    total={total}
                                    appliedCoupon={appliedCoupon}
                                />
                            )}

                            {/* Smart Checkout Assistant */}
                            {cart.length > 0 && (
                                <SmartCheckoutAssistant
                                    subtotal={subtotal}
                                    cart={cart}
                                    appliedCoupon={appliedCoupon}
                                />
                            )}

                            {/* Extra padding at bottom so content doesn't hide behind sticky footer */}
                            <div className="purchase-drawer-bottom-spacer" />
                        </div>

                        {/* ─── STICKY FOOTER ─── */}
                        {cart.length > 0 && (
                            <CheckoutFooter
                                subtotal={subtotal}
                                shipping={shipping}
                                discount={discount}
                                total={total}
                                appliedCoupon={appliedCoupon}
                                isProcessing={purchaseState.isProcessing || razorpay.isProcessing}
                                processingMessage={purchaseState.processingMessage || razorpay.processingStep}
                                onCheckout={handleSecureCheckout}
                            />
                        )}

                        {/* ─── Razorpay Transition Overlay ─── */}
                        <RazorpayTransition isActive={purchaseState.isProcessing} />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}