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
  agent_gst?: string | null;
  agent_company?: string | null;
  cancellation_details?: {
    status: string;
    reason: string;
    cancellation_fee?: number | null;
    refund_amount?: number | null;
    requested_at?: string | null;
    processed_at?: string | null;
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ secret?: string }>;
}

export default async function PrintInvoicePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { secret } = await searchParams;

  let hasSecret = false;

  if (secret) {
    const secretKey = process.env.SECRET_KEY || 'tsaptourismpapikondalubadhrachalam';
    const expectedSecret = crypto
      .createHmac('sha256', secretKey)
      .update(id)
      .digest('hex');

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
    const res = await apiFetch(`/api/v1/bookings/${id}`);
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
  });
  const invoiceDateFormatted = new Date(booking.created_at || new Date()).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  const halfGst = (booking.gst_amount / 2).toFixed(2);
  const totalPaid = (booking.paid_amount ?? (booking.total_amount - booking.remaining_balance)) || 0;
  const passengerCount = booking.adult_count + booking.child_count;
  const transportSelections = getTransportSelections(booking.pricing_snapshot);
  const refreshmentIncluded = hasRefreshment(booking);
  const refreshmentAmount = getRefreshmentAmount(booking.pricing_snapshot);
  const baseFare = getBaseFareExcludingAddons(booking.subtotal_amount, booking.pricing_snapshot);
  const capturedPayments = getCapturedPayments(booking.payment_ledger);

  const primaryPassenger = booking.passengers?.find(p => p.is_primary) || booking.passengers?.[0];
  const billedName = primaryPassenger?.full_name || booking.user?.full_name || 'Guest User';
  const billedPhone = 
    primaryPassenger?.phone_number || 
    (primaryPassenger as any)?.phone || 
    (booking as any)?.user?.phone_number || 
    booking?.user?.phone || 
    (booking as any)?.agent_phone ||
    'N/A';

  const paymentMode = booking.pricing_snapshot?.razorpay_payment_id ? 'Online (Razorpay)' : 'Office';
  const paymentId = booking.pricing_snapshot?.razorpay_payment_id || 'N/A';
  const isRazorpay = paymentMode === 'Online (Razorpay)';
  const gstNumber = '36AYSPN0044M1ZZ';


  return (
    <AdminInvoiceGuard hasSecret={hasSecret}>
      <div className="invoice-container">
        <style dangerouslySetInnerHTML={{
          __html: `
        body {
          font-family: var(--font-outfit), var(--font-sans), sans-serif;
        }
          
          @page { size: A4 portrait; margin: 15mm 15mm 15mm 15mm; }
          
          body {
            margin: 0;
            font-family: 'Inter', system-ui, sans-serif;
            color: #1e293b;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .invoice-container { max-width: 800px; margin: 0 auto; padding: 0; }

          /* Header Styling */
          .header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          
          .header-logos { display: flex; align-items: center; gap: 10px; width: 30%; }
          .logo-img { height: 60px; width: 60px; border-radius: 50%; object-fit: cover; background: #fff; }
          
          .header-center { width: 40%; text-align: center; }
          .header-center h1 { margin: 0; font-size: 38px; font-weight: 900; color: #1e3a8a; letter-spacing: 2px; }
          .header-center .stars { color: #1e3a8a; font-size: 16px; margin: -5px 0 5px 0; }
          .tax-badge { 
            background: #1e3a8a; color: white; padding: 4px 16px; border-radius: 4px; 
            font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
            display: inline-block;
          }
          
          .header-right { width: 30%; text-align: right; }
          .header-right h2 { margin: 0; font-size: 18px; font-weight: 900; color: #ea580c; line-height: 1.1; }
          .header-right h3 { margin: 2px 0 0 0; font-size: 14px; font-weight: 800; color: #1e3a8a; }

          /* Address Row */
          .address-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 11px;
          }
          .company-address { width: 35%; color: #334155; line-height: 1.5; }
          .company-contact { width: 30%; color: #334155; line-height: 1.6; }
          .invoice-details { width: 35%; text-align: left; }
          
          .invoice-details table { width: 100%; font-size: 11px; }
          .invoice-details td { padding: 2px 0; border: none; }
          .invoice-details td:first-child { font-weight: 700; color: #1e3a8a; width: 40%; }
          
          .contact-item { display: flex; align-items: center; gap: 6px; }
          .info-item { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }

          /* Cards (Billed To & Status) */
          .cards-row { display: flex; gap: 20px; margin-bottom: 20px; }
          .card { border: 1px solid #cbd5e1; flex: 1; border-radius: 6px; overflow: hidden; }
          .card-header { background: #1e3a8a; color: white; padding: 8px 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
          .card-header.green { background: #16a34a; }
          .card-body { padding: 12px; font-size: 11px; line-height: 1.6; height: 100px; display: flex; flex-direction: column; justify-content: center; }
          
          .billed-table { width: 100%; border: none; }
          .billed-table td { border: none; padding: 3px 0; vertical-align: top; }
          .billed-table td:first-child { font-weight: 700; color: #1e3a8a; width: 25%; }
          
          .status-display { text-align: center; }
          .status-icon { display: flex; align-items: center; justify-content: center; gap: 10px; color: #16a34a; font-size: 20px; font-weight: 800; }
          .status-icon.partial { color: #ea580c; }
          .status-text { margin-top: 8px; color: #475569; font-weight: 500; font-size: 10px; }

          /* Passenger Table */
          .table-title { background: #1e3a8a; color: white; padding: 8px 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; border-radius: 6px 6px 0 0; }
          .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
          .data-table th { background: #e2e8f0; color: #1e293b; font-weight: 700; padding: 8px 12px; text-align: left; border: 1px solid #cbd5e1; }
          .data-table td { padding: 8px 12px; border: 1px solid #cbd5e1; color: #334155; }
          .data-table tr:nth-child(even) { background: #f8fafc; }
          
          .note { font-size: 10px; color: #1e3a8a; font-weight: 600; margin-top: -10px; margin-bottom: 20px; }

          /* Summary Layout */
          .summary-layout { display: flex; gap: 20px; margin-bottom: 20px; }
          .summary-left { width: 45%; }
          .summary-right { width: 55%; display: flex; flex-direction: column; gap: 15px; }

          .summary-table { width: 100%; border-collapse: collapse; font-size: 11px; }
          .summary-table th { background: #f1f5f9; padding: 8px; border: 1px solid #cbd5e1; text-align: left; }
          .summary-table td { padding: 8px; border: 1px solid #cbd5e1; text-align: right; }
          .summary-table td:first-child { text-align: left; }
          .line-meta { display: block; margin-top: 2px; color: #64748b; font-size: 9px; font-weight: 600; line-height: 1.35; }
          
          .total-row { font-weight: 800; font-size: 12px; color: #1e3a8a; background: #f8fafc; }
          .paid-row { font-weight: 800; font-size: 12px; color: #16a34a; background: #f0fdf4; }
          .balance-row { font-weight: 800; font-size: 12px; color: #dc2626; }
          
          .status-bar { background: #e0f2fe; color: #0369a1; padding: 8px; font-size: 11px; font-weight: 700; text-align: center; border-radius: 4px; margin-top: 10px; text-transform: uppercase; }
          
          /* Footer Details */
          .footer-cards { display: flex; gap: 20px; margin-bottom: 20px; }
          .footer-card { flex: 1; border: 1px solid #1e3a8a; border-radius: 6px; overflow: hidden; }
          .fc-title { background: #1e3a8a; color: white; padding: 6px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
          .fc-body { padding: 12px; font-size: 10px; color: #334155; line-height: 1.5; }
          .fc-body ul { margin: 0; padding-left: 20px; }
          .fc-body li { margin-bottom: 4px; }
          
          .office-details { display: flex; gap: 10px; align-items: flex-start; }
          .boat-illustration { width: 100px; opacity: 0.8; margin-left: auto; }
          
          .bottom-bar { background: #1e3a8a; color: white; padding: 10px; text-align: center; font-size: 14px; font-style: italic; font-weight: 600; border-radius: 4px; display: flex; align-items: center; justify-content: center; gap: 15px; }
        ` }} />

        {/* HEADER */}
        <div className="header-row">
          <div className="header-logos">
            <img src="/aptdc-logo.svg" className="logo-img" alt="AP Tourism" />
            <img src="/telangana-tourism-logo.svg" className="logo-img" alt="Telangana Tourism" />
          </div>
          <div className="header-center">
            <h1>INVOICE</h1>
            <div className="stars">★ ★ ★</div>
            <div className="tax-badge">TAX INVOICE</div>
          </div>
          <div className="header-right">
            <h2>Telangana Boat Tourism</h2>
            <h3>Papikondalu </h3>
          </div>
        </div>

        {/* ADDRESS ROW */}
        <div className="address-row">
          <div className="company-address">
            <strong>Telangana Boat Tourism</strong><br />
            D.no: 4 - 1 - 78/1 (Near SBI ATM),<br />
            Kalyana Mandapam Road, Opp SBI ATM,<br />
            Bhadrachalam, BHADRADRI KOTHAGUDEM Dist.,<br />
            Telangana State - 507 111<br />
            <strong>GSTIN: {gstNumber}</strong>
            {booking.agent_gst && (
              <>
                <br />
                <span style={{ display: 'inline-block', marginTop: '6px' }}>
                  <strong>Agent Company: {booking.agent_company || 'N/A'}</strong><br />
                  <strong>Agent GSTIN: {booking.agent_gst}</strong>
                </span>
              </>
            )}
          </div>
          <div className="company-contact">
            <div className="contact-item"><strong>📞</strong> +91 95420 69573</div>
            <div className="contact-item"><strong>📞</strong> +91 984 984 89 82</div>
            <div className="contact-item"><strong>📞</strong> +91 984 984 89 83</div>
            <div className="contact-item"><strong>📞</strong> +91 984 984 89 38</div>
            <div className="contact-item"><strong>✉️</strong> bookings@tsboattourism.org</div>
            <div className="contact-item"><strong>🌐</strong> www.tsboattourism.org</div>
          </div>
          <div className="invoice-details">
            <table>
              <tbody>
                <tr><td>Invoice No.</td><td>: INV-{booking.public_id}</td></tr>
                <tr><td>Invoice Date</td><td>: {invoiceDateFormatted}</td></tr>
                <tr><td>GSTIN</td><td>: {gstNumber}</td></tr>
                {booking.agent_gst && (
                  <tr><td>Agent GSTIN</td><td>: {booking.agent_gst}</td></tr>
                )}
                <tr><td>Booking ID</td><td>: {booking.public_id}</td></tr>
                <tr><td>{booking.target_type === 'ROOM' ? 'Check-In Date' : 'Travel Date'}</td><td>: {travelDateFormatted}</td></tr>
                {booking.target_type === 'ROOM' && (
                  <tr><td>Check-Out Date</td><td>: {booking.room_checkout_date ? new Date(booking.room_checkout_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase() + ', ' + new Date(booking.room_checkout_date).toLocaleDateString('en-IN', { weekday: 'long' }).toUpperCase() : 'TBA'}</td></tr>
                )}
                <tr><td>{booking.target_type === 'ROOM' ? 'Check-In Time' : 'Reporting Time'}</td><td>: {booking.target_type === 'ROOM' ? (booking.room_checkin || "") : (booking.boarding_point?.departure_time || "")}</td></tr>
                {booking.target_type === 'ROOM' && (
                  <tr><td>Check-Out Time</td><td>: {booking.room_checkout || 'TBA'}</td></tr>
                )}
                <tr><td>{booking.target_type === 'ROOM' ? 'Lodge / Hotel' : 'Reporting Point'}</td><td>: {booking.target_type === 'ROOM' ? (booking.room_address || booking.package_title) : (booking.boarding_point?.title || "")}</td></tr>
                <tr><td>{booking.target_type === 'ROOM' ? 'Room Category' : 'Boat Type'}</td><td>: {booking.variant_title || ""}</td></tr>
                {transportSelections.length > 0 && (
                  <tr>
                    <td style={{ verticalAlign: 'top' }}>Transport</td>
                    <td>: {transportSelections.map((ts) => `${Number(ts.quantity || 1) > 1 ? `${ts.quantity}x ` : ''}${ts.title}`).join(', ')}</td>
                  </tr>
                )}
                {refreshmentIncluded && (
                  <tr>
                    <td style={{ verticalAlign: 'top' }}>Refreshments</td>
                    <td>: {money(refreshmentAmount, 2)} (Add-on for {passengerCount} pax)</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CARDS */}
        <div className="cards-row">
          <div className="card">
            <div className="card-header">BILLED TO</div>
            <div className="card-body">
              <table className="billed-table">
                <tbody>
                  <tr><td>Name</td><td>: {billedName}</td></tr>
                  <tr><td>Phone</td><td>: {billedPhone}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={`card ${booking.status === 'CANCELLED' || booking.status === 'REFUNDED' ? 'cancelled-card' : ''}`}>
            <div className={`card-header ${booking.status === 'FULLY_PAID' || booking.status === 'REFUNDED' ? 'green' : ''}`}>PAYMENT STATUS</div>
            <div className="card-body status-display">
              {booking.status === 'FULLY_PAID' ? (
                <>
                  <div className="status-icon">✅ FULLY PAID</div>
                  <div className="status-text">Payment completed in full.<br />This invoice is generated after full payment.</div>
                </>
              ) : booking.status === 'PARTIAL_PAID' ? (
                <>
                  <div className="status-icon partial">⚠️ PARTIAL PAYMENT</div>
                  <div className="status-text">Advance amount paid.<br />Balance due before boarding.</div>
                </>
              ) : booking.status === 'REFUNDED' ? (
                <>
                  <div className="status-icon" style={{ color: '#059669' }}>💸 REFUNDED</div>
                  <div className="status-text">Booking was cancelled.<br />Amount has been refunded to customer.</div>
                </>
              ) : booking.status === 'CANCELLED' ? (
                <>
                  <div className="status-icon" style={{ color: '#ef4444' }}>🚫 CANCELLED</div>
                  <div className="status-text">This booking has been cancelled.<br />No further payments required.</div>
                </>
              ) : (
                <>
                  <div className="status-icon" style={{ color: '#ef4444' }}>❌ PENDING</div>
                  <div className="status-text">Payment is incomplete.</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* PASSENGERS */}
        <div className="table-title">PASSENGER DETAILS</div>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>#</th>
              <th style={{ width: '35%' }}>Name</th>
              <th style={{ width: '10%' }}>Age</th>
              <th style={{ width: '15%' }}>Gender</th>
              <th style={{ width: '25%' }}>ID Proof (Last 4)</th>
              <th style={{ width: '10%' }}>Type</th>
            </tr>
          </thead>
          <tbody>
            {booking.passengers.map((p, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>
                  {p.full_name} {p.is_primary ? '(Primary)' : ''}
                  {p.phone_number && <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px', fontWeight: 'bold' }}>📞 {p.phone_number}</div>}
                </td>
                <td>{p.age}</td>
                <td>{p.gender || '-'}</td>
                <td>{p.id_proof_number ? `${p.id_proof_type}: ${p.id_proof_number.slice(-4) || p.id_proof_number}` : '(Not Provided)'}</td>
                <td>{p.age >= 11 ? 'Adult' : 'Child'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="note">Note: ID Proof is mandatory for Adults (11+ years). Children (4-10 years) ID Proof is optional.</div>

        {/* SUMMARY SECTION */}
        <div className="summary-layout">
          <div className="summary-left">
            <div className="table-title">BILLING SUMMARY</div>
            <table className="summary-table">
              <tbody>
                <tr>
                  <td>
                    {booking.target_type === 'ROOM' ? 'Room Tariff' : 'Package Fare'}
                    <span className="line-meta">{booking.package_title} - {booking.variant_title} | {booking.adult_count} Adults, {booking.child_count} Children</span>
                  </td>
                  <td>{money(baseFare, 2)}</td>
                </tr>
                {booking.target_type === 'ROOM' && (
                  <tr>
                    <td>
                      Stay Details
                      <span className="line-meta">
                        Check-in {booking.room_checkin || 'TBA'} | Check-out {booking.room_checkout || 'TBA'}{booking.room_checkout_date ? ` | Until ${new Date(booking.room_checkout_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
                      </span>
                    </td>
                    <td>Included</td>
                  </tr>
                )}
                {transportSelections.map((ts, idx) => (
                  <tr key={`transport-${idx}`}>
                    <td>
                      {ts.title || 'Transport'}
                      <span className="line-meta">{describeTransport(ts, passengerCount)}</span>
                    </td>
                    <td>{money(ts.item_total || 0, 2)}</td>
                  </tr>
                ))}
                {refreshmentIncluded && (
                  <tr>
                    <td>
                      Refreshments
                      <span className="line-meta">
                        Add-on for {passengerCount} pax
                      </span>
                    </td>
                    <td>{money(refreshmentAmount, 2)}</td>
                  </tr>
                )}
                {booking.coupon_discount > 0 && (
                  <tr>
                    <td>Discount ({booking.coupon_applied})</td>
                    <td style={{ color: '#16a34a' }}>-{money(booking.coupon_discount, 2)}</td>
                  </tr>
                )}
                <tr>
                  <td>Taxes (GST @ 5%)</td>
                  <td>{money(booking.gst_amount, 2)}</td>
                </tr>
                <tr>
                  <td>Gateway Fee</td>
                  <td>{money(booking.gateway_fee, 2)}</td>
                </tr>
                <tr className="total-row">
                  <td>TOTAL AMOUNT</td>
                  <td>{money(booking.total_amount, 2)}</td>
                </tr>
                <tr className="paid-row">
                  <td>AMOUNT PAID</td>
                  <td>{money(totalPaid, 2)}</td>
                </tr>
                <tr className="balance-row">
                  <td>REMAINING BALANCE</td>
                  <td>{money(booking.remaining_balance, 2)}</td>
                </tr>
              </tbody>
            </table>
            {(booking.status === 'CANCELLED' || booking.status === 'REFUNDED') && booking.cancellation_details && (
              <table className="summary-table" style={{ marginTop: '10px', borderTop: '2px dashed #cbd5e1' }}>
                <tbody>
                  <tr>
                    <td>Cancellation Charges</td>
                    <td style={{ color: '#ef4444' }}>{money(booking.cancellation_details.cancellation_fee || 0, 2)}</td>
                  </tr>
                  <tr className="paid-row" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                    <td>AMOUNT REFUNDED</td>
                    <td>{money(booking.cancellation_details.refund_amount || 0, 2)}</td>
                  </tr>
                </tbody>
              </table>
            )}
            <div className="status-bar">PAYMENT STATUS: {booking.status.replace('_', ' ')}</div>
          </div>

          <div className="summary-right">
            <div>
              <div className="table-title">PAYMENT BREAKDOWN</div>
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Payment Date</th>
                    <th>Mode</th>
                    <th>Transaction / Ref No.</th>
                    <th>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {capturedPayments.length > 0 ? (
                    capturedPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{payment.created_at ? new Date(payment.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : invoiceDateFormatted}</td>
                        <td>{getPaymentMethodLabel(payment.payment_method)}</td>
                        <td>{payment.payment_reference_id || payment.collected_by_label || 'N/A'}</td>
                        <td>{Number(payment.amount || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td>{invoiceDateFormatted}</td>
                      <td>{paymentMode}</td>
                      <td>{paymentId}</td>
                      <td>{totalPaid.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="paid-row">
                    <td colSpan={3}>TOTAL PAID</td>
                    <td>{money(totalPaid, 2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <div className="table-title">TAX BREAKUP</div>
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Tax Type</th>
                    <th>Taxable Amount (₹)</th>
                    <th>Tax Rate (%)</th>
                    <th>Tax Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>CGST</td>
                    <td>{(booking.total_amount - booking.gst_amount).toFixed(2)}</td>
                    <td>2.50</td>
                    <td>{halfGst}</td>
                  </tr>
                  <tr>
                    <td>SGST</td>
                    <td>{(booking.total_amount - booking.gst_amount).toFixed(2)}</td>
                    <td>2.50</td>
                    <td>{halfGst}</td>
                  </tr>
                  <tr className="paid-row">
                    <td colSpan={3}>TOTAL GST</td>
                    <td>₹ {booking.gst_amount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* INSTRUCTIONS */}
        <div className="footer-cards">
          <div className="footer-card" style={{ flex: '1.2' }}>
            <div className="fc-title">IMPORTANT INSTRUCTIONS</div>
            <div className="fc-body">
              <ul>
                <li>You must visit our office before the journey and collect your original manual boarding ticket.</li>
                <li>Please reach at least 30 minutes before reporting time.</li>
                <li>Carry a valid photo ID proof.</li>
                <li>This invoice is not valid for boarding. Boarding is allowed only with the original ticket issued by our office.</li>
                <li>Outside food & alcohol are strictly not allowed.</li>
              </ul>
            </div>
          </div>
          <div className="footer-card" style={{ flex: '1.5' }}>
            <div className="fc-title">OFFICE DETAILS</div>
            <div className="fc-body office-details">
              <div>
                <strong>📍 TOURISM OFFICE</strong><br />
                D.no: 4 - 1 - 78/1 (Near SBI ATM), Kalyana Mandapam Road,<br />
                Bhadrachalam, BHADRADRI KOTHAGUDEM Dist, Telangana - 507 111<br /><br />
                <strong>📞 +91 95420 69573 | +91 984 984 89 82</strong><br />
                🕒 Office Time: 06:00 AM to 08:00 PM (All Days)
              </div>
            </div>
          </div>
        </div>

        <div className="bottom-bar">
          ⚓ Thank you for travelling with us! ⚓
        </div>

      </div>
      <PrintAction showClose />
    </AdminInvoiceGuard>
  );
}
