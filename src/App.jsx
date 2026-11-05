import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { useCart } from './context/CartContext';
import { Check, MessageCircle, ShoppingBag, Loader2 } from 'lucide-react';
import { openWhatsApp, createGeneralEnquiryMessage } from './utils/whatsapp';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PageLoader() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        color: 'var(--color-aqua-400)'
      }}
    >
      <Loader2 size={36} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading Binu’s Aquatic...</span>
    </div>
  );
}

export default function App() {
  const {
    lastAddedItem,
    totalItems,
    subtotal,
    openCart,
    isMinOrderReached,
    amountRemaining,
    MIN_ORDER_VALUE
  } = useCart();

  return (
    <div className="site-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <div style={{ flexGrow: 1 }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>

      <Footer />
      <CartDrawer />

      {/* Item Added Toast Notification */}
      {lastAddedItem && (
        <div className="toast-notification" role="status" aria-live="polite">
          <Check size={18} color="var(--color-emerald-400)" />
          <span>Added "<strong>{lastAddedItem}</strong>" to cart</span>
        </div>
      )}

      {/* Mobile Sticky Cart Bar when items are present */}
      {totalItems > 0 && (
        <div
          className="mobile-sticky-cart-bar"
          role="region"
          aria-label="Cart Summary Bar"
        >
          <div className="mobile-cart-bar-info">
            <span className="mobile-cart-bar-items">{totalItems} {totalItems === 1 ? 'item' : 'items'} • ₹{subtotal.toLocaleString('en-IN')}</span>
            <span className="mobile-cart-bar-threshold">
              {isMinOrderReached ? (
                <span style={{ color: 'var(--color-emerald-400)', fontWeight: 600 }}>✓ Min order reached</span>
              ) : (
                <span>Add ₹{amountRemaining.toLocaleString('en-IN')} for ₹{MIN_ORDER_VALUE.toLocaleString('en-IN')} min</span>
              )}
            </span>
          </div>
          <button
            onClick={openCart}
            className="mobile-cart-bar-btn"
            aria-label="View shopping cart"
          >
            <ShoppingBag size={18} />
            <span>View Cart</span>
          </button>
        </div>
      )}

      {/* Floating Quick WhatsApp Action */}
      <button
        onClick={() => openWhatsApp(createGeneralEnquiryMessage('Floating WhatsApp Button Enquiry'))}
        className="floating-whatsapp-btn"
        aria-label="Direct WhatsApp Chat with Binu’s Aquatic"
        title="Chat on WhatsApp"
        style={{
          bottom: totalItems > 0 ? 'calc(5.2rem + env(safe-area-inset-bottom, 0px))' : 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))',
          left: 'max(1rem, env(safe-area-inset-left, 1rem))'
        }}
      >
        <MessageCircle size={20} />
        <span className="floating-text">Chat on WhatsApp</span>
      </button>
    </div>
  );
}
