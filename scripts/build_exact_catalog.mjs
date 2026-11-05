import fs from 'fs';
import path from 'path';

const inputDir = path.resolve('public/drive-download-20261102T053719Z-1-001');
const files = fs.readdirSync(inputDir).filter(f => f.toLowerCase().endsWith('.heic'));

/**
 * Strict 5 official categories:
 * Fish Foods | Fish Medicines | Others | Tanks | Motors
 */
export const CATEGORIES = [
  'All Products',
  'Fish Foods',
  'Fish Medicines',
  'Others',
  'Tanks',
  'Motors'
];

/**
 * Extracts exact clean product name strictly preserving spelling, casing,
 * and legitimate numbers (e.g. 500G, 14 DAYS, 10ML, 250ML, SP-1000A) while stripping
 * trailing price suffixes (e.g. ' - 125RS_80RS', ' - 150RS _ 90RS', ' - 60RS', ' -650RS_590RS').
 */
export function extractCleanName(filename) {
  const base = filename.replace(/\.heic$/i, '').trim();

  let clean = base
    .replace(/\s*[-_–—]\s*\d+\s*(?:rs|RS|Rs)\s*[-_–—_]\s*\d+\s*(?:rs|RS|Rs)\s*$/i, '')
    .replace(/\s*[-_–—]\s*\d+\s*(?:rs|RS|Rs)\s*$/i, '')
    .replace(/\s*[-_–—]\s*$/i, '')
    .trim();

  return clean;
}

/**
 * Categorize into strictly the 5 specified categories:
 * Fish Foods | Fish Medicines | Others | Tanks | Motors
 *
 * NOTE: Pet Foods category is completely removed.
 * ALL bird foods, dog foods, pet supplements, hamster food, and turtle foods
 * are now classified under Fish Foods.
 */
export function getCategory(cleanName, filename) {
  const n = (cleanName + ' ' + filename).toUpperCase();

  // 1. Motors (water pumps, filter motors, wave makers, air pumps)
  if (
    n.includes('AIRPUMP') || n.includes('AIR PUMP') || n.includes('WAVE MAKER') ||
    n.includes('SP-1000A') || n.includes('WP1300A') || n.includes('WP-1200F') ||
    n.includes('WP-618H') || n.includes('WP50-M') || n.includes('AQ-16H') ||
    n.includes('SK-03') || n.includes('HBL-301') || n.includes('CT-201')
  ) {
    return 'Motors';
  }

  // 2. Fish Medicines (medicines, treatments, water conditioners, bacteria)
  // Note: Garlic Guard (100ML and 250ML) strictly remains under Fish Medicines
  if (
    n.includes('MEDICINE') || n.includes('CURE') || n.includes('DEWORM') ||
    n.includes('WORM OUT') || n.includes('STRESS GUARD') || n.includes('STRESS HEAL') ||
    n.includes('STRESS CARE') || n.includes('ANTI STRESS') || n.includes('PARACIDOL') ||
    n.includes('PARACLEAR') || n.includes('GARLIC GUARD') || n.includes('BREATH EASY') ||
    n.includes('ALGAE REMOVER') || n.includes('SNAIL REMOVER') || n.includes('K++') ||
    n.includes('MICROBAC') || n.includes('AQUA CLEAR') || n.includes('WATER CLEAR') ||
    n.includes('NITRIFYING BACTERIA') || n.includes('BETTA CARE') || n.includes('RID ALL')
  ) {
    return 'Fish Medicines';
  }

  // 3. Fish Foods (aquarium fish feeds, flakes, pellets, plus bird feeds, dog food, turtle food, pet supplements)
  if (
    n.includes('PETSLIFE') || n.includes('PETS LIFE') ||
    n.includes('PEDIGREE') ||
    n.includes('BIRD') || n.includes('BIRDS') ||
    n.includes('LORIKEET') ||
    n.includes('HAMSTER') ||
    n.includes('CALCI +') ||
    n.includes('TURTLE FOOD') ||
    (n.includes('FOOD') && !n.includes('PLANT FOOD')) ||
    n.includes('FLAKES') || n.includes('PELLET') || n.includes('PELLETS') ||
    n.includes('WORMS') || n.includes('WARMS') || n.includes('FAUX WORMS') ||
    n.includes('TAIYO') || n.includes('OPTIMUM') || n.includes('BIOZYM') ||
    n.includes('DROOLS') || n.includes('PROVIT') || n.includes('INTAN') ||
    n.includes('ROYAL') || n.includes('REDFIN') || n.includes('OSAKA') ||
    n.includes('TETRABITES') || n.includes('HUMPY HEAD') || n.includes('CHAMPION') ||
    n.includes('OF AR-G2') || n.includes('OF BF-G1') || n.includes('OF MF-G1') ||
    n.includes('FLOWER HORN') || n.includes('FLOWERHORN') || n.includes('AROWANA') ||
    n.includes('RED PARROT') || n.includes('OSSAR') || n.includes('CICHLID') ||
    n.includes('GUPPY PELLETS') || n.includes('BETTA BRIGHT') || n.includes('KOI FOOD') ||
    n.includes('DISCUS') || n.includes('PORPOISE')
  ) {
    return 'Fish Foods';
  }

  // 4. Others: Remaining genuine miscellaneous products (Breeder box, plant nutrients, heaters, lamps, sponge filters, sealants, unlabelled)
  return 'Others';
}

