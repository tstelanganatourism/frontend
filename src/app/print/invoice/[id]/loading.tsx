import React from 'react';

export default function InvoiceLoading() {
  return (
    <div style={{ maxWidth: '850px', margin: '30px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '24px' }}>
        <div style={{ width: '160px', height: '32px', backgroundColor: '#f1f5f9', borderRadius: '8px' }} />
        <div style={{ width: '120px', height: '24px', backgroundColor: '#f1f5f9', borderRadius: '6px' }} />
      </div>
      <div style={{ height: '180px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }} />
      <div style={{ height: '140px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
    </div>
  );
}
