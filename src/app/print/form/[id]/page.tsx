import React from 'react';
import { notFound } from 'next/navigation';
import PrintAction from '@/components/ui/PrintAction';
import { apiFetch } from '@/lib/api';

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface Passenger {
  full_name: string;
  age: number;
  gender: string | null;
  id_proof_number: string | null;
  id_proof_type: string | null;
  is_primary: boolean;
}

interface BookingDetails {
  public_id: string;
  travel_date: string;
  adult_count: number;
  child_count: number;
  total_amount: number;
  package_title?: string;
  variant_title?: string;
  passengers: Passenger[];
  student_count?: number;
}

export const dynamic = 'force-dynamic';

export default async function PrintFormPage({
  params,
}: {
  params: Promise<{ id: string }>,
}) {
  const { id } = await params;

  let booking: BookingDetails | null = null;

  try {
    const res = await apiFetch(`/api/v1/bookings/${id}`);
    booking = await res.json() as BookingDetails;
  } catch (err) {
    console.error('Failed to load booking:', err);
    notFound();
  }

  if (!booking) return notFound();

  // Only need date and public_id — no passenger processing needed
  const travelDateObj = new Date(booking.travel_date);
  const formattedDate = travelDateObj.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).toUpperCase();

  // 30 blank rows
  const rows = Array.from({ length: 30 }).map((_, idx) => ({ sr: idx + 1 }));

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @page { size: A4 portrait; margin: 10mm; }
        body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background: #f0f0f0; }
        * { box-sizing: border-box; }
        
        .page-container {
          width: 210mm;
          min-height: 297mm;
          background: white;
          margin: 0 auto;
          padding: 10mm;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        @media print {
          body { background: white; }
          .page-container { margin: 0; padding: 0; box-shadow: none; border: none; }
          .no-print { display: none !important; }
        }

        .header-actions { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 20px; }
        .btn { padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; }
        .btn-primary { background: #1e3a8a; color: white; }
        .btn-primary:hover { background: #1e40af; }
        .btn-secondary { background: #e2e8f0; color: #1e293b; }
        .btn-secondary:hover { background: #cbd5e1; }

        .form-border { border: 2px solid #000; width: 100%; height: 100%; display: flex; flex-direction: column; }
        
        /* Form Header */
        .form-header { display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 2px solid #000; }
        .logo-img { height: 80px; width: 80px; border-radius: 50%; object-fit: cover; background: #fff; }
        
        .title-block { text-align: center; flex: 1; }
        .title-block h1 { margin: 0; font-size: 32px; font-weight: 900; color: #000; text-transform: uppercase; }
        .title-block h2 { margin: 5px 0; font-size: 24px; font-weight: 800; color: #000; }
        .title-block h3 { margin: 0; font-size: 20px; font-weight: 700; color: #000; }
        .title-block h4 { margin: 5px 0 0 0; font-size: 16px; font-weight: 700; color: #333; }

        /* Meta Row */
        .meta-row { display: flex; justify-content: space-between; padding: 10px; font-size: 14px; font-weight: 700; }
        .meta-left { display: flex; flex-direction: column; gap: 5px; }
        .meta-right { display: flex; flex-direction: column; gap: 5px; }
        .meta-item { display: flex; align-items: center; }
        .meta-label { width: 80px; }
        .meta-val { border-bottom: 1px dotted #000; width: 150px; text-align: left; padding-left: 5px; }

        /* Table Area */
        .form-table { width: 100%; border-collapse: collapse; font-size: 12px; font-weight: 700; flex: 1; }
        .form-table th, .form-table td { border: 1px solid #000; padding: 4px; text-align: center; height: 26px; }
        .form-table th { font-size: 13px; text-transform: uppercase; background: transparent; }
        
        .td-left { text-align: left !important; padding-left: 10px !important; }
        .address-col-header { text-align: left !important; padding-left: 10px !important; }
        .address-box { height: 100%; width: 100%; display: flex; align-items: flex-start; justify-content: flex-start; }
        
        /* Footer Checkboxes */
        .footer-boxes { display: flex; justify-content: space-around; padding: 10px; border-top: 2px solid #000; border-bottom: 2px solid #000; font-weight: 700; font-size: 13px; }
        .box-item { display: flex; align-items: center; gap: 8px; }
        .square { width: 16px; height: 16px; border: 1px solid #000; }

        .footer-note { text-align: center; padding: 8px; font-weight: 900; font-size: 14px; background: #fff; }
      ` }} />

      <div className="page-container">
        <div className="form-border">
          <div className="form-header">
            <img src="/apple-icon.png" className="logo-img" alt="Telangana Boat Tourism" />
            <div className="title-block">
              <h1>CUSTOMER DETAIL FORM</h1>
              <h2>TELANGANA BOAT TOURISM</h2>
              <h3>AP  BOAT TOURISM</h3>
              <h4>
                {booking.package_title} {booking.variant_title && booking.variant_title !== '—' && `- ${booking.variant_title}`}
              </h4>
            </div>
            <img src="/aptdc-logo.svg" className="logo-img" alt="AP Tourism" />
          </div>

          <div className="meta-row">
            <div className="meta-left">
              {booking.student_count && booking.student_count > 0 ? (
                <>
                  <div className="meta-item"><span className="meta-label">STUDENT:</span> <span className="meta-val"></span></div>
                  <div className="meta-item"><span className="meta-label">TOTAL:</span> <span className="meta-val"></span></div>
                </>
              ) : (
                <>
                  <div className="meta-item"><span className="meta-label">ADULT:</span> <span className="meta-val"></span></div>
                  <div className="meta-item"><span className="meta-label">CHILD:</span> <span className="meta-val"></span></div>
                  <div className="meta-item"><span className="meta-label">TOTAL:</span> <span className="meta-val"></span></div>
                </>
              )}
            </div>
            <div className="meta-right">
              <div className="meta-item"><span className="meta-label">DATE:</span> <span className="meta-val">{formattedDate}</span></div>
              <div className="meta-item"><span className="meta-label">TCKT NO:</span> <span className="meta-val"></span></div>
              <div className="meta-item"><span className="meta-label">ONLINE NO:</span> <span className="meta-val">{booking.public_id}</span></div>
            </div>
          </div>

          <table className="form-table">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>Sr</th>
                <th style={{ width: '35%' }}>PASSENGER NAME</th>
                <th style={{ width: '5%' }}>M/F</th>
                <th style={{ width: '10%' }}>{booking.student_count && booking.student_count > 0 ? 'CLASS' : 'AGE'}</th>
                <th style={{ width: '20%' }}>AADHAR NUMBER</th>
                <th style={{ width: '25%' }} className="address-col-header">ADDRESS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td>{row.sr}</td>
                  <td className="td-left"></td>
                  <td></td>
                  <td></td>
                  <td></td>

                  {/* Handle Row Span for Right Column */}
                  {i === 0 && (
                    <td rowSpan={12} className="td-left" style={{ verticalAlign: 'top', paddingTop: '10px' }}>
                      ADDRESS LINE 1
                    </td>
                  )}
                  {i === 12 && (
                    <td rowSpan={11} className="td-left" style={{ verticalAlign: 'top', paddingTop: '10px' }}>
                      ADDRESS LINE 2
                    </td>
                  )}
                  {i === 23 && (
                    <td className="td-left" style={{ verticalAlign: 'middle' }}>
                      MOBILE NO 1
                    </td>
                  )}
                  {i === 24 && (
                    <td className="td-left"></td>
                  )}
                  {i === 25 && (
                    <td className="td-left" style={{ verticalAlign: 'middle' }}>
                      MOBILE NO 2
                    </td>
                  )}
                  {i === 26 && (
                    <td className="td-left"></td>
                  )}
                  {i === 27 && (
                    <td rowSpan={3} className="td-left" style={{ verticalAlign: 'top', paddingTop: '5px' }}>
                      SIGNATURE
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="footer-boxes">
            <div className="box-item">PAPIKONDALU <div className="square"></div></div>
            <div className="box-item">RAJAHMUNDRY <div className="square"></div></div>
            <div className="box-item">NIGHT STAY IN RESORTS <div className="square"></div></div>
            <div className="box-item">OTHERS <div className="square"></div></div>
          </div>

          <div className="footer-note">
            ALL PASSENGERS MUST SUMBIT AADHAR CARD ZEROX COPIES AT BOAT
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', gap: '10px', borderTop: '1px solid #000' }}>
            <img src="/apple-icon.png" style={{ height: '40px', width: '40px', borderRadius: '50%', border: '1px solid #000' }} alt="Telangana Boat Tourism" />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>TELANGANA BOAT TOURISM</span>
          </div>
        </div>
      </div>
      <PrintAction showClose />
    </>
  );
}