function parseProduct(filename, index) {
  const base = filename.replace(/\.heic$/i, '').trim();
  const name = extractCleanName(filename);
  const category = getCategory(name, filename);

  // Extract prices
  const priceRegex = /(\d+)\s*(?:rs|RS|Rs)/gi;
  const matches = [...base.matchAll(priceRegex)].map(m => parseInt(m[1], 10));

  let originalPrice = null;
  let price = null;
  let discountPercent = 0;
  let pricingRule = 'MANUAL_REVIEW';
  let requiresManualReview = false;
  let manualReviewReason = null;
  let isEnquiryOnly = false;

  if (matches.length === 2) {
    // Both original and offer price exist
    // Original = higher (MRP), Offer = lower (Discounted selling rate)
    const orig = Math.max(matches[0], matches[1]);
    const offer = Math.min(matches[0], matches[1]);
    originalPrice = orig;
    price = offer;
    discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
    pricingRule = 'TWO_PRICES';
    isEnquiryOnly = false;
  } else if (matches.length === 1) {
    price = matches[0];
    originalPrice = null;
    discountPercent = 0;
    pricingRule = 'SINGLE_PRICE';
    isEnquiryOnly = false;
  } else {
    // 0 or >2 prices
    price = null;
    originalPrice = null;
    pricingRule = 'MANUAL_REVIEW';
    requiresManualReview = true;
    isEnquiryOnly = true;
    manualReviewReason = matches.length === 0 ? 'No price specified in filename. Enquire on WhatsApp for current rate.' : 'Multiple price tags in filename. Enquire on WhatsApp.';
  }

  if (name.toUpperCase().startsWith('IMG_')) {
    requiresManualReview = true;
    isEnquiryOnly = true;
    manualReviewReason = manualReviewReason || 'Product image without label. Enquire on WhatsApp for details.';
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `item-${index + 1}`;

  const id = `binu-${slug}-${index + 1}`;
  const image = `/products/${base}.webp`;
  const thumbnail = `/products/thumbs/${base}.webp`;
  const originalFile = `/drive-download-20261102T053719Z-1-001/${filename}`;

  return {
    id,
    slug: `${slug}-${index + 1}`,
    name,
    rawFilename: filename,
    category,
    originalPrice,
    price,
    discountPercent,
    pricingRule,
    requiresManualReview,
    manualReviewReason,
    isEnquiryOnly,
    isTank: false,
    availability: isEnquiryOnly ? 'Enquire on WhatsApp' : 'In Stock',
    isVerified: !requiresManualReview,
    image,
    thumbnail,
    originalImage: originalFile,
    shortDescription: `${name} available at Binu’s Aquatic and Plants retail store in Ranipet. Verified physical store inventory.`,
    description: `${name}. Genuine inventory item photographed at Binu’s Aquatic and Plants, Navalpur, Ranipet. Available for in-store pickup or WhatsApp ordering.`,
    features: [
      'Original physical store inventory item',
      pricingRule === 'TWO_PRICES' ? `Special Offer: ₹${price} (MRP: ₹${originalPrice}, ${discountPercent}% OFF)` : (price ? `Store Price: ₹${price}` : 'Price available on WhatsApp enquiry'),
      'Direct order and instant WhatsApp stock confirmation',
      'Store pickup at Ranipet outlet'
    ],
    sku: `BINU-${(slug.slice(0, 8) + '-' + (index + 1)).toUpperCase()}`
  };
}

/**
 * All 34 verified tanks extracted from "binu tanks.pdf".
 * Strictly extract ONLY:
 * 1. Exact tank name
 * 2. Exact tank size/dimensions
 * Zero prices, zero discount badges, WhatsApp enquiry only.
 */
const TANK_DEFINITIONS = [
  { page: 1, name: "JQYY 350X210X230", tankSize: "350 × 210 × 230 mm", notes: "Curved front glass aquarium with JQYY retail box packaging." },
  { page: 2, name: "JQYY 300X180X210", tankSize: "300 × 180 × 210 mm", notes: "Curved front glass aquarium with JQYY retail box packaging." },
  { page: 3, name: "SUNSUN AQUASSTAR 410A", tankSize: "41.0 × 25.0 × 25.0 cm", notes: "Curved front glass aquarium, Sunsun Aquasstar series." },
  { page: 4, name: "SUNSUN AQUASSTAR MODEL: 380A", tankSize: "38.0 × 25.0 × 30.0 cm", notes: "Curved front glass aquarium, Sunsun Aquasstar Model 380A." },
  { page: 5, name: "SUNSUN AQUASSTAR MODEL: 300A", tankSize: "30.0 × 21.0 × 23.0 cm", notes: "Curved front glass aquarium, Sunsun Aquasstar Model 300A." },
  { page: 6, name: "SUNSUN AQUASSTAR MODEL: 250A", tankSize: "25.0 × 20.0 × 15.0 cm", notes: "Curved front glass aquarium, Sunsun Aquasstar Model 250A." },
  { page: 7, name: "CUBE TOWER U-TANK", tankSize: "30 × 30 × 60 cm (8 MM Glass)", notes: "Tall vertical cube tower U-tank, 8mm glass thickness." },
  { page: 8, name: "CUBE TOWER U-TANK (Photo View)", tankSize: "30 × 30 × 60 cm (Enquire for specifications)", notes: "Tall vertical tower U-tank clear film wrap view." },
  { page: 9, name: "U-TANK 30x20x30", tankSize: "30 × 20 × 30 cm", notes: "Curved front seamless glass U-Tank." },
  { page: 10, name: "JI QING YOU YU (JQYY)", tankSize: "25 × 25 × 25 cm", notes: "Cube glass aquarium, JQYY brand." },
  { page: 11, name: "OP Ocean Pearl Curved Aquarium", tankSize: "Enquire on WhatsApp for exact size", notes: "Hooded curved front glass aquarium with internal filter system." },
  { page: 12, name: "NEMO Aquarium (Filter NF-600)", tankSize: "Enquire on WhatsApp for exact size", notes: "Hooded aquarium with NEMO NF-600 internal filter system." },
  { page: 13, name: "Curved Glass Aquarium 500X270X300", tankSize: "500 × 270 × 300 mm", notes: "Curved glass aquarium with textured stone-finish hood." },
  { page: 14, name: "MINI TOWER U-TANK", tankSize: "18 × 20 × 48 cm (5 MM Glass)", notes: "Mini tower vertical U-tank, 5mm glass thickness." },
  { page: 15, name: "Cabinet Terrarium / Aquarium with LED Light", tankSize: "Enquire on WhatsApp for exact size", notes: "Tall black cabinet setup with 20W aquatic LED plant light." },
  { page: 16, name: "NEMO Hooded Curved Aquarium", tankSize: "Enquire on WhatsApp for exact size", notes: "Champagne/gold ventilated hood with 3-in-1 internal filter." },
  { page: 17, name: "Cylindrical Desktop Vase Tank with Lamp", tankSize: "Enquire on WhatsApp for exact size", notes: "Tabletop cylindrical glass tank with curved LED gooseneck spotlight." },
  { page: 18, name: "Bluepet® Cabinet Aquarium", tankSize: "Enquire on WhatsApp for exact size", notes: "Curved front seamless glass tank on two-door woodgrain cabinet." },
  { page: 19, name: "Bluepet® PV-480", tankSize: "48.0 × 30.0 × 32.0 cm", notes: "Blue hood and base frame, Bluepet PV-480 series." },
  { page: 20, name: "JQYY 180X130X180", tankSize: "180 × 130 × 180 mm", notes: "Mini ecological glass tank, JQYY brand." },
  { page: 21, name: "Cabinet Aquarium (Blue Hood & Trim)", tankSize: "Enquire on WhatsApp for exact size", notes: "Two-door dark wood cabinet with gold handles, blue hood & base trim." },
  { page: 22, name: "Nano Cabinet Aquarium (Red Hood)", tankSize: "Enquire on WhatsApp for exact size", notes: "Single-door dark wood cabinet with lock, red hood & base trim." },
  { page: 23, name: "Nano Cabinet Aquarium (Neon Green Hood)", tankSize: "Enquire on WhatsApp for exact size", notes: "Single-door dark wood cabinet with lock, neon green hood & base trim." },
  { page: 24, name: "OCEAN WORLD Cabinet Aquarium", tankSize: "Enquire on WhatsApp for exact size", notes: "Cream hood with OCEAN WORLD badge, single-door wood cabinet." },
  { page: 25, name: "Cabinet Aquarium (Black Hood & Trim)", tankSize: "Enquire on WhatsApp for exact size", notes: "Two-door dark wood cabinet with vertical gold handles, black hood." },
  { page: 26, name: "C.A.Y Luxury Cabinet Aquarium", tankSize: "Enquire on WhatsApp for exact size", notes: "Mahogany finish canopy and matching two-door cabinet, C.A.Y badge." },
  { page: 27, name: "SUNSUN HW-304A Outside Filter", tankSize: "Outside Filter Accessory (Enquire for specifications)", notes: "Outside multi-layer canister filter unit featured in tank PDF." },
  { page: 28, name: "Rimless Curved Glass Nano Cube", tankSize: "Enquire on WhatsApp for exact size", notes: "Seamless ultra-clear curved front vertical corners glass cube." },
  { page: 29, name: "NEMO AQUA PRODUCTS AT-320 (RX)", tankSize: "Model AT-320 (Nominal 320 mm width)", notes: "Nemo Aqua Products corrugated box, model AT-320 RX." },
  { page: 30, name: "NEMO 400 Mini Aquarium", tankSize: "30 Litres (400 Series)", notes: "Nemo 400 series full color retail box, 30L maximum volume." },
  { page: 31, name: "NEMO 520 Mini Aquarium (ECO RY)", tankSize: "60 Litres (520 Series)", notes: "Nemo 520 series full color retail box, 60L maximum volume, ECO RY." },
  { page: 32, name: "nubios NANO AQUARIUM KIT NB-B20", tankSize: "20 × 20 × 27 cm (11 Litres / 3.0 Gallons)", notes: "Nubios Nano Aquarium Kit NB-B20 retail box, 11L capacity." },
  { page: 33, name: "Nano Aquarium with HB-230 Submersible Pump", tankSize: "Enquire on WhatsApp for exact size (Pump: 5W, 300L/H)", notes: "Nano curved front aquarium with HB-230 submersible pump included." },
  { page: 34, name: "White Nano Curved Aquarium", tankSize: "Enquire on WhatsApp for exact size", notes: "White canopy nano tank with feeding slot and internal pump." }
];

function createTankProduct(tank, index) {
  const pagePad = String(tank.page).padStart(2, '0');
  const slug = `tank-page-${pagePad}-${tank.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
  const id = `binu-tank-${pagePad}`;
  const image = `/products/tanks/page_${pagePad}.webp`;
  const thumbnail = `/products/tanks/thumbs/page_${pagePad}.webp`;
  const originalFile = `/binu tanks.pdf - Page ${tank.page}`;

  return {
    id,
    slug,
    name: tank.name,
    rawFilename: `binu tanks.pdf (Page ${tank.page})`,
    category: "Tanks",
    tankSize: tank.tankSize,
    originalPrice: null,
    price: null,
    discountPercent: 0,
    pricingRule: "ENQUIRY_ONLY",
    requiresManualReview: tank.tankSize.includes('Enquire') || tank.tankSize.includes('Unspecified'),
    manualReviewReason: tank.tankSize.includes('Enquire') ? "Dimensions unstated on image. Direct WhatsApp enquiry." : null,
    isEnquiryOnly: true,
    isTank: true,
    availability: "Enquire on WhatsApp",
    isVerified: true,
    image,
    thumbnail,
    originalImage: originalFile,
    shortDescription: `Tank Name: ${tank.name}. Size: ${tank.tankSize}. Verified physical store inventory from Binu's Aquatic and Plants tank catalogue.`,
    description: `Tank Name: ${tank.name}\nSize: ${tank.tankSize}\n\n${tank.notes}\n\nGenuine inventory photographed at Binu’s Aquatic and Plants, Navalpur, Ranipet. Available for in-store pickup or WhatsApp ordering.`,
    features: [
      `Tank Name: ${tank.name}`,
      `Size: ${tank.tankSize}`,
      "Genuine physical store inventory",
      "Direct WhatsApp enquiry and custom sizing assistance",
      "Store pickup at Ranipet outlet"
    ],
    sku: `BINU-TANK-${pagePad}`
  };
}

