'use client';

export function PrintButton() {
  return (
    <div className="no-print">
      <button className="print-btn" onClick={() => window.print()}>
        🖨&nbsp; Print / Save as PDF
      </button>
    </div>
  );
}
