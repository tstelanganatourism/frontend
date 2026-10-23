import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOptimizedImageUrl(url: string | null | undefined, width: number = 800): string {
  if (!url || !url.trim()) return "https://media.tstelanganatourism.com/gallery/photos/2T9A7843.webp";
  if (url.includes("res.cloudinary.com") && !url.includes("/image/upload/w_") && !url.includes("/image/upload/f_auto")) {
    return url.replace("/image/upload/", `/image/upload/w_${width},f_auto,q_auto/`);
  }
  return url;
}

export function getHdImageUrl(url: string | null | undefined): string {
  return getOptimizedImageUrl(url, 1200);
}

export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
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
  if (url.includes("res.cloudinary.com") && url.includes("/video/upload/") && !url.includes("/video/upload/f_auto") && !url.includes("/video/upload/q_auto")) {
    return url.replace("/video/upload/", "/video/upload/f_auto,q_auto,w_1280,c_limit/");
  }
  return url;
}

export function getCloudinaryVideoPosterUrl(url: string | null | undefined): string {
  if (!url || !url.trim()) return "";
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