const generalProducts = files.map(parseProduct);
const tankProducts = TANK_DEFINITIONS.map(createTankProduct);
const allProducts = [...generalProducts, ...tankProducts];

console.log('========================================');
console.log('MASTER CATALOGUE UPDATE:');
console.log(`General inventory files discovered: ${files.length}`);
console.log(`Tanks extracted from PDF: ${tankProducts.length}`);
console.log(`Total products added to catalogue: ${allProducts.length}`);
console.log(`Products with valid prices (Add to Cart): ${allProducts.filter(p => !p.isEnquiryOnly).length}`);
console.log(`- Two prices (Original & Offer): ${allProducts.filter(p => p.pricingRule === 'TWO_PRICES').length}`);
console.log(`- Single price: ${allProducts.filter(p => p.pricingRule === 'SINGLE_PRICE').length}`);
console.log(`Products with no price / enquiry only (Enquire Now): ${allProducts.filter(p => p.isEnquiryOnly).length}`);

const categoryBreakdown = {};
CATEGORIES.filter(c => c !== 'All Products').forEach(c => {
  categoryBreakdown[c] = allProducts.filter(p => p.category === c).length;
});
console.log('Category breakdown:', categoryBreakdown);
console.log('========================================');

// Save src/data/products.json
fs.writeFileSync(path.resolve('src/data/products.json'), JSON.stringify(allProducts, null, 2), 'utf-8');
console.log('Updated src/data/products.json successfully.');

