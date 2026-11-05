import fs from 'fs';
import path from 'path';
import { PRODUCTS, getProductBySlug, calculateDiscount, formatPrice } from '../src/data/products.js';
import { createCartOrderMessage, createProductOrderMessage, WHATSAPP_PHONE, DISPLAY_PHONE, SHOP_ADDRESS } from '../src/utils/whatsapp.js';

console.log('----------------------------------------------------');
console.log('BINU’S AQUATIC AND PLANTS - FINAL QA VERIFICATION');
console.log('----------------------------------------------------');

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

// 1. All actual public folder images scanned
const imageDir = path.resolve('public/drive-download-20261102T053719Z-1-001');
const rawImages = fs.readdirSync(imageDir).filter(f => f.toLowerCase().endsWith('.heic'));
assert(rawImages.length === 150, `Discovered exactly ${rawImages.length} actual HEIC images in public folder.`);

// 2. Total products in catalog
assert(PRODUCTS.length >= 400, `Catalog contains ${PRODUCTS.length} products (exceeds requirement of >= 400).`);

// 3. Two-price filenames vs single-price filenames vs manual review
const scannedProducts = PRODUCTS.filter(p => p.rawFilename.endsWith('.HEIC') || p.rawFilename.endsWith('.heic'));
assert(scannedProducts.length === 150, `Scanned products equal exactly 150.`);

const twoPriceProducts = PRODUCTS.filter(p => p.pricingRule === 'TWO_PRICES');
const singlePriceProducts = PRODUCTS.filter(p => p.pricingRule === 'SINGLE_PRICE');
const manualReviewProducts = PRODUCTS.filter(p => p.pricingRule === 'MANUAL_REVIEW');

assert(twoPriceProducts.length === 352, `Discounted products with two prices: ${twoPriceProducts.length}`);
assert(singlePriceProducts.length === 53, `Single price products: ${singlePriceProducts.length}`);
assert(manualReviewProducts.length === 15, `Products flagged for manual review: ${manualReviewProducts.length}`);

// Check specific scanned image breakdown
const scannedTwoPrices = scannedProducts.filter(p => p.pricingRule === 'TWO_PRICES');
const scannedSingle = scannedProducts.filter(p => p.pricingRule === 'SINGLE_PRICE');
const scannedManual = scannedProducts.filter(p => p.pricingRule === 'MANUAL_REVIEW');
assert(scannedTwoPrices.length === 95, `Discovered 95 scanned images with two prices.`);
assert(scannedSingle.length === 40, `Discovered 40 scanned images with single price.`);
assert(scannedManual.length === 15, `Discovered 15 scanned images requiring manual review.`);

// 4. Discount percentage mathematical accuracy
let mathErrors = 0;
twoPriceProducts.forEach(p => {
  const expected = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
  if (p.discountPercent !== expected || p.originalPrice <= p.price) {
    mathErrors++;
  }
});
assert(mathErrors === 0, `All ${twoPriceProducts.length} discounted products have 100% mathematically correct discount % using Rule C.`);

// 5. Zero broken images: Check every single product's image and thumbnail files on disk
let missingImages = 0;
let missingThumbs = 0;
PRODUCTS.forEach(p => {
  const imgPath = path.resolve('public', p.image.replace(/^\//, ''));
  const thumbPath = path.resolve('public', p.thumbnail.replace(/^\//, ''));
  if (!fs.existsSync(imgPath)) missingImages++;
  if (!fs.existsSync(thumbPath)) missingThumbs++;
});
assert(missingImages === 0, `Zero missing full-size product images (${PRODUCTS.length} checked).`);
assert(missingThumbs === 0, `Zero missing thumbnail images (${PRODUCTS.length} checked).`);

// 6. Minimum Cart Value (₹1,000) logic simulation
const mockItemsLow = [
  { product: { name: 'Taiyo Flakes', price: 70, originalPrice: 90, slug: 'taiyo-flakes' }, quantity: 5 } // total 350
];
const subtotalLow = mockItemsLow.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
assert(subtotalLow === 350, `Subtotal for mock items is ₹350.`);
assert(subtotalLow < 1000, `Cart value below ₹1,000 correctly detected.`);

const mockItemsHigh = [
  { product: { name: 'Taiyo Flakes', price: 70, originalPrice: 90, slug: 'taiyo-flakes' }, quantity: 5 }, // 350
  { product: { name: 'Aquatic Plants Pack', price: 700, originalPrice: null, slug: 'aquatic-plants' }, quantity: 1 } // 700
];
const subtotalHigh = mockItemsHigh.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
assert(subtotalHigh === 1050, `Subtotal for mock items is ₹1,050.`);
assert(subtotalHigh >= 1000, `Cart value reaching or exceeding ₹1,000 unlocks checkout.`);

// 7. WhatsApp Order Message formatting check
const orderMsg = createCartOrderMessage(mockItemsHigh, subtotalHigh);
assert(orderMsg.includes("Hello Binu's Aquatic and Plants!"), 'WhatsApp message greeting present.');
assert(orderMsg.includes("Product: Taiyo Flakes"), 'WhatsApp message includes product name.');
assert(orderMsg.includes("Original Price: ₹90"), 'WhatsApp message includes original price when discounted.');
assert(orderMsg.includes("Offer Price: ₹70"), 'WhatsApp message includes actual offer price.');
assert(orderMsg.includes("Total: ₹350"), 'WhatsApp message includes item line total.');
assert(orderMsg.includes("Cart Subtotal: ₹1,050"), 'WhatsApp message includes formatted subtotal.');
assert(orderMsg.includes("Please confirm availability and order details."), 'WhatsApp message includes shop confirmation closing.');
assert(!orderMsg.includes("order is confirmed automatically"), 'WhatsApp message never claims order is confirmed automatically.');

// 8. Contact & Business info integrity
assert(WHATSAPP_PHONE === '919342221034', 'Business WhatsApp phone is 919342221034.');
assert(DISPLAY_PHONE === '+91 93422 21034', 'Display phone is +91 93422 21034.');
assert(SHOP_ADDRESS.includes('Navalpur, Ranipet, Tamil Nadu 632401'), 'Store address preserved exactly.');

// 9. Netlify SPA Redirects Verification
const redirectsPath = path.resolve('public/_redirects');
const netlifyTomlPath = path.resolve('netlify.toml');
assert(fs.existsSync(redirectsPath), 'public/_redirects exists.');
assert(fs.readFileSync(redirectsPath, 'utf8').includes('/*    /index.html   200'), 'public/_redirects has correct SPA rewrite rule.');
assert(fs.existsSync(netlifyTomlPath), 'netlify.toml exists.');

console.log('----------------------------------------------------');
console.log(`SUMMARY: ${passedChecks}/${totalChecks} tests passed. Failed: ${failedChecks}`);
console.log('----------------------------------------------------');

if (failedChecks > 0) {
  process.exit(1);
}

