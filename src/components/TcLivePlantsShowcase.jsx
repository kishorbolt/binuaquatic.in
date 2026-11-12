import React, { useMemo, useState } from 'react';
import { Search, Sprout, MessageCircle, X, AlertCircle } from 'lucide-react';
import { TC_LIVE_PLANTS } from '../data/tcLivePlants';
import { openWhatsApp, createPlantEnquiryMessage } from '../utils/whatsapp';
import TcPlantCard from './TcPlantCard';

export default function TcLivePlantsShowcase({ embedded = false }) {
  const [plantQuery, setPlantQuery] = useState('');

  const filteredPlants = useMemo(() => {
    const q = plantQuery.trim().toLowerCase();
    if (!q) return TC_LIVE_PLANTS;
    const words = q.split(/\s+/).filter(Boolean);
    return TC_LIVE_PLANTS.filter((plant) => {
      const target = `${plant.name || ''} ${plant.filename}`.toLowerCase();
      return words.every((word) => target.includes(word));
    });
  }, [plantQuery]);

  const content = (
    <>
      {!embedded && (
        <div className="section-header tc-plants-header">
          <span className="section-tag tc-plants-tag">
            <Sprout size={14} aria-hidden="true" />
            <span>Fresh Tissue Culture Collection</span>
          </span>
          <h2 className="section-title">TC Live Plants</h2>
          <p className="section-desc">
            Pest-free, algae-free lab-grown tissue culture live aquarium plants from our store collection. Enquire directly on WhatsApp for availability and aquascaping guidance.
          </p>
        </div>
      )}

      {embedded && (
        <div className="tc-plants-embedded-intro">
          <div className="tc-plants-embedded-badge-row">
            <span className="section-tag tc-plants-tag" style={{ marginBottom: 0 }}>
              <Sprout size={14} aria-hidden="true" />
              <span>TC Live Plants</span>
            </span>
          </div>
          <p className="tc-plants-embedded-subtitle">
            Fresh tissue culture aquarium plants ready for hobbyists and aquascapers. Tap <strong>Enquire Now</strong> on any plant to connect directly on WhatsApp.
          </p>
        </div>
      )}

      <div className="tc-plants-toolbar">
        <div className="tc-plants-count-info">
          <span>
            Showing <strong>{filteredPlants.length}</strong>
            {plantQuery.trim() ? ` of ${TC_LIVE_PLANTS.length}` : ''} tissue culture{' '}
            {filteredPlants.length === 1 ? 'plant' : 'plants'}
          </span>
        </div>

        <div className="tc-plants-search-box">
          <Search className="tc-plants-search-icon" size={16} aria-hidden="true" />
          <input
            type="text"
            value={plantQuery}
            onChange={(e) => setPlantQuery(e.target.value)}
            placeholder="Filter TC Live Plants by name..."
            className="tc-plants-search-input"
            aria-label="Filter TC Live Plants by name"
          />
          {plantQuery && (
            <button
              type="button"
              onClick={() => setPlantQuery('')}
              className="tc-plants-search-clear"
              aria-label="Clear plant search"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {filteredPlants.length === 0 ? (
        <div className="empty-catalog-state">
          <AlertCircle className="empty-state-icon" size={36} />
          <h3 className="empty-state-title">No Matching TC Live Plants</h3>
          <p className="empty-state-text">
            {plantQuery.trim()
              ? `No TC Live Plants matched "${plantQuery.trim()}". Reset the filter or ask our team directly on WhatsApp.`
              : 'Ask our Ranipet store team directly on WhatsApp for currently stocked tissue culture plants.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {plantQuery.trim() && (
              <button
                type="button"
                onClick={() => setPlantQuery('')}
                className="btn-primary"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
              >
                Show All TC Live Plants
              </button>
            )}
            <button
              type="button"
              onClick={() => openWhatsApp(createPlantEnquiryMessage(plantQuery.trim() || null))}
              className="btn-whatsapp-hero"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
            >
              <MessageCircle size={18} />
              <span>Enquire on WhatsApp</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="products-grid tc-plants-grid">
          {filteredPlants.map((plant, idx) => (
            <TcPlantCard
              key={plant.id}
              plant={plant}
              isPriority={idx < 4}
            />
          ))}
        </div>
      )}
    </>
  );

  if (embedded) {
    return (
      <div className="tc-plants-embedded" aria-label="TC Live Plants Catalog">
        {content}
      </div>
    );
  }

  return (
    <section className="tc-plants-section" id="tc-live-plants" aria-label="TC Live Plants">
      <div className="container">{content}</div>
    </section>
  );
}

