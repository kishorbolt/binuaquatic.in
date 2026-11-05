/**
 * Binu’s Aquatic and Plants - WhatsApp Ordering Utility
 * Phone / WhatsApp Orders: +91 93422 21034
 * Official Click-to-Chat target: 919342221034
 */

export const WHATSAPP_PHONE = '919342221034';
export const DISPLAY_PHONE = '+91 93422 21034';
export const STORE_LANDLINE = '+04172317575';
export const STORE_EMAIL = 'binuaquaticandplants@gmail.com';
export const DEVELOPER_PHONE = '9488793023';
export const DEVELOPER_NAME = 'PIYROWARE';
export const SHOP_ADDRESS = 'Municipal Complex, 7 & 8, MBT Road, Navalpur, Ranipet, Tamil Nadu 632401';
export const INSTAGRAM_URL = 'https://www.instagram.com/binuaquatic.in?utm_source=ig_web_button_share_sheet&rpxt=ZDNlZDc0MzIxNw==';
export const GOOGLE_MAPS_EMBED_URL = "https://maps.google.com/maps?q=Binu's%20Aquatic%20and%20Plants,%20Municipal%20Complex,%207%20%26%208,%20MBT%20Road,%20Navalpur,%20Ranipet,%20Tamil%20Nadu%20632401&t=&z=16&ie=UTF8&iwloc=&output=embed";
export const GOOGLE_MAPS_DIRECTIONS_URL = "https://www.google.com/maps/search/?api=1&query=Binu%27s+Aquatic+and+Plants+Municipal+Complex+7+%26+8+MBT+Road+Navalpur+Ranipet+Tamil+Nadu+632401";

/**
 * Returns canonical product detail URL.
 * Uses deployed origin, supports VITE_SITE_URL configuration,
 * and ensures URL-safe slug encoding.
 */
export function getProductUrl(slug) {
  const safeSlug = encodeURIComponent(String(slug).trim());
  const configuredDomain = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) || '';
  if (configuredDomain) {
    return `${configuredDomain.replace(/\/+$/, '')}/products/${safeSlug}`;
  }
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return `https://binuaquatic.in/products/${safeSlug}`;
    }
    return `${origin}/products/${safeSlug}`;
  }
  return `https://binuaquatic.in/products/${safeSlug}`;
}

/**
 * Creates formatted single product order message
 */
export function createProductOrderMessage(product, quantity = 1) {
  const productUrl = getProductUrl(product.slug);
  const lines = [
    "Hello Binu's Aquatic and Plants!",
    "",
    "I would like to place an order.",
    "",
    `Product: ${product.name}`
  ];

  if (product.originalPrice && product.price && product.originalPrice > product.price) {
    lines.push(`Original Price: ₹${product.originalPrice.toLocaleString('en-IN')}`);
    lines.push(`Offer Price: ₹${product.price.toLocaleString('en-IN')}`);
  } else if (product.price !== null && product.price !== undefined) {
    lines.push(`Price: ₹${product.price.toLocaleString('en-IN')}`);
  } else {
    lines.push('Price: Price on request');
  }

  lines.push(`Quantity: ${quantity}`);
  
  if (typeof product.price === 'number') {
    lines.push(`Total: ₹${(product.price * quantity).toLocaleString('en-IN')}`);
  }

  lines.push(`Product Link: ${productUrl}`);
  lines.push('');
  lines.push('Please confirm availability and order details.');
  lines.push('');
  lines.push('Thank you!');

  return lines.join('\n');
}

/**
 * Creates formatted cart order message matching Section 4 specification
 */
export function createCartOrderMessage(items, subtotal) {
  const lines = [
    "Hello Binu's Aquatic and Plants!",
    "",
    "I would like to place an order.",
    ""
  ];

  items.forEach((item) => {
    const { product, quantity } = item;
    lines.push(`Product: ${product.name}`);

    if (product.originalPrice && product.price && product.originalPrice > product.price) {
      lines.push(`Original Price: ₹${product.originalPrice.toLocaleString('en-IN')}`);
      lines.push(`Offer Price: ₹${product.price.toLocaleString('en-IN')}`);
    } else if (product.price !== null && product.price !== undefined) {
      lines.push(`Price: ₹${product.price.toLocaleString('en-IN')}`);
    } else {
      lines.push('Price: Price on request');
    }

    lines.push(`Quantity: ${quantity}`);

    if (typeof product.price === 'number') {
      lines.push(`Total: ₹${(product.price * quantity).toLocaleString('en-IN')}`);
    } else {
      lines.push('Total: Price to be confirmed');
    }

    lines.push(`Link: ${getProductUrl(product.slug)}`);
    lines.push('');
  });

  lines.push(`Cart Subtotal: ₹${subtotal.toLocaleString('en-IN')}`);
  lines.push('');
  lines.push('Please confirm availability and order details.');
  lines.push('');
  lines.push('Thank you!');

  return lines.join('\n');
}

export function createTankEnquiryMessage(product) {
  const productUrl = getProductUrl(product.slug);
  return [
    "Hello Binu's Aquatic and Plants!",
    "",
    "I am interested in this tank.",
    "",
    `Tank Name: ${product.name}`,
    `Tank Size: ${product.tankSize || 'Standard Dimension'}`,
    `Product Link: ${productUrl}`,
    "",
    "Please share availability and further details.",
    "",
    "Thank you!"
  ].join('\n');
}

export function createGeneralEnquiryMessage(topic = 'General Enquiry') {
  return [
    "Hello Binu's Aquatic and Plants!",
    "",
    `I am visiting your website and have an enquiry regarding: ${topic}.`,
    "",
    "Could you please share more information?",
    "",
    "Thank you!"
  ].join('\n');
}

/**
 * Opens WhatsApp with reliable fallback for both desktop and mobile
 */
export function openWhatsApp(message) {
  const encodedText = encodeURIComponent(message);
  const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedText}`;
  if (typeof window !== 'undefined') {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }
}
