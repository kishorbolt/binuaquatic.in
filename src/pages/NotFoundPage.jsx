import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, MessageCircle, ArrowLeft } from 'lucide-react';
import { openWhatsApp, createGeneralEnquiryMessage } from '../utils/whatsapp';

export default function NotFoundPage({ message }) {
  useEffect(() => {
    document.title = "Page Not Found | Binu’s Aquatic and Plants";
  }, []);

  return (
    <main className="container" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem' }}>
      <div className="empty-catalog-state" style={{ maxWidth: '580px', width: '100%' }}>
        <AlertCircle size={48} color="var(--color-aqua-400)" style={{ marginBottom: '1rem' }} />
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
          404 - Page Not Found
        </h1>
        <p className="empty-state-text">
          {message || "We could not find the page or product you were looking for. It may have moved or the link might be incomplete."}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
          <Link to="/" className="btn-primary" style={{ fontSize: '0.92rem' }}>
            <Home size={18} />
            <span>Return to Homepage</span>
          </Link>

          <button
            onClick={() => openWhatsApp(createGeneralEnquiryMessage('Help finding product or page on website'))}
            className="btn-whatsapp-hero"
            style={{ fontSize: '0.92rem' }}
          >
            <MessageCircle size={18} />
            <span>Ask on WhatsApp</span>
          </button>
        </div>
      </div>
    </main>
  );
}
