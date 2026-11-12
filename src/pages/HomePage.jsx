import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import TcLivePlantsShowcase from '../components/TcLivePlantsShowcase';
import ContactSection from '../components/ContactSection';

export default function HomePage() {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState(() => {
    if (typeof window === 'undefined') return 'All Products';
    return new URLSearchParams(window.location.search).get('category') || 'All Products';
  });

  useEffect(() => {
    document.title = "Binu’s Aquatic and Plants | Aquarium Fish, Birds, Plants & Accessories in Ranipet";
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const targetId = location.hash.replace('#', '');
    const timer = setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [location.hash, activeCategory]);

  return (
    <main>
      <Hero />
      <ProductGrid onCategoryChange={setActiveCategory} />
      {activeCategory !== 'TC Live Plants' && <TcLivePlantsShowcase />}
      <ContactSection />
    </main>
  );
}
