# Image Optimization Guide

## What Was Set Up

Your project now has automatic image optimization and WebP conversion capabilities. All images in `src/assets` have been:
- ✅ Converted to WebP format (50-80% smaller than originals)
- ✅ Compressed to reduce file sizes
- ✅ Original JPG/PNG files preserved and compressed

## Quick Start

### Manual Optimization (Existing Images)
Run whenever you add new images to `src/assets`:
```bash
npm run optimize-images
```

This will:
1. Convert all JPG/PNG images to WebP
2. Compress JPG files (80% quality)
3. Compress PNG files (60-80% quality)

## Using WebP Images in Your React Components

### Method 1: Direct WebP (Recommended for Modern Browsers)
```tsx
<img src="/src/assets/logo-bioenergy.webp" alt="Logo" />
```

### Method 2: Picture Element (Best Practice - Fallback Support)
```tsx
<picture>
  <source srcSet="/src/assets/logo-bioenergy.webp" type="image/webp" />
  <img src="/src/assets/logo-bioenergy.png" alt="Logo" />
</picture>
```

## File Structure
```
src/assets/
├── event-bioenergy.jpg          (compressed)
├── event-bioenergy.webp         (converted & compressed)
├── logo-bioenergy.png           (compressed)
├── logo-bioenergy.webp          (converted & compressed)
└── ... [all other images]
```

## Size Comparison Example
- Original: `event-bioenergy.jpg` (150KB) → WebP: `event-bioenergy.webp` (45KB)
- Original: `logo-bioenergy.png` (120KB) → WebP: `logo-bioenergy.webp` (35KB)

## Configuration

Edit `scripts/convert-images.js` to adjust compression settings:

- **WebP Quality**: Change `quality: 80` (0-100, lower = smaller file)
- **JPG Quality**: Change `quality: 80` (0-100, lower = smaller file)
- **PNG Quality**: Change `quality: [0.6, 0.8]` (lower = smaller file)

## Vite Build Integration (Optional)

An optional Vite plugin configuration is available in `vite.config.image.ts` for automatic optimization during build. This runs the conversion during the build process without needing manual runs.

To enable it:
```bash
# Copy the plugin setup to your vite.config.ts
```

## Browser Support

- WebP: Modern browsers (Chrome, Firefox, Edge, Safari 14+)
- Fallback: Use `<picture>` element for older browser support

## Dependencies Installed

- `imagemin` - Core image optimization
- `imagemin-webp` - WebP conversion
- `imagemin-mozjpeg` - JPG compression
- `imagemin-pngquant` - PNG compression

## Troubleshooting

**Script not found?**
```bash
npm run optimize-images
```

**Want to delete all .webp files?**
```bash
# PowerShell
Remove-Item src/assets/*.webp
# Or manually delete them in VS Code
```

**WebP not supported in my target browsers?**
Use the `<picture>` element approach above as a fallback.
