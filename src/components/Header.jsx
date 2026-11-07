import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, MessageCircle, Menu, X, ChevronRight, Phone, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { openWhatsApp, createGeneralEnquiryMessage, DISPLAY_PHONE } from '../utils/whatsapp';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const { totalItems, openCart, subtotal } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleCategoryNav = (cat) => {
    setMobileMenuOpen(false);
    setCategoryDropdownOpen(false);
    if (location.pathname !== '/') {
      navigate(`/?category=${encodeURIComponent(cat)}#products`);
    } else {
      const url = new URL(window.location);
      url.searchParams.set('category', cat);
      window.history.pushState({}, '', url);
      window.dispatchEvent(new Event('categorychange'));
      const el = document.getElementById('products');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleContactNav = () => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/#contact');
    } else {
      const el = document.getElementById('contact');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const categories = [
    'All Products',
    'Birds & Fish Food',
    'Fish Medicines',
    'Filters & Others',
    'Tanks'
  ];

  return (
    <header className="site-header">
      <div className="container header-inner">
        {/* Brand Logo & Name */}
        <Link to="/" className="brand-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="brand-logo-circle">
            <img
              src="/binulogo.png"
              alt="Binu's Aquatic and Plants Logo"
              className="brand-logo-img"
              width="48"
              height="48"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
          <div className="brand-text-wrapper">
            <span className="brand-title">Binu’s Aquatic & Plants</span>
            <span className="brand-subtitle">Ranipet • Fish • Birds • Plants</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Home
          </Link>

          <Link
            to="/about"
            className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            About Us
          </Link>

          {/* Categories Dropdown */}
          <div
            className="nav-dropdown-wrapper"
            onMouseEnter={() => setCategoryDropdownOpen(true)}
            onMouseLeave={() => setCategoryDropdownOpen(false)}
            style={{ position: 'relative' }}
          >
            <button
              onClick={() => handleCategoryNav('All Products')}
              className="nav-link"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Categories</span>
              <ChevronDown size={14} />
            </button>

            {categoryDropdownOpen && (
              <div
                className="nav-dropdown-menu"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  minWidth: '220px',
                  backgroundColor: '#071f36',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
                  padding: '0.5rem 0',
                  zIndex: 50
                }}
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryNav(cat)}
                    className="nav-dropdown-item"
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.55rem 1rem',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      transition: 'color 0.2s, background 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-aqua-400)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => handleCategoryNav('All Products')}
            className="nav-link"
          >
            Store Catalog
          </button>

          <button
            onClick={handleContactNav}
            className="nav-link"
          >
            Contact & Store
          </button>
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          {/* Quick WhatsApp Order Button */}
          <button
            onClick={() => openWhatsApp(createGeneralEnquiryMessage('Quick Order Enquiry'))}
            className="btn-whatsapp-header"
            aria-label="Order on WhatsApp"
            title="Chat with Binu's Aquatic on WhatsApp"
          >
            <MessageCircle size={18} />
            <span>Order on WhatsApp</span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={openCart}
            className="cart-toggle-btn"
            aria-label={`View Cart with ${totalItems} items`}
            title="Open Shopping Cart"
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="mobile-menu-btn"
            aria-label="Open Mobile Navigation Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Portaled to body to escape backdrop-filter stacking context) */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="mobile-nav-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            <div className="mobile-nav-header">
              <Link
                to="/"
                className="brand-link"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="brand-logo-circle" style={{ width: '42px', height: '42px' }}>
                  <img
                    src="/binulogo.png"
                    alt="Binu's Aquatic Logo"
                    className="brand-logo-img"
                    width="42"
                    height="42"
                  />
                </div>
                <div className="brand-text-wrapper">
                  <span className="brand-title" style={{ fontSize: '1rem' }}>Binu’s Aquatic</span>
                  <span className="brand-subtitle">Ranipet, Tamil Nadu</span>
                </div>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-close-btn"
                aria-label="Close Mobile Navigation"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mobile-nav-links">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/'); }}
                className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                <span>Home</span>
                <ChevronRight size={16} color="var(--color-aqua-400)" />
              </button>

              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/about'); }}
                className={`mobile-nav-link ${location.pathname === '/about' ? 'active' : ''}`}
              >
                <span>About Us</span>
                <ChevronRight size={16} color="var(--color-aqua-400)" />
              </button>

              <div className="mobile-nav-section-title">
                Departments
              </div>

              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryNav(cat)}
                  className="mobile-nav-link mobile-nav-sublink"
                >
                  <span>{cat}</span>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </button>
              ))}

              <button
                onClick={handleContactNav}
                className="mobile-nav-link"
                style={{ marginTop: '0.5rem' }}
              >
                <span>Contact & Location</span>
                <ChevronRight size={16} color="var(--color-aqua-400)" />
              </button>
            </div>

            <div className="mobile-nav-footer">
              <a
                href={`tel:${DISPLAY_PHONE.replace(/\s+/g, '')}`}
                className="hero-phone-chip"
                style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Phone size={16} />
                <span>{DISPLAY_PHONE}</span>
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openWhatsApp(createGeneralEnquiryMessage('Mobile Menu Enquiry'));
                }}
                className="btn-whatsapp-header"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem' }}
              >
                <MessageCircle size={18} />
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </aside>
        </>,
        document.body
      )}
    </header>
  );
}
