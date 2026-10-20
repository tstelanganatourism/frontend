'use client';

/**
 * Custom Next.js Image Loader
 *
 * Offloads 100% of image transformations to Cloudinary's free global CDN
 * instead of burning Vercel's 5,000 monthly image transformation quota.
 *
 * Automatically injects:
 * - f_auto (AVIF / WebP automatic format negotiation)
 * - q_auto:good (intelligent compression)
 * - w_${width} (exact responsive device size)
 * - c_limit (prevent upscaling)
 */

export interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!src) return '';

  // Local assets (e.g. /ts-boat-tourism-banner.jpg, /logo.png, icons)
  if (src.startsWith('/')) {
    return src;
  }

  // Cloudinary images: rewrite URL to let Cloudinary transform at the edge
  if (src.includes('res.cloudinary.com')) {
    const qParam = quality ? `q_${quality}` : 'q_auto:good';
    const transform = `f_auto,${qParam},w_${width},c_limit`;

    // Handle standard Cloudinary upload URL format:
    // https://res.cloudinary.com/<cloud>/image/upload/<transforms>/<version>/<public_id>
    const uploadIndex = src.indexOf('/image/upload/');
    if (uploadIndex !== -1) {
      const prefix = src.slice(0, uploadIndex + '/image/upload/'.length);
      const remainder = src.slice(uploadIndex + '/image/upload/'.length);

      // If already has transformation parameters like f_auto, replace or prepend
      if (remainder.startsWith('f_auto') || remainder.startsWith('w_') || remainder.startsWith('q_')) {
        const parts = remainder.split('/');
        parts[0] = transform;
        return `${prefix}${parts.join('/')}`;
      }

      return `${prefix}${transform}/${remainder}`;
    }
  }

  // Fallback for non-Cloudinary external images (R2, Google, etc.): return unmodified
  return src;
}
