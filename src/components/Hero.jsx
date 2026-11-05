import React from 'react';
import { ArrowRight, MessageCircle, Phone, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { DISPLAY_PHONE, openWhatsApp, createGeneralEnquiryMessage } from '../utils/whatsapp';

export default function Hero() {
  const scrollToProducts = () => {
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHeroWhatsApp = () => {
    openWhatsApp(createGeneralEnquiryMessage('Homepage Hero Order Enquiry'));
  };

  return (
    <section className="hero-section" aria-label="Hero Introduction">
      {/* Cinematic Aquatic Background */}
      <div className="hero-background-wrapper">
        <img
          src="/indexbgg.jpeg?v=20261104"
          alt="Binu's Aquatic and Plants - Underwater Aquarium Theme"
          className="hero-bg-img"
          fetchpriority="high"
          loading="eager"
          decoding="async"
        />
        <div className="hero-overlay" />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="hero-content">
          {/* Badge */}
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Premium Aquatic Life & Pet Nutrition • Ranipet</span>
          </div>

          {/* Logo & Heading */}
          <div className="hero-brand-header">
            <div className="hero-logo-circle">
              <img
                src="/binulogo.png"
                alt="Binu's Aquatic and Plants Official Emblem"
                className="hero-logo-img"
                width="76"
                height="76"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <div>
              <h1 className="hero-heading">Binu’s Aquatic and Plants</h1>
            </div>
          </div>

          <p className="hero-subtitle">
            “Discover Beautiful Fish, Birds, Aquatic Plants & Aquarium Essentials.”
          </p>

          {/* Phone Contact Badge */}
          <div className="hero-phone-chip">
            <Phone size={16} color="var(--color-aqua-400)" />
            <span>Call & WhatsApp: </span>
            <a href={`tel:${DISPLAY_PHONE.replace(/\s+/g, '')}`}>{DISPLAY_PHONE}</a>
          </div>

          {/* CTA Buttons */}
          <div className="hero-actions">
            <button
              onClick={scrollToProducts}
              className="btn-primary"
              id="hero-explore-btn"
            >
              <span>Explore Products</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={handleHeroWhatsApp}
              className="btn-whatsapp-hero"
              id="hero-whatsapp-btn"
            >
              <MessageCircle size={20} />
              <span>Order on WhatsApp</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="hero-features">
            <div className="hero-feature-item">
              <ShieldCheck className="hero-feature-icon" size={20} />
              <span className="hero-feature-text">100% Genuine Fish Feeds & Care</span>
            </div>
            <div className="hero-feature-item">
              <Truck className="hero-feature-icon" size={20} />
              <span className="hero-feature-text">Store Pickup & Local Ranipet Delivery</span>
            </div>
            <div className="hero-feature-item">
              <MessageCircle className="hero-feature-icon" size={20} />
              <span className="hero-feature-text">Instant WhatsApp Confirmation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
