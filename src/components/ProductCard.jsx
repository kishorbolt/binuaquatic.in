import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ShoppingBag, Check, Eye } from 'lucide-react';
import { formatPrice, calculateDiscount } from '../data/products';
import { getProductUrl, openWhatsApp, createTankEnquiryMessage } from '../utils/whatsapp';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, isPriority = false }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const hasValidPrice = typeof product.price === 'number' && product.price > 0 && !product.isEnquiryOnly;
  const hasDiscount = Boolean(hasValidPrice && product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount ? calculateDiscount(product.originalPrice, product.price) : 0;
  const priceFormatted = hasValidPrice ? formatPrice(product.price) : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasValidPrice) return;
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleEnquireNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.category === 'Tanks' || product.isTank) {
      openWhatsApp(createTankEnquiryMessage(product));
      return;
    }
    const productUrl = getProductUrl(product.slug);
    const msg = [
      "Hello Binu's Aquatic and Plants!",
      "",
      "I would like to enquire about the price and availability of:",
      `Product: ${product.name}`,
      `Link: ${productUrl}`,
      "",
      "Please let me know the details. Thank you!"
    ].join('\n');
    openWhatsApp(msg);
  };

  return (
    <article className="product-card" id={`product-${product.id}`}>
      {/* Product Image Container */}
      <Link to={`/products/${product.slug}`} className="product-image-container" aria-label={`View details for ${product.name}`}>
        {hasDiscount && (
          <div className="product-badge-discount-corner">
            <span className="badge-discount">{discountPercent}% OFF</span>
          </div>
        )}

        {!imageLoaded && !imageError && (
          <div
            className="skeleton-placeholder"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
              backgroundSize: '200% 100%',
              animation: 'pulse 1.5s infinite ease-in-out'
            }}
          />
        )}

        {imageError ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              backgroundColor: '#ffffff',
              color: 'var(--text-dark)',
              fontSize: '0.85rem',
              padding: '1rem',
              textAlign: 'center'
            }}
          >
            <span style={{ fontWeight: 700, color: '#041424', marginBottom: '4px' }}>Binu’s Aquatic</span>
            <span style={{ color: '#475569' }}>Store product</span>
          </div>
        ) : (
          <img
            src={product.thumbnail || product.image}
            alt={product.name}
            className="product-card-img"
            loading={isPriority ? "eager" : "lazy"}
            fetchPriority={isPriority ? "high" : "auto"}
            decoding="async"
            width="420"
            height="420"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        )}
      </Link>

      {/* Product Body */}
      <div className="product-body">
        <div className="product-card-category-row">
          <span className="badge-category">{product.category}</span>
        </div>
        <Link to={`/products/${product.slug}`} className="product-name-link">
          <h3 className="product-title" title={product.name}>
            {product.name}
          </h3>
        </Link>

        {/* Pricing Area: STRICTLY show price only when valid; show exact Tank Size when tank; NO text if unpriced */}
        {hasValidPrice ? (
          <div className="product-pricing-row">
            <div className="price-stack">
              {hasDiscount && (
                <span className="original-price-tag">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span className="price-tag">{priceFormatted}</span>
            </div>
            {hasDiscount && (
              <span className="discount-badge">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        ) : product.tankSize ? (
          <div className="product-tank-spec-row" style={{ minHeight: '34px', margin: '0.4rem 0', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '0.86rem', color: 'var(--color-aqua-400)', fontWeight: 600, background: 'rgba(6, 182, 212, 0.1)', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)' }}>
              Size: {product.tankSize}
            </span>
          </div>
        ) : (
          <div className="product-pricing-row" style={{ minHeight: '34px', margin: '0.4rem 0', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '0.86rem', color: 'var(--color-cyan-300)', fontWeight: 600 }}>
              Price on Enquiry
            </span>
          </div>
        )}

        {/* Action Buttons: Add to Cart ONLY (if priced) OR Enquire on WhatsApp ONLY (if unpriced/tank) */}
        <div className="product-actions-cluster">
          {hasValidPrice ? (
            <button
              onClick={handleAddToCart}
              className="btn-card-cart btn-card-cart-full"
              title={`Add ${product.name} to Cart`}
              aria-label={`Add ${product.name} to shopping cart`}
            >
              {justAdded ? (
                <>
                  <Check size={16} color="var(--color-emerald-400)" />
                  <span style={{ color: 'var(--color-emerald-400)' }}>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleEnquireNow}
              className="btn-card-enquire btn-card-enquire-full"
              title={`Enquire about ${product.name} on WhatsApp`}
              aria-label={`Enquire about ${product.name} on WhatsApp`}
            >
              <MessageCircle size={16} />
              <span>{product.category === 'Tanks' || product.isTank ? 'Enquire on WhatsApp' : 'Enquire Now'}</span>
            </button>
          )}

          <Link
            to={`/products/${product.slug}`}
            className="btn-card-details"
            title={`View detailed specifications for ${product.name}`}
            aria-label={`View Details for ${product.name}`}
          >
            <Eye size={15} />
            <span>View Details</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
