'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';

interface PrintActionProps {
  showClose?: boolean;
  filename?: string;
  targetSelector?: string;
}

export default function PrintAction({
  showClose = false,
  filename,
  targetSelector = '.ticket-page-wrapper, .invoice-container, .form-container, body'
}: PrintActionProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (downloading) return;
    try {
      setDownloading(true);

      const pathParts = window.location.pathname.split('/').filter(Boolean);

      // Expected URL pattern: /print/[docType]/[bookingId]
      const printIdx = pathParts.indexOf('print');
      const docType = printIdx !== -1 && pathParts[printIdx + 1] ? pathParts[printIdx + 1] : 'ticket';
      const bookingId = printIdx !== -1 && pathParts[printIdx + 2] ? pathParts[printIdx + 2] : '';

      const defaultFilename = filename
        ? (filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
        : `${docType.toUpperCase()}_${bookingId || 'document'}.pdf`;

      // ── 1. Next.js internal PDF proxy (RECOMMENDED — same-origin, no CORS, ──
      //       generates HMAC secret server-side, streams PDF as attachment)   ──
      if (bookingId) {
        try {
          const proxyUrl = `/api/pdf/${encodeURIComponent(docType)}/${encodeURIComponent(bookingId)}`;
          const response = await fetch(proxyUrl, { cache: 'no-store' });
          if (response.ok) {
            const blob = await response.blob();
            triggerBlobDownload(blob, defaultFilename);
            toast.success('PDF downloaded successfully!');
            setDownloading(false);
            return;
          }
          console.warn(`[PrintAction] Proxy returned ${response.status}, trying fallback`);
        } catch (proxyErr) {
          console.warn('[PrintAction] Proxy fetch failed:', proxyErr);
        }
      }

      // ── 2. Direct backend call (fallback if proxy is down) ───────────────────
      const searchParams = new URLSearchParams(window.location.search);
      const secret = searchParams.get('secret') || '';
      if (bookingId && secret) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
          const pdfEndpoint = `${apiUrl}/api/v1/bookings/${encodeURIComponent(bookingId)}/pdf?doc_type=${encodeURIComponent(docType)}&secret=${encodeURIComponent(secret)}`;
          const response = await fetch(pdfEndpoint);
          if (response.ok) {
            const blob = await response.blob();
            triggerBlobDownload(blob, defaultFilename);
            toast.success('PDF downloaded successfully!');
            setDownloading(false);
            return;
          }
        } catch (backendErr) {
          console.warn('[PrintAction] Direct backend PDF endpoint unavailable:', backendErr);
        }
      }

      // ── 3. Client-side fallback: html2canvas + jsPDF ─────────────────────────
      try {
        await clientSideDownloadPdf(targetSelector, defaultFilename);
        toast.success('PDF generated and downloaded!');
        setDownloading(false);
        return;
      } catch (clientErr) {
        console.warn('[PrintAction] Client-side PDF generation failed:', clientErr);
      }

      // ── Never invoke print dialog when user clicked Save PDF ───────────────
      toast.error('Unable to auto-download PDF. Please click the Print button to print or Save as PDF.');
    } catch (err) {
      console.error('[PrintAction] PDF download error:', err);
      toast.error('Failed to download PDF. Please try again or use the Print button.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}
      className="no-print"
    >
      {showClose && (
        <button
          type="button"
          onClick={() => window.close()}
          style={{
            backgroundColor: '#f1f5f9',
            color: '#334155',
            border: '1px solid #cbd5e1',
            padding: '10px 18px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          ✕ Close
        </button>
      )}

      {/* 1. PRINT BUTTON — opens browser print dialog */}
      <button
        type="button"
        onClick={() => {
          setTimeout(() => window.print(), 50);
        }}
        style={{
          backgroundColor: '#0a2351',
          color: '#ffffff',
          border: 'none',
          padding: '10px 18px',
          borderRadius: '9999px',
          fontSize: '13px',
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(10, 35, 81, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        Print
      </button>

      {/* 2. SAVE PDF BUTTON — direct download to Downloads folder, no print dialog */}
      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={downloading}
        style={{
          backgroundColor: downloading ? '#0d9488' : '#059669',
          color: '#ffffff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '9999px',
          fontSize: '13px',
          fontWeight: 800,
          cursor: downloading ? 'wait' : 'pointer',
          boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          transition: 'background-color 0.2s'
        }}
      >
        {downloading ? (
          <>
            <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
            Downloading PDF...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Save PDF
          </>
        )}
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Triggers a direct file download from a Blob object.
 * Works on all browsers including mobile (iOS Safari, Android Chrome).
 */
function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  // iOS Safari requires the anchor to be in the DOM
  document.body.appendChild(a);
  a.click();
  // Small delay before cleanup so the download initiates
  setTimeout(() => {
    a.remove();
    window.URL.revokeObjectURL(url);
  }, 1500);
}

/**
 * Client-side PDF generation using html2canvas + jsPDF.
 * Captures the specified DOM element(s) as high-quality images and packages
 * them into a PDF that is downloaded directly to the user's Downloads folder.
 * No print dialog is ever shown.
 */
async function clientSideDownloadPdf(selector: string, filename: string): Promise<void> {
  // Dynamic imports — defensive handling for both ESM default and CJS module shapes
  const [h2cMod, jsPdfMod] = await Promise.all([
    import('html2canvas'),
    import('jspdf')
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2canvas = (h2cMod.default || h2cMod) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsPDF = (jsPdfMod.default || (jsPdfMod as any).jsPDF) as any;

  // Find the printable container element
  const selectors = selector.split(',').map(s => s.trim());
  let el: HTMLElement | null = null;
  for (const sel of selectors) {
    el = document.querySelector(sel) as HTMLElement | null;
    if (el) break;
  }
  if (!el) {
    el = document.body;
  }

  // Temporarily hide the no-print toolbar so it doesn't appear in the PDF
  const toolbar = document.querySelector('.no-print') as HTMLElement | null;
  if (toolbar) toolbar.style.display = 'none';

  try {
    // Capture the element at 2x scale for crisp rendering on retina screens
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      // Ignore elements that shouldn't appear in the PDF
      ignoreElements: (element: Element) => {
        return element.classList.contains('no-print');
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // A4 size in mm: 210 x 297
    const pageWidthMm = 210;
    const pageHeightMm = 297;

    // Calculate dimensions to fit the image into A4, maintaining aspect ratio
    const pxPerMm = imgWidth / pageWidthMm;
    const contentHeightMm = imgHeight / pxPerMm;

    let orientation: 'p' | 'l' = 'p';
    let docWidth = pageWidthMm;
    let docHeight = pageHeightMm;

    // Use landscape if content is very wide compared to tall
    if (imgWidth > imgHeight * 1.2) {
      orientation = 'l';
      docWidth = pageHeightMm;
      docHeight = pageWidthMm;
    }

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    // If content fits in one page, add as single page
    if (contentHeightMm <= docHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, docWidth, contentHeightMm);
    } else {
      // Multi-page: slice the canvas into A4-page-height chunks
      const pagePixelHeight = Math.floor(docHeight * pxPerMm);
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
        const sliceHeightMm = (sliceCanvas.height / pxPerMm);

        if (yOffset > 0) pdf.addPage();
        pdf.addImage(sliceData, 'JPEG', 0, 0, docWidth, sliceHeightMm);

        yOffset += pagePixelHeight;
      }
    }

    // Save — this triggers direct file download (no print dialog)
    pdf.save(filename);
  } finally {
    // Restore the toolbar
    if (toolbar) toolbar.style.display = '';
  }
}
