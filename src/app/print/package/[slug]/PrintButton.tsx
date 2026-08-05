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
    <div className="no-print" style={{ width: '100%', background: '#061626', padding: '16px 0', borderTop: '2px solid #0f3d56', marginTop: '24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          width: '100%',
          maxWidth: '210mm',
          margin: '0 auto',
          padding: '0 16px',
        }}
      >
        {/* Left: Back / Close Button */}
        <button
          onClick={handleBack}
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#1e293b',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 800,
            borderRadius: '8px',
            border: '1px solid #475569',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            transition: 'all 0.2s ease',
          }}
          title="Return to site"
        >
          <span style={{ fontSize: '15px' }}>←</span>
          <span>Back to Packages</span>
        </button>

        {/* Right: Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleShare}
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              backgroundColor: '#1e293b',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 800,
              borderRadius: '8px',
              border: '1px solid #475569',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{copied ? '✓ Link Copied!' : '🔗 Share Link'}</span>
          </button>

          <button
            onClick={() => window.print()}
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '11px 26px',
              background: 'linear-gradient(135deg, #0d6e75 0%, #0891b2 100%)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 900,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(13,110,117,0.45)',
              letterSpacing: '0.5px',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: '18px' }}>🖨</span>
            <span>PRINT / SAVE AS PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
