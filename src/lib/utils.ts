import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getHdImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.includes("res.cloudinary.com") && !url.includes("/image/upload/q_") && !url.includes("/image/upload/w_")) {
    // Inject Cloudinary transformations for high resolution and max quality
    return url.replace("/image/upload/", "/image/upload/w_1920,q_auto:best,f_auto/");
  }
  return url;
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


