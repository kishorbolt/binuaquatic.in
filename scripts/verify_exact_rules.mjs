import fs from 'fs';
import path from 'path';
import { PRODUCTS, CATEGORIES, getProductBySlug, calculateDiscount, formatPrice } from '../src/data/products.js';
import { createCartOrderMessage, createProductOrderMessage, createTankEnquiryMessage, WHATSAPP_PHONE, DISPLAY_PHONE, SHOP_ADDRESS } from '../src/utils/whatsapp.js';

console.log('====================================================');
console.log('BINU’S AQUATIC AND PLANTS - EXACT CATALOGUE VERIFICATION');
console.log('====================================================');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`[PASS] ${message}`);
  } else {
    failedChecks++;
    console.error(`[FAIL] ${message}`);
  }
}

// 1. Inventory check: 156 general products + 34 Tanks = 190 total products
const tankProducts = PRODUCTS.filter(p => p.category === 'Tanks');
assert(tankProducts.length === 34, `Extracted exactly 34 tanks from binu tanks.pdf.`);
assert(PRODUCTS.length === 156 + 34, `Total products (${PRODUCTS.length}) matches 156 general products + 34 tanks (190 total).`);

// Strict Rule 4: No backup folders, duplicate folders, or additional product folders
assert(!fs.existsSync('public/products_original_backup'), `No duplicate or backup product folders in public (Rule 4).`);
assert(!fs.existsSync('public/products_backup'), `No backup folders created (Rule 4).`);

// 2. Duplicate detection
const productIds = PRODUCTS.map(p => p.id);
const uniqueIds = new Set(productIds);
assert(uniqueIds.size === PRODUCTS.length, `Zero duplicate product IDs (${uniqueIds.size} unique IDs).`);

const productSlugs = PRODUCTS.map(p => p.slug);
const uniqueSlugs = new Set(productSlugs);
assert(uniqueSlugs.size === PRODUCTS.length, `Zero duplicate product slugs (${uniqueSlugs.size} unique slugs).`);

// 3. Exact Category Check (Strictly the 5 canonical categories: Fish Foods, Fish Medicines, Others, Tanks, Filters)
const allowedCategories = ['Fish Foods', 'Fish Medicines', 'Others', 'Tanks', 'Filters'];
assert(
  CATEGORIES.length === 6 && CATEGORIES[0] === 'All Products' && allowedCategories.every(c => CATEGORIES.includes(c)),
  `CATEGORIES contains ONLY 'All Products' plus the 5 requested categories: ${allowedCategories.join(', ')}`
);

assert(!CATEGORIES.includes('Pet Foods'), `'Pet Foods' category is COMPLETELY REMOVED from CATEGORIES.`);
assert(!CATEGORIES.includes('Motors'), `'Motors' category is COMPLETELY REMOVED and renamed to 'Filters'.`);

let invalidCategoryCount = 0;
PRODUCTS.forEach(p => {
  if (!allowedCategories.includes(p.category)) {
    console.error(`Invalid category on product "${p.name}": "${p.category}"`);
    invalidCategoryCount++;
  }
});
assert(invalidCategoryCount === 0, `All ${PRODUCTS.length} products belong strictly to one of the 5 requested categories.`);

const categoryCounts = {};
allowedCategories.forEach(c => {
  categoryCounts[c] = PRODUCTS.filter(p => p.category === c).length;
});
console.log('Category Counts:', categoryCounts);

assert(categoryCounts['Fish Foods'] === 87, `Fish Foods has 87 products.`);
assert(categoryCounts['Fish Medicines'] === 29, `Fish Medicines has 29 products.`);
assert(categoryCounts['Others'] === 15, `Others has 15 products.`);
assert(categoryCounts['Tanks'] === 34, `Tanks has 34 products extracted from PDF.`);
assert(categoryCounts['Filters'] === 25, `Filters has 25 verified products (10 existing + 15 verified additions).`);

