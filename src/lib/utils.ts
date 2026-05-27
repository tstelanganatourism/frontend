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

