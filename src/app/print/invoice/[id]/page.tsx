import React from 'react';
import crypto from 'crypto';
import { apiFetch } from '@/lib/api';
import { notFound } from 'next/navigation';
import AdminInvoiceGuard from '@/components/admin/AdminInvoiceGuard';
import PrintAction from '@/components/ui/PrintAction';
import {
  describeTransport,
  getBaseFareExcludingAddons,
  getCapturedPayments,
  getPaymentMethodLabel,
  getRefreshmentAmount,
  getTransportSelections,
  hasRefreshment,
  money,
  type PaymentLedgerEntry,
} from '@/lib/bookingDisplay';

interface Passenger {
  full_name: string;
  age: number;
  gender: string;
  id_proof_type: string | null;
  id_proof_number: string | null;
  is_primary: boolean;
  phone_number?: string | null;
  student_class?: string | null;
}

interface BookingDetails {
  id: number;
  public_id: string;
  travel_date: string;
  adult_count: number;
  child_count: number;
  subtotal_amount: number;
  coupon_discount: number;
  coupon_applied: string | null;
  gst_amount: number;
  gateway_fee: number;
  total_amount: number;
  paid_amount: number;
  remaining_balance: number;
  status: string;
  created_at: string | null;
  package_title: string;
  variant_title: string;
  target_type?: 'PACKAGE' | 'ROOM';
  boarding_point?: { title: string; departure_time: string };
  room_checkin?: string | null;
  room_checkout?: string | null;
  room_checkout_date?: string | null;
  room_address?: string | null;
  passengers: Passenger[];
  pricing_snapshot: any;
  has_refreshment_addon?: boolean;
  payment_ledger?: PaymentLedgerEntry[];
  user: {
    full_name: string;
    email: string;
    phone: string;
  };
  agent_id?: number | null;
  agent_name?: string | null;
  agent_gst?: string | null;
  agent_company?: string | null;
  agent_commission?: number | null;
  agent_payable?: number | null;
  cancellation_details?: {
    status: string;
    reason: string;
    cancellation_fee?: number | null;
    refund_amount?: number | null;
    requested_at?: string | null;
    processed_at?: string | null;
  };
  student_count: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ secret?: string }>;
}

