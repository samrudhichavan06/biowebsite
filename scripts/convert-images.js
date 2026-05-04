import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '../src/assets');

async function convertImages() {
  try {
    console.log('Starting image conversion and compression...\n');

    // Convert JPG and PNG to WebP (highly compressed)
    const webpFiles = await imagemin([`${assetsDir}/*.{jpg,jpeg,png}`], {
      destination: assetsDir,
      plugins: [
        imageminWebp({
          quality: 80, // 0-100, lower = more compression
          alphaQuality: 100,
          method: 6, // 0-6, higher = slower but better compression
        }),
      ],
    });

    if (webpFiles.length > 0) {
      console.log('✓ WebP conversion completed:');
      webpFiles.forEach(file => {
        const filename = typeof file === 'string' ? path.basename(file) : path.basename(file.destinationPath || file.path || '');
        console.log(`  - ${filename}`);
      });
    }

    // Compress remaining JPGs
    const jpgFiles = await imagemin([`${assetsDir}/*.jpg`], {
      destination: assetsDir,
      plugins: [
        imageminMozjpeg({
          quality: 80, // 0-100
          progressive: true,
        }),
      ],
    });

    if (jpgFiles.length > 0) {
      console.log('\n✓ JPG compression completed:');
      jpgFiles.forEach(file => {
        const filename = typeof file === 'string' ? path.basename(file) : path.basename(file.destinationPath || file.path || '');
        console.log(`  - ${filename}`);
      });
    }

    // Compress PNGs
    const pngFiles = await imagemin([`${assetsDir}/*.png`], {
      destination: assetsDir,
      plugins: [
        imageminPngquant({
          quality: [0.6, 0.8], // min-max quality
          speed: 1, // 1-11, higher = faster
        }),
      ],
    });

    if (pngFiles.length > 0) {
      console.log('\n✓ PNG compression completed:');
      pngFiles.forEach(file => {
        const filename = typeof file === 'string' ? path.basename(file) : path.basename(file.destinationPath || file.path || '');
        console.log(`  - ${filename}`);
      });
    }

    console.log('\n✓ Image optimization completed successfully!');
  } catch (error) {
    console.error('Error during image conversion:', error);
    process.exit(1);
  }
}

convertImages();
