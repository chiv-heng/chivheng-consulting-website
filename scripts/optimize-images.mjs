import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const publicDir = join(projectRoot, 'public');

const SOURCE_IMAGE = join(publicDir, 'School System Data Flow.png');

// Responsive breakpoints
const SIZES = [400, 600, 847]; // mobile, tablet, desktop

async function optimizeImage() {
  console.log('Starting image optimization...\n');

  // Get original file size
  const originalStats = await stat(SOURCE_IMAGE);
  console.log(`Original PNG: ${(originalStats.size / 1024).toFixed(1)}KB`);

  const results = [];

  for (const width of SIZES) {
    // Create WebP version
    const webpOutput = join(publicDir, `School System Data Flow-${width}w.webp`);
    await sharp(SOURCE_IMAGE)
      .resize(width, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(webpOutput);

    const webpStats = await stat(webpOutput);
    results.push({ format: 'webp', width, size: webpStats.size });
    console.log(`WebP ${width}w: ${(webpStats.size / 1024).toFixed(1)}KB`);

    // Create optimized PNG version (fallback)
    const pngOutput = join(publicDir, `School System Data Flow-${width}w.png`);
    await sharp(SOURCE_IMAGE)
      .resize(width, null, { withoutEnlargement: true })
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(pngOutput);

    const pngStats = await stat(pngOutput);
    results.push({ format: 'png', width, size: pngStats.size });
    console.log(`PNG ${width}w: ${(pngStats.size / 1024).toFixed(1)}KB`);
  }

  console.log('\n--- Summary ---');
  console.log(`Original: ${(originalStats.size / 1024).toFixed(1)}KB`);

  const smallestWebp = results.filter(r => r.format === 'webp').sort((a, b) => a.size - b.size)[0];
  const fullWebp = results.find(r => r.format === 'webp' && r.width === 847);

  console.log(`Smallest WebP (${smallestWebp.width}w): ${(smallestWebp.size / 1024).toFixed(1)}KB`);
  console.log(`Full WebP (847w): ${(fullWebp.size / 1024).toFixed(1)}KB`);
  console.log(`\nSavings at full size: ${((1 - fullWebp.size / originalStats.size) * 100).toFixed(1)}%`);
}

optimizeImage().catch(console.error);