export default async function PrintInvoicePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { secret } = await searchParams;

  const secretKey = process.env.SECRET_KEY || 'tsaptourismpapikondalubadhrachalam';
  const expectedSecret = crypto
    .createHmac('sha256', secretKey)
    .update(id)
    .digest('hex');

  let hasSecret = false;

  if (secret) {
    if (secret !== expectedSecret) {
      return (
        <div style={{ padding: '40px', fontFamily: 'system-ui', textAlign: 'center' }}>
          <h1 style={{ color: '#dc2626' }}>403 Access Denied</h1>
          <p>This document signature is invalid or has expired.</p>
        </div>
      );
    }
    hasSecret = true;
  }

  let booking: BookingDetails | null = null;
  try {
    const url = `/api/v1/bookings/${id}?secret=${expectedSecret}`;
    const res = await apiFetch(url);
    if (res.status === 200) {
      booking = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch booking details for invoice print:", err);
  }

  if (!booking) {
    return notFound();
  }

  const travelDateFormatted = new Date(booking.travel_date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).toUpperCase();
  const invoiceDateFormatted = new Date(booking.created_at || new Date()).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).toUpperCase();

  const halfGst = (booking.gst_amount / 2).toFixed(2);
  const totalPaid = (booking.paid_amount ?? (booking.total_amount - booking.remaining_balance)) || 0;
  const passengerCount = booking.student_count > 0 ? booking.student_count : booking.adult_count + booking.child_count;
  const transportSelections = getTransportSelections(booking.pricing_snapshot);
  const refreshmentIncluded = hasRefreshment(booking);
  const refreshmentAmount = getRefreshmentAmount(booking.pricing_snapshot);
  const baseFare = getBaseFareExcludingAddons(booking.subtotal_amount, booking.pricing_snapshot);
  const capturedPayments = getCapturedPayments(booking.payment_ledger);

  const parts: string[] = [];
  if (booking.student_count > 0) {
    parts.push(`${booking.student_count} Student${booking.student_count > 1 ? 's' : ''}`);
  } else {
    if (booking.adult_count > 0) parts.push(`${booking.adult_count} Adult${booking.adult_count > 1 ? 's' : ''}`);
    if (booking.child_count > 0) parts.push(`${booking.child_count} Child${booking.child_count > 1 ? 'ren' : ''}`);
  }
  const guestSummary = parts.join(', ') || `${booking.passengers.length} Passenger${booking.passengers.length > 1 ? 's' : ''}`;

  const primaryPassenger = booking.passengers?.find(p => p.is_primary) || booking.passengers?.[0];
  const billedName = primaryPassenger?.full_name || booking.user?.full_name || 'Guest User';
  const billedPhone =
    primaryPassenger?.phone_number ||
    (primaryPassenger as any)?.phone ||
    (booking as any)?.user?.phone_number ||
    booking?.user?.phone ||
    (booking as any)?.agent_phone ||
    'N/A';

  const paymentMode = (booking.pricing_snapshot?.pg_payment_id || booking.payment_ledger?.some((p: any) => p.payment_method === 'PHONEPE' || p.payment_method === 'CASHFREE')) ? 'Online' : 'Office';
  const paymentId = booking.pricing_snapshot?.pg_payment_id || 'N/A';
  const gstNumber = '';
  const isFullyPaid = booking.status === 'FULLY_PAID';

  const isRoom = booking.target_type === 'ROOM';
  const allocatedHotelName = booking.pricing_snapshot?.hotel_name || 
                             (booking.room_address ? booking.room_address.split(',')[0].trim() : null) || 
                             'Assigned Luxury Hotel (Details at Check-in)';

  // Determine HSN code
  const hsnCode = isRoom ? '996311' : '996411'; // 996311: Room Accommodation; 996411: Passenger Transport Waterways

  return (
    <AdminInvoiceGuard hasSecret={hasSecret}>
      <div className="invoice-container">
        <style dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap');
          
          body {
            margin: 0;
            font-family: 'Inter', system-ui, sans-serif;
            color: #1e293b;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .invoice-container {
            max-width: 820px;
            margin: 20px auto;
            padding: 30px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(10, 35, 81, 0.05);
          }

          /* Header Styling */
          .header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px solid #0a2351;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          
          .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .logo-img {
            height: 52px;
            width: 52px;
            border-radius: 50%;
            border: 2px solid #c8a45a;
            object-fit: cover;
          }
          
          .brand-title {
            font-family: 'Outfit', sans-serif;
            font-size: 24px;
            font-weight: 900;
            color: #0a2351;
            line-height: 1.1;
          }

          .brand-tagline {
            font-size: 11px;
            font-weight: 700;
            color: #1a6b7a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .header-right {
            text-align: right;
          }

          .invoice-main-title {
            font-family: 'Outfit', sans-serif;
            font-size: 26px;
            font-weight: 900;
            color: #c8a45a;
            margin: 0 0 4px 0;
            letter-spacing: 1px;
          }

          .tax-badge { 
            background: #0a2351;
            color: white;
            padding: 3px 12px;
            border-radius: 4px; 
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: inline-block;
          }

          /* Addresses & Meta Info Grid */
          .info-meta-row {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 24px;
            margin-bottom: 24px;
            font-size: 11px;
          }

          .company-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px;
            line-height: 1.5;
            color: #475569;
          }

          .company-card strong {
            color: #0a2351;
          }

          .meta-table {
            width: 100%;
            border-collapse: collapse;
          }

          .meta-table td {
            padding: 4px 0;
            border: none;
            font-weight: 600;
            color: #334155;
          }

          .meta-table td:first-child {
            font-weight: 800;
            color: #0a2351;
            width: 45%;
            text-transform: uppercase;
            font-size: 9px;
            letter-spacing: 0.5px;
          }

          /* Billed To and Status row */
          .details-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
          }

          .detail-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
          }

          .detail-card-header {
            background: #0a2351;
            color: #ffffff;
            padding: 8px 12px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .detail-card-body {
            padding: 12px;
            font-size: 11.5px;
            line-height: 1.6;
            background: #ffffff;
          }

          .billed-table {
            width: 100%;
            border: none;
          }

          .billed-table td {
            border: none;
            padding: 3px 0;
          }

          .billed-table td:first-child {
            font-weight: 800;
            color: #0a2351;
            width: 25%;
          }

          .status-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            text-align: center;
          }

          .status-icon {
            font-size: 16px;
            font-weight: 900;
            text-transform: uppercase;
            padding: 6px 16px;
            border-radius: 20px;
            letter-spacing: 0.5px;
            display: inline-block;
          }

          .status-icon.paid { background: #dcfce7; color: #166534; }
          .status-partial { background: #fef3c7; color: #92400e; }
          .status-refunded { background: #e0f2fe; color: #0369a1; }
          .status-cancelled { background: #fef2f2; color: #991b1b; }

          .status-desc {
            font-size: 10px;
            color: #64748b;
            margin-top: 6px;
            font-weight: 600;
          }

          /* Tax Line Items Table */
          .section-title {
            font-family: 'Outfit', sans-serif;
            font-weight: 900;
            font-size: 12px;
            color: #0a2351;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .tax-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 24px;
          }

          .tax-table th {
            background: #0a2351;
            color: #ffffff;
            font-weight: 800;
            padding: 8px 12px;
            text-align: left;
            border: 1px solid #0a2351;
            text-transform: uppercase;
            font-size: 9px;
            letter-spacing: 0.5px;
          }

          .tax-table td {
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
            color: #334155;
            font-weight: 600;
          }

          .tax-table tr:nth-child(even) td {
            background: #f8fafc;
          }

          .tax-table-line-title {
            font-weight: 800;
            color: #0f172a;
          }

          .tax-table-line-sub {
            font-size: 9px;
            color: #64748b;
            margin-top: 2px;
            display: block;
          }

          /* Calculation Summary Layout */
          .calculation-summary-row {
            display: grid;
            grid-template-columns: 1fr 1.1fr;
            gap: 20px;
            margin-bottom: 24px;
          }

          .payment-history-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
          }

          .payment-history-title {
            background: #fafafb;
            border-bottom: 1.5px solid #cbd5e1;
            padding: 8px 12px;
            font-size: 10px;
            font-weight: 800;
            color: #0a2351;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .payment-history-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 10.5px;
            font-weight: 600;
          }

          .payment-history-row:last-child {
            border-bottom: none;
          }

          .payment-history-amt {
            font-weight: 800;
            color: #0a2351;
          }

          .payment-history-meta {
            font-size: 8.5px;
            color: #94a3b8;
            margin-top: 1px;
            display: block;
          }

          .calc-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }

          .calc-table td {
            padding: 5px 12px;
            border: 1px solid #e2e8f0;
            text-align: right;
            font-weight: 600;
          }

          .calc-table td:first-child {
            text-align: left;
            color: #475569;
          }

          .calc-row-highlight {
            font-weight: 800;
            background: #fafafb;
            color: #0a2351 !important;
          }

          .calc-row-highlight td {
            color: #0a2351 !important;
          }

          .calc-row-paid {
            font-weight: 800;
            background: #f0fdf4;
            color: #166534 !important;
          }

          .calc-row-paid td {
            color: #166534 !important;
          }

          .calc-row-balance {
            font-weight: 800;
            background: #fef2f2;
            color: #991b1b !important;
          }

          .calc-row-balance td {
            color: #991b1b !important;
          }

          /* Instructions card */
          .instructions-card {
            border: 1.5px solid #cbd5e1;
            border-radius: 8px;
            padding: 12px;
            background: #fafafb;
            margin-bottom: 24px;
          }

          .instructions-title {
            font-size: 10px;
            font-weight: 900;
            color: #b45309;
            text-transform: uppercase;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
          }

          .instructions-card ul {
            margin: 0;
            padding-left: 15px;
            font-size: 9.5px;
            color: #475569;
            line-height: 1.4;
            font-weight: 600;
          }

          .instructions-card li {
            margin-bottom: 3px;
          }

          /* Signature Footer */
          .sign-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }

          .sign-col {
            width: 220px;
            text-align: center;
          }

          .sign-line {
            border-bottom: 1.5px solid #0d2a4a;
            margin-bottom: 6px;
            height: 38px;
          }

          .sign-title {
            font-size: 10px;
            font-weight: 800;
            color: #475569;
            text-transform: uppercase;
          }

          .bottom-bar {
            background: #0a2351;
            color: #ffffff;
            padding: 8px;
            text-align: center;
            font-size: 11px;
            font-weight: 700;
            border-radius: 6px;
            margin-top: 20px;
          }

          @media print {
            body {
              background: #ffffff;
              color: #000000;
            }
            .invoice-container {
              box-shadow: none;
              border: none;
              padding: 0;
              margin: 0;
              width: 100%;
              max-width: 100%;
            }
            .no-print {
              display: none !important;
            }
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
          }
        ` }} />

        {/* HEADER */}
        <div className="header-row">
          <div className="header-left">
            <img src="/apple-touch-icon.png" className="logo-img" alt="TS Boat Tourism" />
            <div>
              <div className="brand-title">TS BOAT TOURISM</div>
              <div className="brand-tagline">Official Booking Platform</div>
            </div>
          </div>
          <div className="header-right">
            <h1 className="invoice-main-title">TAX INVOICE</h1>
            <div className="tax-badge">Original for Recipient</div>
          </div>
        </div>

        {/* DETAILS META GRID */}
        <div className="info-meta-row">
          <div className="company-card">
            <strong>TS Boat Tourism</strong><br />
            Om Shanti Satram, Kalyana Mandapam Road,<br />
            Near SBI ATM, Bhadrachalam, Telangana 507111<br />
            📞 +91 95420 69573 | bookings@tstelanganatourism.com<br />
            GSTIN: 36AABCT4827M1Z1 (Official Registered Partner)
          </div>

          <div>
            <table className="meta-table">
              <tbody>
                <tr>
                  <td>Invoice Number</td>
                  <td>: INV-{booking.public_id}</td>
                </tr>
                <tr>
                  <td>Invoice Date</td>
                  <td>: {invoiceDateFormatted}</td>
                </tr>
                <tr>
                  <td>Place of Supply</td>
                  <td>: Telangana (36)</td>
                </tr>
                <tr>
                  <td>SAC HSN Code</td>
                  <td>: {hsnCode}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CLIENT DETAILS & STATUS ROW */}
        <div className="details-row">
          <div className="detail-card">
            <div className="detail-card-header">Billed To (Recipient)</div>
            <div className="detail-card-body">
              <table className="billed-table">
                <tbody>
                  <tr>
                    <td>Customer</td>
                    <td>: {billedName}</td>
                  </tr>
                  <tr>
                    <td>Contact</td>
                    <td>: {billedPhone}</td>
                  </tr>
                  <tr>
                    <td>PNR Number</td>
                    <td>: {booking.public_id}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-card-header">Payment & Verification</div>
            <div className="detail-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="status-container">
                {booking.status === 'FULLY_PAID' ? (
                  <>
                    <div className="status-icon paid">✓ FULLY PAID</div>
                    <div className="status-desc">Booking is active. manual ticket exchange allowed.</div>
                  </>
                ) : booking.status === 'PARTIAL_PAID' ? (
                  <>
                    <div className="status-icon status-partial">⚠️ PARTIAL PAID</div>
                    <div className="status-desc">Outstanding balance due before journey departure.</div>
                  </>
                ) : booking.status === 'REFUNDED' ? (
                  <>
                    <div className="status-icon status-refunded">💸 REFUNDED</div>
                    <div className="status-desc">The transaction has been fully refunded.</div>
                  </>
                ) : (
                  <>
                    <div className="status-icon status-cancelled">🚫 CANCELLED</div>
                    <div className="status-desc">This transaction is cancelled.</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TAX LINE ITEMS TABLE */}
        <div className="section-title">Billing Line Items</div>
        <table className="tax-table">
          <thead>
            <tr>
              <th style={{ width: '8%', textAlign: 'center' }}>S.No</th>
              <th style={{ width: '45%' }}>Description of Service</th>
              <th style={{ width: '12%' }}>HSN / SAC</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Taxable Value</th>
              <th style={{ width: '10%', textAlign: 'right' }}>GST Rate</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ textAlign: 'center' }}>1</td>
              <td>
                <span className="tax-table-line-title">
                  {booking.package_title} — {booking.variant_title}
                </span>
                <span className="tax-table-line-sub">
                  Travel Date: {travelDateFormatted} | Guests: {guestSummary}
                </span>
              </td>
              <td>{hsnCode}</td>
              <td style={{ textAlign: 'right' }}>{money(baseFare, 2)}</td>
              <td style={{ textAlign: 'right' }}>5.0%</td>
              <td style={{ textAlign: 'right' }}>{money(baseFare, 2)}</td>
            </tr>

            {transportSelections.map((ts, idx) => (
              <tr key={`trans-${idx}`}>
                <td style={{ textAlign: 'center' }}>{idx + 2}</td>
                <td>
                  <span className="tax-table-line-title">{ts.title}</span>
                  <span className="tax-table-line-sub">{describeTransport(ts, booking.adult_count, booking.child_count, booking.student_count)}</span>
                </td>
                <td>996411</td>
                <td style={{ textAlign: 'right' }}>{money(ts.item_total || 0, 2)}</td>
                <td style={{ textAlign: 'right' }}>5.0%</td>
                <td style={{ textAlign: 'right' }}>{money(ts.item_total || 0, 2)}</td>
              </tr>
            ))}

            {refreshmentIncluded && (
              <tr>
                <td style={{ textAlign: 'center' }}>{transportSelections.length + 2}</td>
                <td>
                  <span className="tax-table-line-title">Fresh-Up Room Service Addon</span>
                  <span className="tax-table-line-sub">AC Room access for washroom, fresh-up & short stay ({passengerCount} guests)</span>
                </td>
                <td>996331</td>
                <td style={{ textAlign: 'right' }}>{money(refreshmentAmount, 2)}</td>
                <td style={{ textAlign: 'right' }}>5.0%</td>
                <td style={{ textAlign: 'right' }}>{money(refreshmentAmount, 2)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* CALCULATION SUMMARY & PAYMENT HISTORY */}
        <div className="calculation-summary-row">
          {/* Payment breakdown ledger */}
          <div className="payment-history-card">
            <div className="payment-history-title">💳 Captured Transactions</div>
            {capturedPayments.length > 0 ? (
              capturedPayments.map((p, idx) => {
                const pDate = p.created_at ? new Date(p.created_at) : null;
                const formattedPDate = pDate
                  ? pDate.toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', hour12: true
                    }).toUpperCase()
                  : invoiceDateFormatted;

                const lineLabel = capturedPayments.length === 1
                  ? (isFullyPaid ? 'Full Payment' : 'Advance Payment')
                  : (idx === 0 ? 'Advance Payment' : 'Balance Payment');

                return (
                  <div className="payment-history-row" key={p.id}>
                    <div>
                      <span style={{ fontWeight: 800 }}>{lineLabel}</span>
                      <span className="payment-history-meta">
                        Method: {getPaymentMethodLabel(p.payment_method)}
                        {p.payment_reference_id ? ` · Txn: ${p.payment_reference_id}` : ''}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="payment-history-amt">{money(p.amount, 2)}</span>
                      <span className="payment-history-meta">{formattedPDate}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="payment-history-row">
                <div>
                  <span style={{ fontWeight: 800 }}>{isFullyPaid ? 'Full Payment' : 'Advance Payment'}</span>
                  <span className="payment-history-meta">Mode: {paymentMode} {paymentId !== 'N/A' ? `· Gateway ID: ${paymentId}` : ''}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="payment-history-amt">{money(totalPaid, 2)}</span>
                  <span className="payment-history-meta">{invoiceDateFormatted}</span>
                </div>
              </div>
            )}
          </div>

          {/* Math calculation */}
          <div>
            <table className="calc-table">
              <tbody>
                <tr>
                  <td>Total Taxable Value</td>
                  <td>{money(Number(baseFare) + transportSelections.reduce((acc, curr) => acc + Number(curr.item_total || 0), 0) + (refreshmentIncluded ? Number(refreshmentAmount) : 0), 2)}</td>
                </tr>
                {booking.coupon_discount > 0 && (
                  <tr>
                    <td>Coupon Discount ({booking.coupon_applied})</td>
                    <td style={{ color: '#16a34a' }}>−{money(booking.coupon_discount, 2)}</td>
                  </tr>
                )}
                <tr>
                  <td>CGST (2.5%)</td>
                  <td>₹ {halfGst}</td>
                </tr>
                <tr>
                  <td>SGST (2.5%)</td>
                  <td>₹ {halfGst}</td>
                </tr>
                <tr>
                  <td>Gateway Convenience Fee</td>
                  <td>{money(booking.gateway_fee, 2)}</td>
                </tr>
                <tr className="calc-row-highlight">
                  <td>GRAND INVOICE TOTAL</td>
                  <td>{money(booking.total_amount, 2)}</td>
                </tr>
                {booking.agent_commission != null && booking.agent_commission > 0 && (
                  <>
                    <tr style={{ color: '#16a34a', fontWeight: 'bold' }}>
                      <td>Agent Incentive/Commission</td>
                      <td>-{money(booking.agent_commission, 2)}</td>
                    </tr>
                    <tr className="calc-row-highlight" style={{ background: '#fdfbeb' }}>
                      <td>NET PAYABLE BY AGENT</td>
                      <td>{money(booking.agent_payable || 0, 2)}</td>
                    </tr>
                  </>
                )}
                <tr className="calc-row-paid">
                  <td>TOTAL AMOUNT PAID</td>
                  <td>{money(totalPaid, 2)}</td>
                </tr>
                {booking.remaining_balance > 0 && (
                  <tr className="calc-row-balance">
                    <td>OUTSTANDING BALANCE DUE</td>
                    <td>{money(booking.remaining_balance, 2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Google Maps Navigation Box */}
        <div style={{ marginTop: '16px', marginBottom: '16px', background: 'linear-gradient(135deg, #0a2351 0%, #1e3a8a 100%)', borderRadius: '10px', padding: '14px 18px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1.5px solid #c8a45a' }}>
          <div style={{ flex: 1, paddingRight: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#c8a45a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📍 Bhadrachalam Office Map Navigation</span>
            </div>
            <div style={{ fontSize: '11px', color: '#e2e8f0', lineHeight: 1.4 }}>
              Om Shanti Satram, Kalyana Mandapam Road, Near SBI ATM, Bhadrachalam, Telangana 507111
            </div>
          </div>
          <a 
            href="https://maps.app.goo.gl/b9ZvxUvvFq6FgKVU8" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ background: '#c8a45a', color: '#0a2351', textDecoration: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 800, fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}
          >
            🗺️ Open Google Maps
          </a>
        </div>

        {/* INSTRUCTIONS */}
        <div className="instructions-card">
          <div className="instructions-title">⚠️ Mandatory Compliance & Terms</div>
          <ul>
            <li>This invoice is a financial record and receipt of payment. It does not replace the manual physical boarding pass required at boarding points.</li>
            <li>Boarding is only permitted upon production of the manual ticket collected from our local office prior to departure.</li>
            <li>Please report to the office checkpoint at least 30 minutes before departure reporting time.</li>
            <li>Original government photo identification is required for identity verification of all boarding passengers.</li>
          </ul>
        </div>

        {/* SIGNATURES */}
        <div className="sign-footer">
          <div className="sign-col">
            <div className="sign-line" />
            <div className="sign-title">Customer Acknowledgement</div>
          </div>
          <div className="sign-col" style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#0a2351' }}>For TS BOAT TOURISM</div>
            <div className="sign-line" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '18px', color: '#1a6b7a', opacity: 0.6 }}>TS Boat Tourism Admin</span>
            </div>
            <div className="sign-title">Authorized Signatory</div>
          </div>
        </div>

        <div className="bottom-bar">
          ⚓ Thank you for booking with TS Boat Tourism. Have a safe and memorable trip! ⚓
        </div>

      </div>
      <PrintAction showClose />
    </AdminInvoiceGuard>
  );
}
