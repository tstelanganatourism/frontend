import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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

export function getOptimizedImageUrl(url: string | null | undefined, width: number = 800): string {
  if (!url || !url.trim()) return R2_FALLBACK_IMAGES[0];
  if (url.includes("res.cloudinary.com")) {
    const lower = url.toLowerCase();
    if (lower.includes('pochavaram')) return 'https://media.tstelanganatourism.com/gallery/tours/pochavaram-boat-point.jpg';
    if (lower.includes('papikondalu') && lower.includes('rajahmundry')) return 'https://media.tstelanganatourism.com/gallery/tours/papikondalu-rajahmundry.jpg';
    if (lower.includes('bhadrachalam') && lower.includes('papikondalu')) return 'https://media.tstelanganatourism.com/gallery/tours/bhadrachalam-papikondalu-cruise.jpg';
    if (lower.includes('kolluru') || lower.includes('bamboo') || lower.includes('cottage')) return 'https://media.tstelanganatourism.com/gallery/tours/kolluru-river-cottage.webp';
    if (lower.includes('maredumilli')) return 'https://media.tstelanganatourism.com/gallery/tours/maredumilli-forest-resort.jpg';
    if (lower.includes('parnashala')) return 'https://media.tstelanganatourism.com/gallery/tours/bhadrachalam-parnashala-temple.jpg';
    if (lower.includes('gandipochamma')) return 'https://media.tstelanganatourism.com/gallery/tours/gandipochamma-revu.jpg';
    const idx = stringHash(url) % R2_FALLBACK_IMAGES.length;
    return R2_FALLBACK_IMAGES[idx];
  }
  return url;
}

export function getHdImageUrl(url: string | null | undefined): string {
  return getOptimizedImageUrl(url, 1200);
}

export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
  return match ? match[1] : null;
}

export function getYouTubeEmbedUrl(url: string | null | undefined, autoplay: boolean = true): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;
  const ap = autoplay ? '1' : '0';
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=${ap}&rel=0&modestbranding=1&playsinline=1&controls=1`;
}

export function getOptimizedCloudinaryVideoUrl(url: string | null | undefined): string {
  if (!url || !url.trim()) return "";
  if (url.includes("youtube") || url.includes("youtu.be")) return url;
  if (url.includes("res.cloudinary.com") && url.includes("/video/upload/") && !url.includes("/video/upload/f_auto") && !url.includes("/video/upload/q_auto")) {
    return url.replace("/video/upload/", "/video/upload/f_auto,q_auto,w_1280,c_limit/");
  }
  return url;
}

export function getCloudinaryVideoPosterUrl(url: string | null | undefined): string {
  if (!url || !url.trim()) return "";
  const ytId = getYouTubeId(url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  if (url.includes("res.cloudinary.com") && url.includes("/video/upload/")) {
    const withTransform = url.replace(
      /\/video\/upload\/(?:[a-zA-Z0-9_,]+\/)?/,
      "/video/upload/so_0,f_auto,q_auto,w_1280,c_limit/"
    );
    return withTransform.replace(/\.(mp4|webm|mov|m4v)$/i, ".jpg");
  }
  return "";
}

export function parseValidationError(err: any): string[] {
  if (!err) return [];
  
  // 1. Check for standard backend validation errors nested inside response
  const responseData = err.response?.data;
  if (responseData) {
    // If detail is an array (FastAPI Pydantic validation errors)
    if (Array.isArray(responseData.detail)) {
      return responseData.detail.map((e: any) => {
        const fieldName = e.loc?.slice(-1)?.[0] || 'Field';
        const formattedField = typeof fieldName === 'string' 
          ? fieldName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          : fieldName;
        return `${formattedField}: ${e.msg}`;
      });
    }
    
    // If detail is an object containing validation_errors (like package publish)
    if (responseData.detail && typeof responseData.detail === 'object') {
      const detailObj = responseData.detail;
      if (Array.isArray(detailObj.validation_errors)) {
        return detailObj.validation_errors;
      }
      if (typeof detailObj.message === 'string') {
        return [detailObj.message];
      }
    }

    // Support custom backend exceptions (AppError, VALIDATION_ERROR, etc.)
    if (responseData.error && typeof responseData.error === 'object') {
      const errorObj = responseData.error;
      if (Array.isArray(errorObj.details)) {
        return errorObj.details.map((e: any) => {
          const fieldName = e.loc?.slice(-1)?.[0] || 'Field';
          const formattedField = typeof fieldName === 'string' 
            ? fieldName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            : fieldName;
          return `${formattedField}: ${e.msg}`;
        });
      }
      if (typeof errorObj.message === 'string') {
        return [errorObj.message];
      }
    }
    
    // If detail is a simple string
    if (typeof responseData.detail === 'string') {
      return [responseData.detail];
    }
    
    // Fallback if data is just a string or has a message
    if (typeof responseData === 'string') {
      return [responseData];
    }
    if (responseData.message) {
      return [responseData.message];
    }
  }

  // 2. Check the javascript Error message
  if (err.message) {
    if (err.message.includes(': ') && err.message.includes(', ')) {
      return err.message.split(', ');
    }
    return [err.message];
  }

  return ['An unexpected error occurred'];
}

export function formatINR(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-IN');
}


