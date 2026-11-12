import React, { useState } from 'react';
import { MessageCircle, Sprout } from 'lucide-react';
import { openWhatsApp, createPlantEnquiryMessage } from '../utils/whatsapp';

export default function TcPlantCard({ plant, isPriority = false }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const altLabel = plant.name || 'TC Live Plant';

  const handleEnquireNow = () => {
    openWhatsApp(createPlantEnquiryMessage(plant));
  };

  return (
    <article className="product-card tc-plant-card" id={plant.id}>
      <div className="product-image-container tc-plant-image-container">
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
          <div className="tc-plant-fallback">
            <Sprout size={28} color="var(--color-emerald-500)" />
            <span className="tc-plant-fallback-title">
              {plant.name || 'TC Live Plant'}
            </span>
          </div>
        ) : (
          <img
            src={plant.image}
            alt={altLabel}
            className="product-card-img tc-plant-card-img"
            loading={isPriority ? 'eager' : 'lazy'}
            fetchPriority={isPriority ? 'high' : 'auto'}
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
      </div>

      <div className="product-body tc-plant-body">
        <div className="product-card-category-row">
          <span className="badge-category badge-plant-category">
            <Sprout size={12} aria-hidden="true" />
            <span>TC Live Plants</span>
          </span>
        </div>

        {plant.name && (
          <h3 className="product-title tc-plant-title" title={plant.name}>
            {plant.name}
          </h3>
        )}

        <div className="tc-plant-actions">
          <button
            type="button"
            onClick={handleEnquireNow}
            className="btn-card-enquire tc-plant-enquire-btn"
            aria-label={
              plant.name
                ? `Enquire Now about ${plant.name} on WhatsApp`
                : 'Enquire Now about this TC Live Plant on WhatsApp'
            }
          >
            <MessageCircle size={16} aria-hidden="true" />
            <span>Enquire Now</span>
          </button>
        </div>
      </div>
    </article>
  );
}

