import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import ContactSection from '../components/ContactSection';

export default function HomePage() {
  useEffect(() => {
    document.title = "Binu’s Aquatic and Plants | Aquarium Fish, Birds, Plants & Accessories in Ranipet";
  }, []);

  return (
    <main>
      <Hero />
      <ProductGrid />
      <ContactSection />
    </main>
  );
}
