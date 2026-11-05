import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getProductBySlug,
  PRODUCTS,
  formatPrice,
  calculateDiscount
} from '../data/products';
import {
  getProductUrl,
  openWhatsApp,
  createTankEnquiryMessage
} from '../utils/whatsapp';
import { useCart } from '../context/CartContext';
import {
  MessageCircle,
  ShoppingBag,
  Check,
  Plus,
  Minus,
  Share2,
  ChevronRight,
  ShieldCheck,
  Truck,
  ArrowLeft
} from 'lucide-react';
import NotFoundPage from './NotFoundPage';
import ProductCard from '../components/ProductCard';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const { addToCart, MIN_ORDER_VALUE } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedNotification, setAddedNotification] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (product) {
      document.title = `${product.name} | Binu’s Aquatic and Plants`;
    }
  }, [slug, product]);

  if (!product) {
    return <NotFoundPage message={`Product with identifier "${slug}" was not found in our catalog.`} />;
  }

  const hasValidPrice = typeof product.price === 'number' && product.price > 0 && !product.isEnquiryOnly;
  const hasDiscount = Boolean(hasValidPrice && product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount ? calculateDiscount(product.originalPrice, product.price) : 0;
  const priceFormatted = hasValidPrice ? formatPrice(product.price) : null;
  const productUrl = getProductUrl(product.slug);

  const handleAddToCart = () => {
    if (!hasValidPrice) return;
    addToCart(product, quantity);
    setAddedNotification(true);
    setTimeout(() => setAddedNotification(false), 2000);
  };

  const handleEnquireNow = () => {
    if (product.category === 'Tanks' || product.isTank) {
      openWhatsApp(createTankEnquiryMessage(product));
      return;
    }
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} - Binu’s Aquatic and Plants`,
          text: `Check out ${product.name} at Binu’s Aquatic and Plants, Ranipet!`,
          url: productUrl
        });
      } catch {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(productUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Related products from same category
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <main className="product-detail-section">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <Link to={`/?category=${encodeURIComponent(product.category)}#products`}>
            {product.category}
          </Link>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{product.name}</span>
        </nav>

        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/#products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem',
              color: 'var(--color-aqua-400)'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to All Products</span>
          </Link>
        </div>

        {/* Main Product Layout */}
        <div className="product-detail-layout">
          {/* Gallery / Image Box */}
          <div className="detail-gallery">
            <div className="detail-main-img-box" style={{ position: 'relative', overflow: 'hidden' }}>
              {!imageLoaded && !imageError && (
                <div
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
                    minHeight: '360px',
                    backgroundColor: '#ffffff',
                    color: 'var(--text-dark)',
                    textAlign: 'center',
                    padding: '2rem'
                  }}
                >
                  <span style={{ fontWeight: 800, color: '#041424', fontSize: '1.2rem', marginBottom: '8px' }}>
                    Binu’s Aquatic and Plants
                  </span>
                  <span style={{ color: '#475569' }}>Store Verified Stock</span>
                </div>
              ) : (
                <img
                  src={product.image}
                  alt={product.name}
                  className="detail-main-img"
                  loading="eager"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageError(true);
                    setImageLoaded(true);
                  }}
                />
              )}
            </div>
          </div>

          {/* Product Details & Actions */}
          <div className="detail-info">
            <div className="detail-badge-row">
              <span className="badge-category">{product.category}</span>
              {hasDiscount && (
                <span className="badge-discount">{discountPercent}% OFF</span>
              )}
              {product.sku && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  SKU: {product.sku}
                </span>
              )}
            </div>

            <h1 className="detail-title">{product.name}</h1>

            {/* Pricing Box: ONLY when valid price; clean omission when enquiry-only */}
            {hasValidPrice && (
              <div className="detail-price-box">
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {hasDiscount && (
                    <span className="detail-original-price">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  <span className="detail-price">{priceFormatted}</span>
                  {hasDiscount && (
                    <span className="discount-badge" style={{ fontSize: '0.82rem', padding: '0.25rem 0.65rem' }}>
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  (Store Retail Price)
                </span>
              </div>
            )}

            {/* Tank Dimensions Display */}
            {product.tankSize && (
              <div style={{ margin: '1rem 0', padding: '0.75rem 1rem', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  Tank Dimensions / Size:
                </span>
                <span style={{ fontSize: '1.15rem', color: 'var(--color-aqua-400)', fontWeight: 700 }}>
                  {product.tankSize}
                </span>
              </div>
            )}

            {/* Description */}
            <p className="detail-desc">{product.description}</p>

            {/* Features Highlight */}
            {product.features && product.features.length > 0 && (
              <ul className="detail-features-list">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="detail-feature-item">
                    <Check size={16} className="feature-check-icon" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Quantity Stepper & Share (ONLY for priced items) */}
            {hasValidPrice && (
              <div className="detail-quantity-row">
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Quantity:
                </span>
                <div className="quantity-stepper">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="qty-btn"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="qty-btn"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="cart-toggle-btn"
                  style={{ marginLeft: 'auto' }}
                  title="Share this product page"
                  aria-label="Share product"
                >
                  <Share2 size={18} />
                </button>
                {copiedLink && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-aqua-400)' }}>
                    Link Copied!
                  </span>
                )}
              </div>
            )}

            {/* Minimum Order Value Notice (for priced items) */}
            {hasValidPrice && (
              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  padding: '0.55rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid var(--color-aqua-400)',
                  marginBottom: '1.25rem'
                }}
              >
                <strong>Cart Requirement:</strong> Minimum order value of ₹{MIN_ORDER_VALUE.toLocaleString('en-IN')} is required to checkout via WhatsApp.
              </div>
            )}

            {/* Action Buttons: Add to Cart ONLY (if priced) OR Enquire Now on WhatsApp ONLY (if unpriced) */}
            <div className="detail-cta-group">
              {hasValidPrice ? (
                <button
                  onClick={handleAddToCart}
                  className="btn-add-cart-large btn-add-cart-fullwidth"
                  id="detail-add-cart-btn"
                >
                  {addedNotification ? (
                    <>
                      <Check size={20} color="var(--color-emerald-400)" />
                      <span style={{ color: 'var(--color-emerald-400)' }}>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={20} />
                      <span>Add to Cart ({quantity} × {priceFormatted})</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleEnquireNow}
                  className="btn-enquire-whatsapp-large"
                  id="detail-enquire-btn"
                >
                  <MessageCircle size={22} />
                  <span>{product.category === 'Tanks' || product.isTank ? 'Enquire on WhatsApp' : 'Enquire Now on WhatsApp'}</span>
                </button>
              )}
            </div>

            {/* Reassurance notes */}
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={18} color="var(--color-aqua-400)" />
                <span>Genuine product guaranteed from Binu’s Aquatic and Plants</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Truck size={18} color="var(--color-emerald-400)" />
                <span>Store pickup at Ranipet or delivery confirmed upon chat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section style={{ marginTop: '4rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.5rem' }}>
              More in {product.category}
            </h3>
            <div className="products-grid">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
