import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputDir = path.resolve('scratch/pdf_pages');
const outputDir = path.resolve('public/products/tanks');
const thumbDir = path.resolve('public/products/tanks/thumbs');

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(thumbDir, { recursive: true });

async function convertTanks() {
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.jpeg')).sort();
  console.log(`Converting ${files.length} tank images to WebP...`);

  for (const file of files) {
    const baseName = file.replace(/\.jpeg$/i, '');
    const inPath = path.join(inputDir, file);
    const outFull = path.join(outputDir, `${baseName}.webp`);
    const outThumb = path.join(thumbDir, `${baseName}.webp`);

    // Full image: resize max width 1200, WebP quality 85
    await sharp(inPath)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outFull);

    // Thumbnail: 480x480 fit contain with dark aquatic background #071f36
    await sharp(inPath)
      .resize(480, 480, { fit: 'contain', background: { r: 7, g: 31, b: 54, alpha: 1 } })
      .webp({ quality: 80 })
      .toFile(outThumb);

    console.log(`Converted ${file} -> ${baseName}.webp`);
  }
  console.log('All tank images converted successfully!');
}

convertTanks().catch(err => {
  console.error('Conversion failed:', err);
  process.exit(1);
});

