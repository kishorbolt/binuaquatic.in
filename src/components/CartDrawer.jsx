import React, { useEffect } from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, MessageCircle, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import { createCartOrderMessage, openWhatsApp } from '../utils/whatsapp';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    hasPriceOnRequest,
    MIN_ORDER_VALUE,
    isMinOrderReached,
    amountRemaining,
    progressPercent
  } = useCart();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Lock background scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    if (items.length === 0) return;
    if (subtotal < MIN_ORDER_VALUE) {
      alert(`Minimum order value is ₹${MIN_ORDER_VALUE.toLocaleString('en-IN')}. Please add ₹${amountRemaining.toLocaleString('en-IN')} more to proceed.`);
      return;
    }
    const orderMessage = createCartOrderMessage(items, subtotal);
    openWhatsApp(orderMessage);
  };

  return (
    <>
      <div className="cart-drawer-backdrop" onClick={closeCart} aria-hidden="true" />
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Your Shopping Cart"
      >
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <h2 className="cart-drawer-title">
            <ShoppingBag size={22} color="var(--color-aqua-400)" />
            <span>Shopping Cart ({totalItems})</span>
          </h2>
          <button
            onClick={closeCart}
            className="cart-close-btn"
            aria-label="Close Shopping Cart"
          >
            <X size={24} />
          </button>
        </div>

        {/* Drawer Body */}
        {items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
              Your cart is empty
            </p>
            <p style={{ fontSize: '0.88rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              Add fish feeds, aquarium treatments, and pet supplies to review and order via WhatsApp.
            </p>
            <button
              onClick={closeCart}
              className="btn-primary"
              style={{ fontSize: '0.9rem', padding: '0.65rem 1.25rem' }}
            >
              Start Browsing
            </button>
          </div>
        ) : (
          <>
            {/* Minimum Order Value Alert / Progress Banner */}
            <div
              className={`cart-min-order-banner ${isMinOrderReached ? 'min-order-reached' : 'min-order-pending'}`}
              style={{
                margin: '1rem 1.25rem 0.5rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isMinOrderReached ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                border: `1px solid ${isMinOrderReached ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                {isMinOrderReached ? (
                  <CheckCircle2 size={18} color="var(--color-emerald-400)" />
                ) : (
                  <AlertCircle size={18} color="var(--color-amber-400)" />
                )}
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isMinOrderReached ? 'var(--color-emerald-400)' : 'var(--color-amber-300)' }}>
                  {isMinOrderReached ? (
                    'Minimum Order Reached (₹1,000+)'
                  ) : (
                    `Minimum order value is ₹${MIN_ORDER_VALUE.toLocaleString('en-IN')}`
                  )}
                </span>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  height: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '0.45rem'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    backgroundColor: isMinOrderReached ? 'var(--color-emerald-400)' : 'var(--color-amber-400)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>Subtotal: ₹{subtotal.toLocaleString('en-IN')}</span>
                {!isMinOrderReached ? (
                  <span style={{ color: 'var(--color-amber-300)', fontWeight: 600 }}>
                    Add ₹{amountRemaining.toLocaleString('en-IN')} more to unlock checkout
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-emerald-400)', fontWeight: 600 }}>
                    Ready to checkout
                  </span>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="cart-items-list">
              {items.map(({ product, quantity }) => {
                const priceFormatted = formatPrice(product.price);
                const lineTotal = typeof product.price === 'number'
                  ? `₹${(product.price * quantity).toLocaleString('en-IN')}`
                  : 'Price on request';

                return (
                  <div key={product.id} className="cart-item">
                    <img
                      src={product.thumbnail || product.image}
                      alt={product.name}
                      className="cart-item-img"
                      loading="lazy"
                      decoding="async"
                      width="64"
                      height="64"
                    />

                    <div className="cart-item-info">
                      <span className="cart-item-name">{product.name}</span>
                      <div className="cart-item-price-row" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="cart-item-price">
                          {product.price !== null ? `${priceFormatted} each` : 'Price on request'}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <div className="cart-item-stepper">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="cart-qty-btn"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="cart-qty-btn"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                          = {lineTotal}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="cart-remove-btn"
                      aria-label={`Remove ${product.name} from cart`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="cart-footer">
              <div className="cart-subtotal-row">
                <span className="cart-subtotal-label">Subtotal</span>
                <span className="cart-subtotal-val">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {!isMinOrderReached && (
                <p
                  className="cart-min-order-warning"
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--color-amber-300)',
                    marginBottom: '0.75rem',
                    textAlign: 'center',
                    lineHeight: '1.4'
                  }}
                >
                  Minimum order value is ₹1,000. Add more products to proceed.
                </p>
              )}

              {hasPriceOnRequest && (
                <p className="cart-note" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  * Note: Items marked "Price on request" will be finalized with store staff on WhatsApp before pickup or delivery.
                </p>
              )}

              <button
                onClick={handleCheckout}
                className={`btn-checkout-whatsapp ${!isMinOrderReached ? 'btn-disabled' : ''}`}
                id="cart-whatsapp-checkout-btn"
                disabled={!isMinOrderReached}
                style={{
                  opacity: isMinOrderReached ? 1 : 0.5,
                  cursor: isMinOrderReached ? 'pointer' : 'not-allowed',
                  width: '100%'
                }}
              >
                <MessageCircle size={20} />
                <span>
                  {isMinOrderReached
                    ? 'Checkout on WhatsApp'
                    : `Add ₹${amountRemaining.toLocaleString('en-IN')} more to Checkout`}
                </span>
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button
                  onClick={clearCart}
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  Clear Cart
                </button>
                <button
                  onClick={closeCart}
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-aqua-400)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <span>Continue Shopping</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