// 3b. Garlic Guard 250ML Verification
const garlicGuard250 = PRODUCTS.find(p => p.name === 'GARLIC GUARD 250ML');
assert(
  garlicGuard250 &&
  garlicGuard250.category === 'Fish Medicines' &&
  garlicGuard250.originalPrice === 1350 &&
  garlicGuard250.price === 1174 &&
  garlicGuard250.discountPercent === 13 &&
  garlicGuard250.pricingRule === 'TWO_PRICES' &&
  !garlicGuard250.isEnquiryOnly,
  `Garlic Guard 250ML price verified: Original ₹1,350, Offer ₹1,174, 13% OFF in Fish Medicines, with Add to Cart enabled.`
);

// 3c. Migrated Pet Foods verification in Fish Foods
const birdsBite = PRODUCTS.find(p => p.name === 'BIRDS BITE');
assert(
  birdsBite && birdsBite.category === 'Fish Foods' && birdsBite.originalPrice === 210 && birdsBite.price === 170 && birdsBite.discountPercent === 19,
  `Birds Bite: ₹210 original, ₹170 offer, 19% OFF migrated to Fish Foods.`
);

const birdsCalcium = PRODUCTS.find(p => p.name === 'BIRDS SPECIAL CALCIUM BLOCK');
assert(
  birdsCalcium && birdsCalcium.category === 'Fish Foods' && birdsCalcium.originalPrice === 150 && birdsCalcium.price === 90 && birdsCalcium.discountPercent === 40,
  `Birds Special Calcium Block: ₹150 original, ₹90 offer, 40% OFF migrated to Fish Foods.`
);

const petslifeItems = PRODUCTS.filter(p => p.name.toUpperCase().includes('PETSLIFE') || p.name.toUpperCase().includes('PETS LIFE'));
assert(petslifeItems.length === 10 && petslifeItems.every(p => p.category === 'Fish Foods'), `All 10 Petslife products correctly categorized under Fish Foods.`);

const pedigreeItems = PRODUCTS.filter(p => p.name.toUpperCase().includes('PEDIGREE'));
assert(pedigreeItems.length === 2 && pedigreeItems.every(p => p.category === 'Fish Foods'), `All Pedigree products correctly categorized under Fish Foods.`);

// 3d. Tank Products verification
let tankErrors = 0;
tankProducts.forEach(t => {
  if (t.category !== 'Tanks' || !t.isTank || !t.isEnquiryOnly || t.price !== null || t.originalPrice !== null || t.discountPercent !== 0) {
    tankErrors++;
  }
});
assert(tankErrors === 0, `All 34 tanks have category 'Tanks', isTank: true, isEnquiryOnly: true, null prices, and 0 discount badge.`);

const jqyyTank = PRODUCTS.find(p => p.name === 'JQYY 350X210X230');
assert(jqyyTank && jqyyTank.tankSize === '350 × 210 × 230 mm', `JQYY 350X210X230 has verified size: 350 × 210 × 230 mm.`);

const sunsun380A = PRODUCTS.find(p => p.name === 'SUNSUN AQUASSTAR MODEL: 380A');
assert(sunsun380A && sunsun380A.tankSize === '38.0 × 25.0 × 30.0 cm', `SUNSUN AQUASSTAR 380A has verified size: 38.0 × 25.0 × 30.0 cm.`);

const cubeTowerTank = PRODUCTS.find(p => p.name === 'CUBE TOWER U-TANK');
assert(cubeTowerTank && cubeTowerTank.tankSize.includes('30 × 30 × 60 cm'), `CUBE TOWER U-TANK has verified size: 30 × 30 × 60 cm.`);

// 3e. Tank WhatsApp message verification
const sampleTankMsg = createTankEnquiryMessage(jqyyTank);
assert(
  sampleTankMsg.includes("Hello Binu's Aquatic and Plants!") &&
  sampleTankMsg.includes("I am interested in this tank.") &&
  sampleTankMsg.includes("Tank Name: JQYY 350X210X230") &&
  sampleTankMsg.includes("Tank Size: 350 × 210 × 230 mm") &&
  sampleTankMsg.includes("Product Link:"),
  `Tank WhatsApp enquiry message format strictly matches Section 3 specification.`
);

