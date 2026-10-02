/**
 * downloadUtils.ts
 *
 * Cross-device safe file download utility.
 * Fetches the file via same-origin proxy or blob to eliminate CORS issues
 * and avoid navigation resets across iOS, Android, and Desktop.
 */

import { triggerBlobDownload } from './pdfClientDownload';

export async function downloadFileViaFetch(url: string, filename: string, slug?: string): Promise<void> {
  try {
    if (!url) return;

    const isHttp = url.startsWith('http://') || url.startsWith('https://');
    const isRelativeKey = !isHttp && (url.startsWith('private/') || url.includes('/uploaded/'));

    // If it's an internal/relative object key (not a fetchable HTTP URL)
    if (isRelativeKey) {
      const extractedSlug = slug || filename.replace('-brochure.pdf', '').replace('.pdf', '');
      if (extractedSlug && extractedSlug !== 'download' && typeof window !== 'undefined') {
        window.location.href = `/print/package/${encodeURIComponent(extractedSlug)}?autoDownload=true`;
        return;
      }
    }

    let downloadUrl = url;
    try {
      const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000');
      const isSameOrigin = typeof window !== 'undefined' && urlObj.origin === window.location.origin;

      if (!isSameOrigin) {
        // Route cross-origin URLs (e.g. Cloudinary, R2) through same-origin download proxy to eliminate CORS
        downloadUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}&slug=${encodeURIComponent(slug || '')}`;
      }
    } catch {
      // If parsing fails, route through download proxy
      downloadUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}&slug=${encodeURIComponent(slug || '')}`;
    }

    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/pdf, application/octet-stream, */*',
      },
    });

    if (!response.ok) {
      // If download proxy fails and it's a brochure, fall back to /print/package/[slug]?autoDownload=true
      const extractedSlug = slug || filename.replace('-brochure.pdf', '').replace('.pdf', '');
      if (extractedSlug && extractedSlug !== 'download' && typeof window !== 'undefined') {
        window.location.href = `/print/package/${encodeURIComponent(extractedSlug)}?autoDownload=true`;
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    const blob = await response.blob();
    if (blob.size < 50) {
      const extractedSlug = slug || filename.replace('-brochure.pdf', '').replace('.pdf', '');
      if (extractedSlug && extractedSlug !== 'download' && typeof window !== 'undefined') {
        window.location.href = `/print/package/${encodeURIComponent(extractedSlug)}?autoDownload=true`;
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    triggerBlobDownload(blob, filename);
  } catch (error) {
    console.warn('[downloadFileViaFetch] Fetch download failed, opening in new window:', error);
    const extractedSlug = slug || filename.replace('-brochure.pdf', '').replace('.pdf', '');
    if (extractedSlug && extractedSlug !== 'download' && typeof window !== 'undefined') {
      window.location.href = `/print/package/${encodeURIComponent(extractedSlug)}?autoDownload=true`;
      return;
    }
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}
