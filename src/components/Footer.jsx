import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, MapPin, Phone, Mail, ExternalLink, ArrowRight } from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';
import {
  DISPLAY_PHONE,
  STORE_LANDLINE,
  STORE_EMAIL,
  DEVELOPER_PHONE,
  SHOP_ADDRESS,
  INSTAGRAM_URL,
  GOOGLE_MAPS_DIRECTIONS_URL,
  openWhatsApp,
  createGeneralEnquiryMessage
} from '../utils/whatsapp';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCategoryClick = (cat) => {
    if (location.pathname !== '/') {
      navigate(`/?category=${encodeURIComponent(cat)}#products`);
    } else {
      const url = new URL(window.location);
      url.searchParams.set('category', cat);
      window.history.pushState({}, '', url);
      window.dispatchEvent(new Event('categorychange'));
      const el = document.getElementById('products');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <div className="footer-logo-row">
              <div className="footer-logo-circle">
                <img
                  src="/binulogo.png"
                  alt="Binu's Aquatic and Plants Official Emblem"
                  className="footer-logo-img"
                  width="52"
                  height="52"
                />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  Binu’s Aquatic and Plants
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-aqua-400)', fontWeight: 500 }}>
                  Ranipet, Tamil Nadu
                </span>
              </div>
            </div>

            <p className="footer-desc">
              Your destination for vibrant freshwater aquarium fish, exotic companion birds, live aquatic plants, premium specialty feeds, and authentic aquarium care essentials.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => openWhatsApp(createGeneralEnquiryMessage('Footer WhatsApp Enquiry'))}
                className="btn-whatsapp-header"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
              >
                <MessageCircle size={16} />
                <span>WhatsApp: {DISPLAY_PHONE}</span>
              </button>
            </div>
          </div>

          {/* Quick Categories Column */}
          <div>
            <h4 className="footer-col-title">Store Categories</h4>
            <ul className="footer-links-list">
              <li>
                <button onClick={() => handleCategoryClick('Birds & Fish Food')} className="footer-link">
                  Birds & Fish Food
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('Fish Medicines')} className="footer-link">
                  Fish Medicines
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('Filters & Others')} className="footer-link">
                  Filters & Others
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('Tanks')} className="footer-link">
                  Tanks
                </button>
              </li>
            </ul>
          </div>

          {/* Navigation & Information */}
          <div>
            <h4 className="footer-col-title">Store & Information</h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/" className="footer-link">
                  Home Catalog
                </Link>
              </li>
              <li>
                <Link to="/about" className="footer-link" style={{ color: 'var(--color-aqua-400)', fontWeight: 600 }}>
                  About Us & Our Story
                </Link>
              </li>
              <li>
                <a href="#contact" className="footer-link">
                  Store Location & Hours
                </a>
              </li>
              <li>
                <a
                  href={GOOGLE_MAPS_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Google Maps Directions</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <InstagramIcon size={14} />
                  <span>Instagram @binuaquatic.in</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Store Location Column */}
          <div>
            <h4 className="footer-col-title">Visit Our Retail Outlet</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <MapPin size={18} color="var(--color-aqua-400)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{SHOP_ADDRESS}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Phone size={18} color="var(--color-aqua-400)" style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Mobile &amp; WhatsApp:</span>
                  <a href={`tel:${DISPLAY_PHONE.replace(/\s+/g, '')}`} style={{ color: '#ffffff', fontWeight: 600 }}>
                    {DISPLAY_PHONE}
                  </a>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Phone size={18} color="var(--color-aqua-400)" style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Store Landline:</span>
                  <a href={`tel:${STORE_LANDLINE.replace(/\s+/g, '')}`} style={{ color: '#ffffff', fontWeight: 600 }}>
                    {STORE_LANDLINE}
                  </a>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Mail size={18} color="var(--color-aqua-400)" style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Official Email:</span>
                  <a href={`mailto:${STORE_EMAIL}`} style={{ color: '#ffffff', wordBreak: 'break-all' }}>
                    {STORE_EMAIL}
                  </a>
                </div>
              </div>
              <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-aqua-400)', fontWeight: 700, marginBottom: '2px' }}>
                  MINIMUM CART VALUE
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  ₹1,000 minimum order value for WhatsApp checkout. In-store pickup available.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-copyright-col">
            <p>© {currentYear} Binu’s Aquatic and Plants. All rights reserved. Ranipet, Tamil Nadu.</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              All product prices, offer discounts, and specifications reflect authentic store retail inventory.
            </p>
          </div>

          <div className="footer-developer-credit">
            <span className="developer-tagline">Designed &amp; Developed by</span>
            <div className="developer-brand-row">
              <div className="piyroware-logo-circle">
                <img
                  src="/piyrowarelogo.jpeg"
                  alt="PIYROWARE"
                  className="piyroware-logo-img"
                  width="24"
                  height="24"
                />
              </div>
              <span className="piyroware-text">PIYROWARE</span>
            </div>
            <div className="developer-contact-row">
              <span>Contact Developer Team: </span>
              <a href={`tel:${DEVELOPER_PHONE}`} className="developer-phone-link">
                {DEVELOPER_PHONE}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
