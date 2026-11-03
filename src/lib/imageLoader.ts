'use client';

/**
 * Custom Next.js Image Loader
 *
 * Directs 100% of image traffic to Cloudflare R2 CDN (media.tstelanganatourism.com)
 * or local static assets.
 * 
 * AUTOMATIC CLOUDINARY RESCUE:
 * Intercepts any legacy or cached res.cloudinary.com URLs and transparently
 * rewrites them to high-resolution Cloudflare R2 tour assets so ZERO requests
 * ever reach Cloudinary, completely eliminating 401 Unauthorized errors.
 */

export interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

const R2_FALLBACK_IMAGES = [
  'https://media.tstelanganatourism.com/gallery/tours/bhadrachalam-papikondalu-cruise.jpg',
  'https://media.tstelanganatourism.com/gallery/tours/pochavaram-boat-point.jpg',
  'https://media.tstelanganatourism.com/gallery/tours/papikondalu-rajahmundry.jpg',
  'https://media.tstelanganatourism.com/gallery/tours/gandipochamma-revu.jpg',
  'https://media.tstelanganatourism.com/gallery/tours/kolluru-bamboo-resort-1.png',
  'https://media.tstelanganatourism.com/gallery/tours/kolluru-river-cottage.webp',
  'https://media.tstelanganatourism.com/gallery/tours/maredumilli-forest-resort.jpg',
  'https://media.tstelanganatourism.com/gallery/tours/rajahmundry-boat-cruise.jpg',
  'https://media.tstelanganatourism.com/gallery/tours/bhadrachalam-river-drop.jpg',
  'https://media.tstelanganatourism.com/gallery/tours/bhadrachalam-parnashala-temple.jpg',
  'https://media.tstelanganatourism.com/gallery/photos/2T9A7844.webp',
  'https://media.tstelanganatourism.com/gallery/photos/2T9A7846.webp',
  'https://media.tstelanganatourism.com/gallery/photos/2T9A7848.webp',
  'https://media.tstelanganatourism.com/gallery/photos/2T9A8471.webp',
  'https://media.tstelanganatourism.com/gallery/photos/2T9A8805.webp',
];

function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!src) return '';

  // Local assets (e.g. /ts-boat-tourism-banner.jpg, /logo.png, icons)
  if (src.startsWith('/')) {
    return src;
  }

  // Intercept and rescue any Cloudinary URL to prevent 401 Unauthorized
  if (src.includes('res.cloudinary.com')) {
    const lower = src.toLowerCase();
    if (lower.includes('pochavaram')) {
      return 'https://media.tstelanganatourism.com/gallery/tours/pochavaram-boat-point.jpg';
    }
    if (lower.includes('papikondalu') && lower.includes('rajahmundry')) {
      return 'https://media.tstelanganatourism.com/gallery/tours/papikondalu-rajahmundry.jpg';
    }
    if (lower.includes('bhadrachalam') && lower.includes('papikondalu')) {
      return 'https://media.tstelanganatourism.com/gallery/tours/bhadrachalam-papikondalu-cruise.jpg';
    }
    if (lower.includes('kolluru') || lower.includes('bamboo') || lower.includes('cottage')) {
      return 'https://media.tstelanganatourism.com/gallery/tours/kolluru-river-cottage.webp';
    }
    if (lower.includes('maredumilli')) {
      return 'https://media.tstelanganatourism.com/gallery/tours/maredumilli-forest-resort.jpg';
    }
    if (lower.includes('parnashala')) {
      return 'https://media.tstelanganatourism.com/gallery/tours/bhadrachalam-parnashala-temple.jpg';
    }
    if (lower.includes('gandipochamma')) {
      return 'https://media.tstelanganatourism.com/gallery/tours/gandipochamma-revu.jpg';
    }

    // Deterministically map to one of our 15 distinct high-res R2 photos
    const idx = stringHash(src) % R2_FALLBACK_IMAGES.length;
    return R2_FALLBACK_IMAGES[idx];
  }

  // Cloudflare R2, Google, or any other working external image: return unmodified
  return src;
}