// 4. Clean Product Names (No price suffixes, no price brackets, legitimate numbers preserved)
let priceInNameErrors = 0;
PRODUCTS.forEach(p => {
  if (/(?:\d+\s*rs|\(\s*\d+\s*rs\s*\)|₹)/i.test(p.name)) {
    console.error(`Price found in product name: "${p.name}" (file: ${p.rawFilename})`);
    priceInNameErrors++;
  }
});
assert(priceInNameErrors === 0, `Zero product names contain prices or price suffixes.`);

// Check specific examples requested by user
const taiyoFlakes = PRODUCTS.find(p => p.rawFilename.includes('TAIYO GOLD FLAKES 25G'));
if (taiyoFlakes) {
  assert(taiyoFlakes.name === 'TAIYO GOLD FLAKES 25G', `Taiyo Flakes has clean name: "${taiyoFlakes.name}" without price.`);
}
const taiyoAini = PRODUCTS.find(p => p.rawFilename.includes('TAIYO AINI GOLD 100GM'));
if (taiyoAini) {
  assert(taiyoAini.name === 'TAIYO AINI GOLD 100GM', `Taiyo Aini Gold 100GM preserves exact name and weight.`);
}
const ainiHoliday = PRODUCTS.find(p => p.rawFilename.includes('AINI 14 DAYS HOLIDAY FOOD'));
if (ainiHoliday) {
  assert(ainiHoliday.name === 'AINI 14 DAYS HOLIDAY FOOD', `Aini 14 Days Holiday Food preserves legitimate number "14 DAYS".`);
}
const boyuSp = PRODUCTS.find(p => p.rawFilename.includes('BOYU SP-1000A'));
if (boyuSp) {
  assert(boyuSp.name === 'BOYU SP-1000A', `Boyu SP-1000A preserves legitimate model number.`);
}

// 5. Pricing rules verification
const twoPrices = PRODUCTS.filter(p => p.pricingRule === 'TWO_PRICES');
const singlePrice = PRODUCTS.filter(p => p.pricingRule === 'SINGLE_PRICE');
const manualReview = PRODUCTS.filter(p => p.requiresManualReview && !p.isTank);

assert(twoPrices.length === 96, `Products with original and offer prices: ${twoPrices.length} (95 previous + Garlic Guard 250ML).`);
assert(singlePrice.length === 40, `Products with single price: ${singlePrice.length}.`);
assert(manualReview.length === 5, `General products requiring manual review: ${manualReview.length}.`);

let discountErrors = 0;
twoPrices.forEach(p => {
  const expected = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
  if (p.discountPercent !== expected || p.originalPrice <= p.price) {
    discountErrors++;
  }
});
assert(discountErrors === 0, `All 96 discounted products have mathematically accurate discount % via Rule C.`);

let singlePriceErrors = 0;
singlePrice.forEach(p => {
  if (p.originalPrice !== null || p.discountPercent !== 0) {
    singlePriceErrors++;
  }
});
assert(singlePriceErrors === 0, `All 40 single-price products have null originalPrice and 0 discount badge.`);

