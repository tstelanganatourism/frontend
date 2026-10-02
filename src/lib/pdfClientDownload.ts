/**
 * pdfClientDownload.ts
 *
 * Universal, cross-device client-side PDF generation and download utility.
 * - Works on iOS Safari, Android Chrome, Windows, Mac, Linux.
 * - Powered by html2canvas-pro which natively supports modern CSS colors:
 *   oklch(), lab(), oklab(), lch(), and color-mix().
 * - Prevents tainted canvas errors by inlining cross-origin images as base64 data URIs.
 * - Uses allowTaint: false so toDataURL/toBlob never throws SecurityError.
 * - Handles multi-page slicing cleanly to A4 dimensions.
 */

/**
 * Triggers a file download from a Blob across ALL devices (iOS, Android, Windows, Mac).
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);

  // Check if device is iOS Safari (where programmatic anchor downloads on blob URLs can be ignored)
  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  if (isIOS) {
    // On iOS Safari, open blob URL in a new window/tab so user gets native viewer with Share -> Save to Files
    const newTab = window.open(url, '_blank');
    if (!newTab) {
      window.location.href = url;
    }
    setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    return;
  }

  // Android Chrome, Edge, Safari Desktop, Firefox, Chrome Desktop
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    a.remove();
    window.URL.revokeObjectURL(url);
  }, 2500);
}

/**
 * Convert an image URL to a base64 Data URI so html2canvas never flags the canvas as tainted.
 */
async function urlToBase64(src: string): Promise<string | null> {
  try {
    if (src.startsWith('data:')) return src;

    // First try fetching directly with CORS
    let res: Response | null = null;
    try {
      res = await fetch(src, { mode: 'cors' });
    } catch {
      // If direct fetch fails (CORS error), route through our same-origin download proxy
      const proxyUrl = `/api/download?url=${encodeURIComponent(src)}`;
      res = await fetch(proxyUrl);
    }

    if (!res || !res.ok) return null;

    const blob = await res.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(src);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('[pdfClientDownload] Could not convert image to base64:', src, e);
    return null;
  }
}

/**
 * Pre-processes all <img> elements inside a container:
 * Converts external images to base64 Data URIs so the canvas origin-clean flag remains true.
 * Returns a restoration function to revert modified src values.
 */
async function inlineImagesForCanvas(container: HTMLElement): Promise<() => void> {
  const images = Array.from(container.querySelectorAll('img'));
  const originals: { img: HTMLImageElement; originalSrc: string; crossOrigin: string | null }[] = [];

  const promises = images.map(async (img) => {
    const src = img.currentSrc || img.src;
    if (!src || src.startsWith('data:')) return;

    originals.push({
      img,
      originalSrc: img.src,
      crossOrigin: img.crossOrigin,
    });

    img.crossOrigin = 'anonymous';

    const base64 = await urlToBase64(src);
    if (base64) {
      img.src = base64;
    }
  });

  await Promise.all(promises);

  return () => {
    originals.forEach(({ img, originalSrc, crossOrigin }) => {
      img.src = originalSrc;
      if (crossOrigin !== null) {
        img.crossOrigin = crossOrigin;
      } else {
        img.removeAttribute('crossorigin');
      }
    });
  };
}

/**
 * Client-side PDF generation using html2canvas-pro + jsPDF.
 * - Uses html2canvas-pro which natively understands lab(), oklch(), oklab(), and lch().
 * - Inlines external images as base64 data URIs so canvas export ALWAYS succeeds.
 * - Slices multi-page documents seamlessly into A4 format.
 */
