import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Sparkles, MessageCircle, AlertCircle, ChevronLeft, ChevronRight, X, ArrowRight, Box } from 'lucide-react';
import { PRODUCTS, CATEGORIES, formatPrice } from '../data/products';
import ProductCard from './ProductCard';
import { openWhatsApp, createGeneralEnquiryMessage } from '../utils/whatsapp';

const PRODUCTS_PER_PAGE = 20;

// Lightweight fuzzy match helper
function fuzzyMatch(str, query) {
  if (!query) return true;
  const s = str.toLowerCase();
  const q = query.toLowerCase().trim();
  if (s.includes(q)) return true;

  // Check word-by-word match
  const words = q.split(/\s+/).filter(Boolean);
  return words.every(word => s.includes(word));
}

export default function ProductGrid() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialCategory = searchParams.get('category') || 'All Products';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeSearch, setActiveSearch] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(initialPage > 0 ? initialPage : 1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchContainerRef = useRef(null);

  // Sync category when URL changes
  useEffect(() => {
    const handleCategoryChange = () => {
      const urlCat = new URL(window.location).searchParams.get('category');
      if (urlCat) {
        if (urlCat === 'Filters' || urlCat === 'Others') {
          setSelectedCategory('Filters & Others');
        } else if (urlCat === 'Fish Food' || urlCat === 'Fish Foods') {
          setSelectedCategory('Birds & Fish Food');
        } else if (CATEGORIES.includes(urlCat)) {
          setSelectedCategory(urlCat);
        }
        setCurrentPage(1);
      }
    };
    window.addEventListener('categorychange', handleCategoryChange);
    return () => window.removeEventListener('categorychange', handleCategoryChange);
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat === 'Filters' || cat === 'Others') {
      setSelectedCategory('Filters & Others');
    } else if (cat === 'Fish Food' || cat === 'Fish Foods') {
      setSelectedCategory('Birds & Fish Food');
    } else if (cat && CATEGORIES.includes(cat)) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Click outside listener for search suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle category tab click
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    if (category === 'All Products') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    searchParams.delete('page');
    setSearchParams(searchParams, { replace: true });
  };

  // Live suggestions matching input
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];

    return PRODUCTS.filter((item) => {
      const target = `${item.name} ${item.category}`;
      return fuzzyMatch(target, q);
    }).slice(0, 6);
  }, [searchQuery]);

  // Execute full search across all categories
  const triggerSearch = (query) => {
    setActiveSearch(query);
    setCurrentPage(1);
    setShowSuggestions(false);

    if (query.trim()) {
      // Searching queries across all 5 categories
      setSelectedCategory('All Products');
      searchParams.delete('category');
      searchParams.set('q', query.trim());
    } else {
      searchParams.delete('q');
    }
    searchParams.delete('page');
    setSearchParams(searchParams, { replace: true });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      triggerSearch(searchQuery);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    setShowSuggestions(false);
    searchParams.delete('q');
    searchParams.delete('page');
    setSearchParams(searchParams, { replace: true });
  };

  const handleSuggestionClick = (slug) => {
    setShowSuggestions(false);
    navigate(`/products/${slug}`);
  };

  // Filtered & Sorted Products for Grid
  const filteredProducts = useMemo(() => {
    let result = PRODUCTS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All Products' ||
        item.category === selectedCategory ||
        (selectedCategory === 'Birds & Fish Food' && (item.category === 'Birds & Fish Food' || item.category === 'Fish Foods' || item.category === 'Fish Food')) ||
        (selectedCategory === 'Filters & Others' && (item.category === 'Filters' || item.category === 'Others' || item.category === 'Filters & Others'));

      const q = activeSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        fuzzyMatch(`${item.name} ${item.category} ${item.shortDescription}`, q);

      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'default') {
      if (selectedCategory !== 'Tanks') {
        result.sort((a, b) => {
          const aPriced = typeof a.price === 'number' && a.price > 0 && !a.isEnquiryOnly ? 1 : 0;
          const bPriced = typeof b.price === 'number' && b.price > 0 && !b.isEnquiryOnly ? 1 : 0;
          return bPriced - aPriced;
        });
      }
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => {
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return a.price - b.price;
      });
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => {
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return b.price - a.price;
      });
    } else if (sortBy === 'discount-desc') {
      result.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [selectedCategory, activeSearch, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) || 1;
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedProducts = useMemo(() => {
    const startIdx = (validPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIdx, startIdx + PRODUCTS_PER_PAGE);
  }, [filteredProducts, validPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (newPage === 1) {
      searchParams.delete('page');
    } else {
      searchParams.set('page', String(newPage));
    }
    setSearchParams(searchParams, { replace: true });

    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const startIndex = (validPage - 1) * PRODUCTS_PER_PAGE + 1;
  const endIndex = Math.min(validPage * PRODUCTS_PER_PAGE, filteredProducts.length);

  return (
    <section className="catalog-section" id="products">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">Authentic Store Inventory</span>
          <h2 className="section-title">Shop Our Retail Collection</h2>
          <p className="section-desc">
            Explore verified fish feeds, aquarium treatments, and maintenance equipment from Binu's Aquatic and Plants retail store in Ranipet. Available for in-store pickup or WhatsApp orders.
          </p>
        </div>

        {/* Catalog Control Bar */}
        <div className="catalog-controls">
          {/* Category Tabs: 6 Main Store Categories */}
          <div className="category-tabs" role="tablist" aria-label="Product Categories">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                role="tab"
                aria-selected={selectedCategory === category}
                onClick={() => handleCategorySelect(category)}
                className={`category-tab-btn ${selectedCategory === category ? 'active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Premium Search & Sort Row */}
          <div className="search-and-sort">
            {/* Search Input Container with Live Suggestions */}
            <div className="search-input-wrapper-advanced" ref={searchContainerRef}>
              <div className="search-field-box">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2) setShowSuggestions(true);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products by exact or partial name..."
                  className="search-input"
                  aria-label="Search products"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="search-clear-btn"
                    aria-label="Clear search query"
                    type="button"
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  onClick={() => triggerSearch(searchQuery)}
                  className="search-submit-btn"
                  aria-label="Search"
                  type="button"
                >
                  Search
                </button>
              </div>

              {/* Live Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="search-suggestions-dropdown" role="listbox">
                  <div className="suggestions-header">
                    <span>Matching Products ({suggestions.length})</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Press Enter to view all</span>
                  </div>
                  {suggestions.map((item) => {
                    const isPriced = typeof item.price === 'number' && item.price > 0 && !item.isEnquiryOnly;
                    return (
                      <div
                        key={item.id}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(item.slug)}
                        role="option"
                        tabIndex={0}
                      >
                        <img
                          src={item.thumbnail || item.image}
                          alt={item.name}
                          className="suggestion-thumb"
                          loading="lazy"
                        />
                        <div className="suggestion-details">
                          <span className="suggestion-name">{item.name}</span>
                          <span className="suggestion-cat">{item.category}</span>
                        </div>
                        <div className="suggestion-price-col">
                          {isPriced ? (
                            <span className="suggestion-price">{formatPrice(item.price)}</span>
                          ) : (
                            <span className="suggestion-enquire-tag">Enquire</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="sort-wrapper">
              <label htmlFor="sort-select" className="sort-label">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="default">Featured</option>
                <option value="discount-desc">Biggest Discount (% OFF)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info Bar */}
        <div className="catalog-info-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>
            {filteredProducts.length > 0 ? (
              <>Showing <strong>{startIndex}–{endIndex}</strong> of <strong>{filteredProducts.length}</strong> products</>
            ) : (
              '0 products found'
            )}
            {activeSearch && <span> for "<strong>{activeSearch}</strong>"</span>}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-aqua-400)' }}>
            Category: {selectedCategory}
          </span>
        </div>

        {/* Main Products Grid */}
        {paginatedProducts.length > 0 ? (
          <>
            <div className="products-grid">
              {paginatedProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} isPriority={idx < 4} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav className="pagination-bar" aria-label="Catalog Pagination">
                <button
                  onClick={() => handlePageChange(validPage - 1)}
                  disabled={validPage <= 1}
                  className="pagination-btn pagination-prev"
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={18} />
                  <span>Previous</span>
                </button>

                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - validPage) <= 2)
                    .map((page, idx, arr) => {
                      const showEllipsisBefore = idx > 0 && page - arr[idx - 1] > 1;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsisBefore && <span className="pagination-ellipsis">…</span>}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`pagination-num-btn ${validPage === page ? 'active' : ''}`}
                            aria-label={`Page ${page}`}
                            aria-current={validPage === page ? 'page' : undefined}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  onClick={() => handlePageChange(validPage + 1)}
                  disabled={validPage >= totalPages}
                  className="pagination-btn pagination-next"
                  aria-label="Next Page"
                >
                  <span>Next</span>
                  <ChevronRight size={18} />
                </button>
              </nav>
            )}
          </>
        ) : (
          /* Empty Search / Filter State */
          <div className="empty-catalog-state">
            <AlertCircle className="empty-state-icon" size={36} />
            <h3 className="empty-state-title">No Matching Products Found</h3>
            <p className="empty-state-text">
              We could not find any products matching "{activeSearch}" under {selectedCategory}. Looking for a specific feed, pump, or medicine? Chat with our Ranipet store team directly!
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  clearSearch();
                  setSelectedCategory('All Products');
                  setCurrentPage(1);
                }}
                className="btn-primary"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
              >
                Reset Catalog Filters
              </button>
              <button
                onClick={() => openWhatsApp(createGeneralEnquiryMessage(`Enquiry for: ${activeSearch || selectedCategory}`))}
                className="btn-whatsapp-hero"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
              >
                <MessageCircle size={18} />
                <span>Ask on WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
