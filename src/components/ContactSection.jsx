import React from 'react';
import { MapPin, Phone, Mail, MessageCircle, ExternalLink, Navigation } from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';
import {
  DISPLAY_PHONE,
  STORE_LANDLINE,
  STORE_EMAIL,
  SHOP_ADDRESS,
  INSTAGRAM_URL,
  GOOGLE_MAPS_EMBED_URL,
  GOOGLE_MAPS_DIRECTIONS_URL,
  openWhatsApp,
  createGeneralEnquiryMessage
} from '../utils/whatsapp';

export default function ContactSection() {
  const handleWhatsAppEnquiry = () => {
    openWhatsApp(createGeneralEnquiryMessage('Shop Visit & Location Enquiry'));
  };

  return (
    <section className="contact-section" id="contact" aria-label="Store Location & Contact Information">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Visit Our Retail Store</span>
          <h2 className="section-title">Contact & Store Location</h2>
          <p className="section-desc">
            Conveniently situated in Navalpur, Ranipet. Stop by our store to view live fish, birds, aquatic plants, and quality feeds in person, or get direct delivery via WhatsApp.
          </p>
        </div>

        <div className="contact-layout">
          {/* Shop Information Card */}
          <div className="contact-card">
            <div>
              {/* Business Name */}
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.5rem' }}>
                Binu’s Aquatic and Plants
              </h3>

              {/* Exact Address */}
              <div className="contact-item-row">
                <div className="contact-icon-box">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className="contact-item-title">Store Address</h4>
                  <p className="contact-item-detail">
                    {SHOP_ADDRESS}
                  </p>
                </div>
              </div>

              {/* Mobile & WhatsApp */}
              <div className="contact-item-row">
                <div className="contact-icon-box">
                  <Phone size={22} />
                </div>
                <div>
                  <h4 className="contact-item-title">Mobile &amp; WhatsApp Orders</h4>
                  <p className="contact-item-detail">
                    <a
                      href={`tel:${DISPLAY_PHONE.replace(/\s+/g, '')}`}
                      style={{ color: 'var(--color-cyan-300)', textDecoration: 'underline' }}
                    >
                      {DISPLAY_PHONE}
                    </a>
                  </p>
                </div>
              </div>

              {/* Landline */}
              <div className="contact-item-row">
                <div className="contact-icon-box">
                  <Phone size={22} />
                </div>
                <div>
                  <h4 className="contact-item-title">Store Landline</h4>
                  <p className="contact-item-detail">
                    <a
                      href={`tel:${STORE_LANDLINE.replace(/\s+/g, '')}`}
                      style={{ color: 'var(--color-cyan-300)', textDecoration: 'underline' }}
                    >
                      {STORE_LANDLINE}
                    </a>
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="contact-item-row">
                <div className="contact-icon-box">
                  <Mail size={22} />
                </div>
                <div>
                  <h4 className="contact-item-title">Official Email</h4>
                  <p className="contact-item-detail">
                    <a
                      href={`mailto:${STORE_EMAIL}`}
                      style={{ color: 'var(--color-cyan-300)', textDecoration: 'underline', wordBreak: 'break-all' }}
                    >
                      {STORE_EMAIL}
                    </a>
                  </p>
                </div>
              </div>

              {/* Instagram */}
              <div className="contact-item-row">
                <div className="contact-icon-box">
                  <InstagramIcon size={22} />
                </div>
                <div>
                  <h4 className="contact-item-title">Official Instagram</h4>
                  <p className="contact-item-detail">
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-cyan-300)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>@binuaquatic.in</span>
                      <ExternalLink size={14} />
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="contact-actions-grid">
              <a
                href={`tel:${DISPLAY_PHONE.replace(/\s+/g, '')}`}
                className="btn-contact-action btn-contact-phone"
              >
                <Phone size={18} />
                <span>Call Mobile</span>
              </a>

              <a
                href={`tel:${STORE_LANDLINE.replace(/\s+/g, '')}`}
                className="btn-contact-action btn-contact-phone"
                style={{ backgroundColor: 'var(--color-ocean-800)', border: '1px solid var(--border-subtle)' }}
              >
                <Phone size={18} />
                <span>Call Landline</span>
              </a>

              <a
                href={`mailto:${STORE_EMAIL}`}
                className="btn-contact-action"
                style={{ backgroundColor: 'var(--color-ocean-800)', border: '1px solid var(--border-subtle)', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}
              >
                <Mail size={18} />
                <span>Email Us</span>
              </a>

              <button
                onClick={handleWhatsAppEnquiry}
                className="btn-contact-action btn-contact-whatsapp"
              >
                <MessageCircle size={18} />
                <span>WhatsApp Us</span>
              </button>

              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-contact-action btn-contact-instagram"
              >
                <InstagramIcon size={18} />
                <span>Instagram</span>
              </a>
            </div>
          </div>

          {/* Interactive Google Maps Card */}
          <div className="map-wrapper">
            <iframe
              title="Binu’s Aquatic and Plants Google Maps Location"
              src={GOOGLE_MAPS_EMBED_URL}
              className="map-iframe"
              loading="lazy"
              allowFullScreen=""
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="map-bar">
              <div className="map-address-snip">
                <strong>Ranipet, Tamil Nadu</strong> • Municipal Complex, MBT Road
              </div>
              <a
                href={GOOGLE_MAPS_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-directions"
              >
                <Navigation size={16} />
                <span>Get Directions</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
