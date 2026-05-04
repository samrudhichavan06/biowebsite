/**
 * Optional Vite Plugin for Automatic Image Optimization
 * 
 * To use this plugin:
 * 1. Uncomment the plugin lines in vite.config.ts
 * 2. Import this file: import imageOptimizationPlugin from './vite.plugin.images'
 * 3. Add to plugins array: imageOptimizationPlugin()
 * 
 * This will automatically optimize images during build time.
 */

import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import path from 'path';
import fs from 'fs';

export default function imageOptimizationPlugin() {
  let config;

  return {
    name: 'vite-plugin-image-optimization',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    async generateBundle() {
      if (config.command === 'build') {
        const assetsDir = path.join(config.root, 'src/assets');

        // Only run if assets directory exists
        if (!fs.existsSync(assetsDir)) {
          return;
        }

        try {
          console.log('\n📦 Optimizing images for production build...');

          // Convert to WebP
          await imagemin([`${assetsDir}/*.{jpg,jpeg,png}`], {
            destination: assetsDir,
            plugins: [
              imageminWebp({
                quality: 80,
                alphaQuality: 100,
                method: 6,
              }),
            ],
          });

          // Compress JPGs
          await imagemin([`${assetsDir}/*.jpg`], {
            destination: assetsDir,
            plugins: [
              imageminMozjpeg({
                quality: 80,
                progressive: true,
              }),
            ],
          });

          // Compress PNGs
          await imagemin([`${assetsDir}/*.png`], {
            destination: assetsDir,
            plugins: [
              imageminPngquant({
                quality: [0.6, 0.8],
                speed: 1,
              }),
            ],
          });

          console.log('✅ Image optimization completed!\n');
        } catch (error) {
          console.warn('⚠️  Image optimization skipped:', error.message);
        }
      }
    },
  };
}
