/**
 * downloadUtils.ts
 *
 * Cross-origin safe file download utility.
 *
 * Problem: On mobile browsers, setting `<a href=externalUrl download=...>` and clicking
 * it does NOT trigger a download for cross-origin URLs. Instead, the browser NAVIGATES
 * to the URL, closing/overwriting the current page.
 *
 * Solution: Fetch the file as a Blob via the same-origin backend proxy/redirect,
 * create a temporary object URL from the Blob, and use that as the download href.
 * This always works cross-origin and cross-platform (Android Chrome, iOS Safari, Desktop).
 */

/**
 * Download a file safely on all devices, including mobile browsers.
 * Fetches the resource as a blob to avoid cross-origin navigation issues.
 *
 * @param url - The URL to download (can be a cross-origin presigned URL)
 * @param filename - The suggested filename for the download
 */
export async function downloadFileViaFetch(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      // Follow redirects (handles the 307 redirect from backend → R2)
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Cleanup after a short delay to allow the download to initiate
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      document.body.removeChild(link);
    }, 150);
  } catch (error) {
    console.error('[downloadFileViaFetch] Failed to download:', error);
    // Fallback: open in a new tab so the user can manually save
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
