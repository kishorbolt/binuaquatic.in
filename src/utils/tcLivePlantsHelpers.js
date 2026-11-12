export const TC_LIVE_PLANTS_CATEGORY = 'TC Live Plants';

const SUPPORTED_IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|avif|gif)$/i;
const OPAQUE_FILENAME_PATTERN =
  /^(?:\d+|(?:img|dsc|pxl|photo|image|pic|page|plant|tc)(?:\s+\d+)+)$/i;
const UPPERCASE_TOKENS = new Set(['TC', 'XL', 'XXL', 'XS', 'SM']);
const ALPHANUMERIC_CODE_PATTERN = /^[A-Za-z]{1,2}\d+[A-Za-z]?$/;

/**
 * Formats a TC Live Plant image filename into a clean display name when descriptive,
 * or returns null when the filename carries no plant name metadata.
 */
export function extractPlantName(filename) {
  if (typeof filename !== 'string' || !filename.trim()) return null;

  const base = filename
    .trim()
    .replace(/\.[^.]+$/, '')
    .replace(/(?:[-_]\d{2,4}x\d{2,4})+$/i, '')
    .replace(/_/g, ' ')
    .replace(/\s*-\s+/g, ' __SEP__ ')
    .replace(/\s+-\s*/g, ' __SEP__ ')
    .replace(/-/g, ' ')
    .replace(/__SEP__/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

  if (!base || OPAQUE_FILENAME_PATTERN.test(base)) {
    return null;
  }

  return base
    .split(' ')
    .map((word) => {
      if (word === '-') return '-';
      const upper = word.toUpperCase();
      if (UPPERCASE_TOKENS.has(upper) || ALPHANUMERIC_CODE_PATTERN.test(word)) {
        return upper;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function slugifyPlantKey(text, index) {
  const base = String(text || `plant-${index + 1}`)
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return base || `tc-plant-${index + 1}`;
}

/**
 * Transforms filenames inside public/TC Live Plants into UI-ready plant records.
 * Explicitly excludes pricing or cart metadata.
 */
export function buildTcLivePlantsFromFilenames(filenames = []) {
  const validFiles = filenames
    .filter((file) => typeof file === 'string' && SUPPORTED_IMAGE_EXTENSIONS.test(file))
    .slice()
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  return validFiles.map((filename, index) => {
    const name = extractPlantName(filename);
    const slug = slugifyPlantKey(filename, index);
    return {
      id: `tc-live-plant-${slug}`,
      slug,
      filename,
      name,
      category: TC_LIVE_PLANTS_CATEGORY,
      image: `/TC Live Plants/${encodeURIComponent(filename)}`,
      isLivePlant: true
    };
  });
}

