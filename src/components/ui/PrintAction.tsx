'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { clientSideDownloadPdf, triggerBlobDownload } from '@/lib/pdfClientDownload';

interface PrintActionProps {
  showClose?: boolean;
  filename?: string;
  targetSelector?: string;
}

export default function PrintAction({
  showClose = false,
  filename,
  targetSelector = '.ticket-page-wrapper, .invoice-container, .form-container, .print-report-wrapper, body'
}: PrintActionProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (downloading) return;
    try {
      setDownloading(true);

      const pathParts = window.location.pathname.split('/').filter(Boolean);

      // Expected URL pattern: /print/[docType]/[bookingId]
      const printIdx = pathParts.indexOf('print');
      const docType = printIdx !== -1 && pathParts[printIdx + 1] ? pathParts[printIdx + 1] : 'document';
      const bookingId = printIdx !== -1 && pathParts[printIdx + 2] ? pathParts[printIdx + 2] : '';

      const defaultFilename = filename
        ? (filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
        : `${docType.toUpperCase()}_${bookingId || 'document'}.pdf`;

      // ── 1. Next.js internal PDF proxy (for ticket/invoice/form with bookingId) ──
      if (bookingId && ['ticket', 'invoice', 'form'].includes(docType)) {
        try {
          const proxyUrl = `/api/pdf/${encodeURIComponent(docType)}/${encodeURIComponent(bookingId)}`;
          const response = await fetch(proxyUrl, { cache: 'no-store' });
          if (response.ok) {
            const blob = await response.blob();
            if (blob.size > 100) {
              triggerBlobDownload(blob, defaultFilename);
              toast.success('PDF downloaded successfully!');
              setDownloading(false);
              return;
            }
          }
          console.warn(`[PrintAction] Proxy returned ${response.status} or empty blob, falling back to client-side generator`);
        } catch (proxyErr) {
          console.warn('[PrintAction] Proxy fetch failed:', proxyErr);
        }
      }

      // ── 2. Client-side html2canvas-pro + jsPDF with base64-inlined images ─────
      toast.info('Generating PDF for download...');
      try {
        await clientSideDownloadPdf(targetSelector, defaultFilename);
        toast.success('PDF downloaded successfully!');
        setDownloading(false);
        return;
      } catch (clientErr) {
        console.warn('[PrintAction] Client-side PDF generation failed:', clientErr);
      }

      // ── 3. Final fallback: open print dialog (user can choose "Save as PDF") ───
      toast.info('Opening print dialog — please select "Save as PDF".');
      setTimeout(() => window.print(), 300);
    } catch (err) {
      console.error('[PrintAction] PDF download error:', err);
      toast.error('Could not download directly. Opening print dialog to Save as PDF.');
      setTimeout(() => window.print(), 300);
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
        zIndex: 9999,
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}
      className="no-print"
    >
      {showClose && (
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.close();
            }
          }}
          style={{
            backgroundColor: '#ffffff',
            color: '#334155',
            border: '1px solid #cbd5e1',
            padding: '10px 18px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
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
          padding: '10px 20px',
          borderRadius: '9999px',
          fontSize: '13px',
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(10, 35, 81, 0.3)',
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

      {/* 2. SAVE PDF BUTTON — direct download to Downloads folder */}
      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={downloading}
        style={{
          backgroundColor: downloading ? '#0d9488' : '#059669',
          color: '#ffffff',
          border: 'none',
          padding: '10px 22px',
          borderRadius: '9999px',
          fontSize: '13px',
          fontWeight: 800,
          cursor: downloading ? 'wait' : 'pointer',
          boxShadow: '0 4px 16px rgba(5, 150, 105, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          transition: 'all 0.2s ease'
        }}
      >
        {downloading ? (
          <>
            <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
            Generating PDF...
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
