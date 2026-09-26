'use client';

import React, { useState } from 'react';

export function PrintButton() {
  const [copied, setCopied] = useState(false);

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
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1e293b';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#5ac4d7';
              (e.currentTarget as HTMLButtonElement).style.color = '#5ac4d7';
            }}
            onMouseLeave={e => {
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

          {/* Right: Share + Print Buttons */}
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
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#5ac4d7';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(71, 85, 105, 0.6)';
              }}
            >
              <span style={{ fontSize: '14px' }}>{copied ? '✓' : '🔗'}</span>
              <span style={{ display: 'none' }} className="btn-label">{copied ? 'Copied!' : 'Share'}</span>
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={() => window.print()}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 20px',
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
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(13,110,117,0.55)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(13,110,117,0.4)';
              }}
            >
              <span style={{ fontSize: '16px' }}>🖨</span>
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Spacer so brochure doesn't hide behind fixed top bar ── */}
      <div className="no-print" style={{ height: '58px' }} />
    </>
  );
}
