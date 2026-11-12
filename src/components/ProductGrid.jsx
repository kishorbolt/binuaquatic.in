import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Sparkles, MessageCircle, AlertCircle, ChevronLeft, ChevronRight, X, ArrowRight, Box } from 'lucide-react';
import { PRODUCTS, CATEGORIES, groupProductsByBrand, formatPrice } from '../data/products';
import ProductCard from './ProductCard';
import TcLivePlantsShowcase from './TcLivePlantsShowcase';
import { openWhatsApp, createGeneralEnquiryMessage } from '../utils/whatsapp';

const PRODUCTS_PER_PAGE = 20;

function slugifyBrand(brandName) {
  return String(brandName || 'other')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

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

export default function ProductGrid({ onCategoryChange }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const normalizeUrlCategory = (cat) => {
    if (!cat) return null;
    if (cat === 'Filters' || cat === 'Others') return 'Filters & Others';
    if (cat === 'Fish Food' || cat === 'Fish Foods') return 'Birds & Fish Food';
    if (cat.toLowerCase() === 'tc live plants') return 'TC Live Plants';
    if (CATEGORIES.includes(cat)) return cat;
    return null;
  };

  const initialCategory = normalizeUrlCategory(searchParams.get('category')) || 'All Products';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeSearch, setActiveSearch] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(initialPage > 0 ? initialPage : 1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchContainerRef = useRef(null);

  useEffect(() => {
    onCategoryChange?.(selectedCategory);
  }, [selectedCategory, onCategoryChange]);

  // Sync category when URL changes
  useEffect(() => {
    const handleCategoryChange = () => {
      const normalized = normalizeUrlCategory(new URL(window.location).searchParams.get('category'));
      setSelectedCategory(normalized || 'All Products');
      setSelectedBrand('All');
      setCurrentPage(1);
    };
    window.addEventListener('categorychange', handleCategoryChange);
    return () => window.removeEventListener('categorychange', handleCategoryChange);
  }, []);

  useEffect(() => {
    const normalized = normalizeUrlCategory(searchParams.get('category'));
    setSelectedCategory(normalized || 'All Products');
    const urlBrand = searchParams.get('brand');
    setSelectedBrand(urlBrand || 'All');
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
    setSelectedBrand('All');
    setCurrentPage(1);
    if (category === 'TC Live Plants') {
      setSearchQuery('');
      setActiveSearch('');
      searchParams.delete('q');
    }
    if (category === 'All Products') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    searchParams.delete('brand');
    searchParams.delete('page');
    setSearchParams(searchParams, { replace: true });
  };

  // Handle brand filter pill click inside Birds & Fish Food
  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    if (brand === 'All') {
      searchParams.delete('brand');
    } else {
      searchParams.set('brand', brand);
    }
    setSearchParams(searchParams, { replace: true });
  };

  // Live suggestions matching input
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];

    return PRODUCTS.filter((item) => {
      const target = `${item.name} ${item.category} ${item.brand || ''}`;
      return fuzzyMatch(target, q);
    }).slice(0, 6);
  }, [searchQuery]);

  // Execute full search across all categories
  const triggerSearch = (query) => {
    setActiveSearch(query);
    setSelectedBrand('All');
    setCurrentPage(1);
    setShowSuggestions(false);

    if (query.trim()) {
      // Searching queries across all 5 categories
      setSelectedCategory('All Products');
      searchParams.delete('category');
      searchParams.delete('brand');
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
        fuzzyMatch(`${item.name} ${item.category} ${item.brand || ''} ${item.shortDescription}`, q);

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

  // Dynamic Brand Grouping inside Birds & Fish Food & Filters & Others, plus dedicated TC Live Plants view
  const BRAND_GROUPED_CATEGORIES = new Set(['Birds & Fish Food', 'Filters & Others']);
  const isBrandOrganizedView = BRAND_GROUPED_CATEGORIES.has(selectedCategory);
  const isTcLivePlantsView = selectedCategory === 'TC Live Plants';

  const brandGroups = useMemo(() => {
    if (!isBrandOrganizedView) return [];
    return groupProductsByBrand(filteredProducts);
  }, [isBrandOrganizedView, filteredProducts]);

  const displayedBrandGroups = useMemo(() => {
    if (!isBrandOrganizedView) return [];
    if (selectedBrand === 'All') return brandGroups;
    const filteredByBrand = brandGroups.filter((g) => g.brand === selectedBrand);
    return filteredByBrand.length > 0 ? filteredByBrand : brandGroups;
  }, [isBrandOrganizedView, brandGroups, selectedBrand]);

  const effectiveSelectedBrand = useMemo(() => {
    if (!isBrandOrganizedView || selectedBrand === 'All') return 'All';
    return brandGroups.some((g) => g.brand === selectedBrand) ? selectedBrand : 'All';
  }, [isBrandOrganizedView, brandGroups, selectedBrand]);

  const displayedBrandProductsCount = useMemo(() => {
    return displayedBrandGroups.reduce((sum, g) => sum + g.products.length, 0);
  }, [displayedBrandGroups]);

  // Pagination calculation (used for all categories other than brand-organized Birds & Fish Food)
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

          {/* Premium Search & Sort Row (Retail Catalog Categories) */}
          {!isTcLivePlantsView && (
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
          )}
        </div>

        {/* Results Info Bar */}
        {!isTcLivePlantsView && (
        <div className="catalog-info-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>
            {filteredProducts.length > 0 ? (
              isBrandOrganizedView ? (
                <>
                  Showing <strong>{displayedBrandProductsCount}</strong> {displayedBrandProductsCount === 1 ? 'product' : 'products'} across <strong>{displayedBrandGroups.length}</strong> {displayedBrandGroups.length === 1 ? 'brand' : 'brands'}
                </>
              ) : (
                <>Showing <strong>{startIndex}–{endIndex}</strong> of <strong>{filteredProducts.length}</strong> products</>
              )
            ) : (
              '0 products found'
            )}
            {activeSearch && <span> for "<strong>{activeSearch}</strong>"</span>}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-aqua-400)' }}>
            Category: {selectedCategory}
            {isBrandOrganizedView && effectiveSelectedBrand !== 'All' ? ` • Brand: ${effectiveSelectedBrand}` : ''}
          </span>
        </div>
        )}

        {/* Brand Quick-Filter Strip inside Birds & Fish Food */}
        {!isTcLivePlantsView && isBrandOrganizedView && brandGroups.length > 0 && (
          <div className="brand-filter-bar" role="region" aria-label="Filter by Brand">
            <div className="brand-filter-top">
              <span className="brand-filter-label">Browse by Brand ({brandGroups.length})</span>
              {effectiveSelectedBrand !== 'All' && (
                <button
                  type="button"
                  onClick={() => handleBrandSelect('All')}
                  className="brand-reset-inline-btn"
                >
                  Show All Brands
                </button>
              )}
            </div>
            <div className="brand-pills-list" role="tablist" aria-label="Available Brands">
              <button
                type="button"
                role="tab"
                aria-selected={effectiveSelectedBrand === 'All'}
                onClick={() => handleBrandSelect('All')}
                className={`brand-pill-btn ${effectiveSelectedBrand === 'All' ? 'active' : ''}`}
              >
                <span>All Brands</span>
                <span className="brand-pill-count">{filteredProducts.length}</span>
              </button>
              {brandGroups.map((group) => (
                <button
                  type="button"
                  key={group.brand}
                  role="tab"
                  aria-selected={effectiveSelectedBrand === group.brand}
                  onClick={() => handleBrandSelect(group.brand)}
                  className={`brand-pill-btn ${effectiveSelectedBrand === group.brand ? 'active' : ''}`}
                >
                  <span>{group.brand}</span>
                  <span className="brand-pill-count">{group.products.length}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Products Content */}
        {isTcLivePlantsView ? (
          <TcLivePlantsShowcase embedded />
        ) : filteredProducts.length === 0 ? (
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
                  setSelectedBrand('All');
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
        ) : isBrandOrganizedView ? (
          <div className="brand-sections-container">
            {displayedBrandGroups.map((group, groupIdx) => (
              <section
                key={group.brand}
                id={`brand-${slugifyBrand(group.brand)}`}
                className="brand-section-block"
                aria-label={`${group.brand} products`}
              >
                <div className="brand-section-header">
                  <div className="brand-section-heading-group">
                    <h3 className="brand-section-title">{group.brand}</h3>
                    <span className="brand-section-count">
                      {group.products.length} {group.products.length === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>
                  {effectiveSelectedBrand !== 'All' && (
                    <button
                      type="button"
                      onClick={() => handleBrandSelect('All')}
                      className="brand-reset-inline-btn"
                    >
                      View All Brands
                    </button>
                  )}
                </div>

                <div className="products-grid">
                  {group.products.map((product, pIdx) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isPriority={groupIdx === 0 && pIdx < 4}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
}
