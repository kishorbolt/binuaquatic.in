import fs from 'fs';
import path from 'path';
import convert from 'heic-convert';
import sharp from 'sharp';

const inputDir = path.resolve('public/drive-download-20261102T053719Z-1-001');
const outputDir = path.resolve('public/products');
const thumbDir = path.resolve('public/products/thumbs');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

const files = fs.readdirSync(inputDir).filter(f => f.toLowerCase().endsWith('.heic'));

console.log(`Starting conversion of ${files.length} HEIC images...`);

// Helper to sanitize filename for web safety while preserving readability
export function getSafeBaseName(fileName) {
  return fileName
    .replace(/\.heic$/i, '')
    .trim();
}

async function convertFile(file, index) {
  const inputPath = path.join(inputDir, file);
  const base = getSafeBaseName(file);
  const outWebp = path.join(outputDir, `${base}.webp`);
  const outThumb = path.join(thumbDir, `${base}.webp`);

  // Skip if already converted
  if (fs.existsSync(outWebp) && fs.existsSync(outThumb)) {
    return { file, status: 'cached' };
  }

  try {
    const inputBuf = fs.readFileSync(inputPath);
    // Convert HEIC to JPEG buffer in memory
    const jpegBuf = await convert({
      buffer: inputBuf,
      format: 'JPEG',
      quality: 0.92
    });

    // 1. Optimized Full Image (max 1000px, quality 82)
    await sharp(jpegBuf)
      .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(outWebp);

    // 2. Optimized Thumbnail (max 420px, quality 75)
    await sharp(jpegBuf)
      .resize(420, 420, { fit: 'cover', position: 'center' })
      .webp({ quality: 75, effort: 4 })
      .toFile(outThumb);

    if ((index + 1) % 15 === 0 || index + 1 === files.length) {
      console.log(`Progress: ${index + 1}/${files.length} converted.`);
    }

    return { file, status: 'success' };
  } catch (err) {
    console.error(`Error converting ${file}:`, err.message);
    return { file, status: 'error', error: err.message };
  }
}

// Run with concurrency of 4
async function run() {
  const startTime = Date.now();
  const concurrency = 4;
  const results = [];

  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const batchPromises = batch.map((file, batchIdx) => convertFile(file, i + batchIdx));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  const successCount = results.filter(r => r.status === 'success' || r.status === 'cached').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  console.log(`\nImage Conversion Complete in ${((Date.now() - startTime) / 1000).toFixed(1)}s!`);
  console.log(`Successful: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

run();

