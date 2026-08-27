'use client';

import React, { useState } from 'react';

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

      const searchParams = new URLSearchParams(window.location.search);
      const secret = searchParams.get('secret') || '';
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      
      // Expected URL pattern: /print/[docType]/[bookingId]
      const printIdx = pathParts.indexOf('print');
      const docType = printIdx !== -1 && pathParts[printIdx + 1] ? pathParts[printIdx + 1] : 'ticket';
      const bookingId = printIdx !== -1 && pathParts[printIdx + 2] ? pathParts[printIdx + 2] : '';

      const defaultFilename = filename ? (filename.endsWith('.pdf') ? filename : `${filename}.pdf`) : `${docType.toUpperCase()}_${bookingId || 'document'}.pdf`;

      // 1. Call high-fidelity backend Playwright PDF endpoint
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const pdfEndpoint = `${apiUrl}/api/v1/bookings/${encodeURIComponent(bookingId)}/pdf?doc_type=${encodeURIComponent(docType)}&secret=${encodeURIComponent(secret)}`;

      try {
        const response = await fetch(pdfEndpoint);
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = blobUrl;
          a.download = defaultFilename;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            a.remove();
            window.URL.revokeObjectURL(blobUrl);
          }, 1000);
          setDownloading(false);
          return;
        }
      } catch (backendErr) {
        console.warn('Backend PDF endpoint error, using browser print fallback:', backendErr);
      }

      // If backend was unreachable, open standard print dialog
      window.print();
    } catch (err) {
      console.error('Direct PDF download error:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }} className="no-print">
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

      {/* 1. SEPARATE PRINT BUTTON */}
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

      {/* 2. SEPARATE SAVE PDF BUTTON (Direct download of .pdf file to user system / mobile phone) */}
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
