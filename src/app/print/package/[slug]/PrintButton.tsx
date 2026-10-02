'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { clientSideDownloadPdf } from '@/lib/pdfClientDownload';

export function PrintButton() {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/packages';
      }
    }
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // fallback
      }
    }
  };

  const handleDownloadPdf = React.useCallback(async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      toast.info('Generating PDF for download...');

      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const slug = pathParts[pathParts.length - 1] || 'tour';
      const filename = `${slug}-brochure.pdf`;

      await clientSideDownloadPdf('.brochure-container, body', filename);
      toast.success('Brochure PDF downloaded successfully!');
    } catch (err) {
      console.error('[PrintButton] PDF download error:', err);
      toast.info('Opening print dialog — please select "Save as PDF".');
      setTimeout(() => window.print(), 300);
    } finally {
      setDownloading(false);
    }
  }, [downloading]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autoDownload') === 'true') {
        const timer = setTimeout(() => {
          handleDownloadPdf();
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [handleDownloadPdf]);

  return (
    <>
      {/* ── Sticky Top Action Bar (hidden on print) ── */}
      <div
        className="no-print"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: 'rgba(6, 22, 38, 0.97)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(90, 196, 215, 0.25)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
          padding: '10px 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            maxWidth: '210mm',
            margin: '0 auto',
            flexWrap: 'wrap',
          }}
        >
          {/* Left: Back Button */}
          <button
            onClick={handleBack}
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              color: '#e2e8f0',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '8px',
              border: '1px solid rgba(71, 85, 105, 0.6)',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease',
              letterSpacing: '0.2px',
              flexShrink: 0,
            }}
            title="Return to site"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1e293b';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#5ac4d7';
              (e.currentTarget as HTMLButtonElement).style.color = '#5ac4d7';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(30, 41, 59, 0.9)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(71, 85, 105, 0.6)';
              (e.currentTarget as HTMLButtonElement).style.color = '#e2e8f0';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Back</span>
          </button>

          {/* Center: Brochure label (hidden on very small screens) */}
          <span
            style={{
              color: '#94a3b8',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              flex: 1,
              textAlign: 'center',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Tour Brochure Preview
          </span>

          {/* Right: Share + Save PDF + Print Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={handleShare}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                color: '#e2e8f0',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '8px',
                border: '1px solid rgba(71, 85, 105, 0.6)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#5ac4d7';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(71, 85, 105, 0.6)';
              }}
            >
              <span style={{ fontSize: '14px' }}>{copied ? '✓' : '🔗'}</span>
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>

            {/* SAVE PDF BUTTON */}
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                backgroundColor: downloading ? '#0d9488' : '#059669',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 800,
                borderRadius: '8px',
                border: 'none',
                cursor: downloading ? 'wait' : 'pointer',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)',
                letterSpacing: '0.4px',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              {downloading ? (
                <>
                  <svg style={{ animation: 'spin 1s linear infinite' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '15px' }}>📥</span>
                  <span>Save PDF</span>
                </>
              )}
            </button>

            {/* PRINT BUTTON */}
            <button
              onClick={() => window.print()}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                background: 'linear-gradient(135deg, #0d6e75 0%, #0891b2 100%)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 800,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(13,110,117,0.4)',
                letterSpacing: '0.4px',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(13,110,117,0.55)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(13,110,117,0.4)';
              }}
            >
              <span style={{ fontSize: '15px' }}>🖨</span>
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Spacer so brochure doesn't hide behind fixed top bar ── */}
      <div className="no-print" style={{ height: '58px' }} />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </>
  );
}
