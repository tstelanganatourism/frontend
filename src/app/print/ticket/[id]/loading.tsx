import React from 'react';

export default function TicketLoading() {
  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '24px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f1f5f9' }} />
          <div>
            <div style={{ width: '180px', height: '24px', borderRadius: '6px', backgroundColor: '#f1f5f9', marginBottom: '8px' }} />
            <div style={{ width: '120px', height: '14px', borderRadius: '4px', backgroundColor: '#f8fafc' }} />
          </div>
        </div>
        <div style={{ width: '140px', height: '36px', borderRadius: '8px', backgroundColor: '#f1f5f9' }} />
      </div>

      {/* Ticket Details Grid Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '80px', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '10px' }} />
            <div style={{ width: '140px', height: '18px', backgroundColor: '#cbd5e1', borderRadius: '6px' }} />
          </div>
        ))}
      </div>

      {/* Passengers Table Skeleton */}
      <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <div style={{ width: '160px', height: '18px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '16px' }} />
        <div style={{ width: '100%', height: '40px', backgroundColor: '#e2e8f0', borderRadius: '6px', marginBottom: '8px' }} />
        <div style={{ width: '100%', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '6px' }} />
      </div>

      {/* Payment Summary Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '280px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ width: '80px', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
            <div style={{ width: '60px', height: '14px', backgroundColor: '#cbd5e1', borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: '100px', height: '18px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
            <div style={{ width: '80px', height: '18px', backgroundColor: '#0d9488', borderRadius: '4px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
