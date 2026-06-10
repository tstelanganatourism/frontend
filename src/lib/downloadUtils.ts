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
    const urlObj = new URL(url, window.location.href);
    const keyParam = urlObj.searchParams.get('key');

    // 1. Open in new page for instant viewing
    if (keyParam) {
      // Open a blank tab synchronously to prevent browser popup blockers from blocking it
      const newTab = window.open('', '_blank');
      
      // Request a signed preview URL (without attachment headers) from the backend
      const apiBase = urlObj.origin === 'null' ? '' : urlObj.origin;
      
      fetch(`${apiBase}/api/v1/documents/signed-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ object_key: keyParam }),
        credentials: 'include'
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to get signed url: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (newTab && data.url) {
            newTab.location.href = data.url;
          }
        })
        .catch((err) => {
          console.error('[downloadFileViaFetch] Signed URL preview failed:', err);
          if (newTab) newTab.close();
        });
    } else {
      // Direct PDF URL (Google Drive/Cloudinary): open directly in a new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    // 2. Perform the background download asynchronously via same-origin fetch.
    // Since we stream the document from the same-origin backend proxy, there are no CORS blocks,
    // and since it is an async fetch request, the parent window does not start a navigation sequence,
    // completely preventing Next.js route transition loaders or page reloads from triggering.
    const isSameOrigin = urlObj.origin === window.location.origin;

    const response = await fetch(url, {
      method: 'GET',
      credentials: isSameOrigin ? 'include' : 'omit',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch file stream: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    
    // Stop propagation of click to guarantee Next.js router doesn't intercept the local blob click
    link.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    document.body.appendChild(link);
    link.click();

    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      document.body.removeChild(link);
    }, 150);
  } catch (error) {
    console.error('[downloadFileViaFetch] Failed to download:', error);
  }
}
