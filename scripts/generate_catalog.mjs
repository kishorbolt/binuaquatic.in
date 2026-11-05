import fs from 'fs';
import path from 'path';

const inputDir = path.resolve('public/drive-download-20261102T053719Z-1-001');
const files = fs.readdirSync(inputDir).filter(f => f.toLowerCase().endsWith('.heic'));

function cleanTitle(str) {
  return str
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => {
      if (w.length <= 2 && w.toUpperCase() === w) return w;
      if (['ML', 'GM', 'KG', 'W', 'FW', 'UV', 'LED', 'SP', 'HBL', 'YC', 'WP', 'AQ', 'SB', 'SK', 'RTV'].includes(w.toUpperCase())) {
        return w.toUpperCase();
      }
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ');
}

function parseFilename(file) {
  const base = file.replace(/\.heic$/i, '').trim();
  
  // Extract all occurrences of (digits) followed by rs/RS/Rs
  const priceRegex = /(\d+)\s*(?:rs|RS|Rs)/gi;
  const matches = [...base.matchAll(priceRegex)].map(m => parseInt(m[1], 10));

  // Remove the price suffix from product name
  // Match patterns like:
  // - 125RS_80RS
  // - 150RS _ 90RS
  // - 90RS
  // -650RS_590RS
  let rawName = base
    .replace(/[-_–—]?\s*\d+\s*(?:rs|RS|Rs)\s*[-_–—]?\s*\d*\s*(?:rs|RS|Rs)?\s*$/i, '')
    .replace(/[-_–—]\s*$/, '')
    .trim();

  // If rawName is still generic or empty (like "IMG_8046"), handle gracefully
  let name = cleanTitle(rawName);
  if (!name || name.startsWith('Img_')) {
    name = `Aquarium Store Item (${base})`;
  }

  // Determine pricing rule
  let originalPrice = null;
  let price = null;
  let discountPercent = 0;
  let pricingRule = 'MANUAL_REVIEW';
  let requiresManualReview = false;
  let manualReviewReason = null;

  if (matches.length === 2) {
    const p1 = matches[0];
    const p2 = matches[1];
    if (p1 > p2) {
      originalPrice = p1;
      price = p2;
      discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
      pricingRule = 'TWO_PRICES';
    } else {
      // Ambiguous case like 1174RS_1350RS
      originalPrice = p1;
      price = p2;
      pricingRule = 'MANUAL_REVIEW';
      requiresManualReview = true;
      manualReviewReason = `Ambiguous pricing: first price (₹${p1}) is <= second price (₹${p2}). Flagged for manual review.`;
    }
  } else if (matches.length === 1) {
    price = matches[0];
    originalPrice = null;
    discountPercent = 0;
    pricingRule = 'SINGLE_PRICE';
  } else {
    // 0 or >2 prices
    price = null;
    originalPrice = null;
    pricingRule = 'MANUAL_REVIEW';
    requiresManualReview = true;
    manualReviewReason = matches.length === 0 ? 'No price specified in image filename' : 'More than 2 prices in filename';
  }

  // Determine category
  const lower = (name + ' ' + base).toLowerCase();
  let category = 'Aquarium Accessories';

  if (lower.includes('turtle')) {
    category = 'Turtle Products';
  } else if (lower.includes('plant') || lower.includes('nutrients')) {
    category = 'Aquatic Plants';
  } else if (lower.includes('bird') || lower.includes('lorikeet') || lower.includes('fruit mix') || lower.includes('fruitmix') || lower.includes('hand feeding')) {
    category = 'Bird Food';
  } else if (lower.includes('pedigree') || lower.includes('hamster')) {
    category = 'Other Pet Essentials';
  } else if (
    lower.includes('medicine') || lower.includes('cure') || lower.includes('deworm') ||
    lower.includes('worm out') || lower.includes('stress guard') || lower.includes('stress heal') ||
    lower.includes('stress care') || lower.includes('paracidol') || lower.includes('paraclear') ||
    lower.includes('garlic guard') || lower.includes('breath easy') || lower.includes('algae remover') ||
    lower.includes('snail remover') || lower.includes('k++') || lower.includes('anti stress')
  ) {
    category = 'Fish Medicine';
  } else if (
    lower.includes('food') || lower.includes('flakes') || lower.includes('pellet') ||
    lower.includes('pellets') || lower.includes('worms') || lower.includes('warms') ||
    lower.includes('taiyo') || lower.includes('optimum') || lower.includes('biozym') ||
    lower.includes('drools') || lower.includes('provit') || lower.includes('intan') ||
    lower.includes('royal') || lower.includes('redfin') || lower.includes('osaka') ||
    lower.includes('tetrabites') || lower.includes('humpy head') || lower.includes('champion') ||
    lower.includes('cichlid') || lower.includes('flowerhorn') || lower.includes('arowana')
  ) {
    category = 'Fish Food';
  } else if (
    lower.includes('filter') || lower.includes('pump') || lower.includes('wave maker') ||
    lower.includes('heater') || lower.includes('uvlamp') || lower.includes('sunlight') ||
    lower.includes('mist maker') || lower.includes('m-seal') || lower.includes('salt') ||
    lower.includes('sobo') || lower.includes('sunsun') || lower.includes('boyu') ||
    lower.includes('calci +') || lower.includes('breeder')
  ) {
    category = 'Aquarium Accessories';
  }

  // Create clean slug
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const id = `binu-${slug}`;

  // Image paths
  const image = `/products/${base}.webp`;
  const thumbnail = `/products/thumbs/${base}.webp`;
  const originalFile = `/drive-download-20261102T053719Z-1-001/${file}`;

  return {
    id,
    slug,
    name,
    rawFilename: file,
    category,
    originalPrice,
    price,
    discountPercent,
    pricingRule,
    requiresManualReview,
    manualReviewReason,
    availability: requiresManualReview ? 'Confirm on WhatsApp' : 'In Stock',
    isVerified: !requiresManualReview,
    image,
    thumbnail,
    originalImage: originalFile,
    shortDescription: `${name} available at Binu’s Aquatic and Plants retail store in Ranipet. Authentic store-verified stock.`,
    description: `High-quality ${name.toLowerCase()} sourced directly for aquarium and pet enthusiasts. Available for convenient in-store pickup at our Ranipet retail outlet or local delivery with direct WhatsApp confirmation.`,
    features: [
      'Authentic store photograph from Ranipet retail inventory',
      pricingRule === 'TWO_PRICES' ? `Special Store Offer: ₹${price} (MRP: ₹${originalPrice}, ${discountPercent}% OFF)` : (price ? `Store Price: ₹${price}` : 'Price confirmed on request'),
      'Direct WhatsApp order assistance & stock verification',
      'Local Ranipet pickup & safe packaging'
    ],
    sku: `BINU-${slug.slice(0, 10).toUpperCase()}`
  };
}

export function generateAllProducts() {
  const discoveredProducts = files.map(parseFilename);
  return discoveredProducts;
}