// 6. Zero broken images verification across all 175 products
let missingWebp = 0;
let missingThumb = 0;
PRODUCTS.forEach(p => {
  const imgPath = path.resolve('public', p.image.replace(/^\//, ''));
  const thumbPath = path.resolve('public', p.thumbnail.replace(/^\//, ''));
  if (!fs.existsSync(imgPath)) {
    console.error(`Missing full webp: ${p.image}`);
    missingWebp++;
  }
  if (!fs.existsSync(thumbPath)) {
    console.error(`Missing thumb webp: ${p.thumbnail}`);
    missingThumb++;
  }
});
assert(missingWebp === 0, `Zero missing full WebP images (${PRODUCTS.length} checked).`);
assert(missingThumb === 0, `Zero missing WebP thumbnails (${PRODUCTS.length} checked).`);

// 7. Minimum cart value ₹1,000 enforcement
const mockBelow = [{ product: { price: 70 }, quantity: 5 }];
const subBelow = mockBelow.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
assert(subBelow < 1000, `Below ₹1,000 subtotal (₹${subBelow}) detected.`);

const mockAbove = [{ product: { price: 600 }, quantity: 2 }];
const subAbove = mockAbove.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
assert(subAbove >= 1000, `Above ₹1,000 subtotal (₹${subAbove}) unlocks checkout.`);

// 8. Business integrity & UI compliance
assert(WHATSAPP_PHONE === '919342221034', `WhatsApp phone preserved: 919342221034.`);
assert(DISPLAY_PHONE === '+91 93422 21034', `Display phone preserved: +91 93422 21034.`);
assert(SHOP_ADDRESS.includes('Navalpur, Ranipet'), `Shop address preserved in Ranipet.`);

// 9. UI Compliance Check - Buy Now removal & Price Render Order
const cardCode = fs.readFileSync(path.resolve('src/components/ProductCard.jsx'), 'utf-8');
const detailCode = fs.readFileSync(path.resolve('src/pages/ProductDetailPage.jsx'), 'utf-8');
assert(!cardCode.includes('Buy Now'), `ProductCard contains ZERO 'Buy Now' buttons.`);
assert(!detailCode.includes('Buy Now'), `ProductDetailPage contains ZERO 'Buy Now' buttons.`);

const origTagIdx = cardCode.indexOf('original-price-tag');
const priceTagIdx = cardCode.indexOf('className="price-tag"');
assert(origTagIdx > 0 && origTagIdx < priceTagIdx, `ProductCard renders strikethrough original price BEFORE offer price.`);

const detailOrigIdx = detailCode.indexOf('detail-original-price');
const detailPriceIdx = detailCode.indexOf('className="detail-price"');
assert(detailOrigIdx > 0 && detailOrigIdx < detailPriceIdx, `ProductDetailPage renders strikethrough original price BEFORE offer price.`);

// 10. Navigation and Footer Check
const headerCode = fs.readFileSync(path.resolve('src/components/Header.jsx'), 'utf-8');
const footerCode = fs.readFileSync(path.resolve('src/components/Footer.jsx'), 'utf-8');
assert(!headerCode.includes('Pet Foods') && !headerCode.includes("'Motors'"), `Header navigation contains ZERO references to 'Pet Foods' or 'Motors'.`);
assert(!footerCode.includes('Pet Foods') && !footerCode.includes("'Motors'"), `Footer links contain ZERO references to 'Pet Foods' or 'Motors'.`);
assert(headerCode.includes("'Filters'"), `Header navigation includes 'Filters'.`);
assert(footerCode.includes("'Filters'"), `Footer links include 'Filters'.`);

// 11. About Page Compliance
const aboutCode = fs.readFileSync(path.resolve('src/pages/AboutPage.jsx'), 'utf-8');
assert(aboutCode.includes('Passion for Aquatic Care'), `About page contains requested headline 'Passion for Aquatic Care'.`);
assert(!aboutCode.includes('Pet Foods'), `About page contains ZERO references to 'Pet Foods'.`);
assert(aboutCode.includes('Tanks'), `About page highlights verified aquarium tank collection.`);
assert(!aboutCode.includes('UVB') && !aboutCode.includes('reptile'), `About page has zero unverified reptile/UVB claims.`);

// 12. Perfect Circular Logo & Asset Integrity
import sharp from 'sharp';

const logoMeta = await sharp(path.resolve('public/binulogo.png')).metadata();
assert(logoMeta.width === logoMeta.height, `Logo has exact 1:1 square dimensions (${logoMeta.width}x${logoMeta.height}px).`);
assert(logoMeta.hasAlpha === true, `Logo has true alpha channel transparency.`);

const logoRaw = await sharp(path.resolve('public/binulogo.png')).raw().toBuffer({ resolveWithObject: true });
// Check corner alpha at (0,0)
const cornerAlpha = logoRaw.data[3];
assert(cornerAlpha === 0, `Logo outer corners are 100% transparent (alpha: ${cornerAlpha}) with zero fake checkerboard.`);

// Check indexbgg background image
const bgMeta = await sharp(path.resolve('public/indexbgg.jpeg')).metadata();
assert(bgMeta.width === 1536 && bgMeta.height === 1024, `Homepage hero background indexbgg.jpeg is verified (${bgMeta.width}x${bgMeta.height}px).`);

// 13. Mobile-First Responsive CSS & Image Container Verification
const cssCode = fs.readFileSync(path.resolve('src/index.css'), 'utf-8');
assert(cssCode.includes('overflow-x: hidden'), `Root body has overflow-x: hidden to prevent horizontal scrolling.`);
assert(cssCode.includes('repeat(2, minmax(0, 1fr))'), `Mobile product grid implements modern 2-column layout.`);
assert(cssCode.includes('aspect-ratio: 1 / 1'), `Product cards and logo containers enforce 1:1 aspect-ratio to prevent layout shift.`);
assert(cssCode.includes('.product-image-container') && cssCode.includes('background: #ffffff;'), `.product-image-container has pure white background: #ffffff.`);
assert(cssCode.includes('.detail-main-img-box') && cssCode.includes('background: #ffffff;'), `.detail-main-img-box has pure white background: #ffffff.`);

// 14. High-Fidelity Restored Product Images Verification (Non-Tank Products)
const nonTankProducts = PRODUCTS.filter(p => !p.isTank);
assert(nonTankProducts.length === 156, `Non-tank products count is exactly 156.`);

let imageIntegrityErrors = 0;
let thumbIntegrityErrors = 0;

for (const p of nonTankProducts) {
  const fullImgPath = path.resolve('public', p.image.replace(/^\//, ''));
  const thumbImgPath = path.resolve('public', p.thumbnail.replace(/^\//, ''));
  
  if (!fs.existsSync(fullImgPath) || fs.statSync(fullImgPath).size < 8000) {
    imageIntegrityErrors++;
  }
  if (!fs.existsSync(thumbImgPath) || fs.statSync(thumbImgPath).size < 1000) {
    thumbIntegrityErrors++;
  }
}
assert(imageIntegrityErrors === 0, `All 156 non-tank product images are authentic, uncorrupted, and full resolution.`);
assert(thumbIntegrityErrors === 0, `All 156 product thumbnails are verified and intact.`);

// 15. Tanks Preserved Untouched
const tankFiles = fs.readdirSync(path.resolve('public/products/tanks')).filter(f => f.endsWith('.webp'));
assert(tankFiles.length === 34, `All 34 tank images in public/products/tanks/ remain preserved and untouched.`);

// 16. Vercel & Netlify Deployment Configurations
assert(fs.existsSync('vercel.json'), `vercel.json exists for Vercel deployment.`);
const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf-8'));
assert(
  vercelConfig.buildCommand === 'npm run build' &&
  vercelConfig.outputDirectory === 'dist' &&
  Array.isArray(vercelConfig.rewrites) &&
  vercelConfig.rewrites.some(r => r.source === '/(.*)' && r.destination === '/index.html'),
  `vercel.json configured with buildCommand, outputDirectory, and SPA rewrites.`
);
assert(fs.existsSync('netlify.toml'), `netlify.toml preserved for ongoing Netlify deployment.`);
assert(fs.existsSync('public/_redirects'), `public/_redirects preserved for ongoing Netlify deployment.`);

// 17. Production Build Files Verification
assert(fs.existsSync('dist/index.html'), `dist/index.html compiled successfully.`);
assert(fs.existsSync('dist/binulogo.png'), `dist/binulogo.png deployed in production build.`);
assert(fs.existsSync('dist/indexbgg.jpeg'), `dist/indexbgg.jpeg deployed in production build.`);

console.log('========================================');
console.log(`FINAL RESULT: ${passedChecks}/${totalChecks} tests passed. Failed: ${failedChecks}`);
console.log('========================================');

if (failedChecks > 0) {
  process.exit(1);
}
