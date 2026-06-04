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
  const ticketTitle = isRoom ? 'HOTEL/RESORT TICKET' : (isBoatRide ? 'BOAT RIDE TICKET' : 'SIGHTSEEING TICKET');

  const reportingTime = isRoom ? (booking.room_checkin || 'TBA') : (booking.boarding_point?.departure_time || 'TBA');
  const boardingTitle = isRoom
    ? (booking.package_title)
    : (booking.boarding_point?.title || 'Bhadrachalam Tourism Office');

  const totalPaid = (booking.paid_amount ?? (booking.total_amount - booking.remaining_balance)) || 0;
  const isFullyPaid = booking.status === 'FULLY_PAID';
  const passengerCount = booking.adult_count + booking.child_count;
  const transportSelections = getTransportSelections(booking.pricing_snapshot);
  const refreshmentIncluded = hasRefreshment(booking);
  const refreshmentAmount = getRefreshmentAmount(booking.pricing_snapshot);
  const baseFare = getBaseFareExcludingAddons(booking.subtotal_amount, booking.pricing_snapshot);
  const capturedPayments = getCapturedPayments(booking.payment_ledger);

  // Dynamic GSTIN selection based on payment type
  const isRazorpay = !!(
    booking.pricing_snapshot?.razorpay_payment_id ||
    booking.pricing_snapshot?.razorpay_order_id ||
    booking.payment_ledger?.some((p) => p.payment_method === 'RAZORPAY')
  );
  const gstNumber = isRazorpay ? '29AANCR6717K1ZN' : '36AALFT7063K1ZL';

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
  if (booking.adult_count > 0) parts.push(`${booking.adult_count} Adult${booking.adult_count > 1 ? 's' : ''}`);
  if (booking.child_count > 0) parts.push(`${booking.child_count} Child${booking.child_count > 1 ? 'ren' : ''}`);
  const guestSummary = parts.join(', ') || `${booking.passengers.length} Passenger${booking.passengers.length > 1 ? 's' : ''}`;
  const primaryPassenger = booking.passengers.find(p => p.is_primary) || booking.passengers[0];

  return (
    <div className="wrap">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Nastaliq+Urdu:wght@600;700&family=Noto+Sans+Telugu:wght@600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
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
        .ticket-title-wrap { text-align: center; padding: 14px 0 8px; background: #fff; }
        .ticket-title {
          font-size: 28px; font-weight: 900; color: #0a2351;
          letter-spacing: 2px; position: relative; display: inline-block;
        }
        .ticket-title::before, .ticket-title::after {
          content: '◆ ◆ ◆'; font-size: 8px; color: #c8a45a; position: absolute;
          top: 50%; transform: translateY(-50%); letter-spacing: 3px;
        }
        .ticket-title::before { right: calc(100% + 12px); }
        .ticket-title::after { left: calc(100% + 12px); }
        .ticket-stars { color: #c8a45a; font-size: 14px; letter-spacing: 5px; margin-top: 4px; margin-bottom: 6px; }

        /* ── PKG RIBBON ── */
        .pkg-ribbon {
          background: #0a2351; color: #fff; text-align: center;
          padding: 8px 20px; font-size: 13px; font-weight: 800;
          letter-spacing: 2px; text-transform: uppercase;
          margin-bottom: 0;
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
        .jt-event { display: flex; gap: 10px; margin-bottom: 6px; align-items: flex-start; }
        .jt-dot-col { display: flex; flex-direction: column; align-items: center; width: 12px; flex-shrink: 0; }
        .jt-dot { width: 8px; height: 8px; border-radius: 50%; background: #0a2351; border: 2px solid #9fa8da; flex-shrink: 0; }
        .jt-line { width: 2px; flex: 1; background: #c5cae9; min-height: 12px; }
        .jt-time { font-size: 9.5px; font-weight: 800; color: #0a2351; width: 55px; flex-shrink: 0; }
        .jt-desc { font-size: 9.5px; font-weight: 600; color: #444; line-height: 1.4; }

        /* ── RULES GRID ── */
        .rules-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 10px; }
        .rule-box { border: 1px solid #ddd; border-radius: 5px; padding: 8px 9px; background: #fff; }
        .rule-box-title { font-size: 8.5px; font-weight: 900; color: #d32f2f; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
        .rule-box ul { padding-left: 12px; }
        .rule-box li { font-size: 8.5px; color: #444; font-weight: 600; margin-bottom: 2px; line-height: 1.4; }
        .rule-alert { font-size: 8px; font-weight: 800; color: #d32f2f; margin-top: 4px; font-style: italic; }
        .rule-check li { list-style: none; position: relative; padding-left: 2px; }
        .rule-check li::before { content: '✓'; color: #2e7d32; font-weight: 900; margin-right: 3px; }

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
          <img src="/icon-512x512.png" alt="Telangana and AP Boat Tourism" />
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
        <div className="ticket-title">{ticketTitle}</div>
        <div className="ticket-stars">★ ★ ★</div>
      </div>

      {/* ═══════ PKG RIBBON ═══════ */}
      <div className="pkg-ribbon">{booking.package_title.toUpperCase()}</div>

      {/* ═══════ BANNER IMAGE ═══════ */}
      <img src="https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779480316/27d6478a-0032-4cc3-a0e0-20eec56de773.png" className="banner-img" alt="Telangana Boat Tourism" />

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
                          • Refreshments Included ({passengerCount} pax)
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
                <strong>📍 TSTG Tourism Office Address</strong>
                DR NO:4-1-78/1<br />
                KALYANA MANDAPAM ROAD OPP SBI ATM<br />
                BHADRACHALAM, BHADRADRI KOTHAGUDEM (DIST),<br />
                TELANGANA-507111<br />
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
              </div>
              <div className="divider-v" />
              <div className="note-addr-col">
                <strong>📞 Contact Numbers</strong>
                +91 95420 69573(Office Number)<br />
                +91 984 984 89 82<br />
                +91 984 984 89 83<br />
                +91 984 984 89 38
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
              <th>Age</th>
              <th>Gender</th>
              <th>Aadhaar (Last 4)</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {booking.passengers.map((p, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>
                  {p.full_name}
                  {p.is_primary && <span className="lead-badge">LEAD</span>}
                  {p.phone_number && <div style={{ fontSize: '8.5px', color: '#64748b', marginTop: '2px', fontWeight: 'bold' }}>📞 {p.phone_number}</div>}
                </td>
                <td>{p.age}</td>
                <td>{p.gender || '—'}</td>
                <td>{p.id_proof_number ? `${p.id_proof_number}` : '(Not Provided)'}</td>
                <td>
                  <span className={`type-chip ${p.age >= 11 ? 'adult-chip' : 'child-chip'}`}>
                    {p.age >= 11 ? 'Adult' : 'Child'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="note-text">Note: Aadhaar is mandatory for Adults (11+ years). Children (4-10 years) Aadhaar is optional.</div>

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
                  <small>{describeTransport(ts, passengerCount)}</small>
                </span>
                <span>{money(ts.item_total || 0, 2)}</span>
              </div>
            ))}
            {refreshmentIncluded && (
              <div className="pay-row">
                <span>
                  Refreshments
                  <small>Included for {passengerCount} pax</small>
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
              <div className="pay-note">
                <span className="pay-note-icon">✓</span>
                <span>
                  Payments: {capturedPayments.map((payment) => `${money(payment.amount, 2)} ${payment.payment_method}`).join(', ')}
                </span>
              </div>
            )}
            <div className="pay-status-row" style={{ color: booking.status === 'CANCELLED' || booking.status === 'REFUNDED' ? '#d32f2f' : isFullyPaid ? '#2e7d32' : booking.remaining_balance > 0 ? '#e65100' : '#d32f2f' }}>
              <span>PAYMENT STATUS</span>
              <span>{booking.status === 'CANCELLED' || booking.status === 'REFUNDED' ? booking.status : isFullyPaid ? 'FULLY PAID' : booking.remaining_balance > 0 ? 'PARTIAL PAYMENT' : booking.status.replace(/_/g, ' ')}</span>
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
        <div className="rules-grid">
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
          <div className="footer-item">✉️ <strong>tsboattourismservices@gmail.com</strong></div>
          <div className="footer-item">🌐 <strong>www.tsboattourism.org</strong></div>
        </div>
        <div className="footer-tagline">Thank you for travelling with us!</div>
      </div>

      <PrintAction showClose />
    </div>
  );
}
