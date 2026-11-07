import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Store,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Layers,
  Heart,
  Droplets,
  Activity,
  Cpu
} from 'lucide-react';
import { DISPLAY_PHONE, STORE_LANDLINE, STORE_EMAIL, SHOP_ADDRESS, openWhatsApp, createGeneralEnquiryMessage } from '../utils/whatsapp';

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = "About Us | Binu's Aquatic and Plants";
  }, []);

  const handleWhatsAppEnquiry = (topic) => {
    openWhatsApp(createGeneralEnquiryMessage(topic));
  };

  return (
    <main className="about-page" aria-label="About Binu's Aquatic and Plants">
      {/* Hero Header */}
      <section className="about-hero-section">
        <div className="about-hero-bg">
          <img
            src="/indexbgg.jpeg?v=20261104"
            alt="Freshwater planted aquarium background"
            className="about-hero-img"
            fetchpriority="high"
          />
          <div className="about-hero-overlay" />
        </div>

        <div className="container about-hero-container">
          <div className="about-hero-badge">
            <Sparkles size={16} />
            <span>Retail Store • Navalpur, Ranipet</span>
          </div>

          <h1 className="about-hero-heading">
            Passion for Aquatic Care
          </h1>

          <p className="about-hero-intro">
            Welcome to Binu's Aquatic and Plants, a destination for aquarium essentials, fish foods, fish medicines, aquarium equipment, and related products.
          </p>

          <p className="about-hero-subintro">
            We aim to make aquarium care and maintenance convenient by bringing together useful products for aquarium enthusiasts and hobbyists.
          </p>

          <div className="about-hero-actions">
            <Link to="/#products" className="btn-primary">
              <span>Browse Catalog</span>
              <ArrowRight size={18} />
            </Link>
            <button
              onClick={() => handleWhatsAppEnquiry('General Store Enquiry')}
              className="btn-whatsapp-hero"
            >
              <MessageCircle size={18} />
              <span>Contact Store on WhatsApp</span>
            </button>
          </div>
        </div>
      </section>

      <div className="container about-content-sections">
        {/* Section 1: Our Story */}
        <section className="about-narrative-card" id="our-story">
          <div className="about-narrative-grid">
            <div className="about-narrative-text">
              <span className="section-tag">Ranipet Retail Store</span>
              <h2 className="about-section-heading">1. Our Story</h2>
              <p>
                Binu's Aquatic and Plants is a local retail pet and aquarium supply store situated at Municipal Complex, 7 & 8, MBT Road, Navalpur, Ranipet, Tamil Nadu.
              </p>
              <p>
                Founded on an appreciation for aquarium keeping and pet hobbyists, our retail outlet provides accessible aquarium supplies, quality nutritional feeds, essential water treatments, and filtration equipment for customers in Ranipet, Vellore, and surrounding areas.
              </p>
              <p>
                We believe in straightforward, transparent customer service. All items featured in our product catalogue are photographed directly from our physical store shelves.
              </p>
            </div>
            <div className="about-narrative-media">
              <div className="about-story-logo-circle">
                <img
                  src="/binulogo.png"
                  alt="Binu's Aquatic and Plants Official Emblem"
                  className="about-story-logo-img"
                  width="200"
                  height="200"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="about-badge-storefront">
                <Store size={18} />
                <span>Navalpur, Ranipet Retail Store</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Aquarium Care Essentials */}
        <section className="about-narrative-card" id="care-essentials">
          <div className="about-narrative-grid reverse">
            <div className="about-narrative-text">
              <span className="section-tag">Healthy Water & Environments</span>
              <h2 className="about-section-heading">2. Aquarium Care Essentials</h2>
              <p>
                Maintaining a clean, stable aquatic habitat is essential for the wellbeing of freshwater fish. Balanced water conditions, proper aeration, and regular filtration keep tank environments clear and thriving.
              </p>
              <p>
                We stock everyday aquarium care products including water conditioners, biological media, aquarium salt, and routine maintenance accessories to assist hobbyists with consistent tank care.
              </p>
            </div>
            <div className="about-narrative-media">
              <img
                src="/indexbgg.jpeg?v=20261104"
                alt="Freshwater aquarium setup"
                className="about-showcase-img"
                loading="lazy"
                decoding="async"
                width="1672"
                height="941"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Fish Foods and Nutrition */}
        <section className="about-narrative-card" id="fish-foods">
          <div className="about-narrative-grid">
            <div className="about-narrative-text">
              <span className="section-tag">Daily Nutrition</span>
              <h2 className="about-section-heading">3. Fish Foods and Nutrition</h2>
              <p>
                Healthy growth, active behavior, and coloration depend on balanced daily feeding. Our inventory includes trusted nutritional feeds tailored for diverse freshwater fish requirements:
              </p>
              <ul className="about-highlights-list">
                <li>
                  <Heart size={16} color="var(--color-aqua-400)" />
                  <span>Staple flakes and micro-pellets for community fish, guppies, and tetras.</span>
                </li>
                <li>
                  <Heart size={16} color="var(--color-aqua-400)" />
                  <span>High-protein growth pellets for cichlids, flowerhorns, and arowanas.</span>
                </li>
                <li>
                  <Heart size={16} color="var(--color-aqua-400)" />
                  <span>Natural freeze-dried bloodworms, tubifex worm cubes, and pond koi feeds.</span>
                </li>
              </ul>
            </div>
            <div className="about-narrative-media">
              <img
                src="/aboutus3.png"
                alt="Fish Foods and Nutrition - Binu's Aquatic and Plants"
                className="about-showcase-img"
                loading="lazy"
                decoding="async"
                width="1672"
                height="941"
              />
            </div>
          </div>
        </section>

        {/* Section 4: Fish Medicines and Care */}
        <section className="about-narrative-card" id="fish-medicines">
          <div className="about-narrative-grid reverse">
            <div className="about-narrative-text">
              <span className="section-tag">Aquatic Health</span>
              <h2 className="about-section-heading">4. Fish Medicines and Care</h2>
              <p>
                Prompt attention to water quality and minor fish ailments helps prevent health complications in freshwater tanks. We carry practical remedies and water treatments:
              </p>
              <ul className="about-highlights-list">
                <li>
                  <Droplets size={16} color="var(--color-cyan-400)" />
                  <span>Water conditioners and dechlorinators for tap water safety.</span>
                </li>
                <li>
                  <Droplets size={16} color="var(--color-cyan-400)" />
                  <span>Treatments for white spot, fin rot, and external bacterial stress.</span>
                </li>
                <li>
                  <Droplets size={16} color="var(--color-cyan-400)" />
                  <span>Nitrifying bacteria supplements and water clarifiers for clean tanks.</span>
                </li>
              </ul>
            </div>
            <div className="about-narrative-media">
              <img
                src="/aboutus4.png"
                alt="Fish Medicines and Aquatic Care - Binu's Aquatic and Plants"
                className="about-showcase-img"
                loading="lazy"
                decoding="async"
                width="1672"
                height="941"
              />
            </div>
          </div>
        </section>

        {/* Section 5: Aquarium Equipment and Filters */}
        <section className="about-narrative-card" id="equipment-filters">
          <div className="about-narrative-grid">
            <div className="about-narrative-text">
              <span className="section-tag">Circulation & Aeration</span>
              <h2 className="about-section-heading">5. Aquarium Equipment and Filters</h2>
              <p>
                Proper mechanical and biological filtration is the backbone of any aquarium system. We provide reliable pumps and filters from standard aquatic manufacturers:
              </p>
              <ul className="about-highlights-list">
                <li>
                  <Cpu size={16} color="var(--color-aqua-400)" />
                  <span>Submersible power filters and internal water pumps (Sobo, Boyu).</span>
                </li>
                <li>
                  <Cpu size={16} color="var(--color-aqua-400)" />
                  <span>Hang-on-back (HOB) waterfall filters and surface skimmers.</span>
                </li>
                <li>
                  <Cpu size={16} color="var(--color-aqua-400)" />
                  <span>Diaphragm air pumps, wave makers, and replacement sponge cartridges.</span>
                </li>
              </ul>
            </div>
            <div className="about-narrative-media">
              <img
                src="/aboutus5.png"
                alt="Aquarium Equipment and Filters - Binu's Aquatic and Plants"
                className="about-showcase-img"
                loading="lazy"
                decoding="async"
                width="1672"
                height="941"
              />
            </div>
          </div>
        </section>

        {/* Section 6: Our Product Collection */}
        <section className="about-narrative-card" id="collection">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="section-tag">Organized Catalog</span>
            <h2 className="about-section-heading">6. Our Product Collection</h2>
            <p style={{ maxWidth: '650px', margin: '0 auto', color: 'var(--text-secondary)' }}>
              Our physical retail inventory is catalogued across four primary store categories for convenient browsing:
            </p>
          </div>

          <div className="about-collection-grid">
            <div className="about-collection-card">
              <h4 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '0.35rem' }}>Birds & Fish Food</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Flakes, pellets, granules, bloodworms, pond feeds, bird diets, and companion pet foods.</p>
            </div>
            <div className="about-collection-card">
              <h4 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '0.35rem' }}>Fish Medicines</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Water conditioners, anti-stress formulas, parasite cures, and water clarifiers.</p>
            </div>
            <div className="about-collection-card">
              <h4 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '0.35rem' }}>Filters & Others</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Submersible power filters, air pumps, wave makers, hang-on filters, heaters, plant nutrients, and essential aquarium accessories.</p>
            </div>
            <div className="about-collection-card">
              <h4 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '0.35rem' }}>Tanks</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Freshwater glass aquariums, curved-front tanks, tower tanks, nano setups, and cabinet aquariums from our verified tank collection.</p>
            </div>
          </div>
        </section>

        {/* Section 7: Visit Our Store */}
        <section className="about-narrative-card visit-store-highlight" id="visit-store">
          <div className="visit-store-header">
            <Store size={32} color="var(--color-aqua-400)" />
            <h2 className="about-section-heading" style={{ marginBottom: '0.5rem' }}>7. Visit Our Store</h2>
            <p style={{ maxWidth: '620px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              We welcome customers to visit our store in Navalpur, Ranipet to inspect products in person or place orders via WhatsApp for store pickup or delivery.
            </p>
          </div>

          <div className="visit-store-grid">
            <div className="visit-store-info-col">
              <div className="visit-store-detail-item">
                <MapPin size={22} color="var(--color-aqua-400)" />
                <div>
                  <h4 style={{ color: '#ffffff', fontWeight: 700 }}>Store Location</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {SHOP_ADDRESS}
                  </p>
                </div>
              </div>

              <div className="visit-store-detail-item">
                <Phone size={22} color="var(--color-aqua-400)" />
                <div>
                  <h4 style={{ color: '#ffffff', fontWeight: 700 }}>Mobile &amp; WhatsApp Orders</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <a href={`tel:${DISPLAY_PHONE.replace(/\s+/g, '')}`} style={{ color: 'var(--color-aqua-400)', textDecoration: 'underline' }}>
                      {DISPLAY_PHONE}
                    </a>
                  </p>
                </div>
              </div>

              <div className="visit-store-detail-item">
                <Phone size={22} color="var(--color-aqua-400)" />
                <div>
                  <h4 style={{ color: '#ffffff', fontWeight: 700 }}>Store Landline</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <a href={`tel:${STORE_LANDLINE.replace(/\s+/g, '')}`} style={{ color: 'var(--color-aqua-400)', textDecoration: 'underline' }}>
                      {STORE_LANDLINE}
                    </a>
                  </p>
                </div>
              </div>

              <div className="visit-store-detail-item">
                <Mail size={22} color="var(--color-aqua-400)" />
                <div>
                  <h4 style={{ color: '#ffffff', fontWeight: 700 }}>Official Email</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <a href={`mailto:${STORE_EMAIL}`} style={{ color: 'var(--color-aqua-400)', textDecoration: 'underline' }}>
                      {STORE_EMAIL}
                    </a>
                  </p>
                </div>
              </div>

              <div className="visit-store-detail-item">
                <Clock size={22} color="var(--color-aqua-400)" />
                <div>
                  <h4 style={{ color: '#ffffff', fontWeight: 700 }}>Operating Hours</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Open 7 Days a Week • Morning to Evening
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <a
                  href={`tel:${DISPLAY_PHONE.replace(/\s+/g, '')}`}
                  className="btn-primary"
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
                >
                  <Phone size={16} />
                  <span>Call Mobile</span>
                </a>
                <a
                  href={`tel:${STORE_LANDLINE.replace(/\s+/g, '')}`}
                  className="btn-primary"
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem', backgroundColor: 'var(--color-ocean-800)', borderColor: 'var(--border-subtle)' }}
                >
                  <Phone size={16} />
                  <span>Call Landline</span>
                </a>
                <a
                  href={`mailto:${STORE_EMAIL}`}
                  className="btn-primary"
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem', backgroundColor: 'var(--color-ocean-800)', borderColor: 'var(--border-subtle)' }}
                >
                  <Mail size={16} />
                  <span>Email Us</span>
                </a>
                <button
                  onClick={() => handleWhatsAppEnquiry('Store Visit & Timings')}
                  className="btn-whatsapp-hero"
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
                >
                  <MessageCircle size={16} />
                  <span>Chat on WhatsApp</span>
                </button>
              </div>
            </div>

            <div className="visit-store-map-col">
              <iframe
                title="Binu's Aquatic and Plants Google Maps Location"
                src="https://maps.google.com/maps?q=Binu's%20Aquatic%20and%20Plants,%20Municipal%20Complex,%207%20%26%208,%20MBT%20Road,%20Navalpur,%20Ranipet,%20Tamil%20Nadu%20632401&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="280"
                style={{ border: 0, borderRadius: 'var(--radius-md)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