// Write src/data/products.js
const productsJsContent = `/**
 * Binu’s Aquatic and Plants - Product Catalogue
 * 
 * Strict exact names, verified filename-based pricing,
 * and the 5 official categories:
 * Fish Foods | Fish Medicines | Others | Tanks | Motors
 */

export const CATEGORIES = [
  'All Products',
  'Fish Foods',
  'Fish Medicines',
  'Others',
  'Tanks',
  'Motors'
];

export const PRODUCTS = ${JSON.stringify(allProducts, null, 2)};

export function getProductBySlug(slug) {
  if (!slug) return undefined;
  try {
    const normalized = decodeURIComponent(String(slug)).toLowerCase().trim();
    return PRODUCTS.find((p) => {
      if (p.slug.toLowerCase() === normalized) return true;
      if (p.id.toLowerCase() === normalized) return true;
      return false;
    });
  } catch {
    const raw = String(slug).toLowerCase().trim();
    return PRODUCTS.find((p) => p.slug.toLowerCase() === raw || p.id.toLowerCase() === raw);
  }
}

export function getProductById(id) {
  if (!id) return undefined;
  const normalized = String(id).toLowerCase().trim();
  return PRODUCTS.find((p) => p.id.toLowerCase() === normalized);
}

export function calculateDiscount(originalPrice, offerPrice) {
  if (!originalPrice || !offerPrice || originalPrice <= offerPrice) {
    return 0;
  }
  return Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
}

export function formatPrice(price) {
  if (price === null || price === undefined) {
    return null;
  }
  return \`₹\${Number(price).toLocaleString('en-IN')}\`;
}
`;

fs.writeFileSync(path.resolve('src/data/products.js'), productsJsContent, 'utf-8');
console.log('Updated src/data/products.js successfully.');
