'use client';
import { useEffect } from 'react';

export default function PrintAction({ showClose = false }: { showClose?: boolean }) {
  useEffect(() => {
    // Detect if we are already in a print preview (or iframe) to prevent infinite loops
    const isPrintMedia = window.matchMedia && window.matchMedia('print').matches;
    if (isPrintMedia) return;
    
    // Automatically open the print/save as PDF dialog when the page loads
    const timer = setTimeout(() => {
      window.print();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000, display: 'flex', gap: '10px' }} className="no-print">
      {showClose && (
        <button
          type="button"
          onClick={() => window.close()}
          style={{
            backgroundColor: '#e2e8f0',
            color: '#1e293b',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '9999px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          ✕ Close
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          setTimeout(() => window.print(), 100);
        }}
        style={{
          backgroundColor: '#0f766e',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '9999px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        Print / Save PDF
      </button>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
