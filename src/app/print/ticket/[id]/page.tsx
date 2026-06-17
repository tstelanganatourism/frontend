import React from 'react';
import crypto from 'crypto';
import { apiFetch } from '@/lib/api';
import { notFound } from 'next/navigation';
import PrintAction from '@/components/ui/PrintAction';
import {
  describeTransport,
  getBaseFareExcludingAddons,
  getCapturedPayments,
  getRefreshmentAmount,
  getTransportSelections,
  hasRefreshment,
  money,
  type PaymentLedgerEntry,
} from '@/lib/bookingDisplay';

export const dynamic = 'force-dynamic';

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

interface BoardingPoint {
  title: string;
  address: string;
  landmark: string;
  departure_time: string;
  contact_number: string;
}

interface BookingDetails {
  id: number;
  public_id: string;
  travel_date: string;
  adult_count: number;
  child_count: number;
  student_count: number;
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
  package_type?: 'TOUR' | 'TRIP';
  target_type?: 'PACKAGE' | 'ROOM';
  boarding_point: BoardingPoint | null;
  passengers: Passenger[];
  agent_id: number | null;
  agent_name: string | null;
  agent_phone?: string | null;
  agent_gst?: string | null;
  agent_company?: string | null;
  customer_email?: string | null;
  room_checkin?: string | null;
  room_checkout?: string | null;
  room_checkout_date?: string | null;
  room_address?: string | null;
  room_highlights?: { title: string; icon: string }[];
  itinerary?: { day_number: number; title: string; timing: string; duration?: string | null; meal_included?: boolean; description: string }[];
  pricing_snapshot?: any;
  has_refreshment_addon?: boolean;
  payment_ledger?: PaymentLedgerEntry[];
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

export default async function PrintTicketPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { secret } = await searchParams;

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
  }

  let booking: BookingDetails | null = null;
  try {
    const res = await apiFetch(`/api/v1/bookings/${id}`, { cache: 'no-store' });
    if (res.status === 200) {
      booking = await res.json();
      console.log("=== TICKET PAGE FETCHED BOOKING ===", id, "room_checkout_date:", booking?.room_checkout_date);
    }
  } catch (err) {
    console.error("Failed to fetch booking details for print:", err);
  }

  if (!booking) {
    return notFound();
  }

  const travelDateObj = new Date(booking.travel_date);
  const travelDateFormatted = travelDateObj.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  }).toUpperCase() + ', ' + travelDateObj.toLocaleDateString('en-IN', { weekday: 'long' }).toUpperCase();

  const isRoom = booking.target_type === 'ROOM';
  const isBoatRide = booking.package_type === 'TOUR';
  let ticketTitle = isRoom ? 'HOTEL/RESORT TICKET' : (isBoatRide ? 'BOAT RIDE TICKET' : 'SIGHTSEEING TICKET');
  if (booking.status === 'CANCELLED') ticketTitle = 'CANCELLED TICKET';
  if (booking.status === 'REFUNDED') ticketTitle = 'REFUNDED TICKET';

  const reportingTime = isRoom ? (booking.room_checkin || 'TBA') : (booking.boarding_point?.departure_time || 'TBA');
  const boardingTitle = isRoom
    ? (booking.package_title)
    : (booking.boarding_point?.title || 'Bhadrachalam Tourism Office');

  const totalPaid = (booking.paid_amount ?? (booking.total_amount - booking.remaining_balance)) || 0;
  const isFullyPaid = booking.status === 'FULLY_PAID';
  const passengerCount = booking.student_count > 0 ? booking.student_count : booking.adult_count + booking.child_count;
  const transportSelections = getTransportSelections(booking.pricing_snapshot);
  const has25Seater = transportSelections.some(ts =>
    Number(ts.capacity) === 25 ||
    (ts.title && (
      ts.title.toLowerCase().includes('25') ||
      ts.title.toLowerCase().includes('25-seater') ||
      ts.title.toLowerCase().includes('25 seater')
    ))
  );
  const refreshmentIncluded = hasRefreshment(booking);
  const refreshmentAmount = getRefreshmentAmount(booking.pricing_snapshot);
  const baseFare = getBaseFareExcludingAddons(booking.subtotal_amount, booking.pricing_snapshot);
  const capturedPayments = getCapturedPayments(booking.payment_ledger);

  // Determine if payment was made online (PhonePe or Cashfree)
  const isOnlinePayment = !!(
    booking.pricing_snapshot?.pg_payment_id ||
    booking.pricing_snapshot?.pg_order_id ||
    booking.payment_ledger?.some((p) => p.payment_method === 'PHONEPE' || p.payment_method === 'CASHFREE' || p.payment_method === 'RAZORPAY')
  );
  const gstNumber = '36AYSPN0044M1ZZ';

  // Parse itinerary events
  type TlEvent = { time: string; desc: string };
  function parseEvents(day: { timing?: string; title: string; description?: string }): TlEvent[] {
    const combined = (day.description || '').trim();
    if (!combined) return [{ time: day.timing || '', desc: day.title }];
    const parts = combined
      .split(/(?=\d{1,2}:\d{2}\s*(?:AM|PM)\s*[-–])/i)
      .map(p => p.trim())
      .filter(Boolean);
    const matches: TlEvent[] = [];
    for (const part of parts) {
      const m = part.match(/^(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[-–]\s*([\s\S]+)/i);
      if (m) {
        const desc = m[2].trim().replace(/\.\s*$/, '').trim();
        if (desc) matches.push({ time: m[1].trim(), desc });
      }
    }
    if (matches.length > 0) return matches;
    return [{ time: day.timing || '', desc: `${day.title}${day.description ? ' — ' + day.description : ''}` }];
  }

  const allEvents: TlEvent[] =
    booking.itinerary && booking.itinerary.length > 0
      ? booking.itinerary.flatMap(day => parseEvents(day))
      : [];

  const parts: string[] = [];
  if (booking.student_count > 0) {
    parts.push(`${booking.student_count} Student${booking.student_count > 1 ? 's' : ''}`);
  } else {
    if (booking.adult_count > 0) parts.push(`${booking.adult_count} Adult${booking.adult_count > 1 ? 's' : ''}`);
    if (booking.child_count > 0) parts.push(`${booking.child_count} Child${booking.child_count > 1 ? 'ren' : ''}`);
  }
  const guestSummary = parts.join(', ') || `${booking.passengers.length} Passenger${booking.passengers.length > 1 ? 's' : ''}`;
  const primaryPassenger = booking.passengers.find(p => p.is_primary) || booking.passengers[0];

  return (
    <div className="wrap">
      <style dangerouslySetInnerHTML={{
        __html: `
        body {
          font-family: var(--font-outfit), var(--font-sans), sans-serif;
        }
        @page { size: A4 portrait; margin: 6mm 8mm; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Inter', system-ui, sans-serif;
          color: #1e293b;
          background: #fff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .wrap { width: 100%; max-width: 700px; margin: 0 auto; border: 2px solid #0a2351; }

        /* ── HEADER ── */
        .header {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; padding: 12px 16px; background: #fff;
          border-bottom: 3px solid #2e7d32;
        }
        .state-brand {
          display: flex; align-items: center; gap: 9px; min-width: 0; flex: 1;
        }
        .state-brand.ap { flex-direction: row-reverse; text-align: right; }
        .state-brand img {
          height: 50px; width: 50px; border-radius: 50%; object-fit: contain;
          border: 2px solid #ddd; background: #fff; padding: 2px; flex-shrink: 0;
        }
        .state-copy { display: flex; min-width: 0; flex-direction: column; gap: 1px; line-height: 1.15; }
        .state-en {
          font-size: 10px; font-weight: 900; color: #475569;
          text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;
        }
        .state-name-ts { color: #1a6b7a; font-weight: 900; }
        .state-name-ap { color: #e0a92c; font-weight: 900; }
        .state-telugu {
          font-family: 'Noto Sans Telugu', 'Inter', sans-serif;
          font-size: 11px; font-weight: 800; color: #0f172a; white-space: nowrap;
        }
        .state-urdu {
          font-family: 'Noto Nastaliq Urdu', 'Inter', sans-serif;
          font-size: 10px; font-weight: 700; color: #475569; white-space: nowrap;
        }
        .header-center {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          width: 122px; flex-shrink: 0; text-align: center;
        }
        .header-center img {
          height: 56px; width: 56px; border-radius: 50%; object-fit: contain;
          background: #fff; box-shadow: 0 0 0 1px #e2e8f0;
        }
        .platform-text {
          margin-top: 4px; font-size: 8px; font-weight: 900; color: #0a2351;
          text-transform: uppercase; letter-spacing: 0.7px; line-height: 1.2;
        }

        /* ── TICKET TITLE ── */
        .ticket-title-wrap {
          text-align: center; padding: 10px 20px 0; background: #fff;
          display: flex; align-items: center; gap: 12px;
        }
        .ticket-title-rule { flex: 1; height: 2px; background: linear-gradient(to right, transparent, #c8a45a); }
        .ticket-title-rule.right { background: linear-gradient(to left, transparent, #c8a45a); }
        .ticket-title-inner { display: flex; flex-direction: column; align-items: center; gap: 2px; flex-shrink: 0; }
        .ticket-type-badge {
          font-size: 10px; font-weight: 900; color: #c8a45a;
          text-transform: uppercase; letter-spacing: 3px;
        }
        .ticket-title {
          font-size: 24px; font-weight: 900; color: #0a2351;
          letter-spacing: 2px;
        }

        /* ── PKG RIBBON ── */
        .pkg-ribbon {
          background: linear-gradient(135deg, #0a2351 0%, #1a3a6b 50%, #0a2351 100%);
          color: #fff; text-align: center;
          padding: 10px 20px; font-size: 15px; font-weight: 900;
          letter-spacing: 1.5px; text-transform: uppercase;
          border-top: 3px solid #c8a45a;
          margin-bottom: 0;
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .pkg-ribbon-sub {
          font-size: 9px; font-weight: 700; color: #c8a45a;
          letter-spacing: 2px; text-transform: uppercase; margin-top: 2px;
        }

        /* ── BANNER ── */
        .banner-img {
          width: 100%; display: block; object-fit: cover;
        }

        /* ── BODY ── */
        .body { padding: 12px 14px; }

        /* ── TOP GRID ── */
        .top-grid { display: flex; gap: 10px; margin-bottom: 10px; }

        /* Booking card */
        .bk-card { width: 36%; border: 1.5px solid #0a2351; border-radius: 6px; overflow: hidden; }
        .bk-hdr { background: #0a2351; color: white; padding: 5px 10px; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
        .bk-body { padding: 8px 10px; }
        .bk-row { display: flex; gap: 7px; margin-bottom: 7px; align-items: flex-start; padding-bottom: 7px; border-bottom: 1px solid #f1f5f9; }
        .bk-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .bk-icon { font-size: 12px; color: #0a2351; width: 16px; text-align: center; flex-shrink: 0; margin-top: 1px; }
        .bk-lbl { font-size: 7.5px; font-weight: 800; color: #d32f2f; text-transform: uppercase; letter-spacing: 0.5px; }
        .bk-val { font-size: 11px; font-weight: 800; color: #0a2351; }

        /* Notice card */
        .note-card { flex: 1; border: 1.5px solid #d32f2f; border-radius: 6px; overflow: hidden; display: flex; flex-direction: column; }
        .note-top { display: flex; gap: 8px; padding: 10px; align-items: flex-start; }
        .note-badge {
          background: #d32f2f; color: white; border-radius: 50%;
          width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 900; flex-shrink: 0;
        }
        .note-title { font-size: 11px; font-weight: 900; color: #d32f2f; margin-bottom: 2px; }
        .note-body { font-size: 9.5px; font-weight: 600; color: #475569; line-height: 1.5; }
        .note-highlight {
          background: #fff3cd; border-top: 1.5px solid #ffc107; border-bottom: 1.5px solid #ffc107;
          padding: 6px 12px; font-size: 11px; font-weight: 900; color: #0a2351; text-align: center;
          letter-spacing: 0.5px;
        }
        .note-addr { display: flex; gap: 10px; padding: 8px 10px; background: #f8fafc; border-top: 1px solid #e2e8f0; flex: 1; }
        .note-addr-col { flex: 1; font-size: 9px; line-height: 1.7; color: #475569; font-weight: 600; }
        .note-addr-col strong { display: flex; align-items: center; gap: 3px; color: #0a2351; font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
        .divider-v { width: 1px; background: #e2e8f0; }
        .note-report-bar {
          background: #0a2351; color: #fff; text-align: center;
          padding: 6px 10px; font-size: 9px; font-weight: 800;
          letter-spacing: 1px; display: flex; align-items: center; justify-content: center; gap: 6px;
        }

        /* ── PASSENGERS ── */
        .sec-hdr { background: #0a2351; color: white; padding: 5px 10px; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; border-radius: 4px 4px 0 0; }
        .pax-table { width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #ddd; }
        .pax-table th { background: #f5f5f5; color: #333; font-weight: 800; padding: 5px 8px; text-align: left; border: 1px solid #ddd; font-size: 9px; text-transform: uppercase; letter-spacing: 0.3px; }
        .pax-table td { padding: 5px 8px; border: 1px solid #ddd; color: #333; font-weight: 600; }
        .pax-table tr:nth-child(even) td { background: #fafafa; }
        .lead-badge { background: #2e7d32; color: white; font-size: 7px; font-weight: 800; padding: 1px 5px; border-radius: 10px; margin-left: 5px; vertical-align: middle; }
        .type-chip { font-size: 8px; font-weight: 800; padding: 1.5px 7px; border-radius: 10px; }
        .adult-chip { background: #e3f2fd; color: #1565c0; }
        .child-chip { background: #e8f5e9; color: #2e7d32; }
        .note-text { font-size: 8.5px; color: #555; font-weight: 600; padding: 5px 10px; font-style: italic; border: 1px solid #ddd; border-top: none; margin-bottom: 10px; }

        /* ── BOTTOM GRID ── */
        .btm-grid { display: flex; gap: 10px; margin-bottom: 10px; }

        /* Payment card */
        .pay-card { width: 42%; border: 1.5px solid #ddd; border-radius: 6px; overflow: hidden; display: flex; flex-direction: column; }
        .pay-row { display: flex; justify-content: space-between; padding: 5px 10px; font-size: 10px; border-bottom: 1px solid #f1f5f9; color: #555; font-weight: 600; }
        .pay-row span:last-child { font-weight: 700; color: #1e293b; text-align: right; }
        .pay-row small { display: block; color: #64748b; font-size: 7.5px; line-height: 1.35; margin-top: 1px; font-weight: 700; }
        .pay-total { display: flex; justify-content: space-between; padding: 6px 10px; font-size: 11px; font-weight: 900; color: #0a2351; background: #e8eaf6; border-top: 2px solid #9fa8da; }
        .pay-paid { display: flex; justify-content: space-between; padding: 5px 10px; font-size: 10.5px; font-weight: 800; color: #2e7d32; background: #e8f5e9; }
        .pay-bal { display: flex; justify-content: space-between; padding: 5px 10px; font-size: 10.5px; font-weight: 800; color: #d32f2f; background: #ffebee; }
        .pay-status-row { display: flex; justify-content: space-between; padding: 5px 10px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
        .pay-note { display: flex; align-items: flex-start; gap: 5px; padding: 6px 10px; font-size: 8.5px; color: #555; font-weight: 600; background: #f5f5f5; border-top: 1px solid #eee; line-height: 1.5; }
        .pay-note-icon { color: #1565c0; font-size: 12px; flex-shrink: 0; margin-top: 1px; }

        /* Journey card */
        .journey-card { flex: 1; border: 1.5px solid #ddd; border-radius: 6px; overflow: hidden; }
        .jt-timeline { padding: 8px 10px; }
        .jt-event { display: flex; gap: 10px; padding-bottom: 12px; align-items: stretch; }
        .jt-dot-col { display: flex; flex-direction: column; align-items: center; width: 12px; flex-shrink: 0; }
        .jt-dot { width: 8px; height: 8px; border-radius: 50%; background: #0a2351; border: 2px solid #9fa8da; flex-shrink: 0; }
        .jt-line { width: 2px; flex: 1; background: #c5cae9; min-height: 12px; }
        .jt-time { font-size: 9.5px; font-weight: 800; color: #0a2351; min-width: 65px; white-space: nowrap; flex-shrink: 0; }
        .jt-desc { font-size: 9.5px; font-weight: 600; color: #444; line-height: 1.4; flex: 1; }

        /* ── RULES GRID ── */
        .rules-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 10px; }
        .rule-box { border: 1px solid #ddd; border-radius: 5px; padding: 8px 9px; background: #fff; }
        .rule-box-title { font-size: 8.5px; font-weight: 900; color: #d32f2f; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
        .rule-box ul { padding-left: 12px; }
        .rule-box li { font-size: 8.5px; color: #444; font-weight: 600; margin-bottom: 2px; line-height: 1.4; }
        .rule-alert { font-size: 8px; font-weight: 800; color: #d32f2f; margin-top: 4px; font-style: italic; }
        .rule-check li { list-style: none; position: relative; padding-left: 2px; }
        .rule-check li::before { content: '✓'; color: #2e7d32; font-weight: 900; margin-right: 3px; }

        /* ── BUS WARNING ── */
        .bus-warning-box {
          border: 1.5px solid #d97706; background: #fffbeb; border-radius: 6px; padding: 8px 10px; margin-bottom: 10px;
        }
        .bus-warning-title {
          font-size: 10px; font-weight: 900; color: #b45309; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;
        }
        .bus-warning-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .bus-warning-col {
          font-size: 8px; color: #4b5563; line-height: 1.4; font-weight: 600;
        }
        .bus-warning-col ul {
          list-style: none; margin: 0; padding: 0;
        }
        .bus-warning-col li {
          display: flex; gap: 4px; margin-bottom: 3px;
        }

        /* ── AGENT BAR ── */
        .agent-bar {
          display: flex; align-items: center; justify-content: space-between;
          background: #1e293b; color: #94a3b8;
          padding: 6px 14px; font-size: 9px; font-weight: 700;
          border-top: 2px solid #f59e0b;
        }
        .agent-bar-label { color: #f59e0b; font-size: 8px; text-transform: uppercase; letter-spacing: 1px; font-weight: 900; margin-right: 6px; }
        .agent-bar strong { color: #fde68a; font-size: 10px; }

        /* ── FOOTER ── */
        .footer {
          background: #0a2351; color: white;
          display: flex; align-items: center; justify-content: center; gap: 20px;
          padding: 8px 14px; font-size: 9px; font-weight: 700;
        }
        .footer-item { display: flex; align-items: center; gap: 4px; color: #e0e0e0; }
        .footer-item strong { color: #fff; }
        .footer-tagline {
          text-align: center; padding: 8px 14px;
          font-family: 'Dancing Script', cursive;
          font-size: 16px; font-weight: 700; color: #2e7d32;
          background: #f5f5f5; border-top: 1px solid #ddd;
        }

        @media print { .no-print { display: none !important; } }
      ` }}></style>

      {(booking.status === 'CANCELLED' || booking.status === 'REFUNDED') && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, pointerEvents: 'none', overflow: 'hidden'
        }}>
          <div style={{
            transform: 'rotate(-45deg)',
            fontSize: '120px',
            fontWeight: 900,
            color: 'rgba(239, 68, 68, 0.15)', /* red-500 with low opacity */
            textTransform: 'uppercase',
            letterSpacing: '10px',
            border: '8px solid rgba(239, 68, 68, 0.15)',
            padding: '20px 40px',
            borderRadius: '20px',
            whiteSpace: 'nowrap'
          }}>
            {booking.status}
          </div>
        </div>
      )}

      {/* ═══════ HEADER ═══════ */}
      <div className="header">
        <div className="state-brand ts">
          <img src="/telangana-tourism-logo.svg" alt="Telangana Tourism" />
          <div className="state-copy">
            <div className="state-en"><span className="state-name-ts">Telangana</span> Boat Tourism</div>
            <div className="state-telugu">తెలంగాణ బోట్ టూరిజం</div>
            <div className="state-urdu" dir="rtl">تلنگانہ بوٹ ٹورزم</div>
          </div>
        </div>
        <div className="header-center">
          <img src="/apple-touch-icon.png" alt="Telangana and AP Boat Tourism" />
          <div className="platform-text">Official Booking Platform</div>
        </div>
        <div className="state-brand ap">
          <img src="/aptdc-logo.svg" alt="Andhra Pradesh Tourism" />
          <div className="state-copy">
            <div className="state-en"><span className="state-name-ap">Andhra Pradesh</span> Boat Tourism</div>
            <div className="state-telugu">ఆంధ్రప్రదేశ్ బోట్ టూరిజం</div>
            <div className="state-urdu" dir="rtl">آندھرا پردیش بوٹ ٹورزم</div>
          </div>
        </div>
      </div>

      {/* ═══════ TICKET TITLE ═══════ */}
      <div className="ticket-title-wrap">
        <div className="ticket-title-rule" />
        <div className="ticket-title-inner">
          <div className="ticket-type-badge">✦ {isRoom ? 'Room / Stay Booking' : isBoatRide ? 'Boat Tour Booking' : 'Sightseeing Booking'} ✦</div>
          <div className="ticket-title">{ticketTitle}</div>
        </div>
        <div className="ticket-title-rule right" />
      </div>

      {/* ═══════ PKG RIBBON ═══════ */}
      <div className="pkg-ribbon">
        {booking.package_title.toUpperCase()}
        {booking.variant_title && <div className="pkg-ribbon-sub">{booking.variant_title}</div>}
      </div>

      {/* ═══════ BANNER IMAGE ═══════ */}
      <img src="https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1780902910/8f1dd045-5038-4ae4-9b7c-1f8ba27c897f_uftvpr.png" className="banner-img" alt="AP and Telangana Boat Tourism" />

      <div className="body">
        {/* ═══════ TOP GRID ═══════ */}
        <div className="top-grid">
          {/* Booking Details Card */}
          <div className="bk-card">
            <div className="bk-hdr">Booking Details</div>
            <div className="bk-body">
              <div className="bk-row">
                <div className="bk-icon">🎫</div>
                <div><div className="bk-lbl">Booking ID</div><div className="bk-val">{booking.public_id}</div></div>
              </div>
              {primaryPassenger?.phone_number && (
                <div className="bk-row">
                  <div className="bk-icon">📞</div>
                  <div><div className="bk-lbl">Customer Phone</div><div className="bk-val">{primaryPassenger.phone_number}</div></div>
                </div>
              )}
              {booking.customer_email && (
                <div className="bk-row">
                  <div className="bk-icon">✉️</div>
                  <div><div className="bk-lbl">Customer Email</div><div className="bk-val">{booking.customer_email}</div></div>
                </div>
              )}
              <div className="bk-row">
                <div className="bk-icon">📅</div>
                <div><div className="bk-lbl">{isRoom ? 'Check-In Date' : 'Travel Date'}</div><div className="bk-val">{travelDateFormatted}</div></div>
              </div>
              {isRoom && (
                <div className="bk-row">
                  <div className="bk-icon">📅</div>
                  <div><div className="bk-lbl">Check-Out Date</div><div className="bk-val">{booking.room_checkout_date ? new Date(booking.room_checkout_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase() + ', ' + new Date(booking.room_checkout_date).toLocaleDateString('en-IN', { weekday: 'long' }).toUpperCase() : 'TBA'}</div></div>
                </div>
              )}
              <div className="bk-row">
                <div className="bk-icon">🕒</div>
                <div><div className="bk-lbl">{isRoom ? 'Check-In Time' : 'Reporting Time'}</div><div className="bk-val">{reportingTime}</div></div>
              </div>
              {isRoom && (
                <div className="bk-row">
                  <div className="bk-icon">🕒</div>
                  <div><div className="bk-lbl">Check-Out Time</div><div className="bk-val">{booking.room_checkout || 'TBA'}</div></div>
                </div>
              )}
              <div className="bk-row">
                <div className="bk-icon">📍</div>
                <div><div className="bk-lbl">{isRoom ? 'Lodge / Hotel' : 'Reporting Point'}</div><div className="bk-val">{boardingTitle}</div></div>
              </div>
              <div className="bk-row">
                <div className="bk-icon">{isRoom ? '🏨' : '🚢'}</div>
                <div><div className="bk-lbl">{isRoom ? 'Room Category' : 'Boat Type'}</div><div className="bk-val">{booking.variant_title}</div></div>
              </div>
              <div className="bk-row">
                <div className="bk-icon">👥</div>
                <div><div className="bk-lbl">Total Passengers</div><div className="bk-val">{guestSummary}</div></div>
              </div>
              {(transportSelections.length > 0 || refreshmentIncluded) && (
                <div className="bk-row">
                  <div className="bk-icon">🚐</div>
                  <div>
                    <div className="bk-lbl">Addons & Transport</div>
                    <div className="bk-val text-[10px] space-y-1 mt-0.5">
                      {transportSelections.map((ts, i) => (
                        <div key={i}>
                          • {ts.title} ({describeTransport(ts, passengerCount)})
                        </div>
                      ))}
                      {refreshmentIncluded && (
                        <div>
                          • Refreshments: {money(refreshmentAmount, 2)} ({passengerCount} pax)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Important Notice Card */}
          <div className="note-card">
            <div className="note-top">
              <div className="note-badge">!</div>
              <div>
                <div className="note-title">IMPORTANT: THIS IS NOT YOUR BOARDING TICKET</div>
                <div className="note-body">
                  {isRoom
                    ? 'This is a room booking voucher. Present this document at reception along with a valid Government ID during check-in.'
                    : 'This is a booking confirmation / ticket summary.'}
                </div>
              </div>
            </div>
            {!isRoom && (
              <div className="note-highlight">
                YOU MUST VISIT OUR OFFICE BEFORE THE JOURNEY
              </div>
            )}
            {!isRoom && (
              <div className="note-body" style={{ padding: '6px 10px', fontSize: '9px', lineHeight: '1.6', color: '#475569' }}>
                Please reach our office on the reporting date and collect your original manual boarding ticket.
              </div>
            )}
            <div className="note-addr">
              <div className="note-addr-col">
                <strong>📍 Telangana Boat Tourism Office Address</strong>
                DR NO:4-1-78/1<br />
                KALYANA MANDAPAM ROAD OPP SBI ATM<br />
                BHADRACHALAM, BHADRADRI KOTHAGUDEM (DIST),<br />
                TELANGANA-507111<br />
                <div style={{ marginTop: '6px', marginBottom: '4px' }}>
                  <a
                    href="https://maps.app.goo.gl/ZZynQYDrgaDAipDz6?g_st=awb"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '8px', fontWeight: 800, textDecoration: 'none', border: '1px solid #bae6fd' }}
                  >
                    🗺️ Open in Google Maps
                  </a>
                </div>
                <strong>GSTIN: {gstNumber}</strong>
                {booking.agent_gst && (
                  <>
                    <br />
                    <strong>Agent GSTIN: {booking.agent_gst}</strong>
                    {booking.agent_company && (
                      <> ({booking.agent_company})</>
                    )}
                  </>
                )}
                {/* Location link for room or boarding point */}
                {isRoom && booking.room_address && (
                  <div style={{ marginTop: '10px', padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                    <strong style={{ color: '#0f172a', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px' }}>📍 {booking.package_title} Location</strong>
                    <div style={{ fontSize: '8px', color: '#475569', marginTop: '2px', marginBottom: '6px' }}>{booking.room_address}</div>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(booking.room_address)}`}
                      style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '8px', fontWeight: 800, textDecoration: 'none', border: '1px solid #bae6fd' }}
                    >
                      🗺️ Open in Google Maps
                    </a>
                  </div>
                )}
                {!isRoom && booking.boarding_point?.address && (
                  <div style={{ marginTop: '10px', padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                    <strong style={{ color: '#0f172a', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px' }}>📍 Boarding Point Address</strong>
                    <div style={{ fontSize: '8px', color: '#475569', marginTop: '2px', marginBottom: '6px' }}>
                      {booking.boarding_point.address}
                      {booking.boarding_point.landmark && <>, {booking.boarding_point.landmark}</>}
                    </div>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent((booking.boarding_point.address || '') + ' ' + (booking.boarding_point.landmark || ''))}`}
                      style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '8px', fontWeight: 800, textDecoration: 'none', border: '1px solid #bae6fd' }}
                    >
                      🗺️ Open in Google Maps
                    </a>
                  </div>
                )}
              </div>
              <div className="divider-v" />
              <div className="note-addr-col">
                <strong>📞 Contact Numbers</strong>
                +91 984 984 89 82<br />
                +91 984 984 89 83<br />
                +91 984 984 89 38<br />
                +91 95420 69573 (Bhadrachalam Office)
              </div>
            </div>
            <div className="note-report-bar">
              ⏰ PLEASE REACH AT LEAST 30 MINUTES BEFORE REPORTING TIME
            </div>
          </div>
        </div>

        {/* ═══════ PASSENGER DETAILS ═══════ */}
        <div className="sec-hdr">Passenger Details</div>
        <table className="pax-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>{booking.student_count > 0 ? 'Class' : 'Age'}</th>
              <th>Gender</th>
              <th>Aadhaar (Last 4)</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let rowIndex = 1;
              const detailed: any[] = [];
              let quickAdults = 0;
              let quickChildren = 0;
              let quickStudents = 0;

              booking.passengers.forEach((p: any) => {
                const isQuickGuest = !p.is_primary && (
                  booking.pricing_snapshot?.booking_mode === 'QUICK' ||
                  (p.full_name || '').toLowerCase().includes("quick ticket") ||
                  (p.full_name || '').toLowerCase().includes("guest adult") ||
                  (p.full_name || '').toLowerCase().includes("guest child") ||
                  (p.full_name || '').toLowerCase().includes("quick ticket(not provided)") ||
                  (p.full_name || '').toLowerCase().includes("student")
                );

                if (isQuickGuest) {
                  if (booking.student_count > 0) quickStudents++;
                  else if (p.age >= 11) quickAdults++;
                  else quickChildren++;
                } else {
                  detailed.push(p);
                }
              });

              const rows = detailed.map((p, idx) => (
                <tr key={`det-${idx}`}>
                  <td>{rowIndex++}</td>
                  <td>
                    {p.full_name}
                    {p.is_primary && <span className="lead-badge">LEAD</span>}
                    {(p.phone_number || primaryPassenger?.phone_number) && <div style={{ fontSize: '8.5px', color: '#64748b', marginTop: '2px', fontWeight: 'bold' }}>📞 {p.phone_number || primaryPassenger?.phone_number}</div>}
                  </td>
                  <td>{booking.student_count > 0 ? (p.student_class || 'General') : p.age}</td>
                  <td>{p.gender || '—'}</td>
                  <td>{p.id_proof_number ? `${p.id_proof_number}` : '(Not Provided)'}</td>
                  <td>
                    <span className={`type-chip ${booking.student_count > 0 ? 'adult-chip' : (p.age >= 11 ? 'adult-chip' : 'child-chip')}`}>
                      {booking.student_count > 0 ? 'Student' : (p.age >= 11 ? 'Adult' : 'Child')}
                    </span>
                  </td>
                </tr>
              ));

              if (quickAdults > 0) {
                rows.push(
                  <tr key="quick-adults">
                    <td>{rowIndex++}</td>
                    <td><span style={{ color: '#64748b', fontStyle: 'italic' }}>Not Provided (Adult) × {quickAdults}</span></td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td><span className="type-chip adult-chip">Adult</span></td>
                  </tr>
                );
              }
              if (quickChildren > 0) {
                rows.push(
                  <tr key="quick-children">
                    <td>{rowIndex++}</td>
                    <td><span style={{ color: '#64748b', fontStyle: 'italic' }}>Not Provided (Child) × {quickChildren}</span></td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td><span className="type-chip child-chip">Child</span></td>
                  </tr>
                );
              }
              if (quickStudents > 0) {
                rows.push(
                  <tr key="quick-students">
                    <td>{rowIndex++}</td>
                    <td><span style={{ color: '#64748b', fontStyle: 'italic' }}>Not Provided (Student) × {quickStudents}</span></td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td><span className="type-chip adult-chip">Student</span></td>
                  </tr>
                );
              }

              return rows;
            })()}
          </tbody>
        </table>
        <div className="note-text">
          {booking.student_count > 0
            ? "Note: For student packages, student class information is collected. Aadhaar and contact numbers are optional."
            : "Note: Aadhaar is mandatory for Adults (11+ years). Children (4-10 years) Aadhaar is optional."
          }
        </div>

        {/* ═══════ PAYMENT + JOURNEY ═══════ */}
        <div className="btm-grid">
          {/* Payment Summary */}
          <div className="pay-card">
            <div className="sec-hdr">Payment Summary</div>
            <div className="pay-row">
              <span>
                {isRoom ? 'Room Tariff' : 'Package Fare'}
                <small>{booking.variant_title} | {guestSummary}</small>
              </span>
              <span>{money(baseFare, 2)}</span>
            </div>
            {isRoom && (
              <div className="pay-row">
                <span>
                  Stay Details
                  <small>Check-in {booking.room_checkin || 'TBA'} | Check-out {booking.room_checkout || 'TBA'}</small>
                </span>
                <span>Included</span>
              </div>
            )}
            {transportSelections.map((ts, idx) => (
              <div className="pay-row" key={`transport-${idx}`}>
                <span>
                  {ts.title || 'Transport'}
                  <small>{describeTransport(ts, booking.adult_count, booking.child_count, booking.student_count)}</small>
                </span>
                <span>{money(ts.item_total || 0, 2)}</span>
              </div>
            ))}
            {refreshmentIncluded && (
              <div className="pay-row">
                <span>
                  Refreshments
                  <small>
                    {booking.student_count > 0
                      ? (refreshmentAmount > 0 ? `Add-on for ${booking.student_count} Students` : `Included for ${booking.student_count} Students`)
                      : (refreshmentAmount > 0 ? `Add-on for ${booking.adult_count} Adults + ${booking.child_count} Children` : `Included for ${booking.adult_count} Adults + ${booking.child_count} Children`)
                    }
                  </small>
                </span>
                <span>{refreshmentAmount > 0 ? money(refreshmentAmount, 2) : 'Included'}</span>
              </div>
            )}
            {booking.coupon_discount > 0 && (
              <div className="pay-row" style={{ color: '#2e7d32' }}><span>Discount ({booking.coupon_applied})</span><span>−{money(booking.coupon_discount, 2)}</span></div>
            )}
            <div className="pay-row"><span>Taxes (GST @ 5%)</span><span>{money(booking.gst_amount, 2)}</span></div>
            <div className="pay-row"><span>Convenience Fee</span><span>{money(booking.gateway_fee, 2)}</span></div>
            <div className="pay-total"><span>TOTAL AMOUNT</span><span>{money(booking.total_amount, 2)}</span></div>
            <div className="pay-paid"><span>AMOUNT PAID</span><span>{money(totalPaid, 2)}</span></div>
            {booking.remaining_balance > 0 && (
              <div className="pay-bal"><span>REMAINING BALANCE</span><span>{money(booking.remaining_balance, 2)}</span></div>
            )}
            {capturedPayments.length > 0 && (
              <div style={{ borderTop: '1px dashed #ddd', padding: '6px 10px', background: '#f8fafc' }}>
                <div style={{ fontSize: '8px', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>🕒 Payment History</div>
                {capturedPayments.map((payment, idx) => {
                  const methodNames: Record<string, string> = {
                    RAZORPAY: 'Online (PhonePe)',
                    PHONEPE: 'Online (PhonePe)',
                    CASHFREE: 'Online (Cashfree)',
                    CASH: 'Cash',
                    BANK_TRANSFER: 'Bank Transfer',
                    ADMIN_MANUAL: 'Manual (Admin)'
                  };
                  const methodName = methodNames[payment.payment_method] ?? payment.payment_method;

                  const payDate = payment.created_at ? new Date(payment.created_at) : null;
                  const formattedDate = payDate
                    ? payDate.toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })
                    : '—';

                  return (
                    <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#334155', fontWeight: 600, padding: '3px 0', borderBottom: idx < capturedPayments.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <span style={{ fontWeight: 800 }}>
                          {idx === 0
                            ? (payment.amount >= booking.total_amount ? 'Full Payment' : 'Advance Payment')
                            : 'Remaining Balance Payment'}
                        </span>
                        <span style={{ fontSize: '6.5px', color: '#64748b', fontWeight: 700 }}>
                          {methodName} {payment.payment_reference_id ? `· Txn: ${payment.payment_reference_id}` : ''}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, gap: '1px' }}>
                        <span style={{ fontWeight: 800, color: '#1e293b' }}>{money(payment.amount, 2)}</span>
                        <span style={{ fontSize: '6.5px', color: '#64748b' }}>{formattedDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="pay-status-row" style={{ color: booking.status === 'CANCELLED' || booking.status === 'REFUNDED' ? '#d32f2f' : isFullyPaid ? '#2e7d32' : booking.remaining_balance > 0 ? '#e65100' : '#d32f2f' }}>
              <span>PAYMENT STATUS</span>
              <span>{booking.status === 'CANCELLED' || booking.status === 'REFUNDED' ? booking.status : isFullyPaid ? 'FULLY PAID' : booking.status === 'PENDING' ? 'PENDING' : booking.remaining_balance > 0 ? 'PARTIAL PAYMENT' : booking.status.replace(/_/g, ' ')}</span>
            </div>
            {(booking.status === 'CANCELLED' || booking.status === 'REFUNDED') && booking.cancellation_details && (
              <>
                <div className="pay-row" style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                  <span>Cancellation Charges</span>
                  <span>{money(booking.cancellation_details.cancellation_fee || 0, 2)}</span>
                </div>
                <div className="pay-row" style={{ color: '#2e7d32', fontWeight: 'bold', backgroundColor: '#f0fdf4', padding: '4px 8px', borderRadius: '4px', margin: '4px 0' }}>
                  <span>AMOUNT REFUNDED</span>
                  <span>{money(booking.cancellation_details.refund_amount || 0, 2)}</span>
                </div>
              </>
            )}
            {booking.remaining_balance > 0 && (
              <div className="pay-note">
                <span className="pay-note-icon">ℹ️</span>
                <span>You can pay the remaining amount online or at our office before the journey.</span>
              </div>
            )}
          </div>

          {/* Journey Highlights */}
          <div className="journey-card">
            <div className="sec-hdr">{isRoom ? 'Stay Highlights' : 'Journey Highlights'}</div>
            {isRoom ? (
              <div className="jt-timeline">
                <div className="jt-event">
                  <div className="jt-dot-col"><div className="jt-dot" /><div className="jt-line" /></div>
                  <div className="jt-time">{booking.room_checkin || 'Check-In'}</div>
                  <div className="jt-desc">Check-in at {booking.package_title}<br /><span style={{ fontSize: '8.5px', color: '#666', fontWeight: 700 }}>{travelDateFormatted}</span></div>
                </div>
                {booking.room_highlights && booking.room_highlights.length > 0 ? (
                  booking.room_highlights.map((hi, i) => (
                    <div className="jt-event" key={`hi-${i}`}>
                      <div className="jt-dot-col"><div className="jt-dot" style={{ background: '#e2e8f0', borderColor: '#94a3b8' }} /><div className="jt-line" /></div>
                      <div className="jt-time" style={{ color: '#64748b' }}>Service</div>
                      <div className="jt-desc">{hi.title}</div>
                    </div>
                  ))
                ) : (
                  <div className="jt-event">
                    <div className="jt-dot-col"><div className="jt-dot" /><div className="jt-line" /></div>
                    <div className="jt-time">During Stay</div>
                    <div className="jt-desc">Enjoy lodge facilities &amp; local sightseeing</div>
                  </div>
                )}
                <div className="jt-event">
                  <div className="jt-dot-col"><div className="jt-dot" /></div>
                  <div className="jt-time">{booking.room_checkout || 'Check-Out'}</div>
                  <div className="jt-desc">Check-out &amp; Departure<br /><span style={{ fontSize: '8.5px', color: '#666', fontWeight: 700 }}>{booking.room_checkout_date ? new Date(booking.room_checkout_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', weekday: 'long' }).toUpperCase() : ''}</span></div>
                </div>
              </div>
            ) : allEvents.length > 0 ? (
              <div className="jt-timeline">
                {allEvents.map((ev, i) => (
                  <div className="jt-event" key={i}>
                    <div className="jt-dot-col">
                      <div className="jt-dot" />
                      {i < allEvents.length - 1 && <div className="jt-line" />}
                    </div>
                    <div className="jt-time">{ev.time}</div>
                    <div className="jt-desc">
                      {ev.desc.split(/\.\s+(?=[A-Z])|\n+/).filter(Boolean).map((sentence, idx) => {
                        const trimmed = sentence.trim();
                        return (
                          <span key={idx} style={{ display: 'block', marginBottom: '4px' }}>
                            {trimmed.endsWith('.') ? trimmed : `${trimmed}.`}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '10px', color: '#888', fontSize: '9px', fontWeight: 600 }}>Itinerary details will be shared at the office.</div>
            )}
          </div>
        </div>

        {/* ═══════ RULES GRID ═══════ */}
        <div className="rules-grid" style={has25Seater ? { gridTemplateColumns: '1fr 1fr 1fr 1fr' } : undefined}>
          <div className="rule-box">
            <div className="rule-box-title">⛔ Cancellation Policy</div>
            {isRoom ? (
              <ul>
                <li>Room bookings are strictly non-cancellable and non-refundable.</li>
                <li>Please contact our support desk for extreme emergencies.</li>
              </ul>
            ) : (
              <>
                <ul>
                  <li>Cancellation can be requested only before 7 days of the reporting date.</li>
                  <li>A cancellation fee of 35% will be applicable on the total amount.</li>
                  <li>Contact us on WhatsApp to raise a cancellation request.</li>
                </ul>
                <div className="rule-alert">Cancellation will be confirmed only after admin approval.</div>
              </>
            )}
          </div>
          <div className="rule-box">
            <div className="rule-box-title">📋 Terms &amp; Conditions</div>
            <ul className="rule-check">
              <li>No refund for late arrivals.</li>
              <li>Outside food &amp; alcohol are not allowed.</li>
              <li>Life jackets are compulsory during the ride.</li>
              <li>Carry your original ID proof.</li>
              <li>Keep the environment clean.</li>
              <li>Management decision is final.</li>
            </ul>
          </div>
          <div className="rule-box">
            <div className="rule-box-title">{isRoom ? '🏨 Lodge Instructions' : '📍 Office Instructions'}</div>
            <ul>
              {isRoom ? (
                <>
                  <li>Present this voucher at reception during check-in.</li>
                  <li>Carry original valid ID proof for all guests.</li>
                  <li>Check-in is {booking.room_checkin || '12:00 PM'}, check-out is {booking.room_checkout || '11:00 AM'}.</li>
                  <li>Damage to property will attract extra charges.</li>
                </>
              ) : (
                <>
                  <li>Reach our office at the reporting time.</li>
                  <li>Collect your manual ticket before boarding.</li>
                  <li>Our team will guide you for the boarding process.</li>
                </>
              )}
            </ul>
          </div>

          {/* Bus Warning Box inside rules-grid (as 4th column card) */}
          {has25Seater && (
            <div className="rule-box" style={{ border: '1.5px solid #d97706', background: '#fffbeb', display: 'flex', flexDirection: 'column' }}>
              <div className="rule-box-title" style={{ color: '#b45309', borderBottom: '1px solid #fed7aa', paddingBottom: '4px', marginBottom: '4px' }}>🚌 Bus Notice</div>

              <div style={{ fontSize: '7.5px', fontWeight: 900, color: '#b45309', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📢 ముఖ్య గమనిక</div>
              <ul style={{ listStyle: 'none', paddingLeft: 0, marginBottom: '6px' }}>
                <li style={{ display: 'flex', gap: '3px', marginBottom: '2px', fontSize: '7.5px', lineHeight: '1.3' }}><span>🚌</span><span>కనీస ప్రయాణికుల సంఖ్య పూర్తికాక బస్సు ఫుల్ కాకపోతే, టూర్ను టాటా మ్యాజిక్ / 7 సీటర్ వాహనంలో నిర్వహించబడుతుంది.</span></li>
                <li style={{ display: 'flex', gap: '3px', marginBottom: '2px', fontSize: '7.5px', lineHeight: '1.3' }}><span>💰</span><span>బస్సు చార్జీ మరియు టాటా మ్యాజిక్ చార్జీ మధ్య ఉన్న అదనపు మొత్తాన్ని ప్రయాణికులకు రిఫండ్ చేయబడుతుంది.</span></li>
                <li style={{ display: 'flex', gap: '3px', marginBottom: '2px', fontSize: '7.5px', lineHeight: '1.3' }}><span>✅</span><span>బస్సు పూర్తిగా నిండిన సందర్భంలో మాత్రమే బస్సు టికెట్ కన్ఫర్మ్ చేయబడుతుంది.</span></li>
                <li style={{ display: 'flex', gap: '3px', marginBottom: '2px', fontSize: '7.5px', lineHeight: '1.3' }}><span>⚠️</span><span>ప్రయాణికుల సంఖ్యను బట్టి వాహనం మార్చే హక్కు యాజమాన్యానికి ఉంటుంది.</span></li>
              </ul>

              <div style={{ fontSize: '7.5px', fontWeight: 900, color: '#b45309', marginBottom: '2px', borderTop: '1px dashed #fed7aa', paddingTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📢 Important Note</div>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                <li style={{ display: 'flex', gap: '3px', marginBottom: '2px', fontSize: '7.5px', lineHeight: '1.3' }}><span>🚌</span><span>If the minimum passenger count is not met and the bus is not fully occupied, the tour will be operated using a Tata Magic / 7-Seater vehicle.</span></li>
                <li style={{ display: 'flex', gap: '3px', marginBottom: '2px', fontSize: '7.5px', lineHeight: '1.3' }}><span>💰</span><span>The difference between the bus fare and the Tata Magic fare will be refunded to passengers.</span></li>
                <li style={{ display: 'flex', gap: '3px', marginBottom: '2px', fontSize: '7.5px', lineHeight: '1.3' }}><span>✅</span><span>Bus tickets will be confirmed only when sufficient passengers are available to operate the bus.</span></li>
                <li style={{ display: 'flex', gap: '3px', marginBottom: '2px', fontSize: '7.5px', lineHeight: '1.3' }}><span>⚠️</span><span>Management reserves the right to change the vehicle based on passenger occupancy.</span></li>
              </ul>
            </div>
          )}
        </div>

        {/* Agent bar */}
        {booking.agent_id && (
          <div className="agent-bar">
            <div>
              <span className="agent-bar-label">Booked via Agent</span>{' '}
              <strong>AGENT_{String(booking.agent_id).padStart(3, '0')} · {booking.agent_name} {booking.agent_company ? `(${booking.agent_company})` : ''}</strong>
              {booking.agent_gst && (
                <span className="ml-2 pl-2 border-l border-slate-600">
                  GSTIN: <strong>{booking.agent_gst}</strong>
                </span>
              )}
            </div>
            {booking.agent_phone && (
              <div>📞 Agent: <strong>{booking.agent_phone}</strong></div>
            )}
          </div>
        )}

        {/* ═══════ FOOTER ═══════ */}
        <div className="footer">
          <div className="footer-item">📞 <strong>+91 95420 69573</strong></div>
          <div className="footer-item">✉️ <strong>bookings@tsboattourism.org</strong></div>
          <div className="footer-item">🌐 <strong>www.tsboattourism.org</strong></div>
        </div>
        <div className="footer-tagline">Thank you for travelling with us!</div>
      </div>

      <PrintAction showClose />
    </div>
  );
}