export async function clientSideDownloadPdf(selector: string, filename: string): Promise<void> {
  // Use html2canvas-pro (with fallback to html2canvas) + jsPDF
  const [h2cMod, jsPdfMod] = await Promise.all([
    import('html2canvas-pro').catch(() => import('html2canvas')),
    import('jspdf'),
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2canvas = (h2cMod.default || h2cMod) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsPDF = (jsPdfMod.default || (jsPdfMod as any).jsPDF) as any;

  // Find the printable container element
  const selectors = selector.split(',').map((s) => s.trim());
  let el: HTMLElement | null = null;
  for (const sel of selectors) {
    el = document.querySelector(sel) as HTMLElement | null;
    if (el) break;
  }
  if (!el) {
    el = document.body;
  }

  // Temporarily hide no-print elements
  const noPrintEls = document.querySelectorAll('.no-print');
  const originalDisplays: string[] = [];
  noPrintEls.forEach((elem, i) => {
    originalDisplays[i] = (elem as HTMLElement).style.display;
    (elem as HTMLElement).style.display = 'none';
  });

  let restoreImages: (() => void) | null = null;

  try {
    // 1. Inline all external images to base64 data URIs
    restoreImages = await inlineImagesForCanvas(el);

    // Microtask pause to allow browser image decode
    await new Promise((r) => setTimeout(r, 60));

    // Determine scale: 2 for crisp desktop, 1.5 for mobile to respect memory limits
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const scale = isMobile ? 1.5 : 2;

    // 2. Render to canvas with allowTaint: false, useCORS: true and onclone sanitizer
    const canvas = await html2canvas(el, {
      scale,
      useCORS: true,
      allowTaint: false, // CRITICAL: NEVER set to true, otherwise toDataURL() throws SecurityError
      logging: false,
      backgroundColor: '#ffffff',
      imageTimeout: 15000,
      ignoreElements: (element: Element) => {
        return (
          element.classList.contains('no-print') ||
          element.tagName === 'IFRAME' ||
          (element as HTMLElement).style?.display === 'none'
        );
      },
      onclone: (clonedDoc: Document) => {
        // Defensive cleanup: remove any unparsed inline lab()/oklch() styles if present
        try {
          const elements = clonedDoc.querySelectorAll('*');
          elements.forEach((node) => {
            const elem = node as HTMLElement;
            if (elem.style) {
              ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke'].forEach((prop) => {
                const val = (elem.style as any)[prop];
                if (val && typeof val === 'string' && (val.includes('lab(') || val.includes('oklch('))) {
                  (elem.style as any)[prop] = '';
                }
              });
            }
          });
        } catch {
          // ignore
        }
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Determine orientation: landscape if wider than tall
    const isLandscape = imgWidth > imgHeight * 1.1;

    // A4 dimensions in mm
    const pageWidthMm = isLandscape ? 297 : 210;
    const pageHeightMm = isLandscape ? 210 : 297;

    const pxPerMm = imgWidth / pageWidthMm;
    const contentHeightMm = imgHeight / pxPerMm;

    const pdf = new jsPDF({
      orientation: isLandscape ? 'l' : 'p',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    if (contentHeightMm <= pageHeightMm) {
      // Single page document
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthMm, contentHeightMm);
    } else {
      // Multi-page document: slice canvas cleanly
      const pagePixelHeight = Math.floor(pageHeightMm * pxPerMm);
      let yOffset = 0;

      while (yOffset < imgHeight) {
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = imgWidth;
        sliceCanvas.height = Math.min(pagePixelHeight, imgHeight - yOffset);

        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          ctx.drawImage(canvas, 0, -yOffset);
        }

        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95);
        const sliceHeightMm = sliceCanvas.height / pxPerMm;

        if (yOffset > 0) pdf.addPage();
        pdf.addImage(sliceData, 'JPEG', 0, 0, pageWidthMm, sliceHeightMm);
        yOffset += pagePixelHeight;
      }
    }

    // Convert PDF to Blob and trigger cross-device download
    const pdfBlob = pdf.output('blob');
    triggerBlobDownload(pdfBlob, filename);
  } finally {
    // Restore inlined images
    if (restoreImages) {
      restoreImages();
    }
    // Restore hidden elements
    noPrintEls.forEach((elem, i) => {
      (elem as HTMLElement).style.display = originalDisplays[i] ?? '';
    });
  }
}
