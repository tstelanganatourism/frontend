import React from 'react';
import crypto from 'crypto';
import { apiFetch } from '@/lib/api';
import { notFound } from 'next/navigation';
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
  room_map_url?: string | null;
  room_highlights?: { title: string; icon: string }[];
  itinerary?: { day_number: number; title: string; timing: string; duration?: string | null; meal_included?: boolean; description: string }[];
  pricing_snapshot?: any;
  has_refreshment_addon?: boolean;
  payment_ledger?: PaymentLedgerEntry[];
  is_rescheduled?: boolean;
  postpone_details?: {
    status: string;
    reason: string;
    requested_new_date: string;
    original_travel_date?: string | null;
    requested_at?: string | null;
    processed_at?: string | null;
  };
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

  const hasRescheduled = !!(booking.is_rescheduled && booking.postpone_details?.original_travel_date);
  const oldTravelDateObj = hasRescheduled ? new Date(booking.postpone_details!.original_travel_date!) : null;
  const oldTravelDateFormatted = oldTravelDateObj
    ? oldTravelDateObj.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric'
      }).toUpperCase() + ', ' + oldTravelDateObj.toLocaleDateString('en-IN', { weekday: 'long' }).toUpperCase()
    : '';

  const isRoom = booking.target_type === 'ROOM';
  const isBoatRide = booking.package_type === 'TOUR';
  let ticketTitle = isRoom ? 'HOTEL/RESORT CONFIRMATION' : (isBoatRide ? 'BOARDING PASS / TICKET' : 'TOURIST TICKET');
  if (booking.status === 'CANCELLED') ticketTitle = 'CANCELLED TICKET';
  if (booking.status === 'REFUNDED') ticketTitle = 'REFUNDED TICKET';

  const reportingTime = isRoom ? (booking.room_checkin || 'TBA') : (booking.boarding_point?.departure_time || 'TBA');
  
  const allocatedHotelName = booking.pricing_snapshot?.hotel_name || 
                             booking.package_title ||
                             (booking.room_address ? booking.room_address.split(',')[0].trim() : null) || 
                             'Assigned Luxury Hotel (Details at Check-in)';

  const boardingTitle = isRoom
    ? allocatedHotelName
    : (booking.boarding_point?.title || 'Bhadrachalam Office');

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
  const gstNumber = '';

  // Parse itinerary events grouped by day
  type TlEvent = { time: string; title: string; desc: string; meal_included?: boolean };
  type TlDay = { dayNumber: number; events: TlEvent[] };

  function parseItineraryStops(itineraryList: any[]): TlDay[] {
    if (!itineraryList || itineraryList.length === 0) return [];
    
    const dayMap = new Map<number, TlEvent[]>();

    itineraryList.forEach((stop, idx) => {
      const dayNum = stop.day_number || 1;
      if (!dayMap.has(dayNum)) dayMap.set(dayNum, []);

      const combinedDesc = (stop.description || '').trim();
      const timeStr = stop.timing || '';
      
      // Check if description itself contains embedded timestamps (like 8:00 AM: ...)
      const subParts = combinedDesc
        .split(/(?=\b\d{1,2}:\d{2}\s*(?:AM|PM)\s*[:\-–])/i)
        .map((p: string) => p.trim())
        .filter(Boolean);

      if (subParts.length > 1) {
        for (const part of subParts) {
          const m = part.match(/^(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[:\-–]\s*([\s\S]+)/i);
          if (m) {
            dayMap.get(dayNum)!.push({
              time: m[1].trim(),
              title: stop.title,
              desc: m[2].trim().replace(/\.\s*$/, '').trim(),
              meal_included: stop.meal_included
            });
          }
        }
      } else {
        dayMap.get(dayNum)!.push({
          time: timeStr || `Stop #${idx + 1}`,
          title: stop.title,
          desc: combinedDesc || stop.title,
          meal_included: stop.meal_included
        });
      }
    });

    return Array.from(dayMap.entries()).map(([dayNumber, events]) => ({
      dayNumber,
      events
    }));
  }

  const parsedItineraryDays: TlDay[] = parseItineraryStops(booking.itinerary || []);

  const parts: string[] = [];
  if (booking.student_count > 0) {
    parts.push(`${booking.student_count} Student${booking.student_count > 1 ? 's' : ''}`);
  } else {
    if (booking.adult_count > 0) parts.push(`${booking.adult_count} Adult${booking.adult_count > 1 ? 's' : ''}`);
    if (booking.child_count > 0) parts.push(`${booking.child_count} Child${booking.child_count > 1 ? 'ren' : ''}`);
  }
  const guestSummary = parts.join(', ') || `${booking.passengers.length} Passenger${booking.passengers.length > 1 ? 's' : ''}`;
  const primaryPassenger = booking.passengers.find(p => p.is_primary) || booking.passengers[0];

  // Barcode pattern for rendering a beautiful custom barcode via CSS
  const barcodePattern = [2, 1, 3, 1, 4, 1, 2, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4];

  return (
    <div className="ticket-page-wrapper">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Telugu:wght@500;700;800&display=swap');
        
        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: #f1f5f9;
          color: #1e293b;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .ticket-page-wrapper {
          width: 100%;
          max-width: 820px;
          margin: 20px auto;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(10, 35, 81, 0.08);
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          border: 1px solid #cbd5e1;
        }

        /* Perforated Stub Design */
        .ticket-container {
          display: flex;
          width: 100%;
          position: relative;
        }

        .ticket-main {
          width: 100%;
          padding: 24px;
          position: relative;
        }
        .punch-hole-bottom {
          bottom: -12px;
          box-shadow: inset 0 3px 5px rgba(0,0,0,0.05);
        }

        /* Header Area */
        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #0a2351;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-img {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid #c8a45a;
          object-fit: cover;
        }

        .brand-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-weight: 900;
          color: #0a2351;
          font-size: 21px;
          line-height: 1.1;
        }

        .brand-subtitle {
          font-size: 10px;
          font-weight: 700;
          color: #1a6b7a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .telugu-tag {
          font-family: 'Noto Sans Telugu', sans-serif;
          font-size: 10px;
          color: #475569;
          margin-top: 1px;
        }

        .ticket-title-section {
          text-align: right;
        }

        .ticket-badge {
          background: #0a2351;
          color: #ffffff;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          display: inline-block;
          margin-bottom: 4px;
        }

        .ticket-main-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 23px;
          font-weight: 900;
          color: #c8a45a;
          margin: 0;
          letter-spacing: 0.5px;
        }

        /* Ribbon bar */
        .pkg-ribbon-bar {
          background: linear-gradient(135deg, #0a2351 0%, #1a3a6b 100%);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 6px;
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          box-shadow: 0 4px 10px rgba(10, 35, 81, 0.15);
        }

        .pkg-ribbon-variant {
          color: #c8a45a;
          font-size: 11px;
          font-weight: 700;
        }

        /* 2-Column Info Grid */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .info-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 12px;
          background: #f8fafc;
        }

        .info-label {
          font-size: 9px;
          font-weight: 800;
          color: #d32f2f;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .info-value {
          font-size: 12px;
          font-weight: 750;
          color: #0a2351;
        }

        /* Passenger Table */
        .section-header {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-weight: 900;
          font-size: 13px;
          color: #ffffff;
          background: #0a2351;
          padding: 6px 12px;
          border-radius: 6px 6px 0 0;
          text-transform: none;
          letter-spacing: 0.5px;
        }

        .pax-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin-bottom: 16px;
        }

        .pax-table th {
          background: #f1f5f9;
          color: #475569;
          font-weight: 800;
          text-align: left;
          padding: 6px 12px;
          border: 1px solid #cbd5e1;
          text-transform: uppercase;
          font-size: 9px;
        }

        .pax-table td {
          padding: 6px 12px;
          border: 1px solid #cbd5e1;
          color: #1e293b;
          font-weight: 600;
        }

        .pax-table tr:nth-child(even) {
          background: #fafafb;
        }

        .lead-badge {
          background: #16a34a;
          color: white;
          font-size: 7px;
          font-weight: 900;
          padding: 1.5px 5px;
          border-radius: 4px;
          margin-left: 6px;
          letter-spacing: 0.3px;
        }

        .type-pill {
          font-size: 8px;
          font-weight: 900;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .pill-adult { background: #e0f2fe; color: #0369a1; }
        .pill-child { background: #dcfce7; color: #15803d; }
        .pill-student { background: #fef3c7; color: #b45309; }

        /* Journey and Payment Grid */
        .bottom-sections-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
          align-items: stretch;
        }

        .summary-card {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          overflow: hidden;
          background: #ffffff;
          display: flex;
          flex-direction: column;
        }

        .pay-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 12px;
          font-size: 11px;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
          font-weight: 600;
        }

        .pay-row span:last-child {
          font-weight: 750;
          color: #0f172a;
        }

        .pay-row-subtext {
          font-size: 8.5px;
          color: #94a3b8;
          display: block;
          font-weight: 500;
          margin-top: 1px;
        }

        .pay-row.grand-total {
          background: #f8fafc;
          border-top: 1.5px solid #cbd5e1;
          font-size: 12px;
          font-weight: 900;
          color: #0a2351;
        }

        .pay-row.grand-total span:last-child {
          color: #0a2351;
          font-size: 13px;
          font-weight: 900;
        }

        .pay-row.amt-paid {
          background: #f0fdf4;
          color: #16a34a;
          font-weight: 800;
        }

        .pay-row.amt-paid span:last-child {
          color: #166534;
        }

        .pay-row.amt-balance {
          background: #fef2f2;
          color: #dc2626;
          font-weight: 800;
        }

        .pay-row.amt-balance span:last-child {
          color: #991b1b;
        }

        .status-row {
          padding: 6px 12px;
          text-align: center;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .status-paid { background: #dcfce7; color: #15803d; }
        .status-partial { background: #fef3c7; color: #b45309; }
        .status-cancelled { background: #fef2f2; color: #b91c1c; }

        /* Timeline styling */
        .timeline-container {
          padding: 10px 12px;
          max-height: 290px;
          overflow-y: auto;
          flex: 1;
        }

        .timeline-event {
          display: flex;
          gap: 10px;
          margin-bottom: 8px;
          position: relative;
        }

        .timeline-event:last-child {
          margin-bottom: 0;
        }

        .timeline-line {
          width: 2px;
          background: #cbd5e1;
          position: absolute;
          left: 5px;
          top: 10px;
          bottom: -10px;
        }

        .timeline-event:last-child .timeline-line {
          display: none;
        }

        .timeline-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #0a2351;
          border: 2px solid #c8a45a;
          z-index: 2;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .timeline-time {
          font-size: 10px;
          font-weight: 800;
          color: #1a6b7a;
          white-space: nowrap;
          width: 65px;
        }

        .timeline-desc {
          font-size: 10px;
          color: #334155;
          font-weight: 600;
          line-height: 1.3;
        }

        /* Rules Cards */
        .rules-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 12px;
        }

        .rule-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 10px;
          background: #ffffff;
        }

        .rule-card-title {
          font-size: 9px;
          font-weight: 900;
          color: #d32f2f;
          text-transform: uppercase;
          margin-bottom: 6px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 4px;
        }

        .rule-card ul {
          margin: 0;
          padding-left: 12px;
          font-size: 9px;
          color: #475569;
          font-weight: 600;
          line-height: 1.3;
        }

        .rule-card li {
          margin-bottom: 3px;
        }

        /* Stub styling */
        .stub-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 900;
          font-size: 15px;
          color: #0a2351;
          text-align: center;
          margin-bottom: 12px;
          border-bottom: 1.5px solid #cbd5e1;
          padding-bottom: 6px;
          width: 100%;
        }

        .stub-row {
          width: 100%;
          margin-bottom: 10px;
        }

        .stub-label {
          font-size: 8px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .stub-value {
          font-size: 11px;
          font-weight: 800;
          color: #0f172a;
        }

        .stub-barcode-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: auto;
          width: 100%;
        }

        .barcode-container {
          display: flex;
          align-items: flex-end;
          height: 38px;
          gap: 1.5px;
          background: #ffffff;
          padding: 6px 12px;
          border-radius: 4px;
          border: 1px solid #cbd5e1;
          width: 100%;
          justify-content: center;
        }

        .barcode-line {
          height: 100%;
          background: #000000;
          border-radius: 0.5px;
        }

        .barcode-id {
          font-family: 'Courier New', Courier, monospace;
          font-size: 8.5px;
          font-weight: 900;
          margin-top: 4px;
          letter-spacing: 1px;
          color: #475569;
        }

        /* Banner banner info */
        .banner-warning {
          background: #fff7ed;
          border: 1px solid #ffedd5;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 16px;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .banner-warning-icon {
          background: #ea580c;
          color: #ffffff;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 13px;
          flex-shrink: 0;
        }

        .banner-warning-text {
          font-size: 10.5px;
          color: #ea580c;
          font-weight: 750;
          line-height: 1.4;
        }

        .agent-bar-ticket {
          background: #1e293b;
          color: #ffffff;
          padding: 8px 16px;
          font-size: 10px;
          font-weight: 800;
          display: flex;
          justify-content: space-between;
          border-top: 3px solid #c8a45a;
        }

        .ticket-footer {
          background: #0a2351;
          color: #ffffff;
          padding: 10px 16px;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          font-weight: 700;
        }

        .ticket-footer a {
          color: #c8a45a;
          text-decoration: none;
        }

        /* Print media styles */
        @media print {
          body {
            background: #ffffff;
            color: #000000;
          }
          .ticket-page-wrapper {
            margin: 0;
            box-shadow: none;
            border: none;
            width: 100%;
            max-width: 100%;
          }
          .punch-hole-top, .punch-hole-bottom {
            display: none;
          }
          .no-print {
            display: none !important;
          }
          .timeline-container {
            max-height: none;
            overflow: visible;
          }
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
        }
      ` }} />

      {/* Cancelled / Refunded watermark overlay */}
      {(booking.status === 'CANCELLED' || booking.status === 'REFUNDED') && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, pointerEvents: 'none', overflow: 'hidden'
        }}>
          <div style={{
            transform: 'rotate(-30deg)',
            fontSize: '90px',
            fontWeight: 900,
            color: 'rgba(239, 68, 68, 0.12)',
            textTransform: 'uppercase',
            letterSpacing: '10px',
            border: '8px dashed rgba(239, 68, 68, 0.12)',
            padding: '15px 35px',
            borderRadius: '12px',
            whiteSpace: 'nowrap'
          }}>
            {booking.status}
          </div>
        </div>
      )}

      {/* TS Boat Tourism Graphic Banner */}
      <div style={{ width: '100%', marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="https://res.cloudinary.com/r929tquv/image/upload/v1784836276/e62df8f4-a296-43b0-aa24-c63cb3a8f38f_n6bdp6.png" 
          alt="TS Boat Tourism Banner" 
          style={{ width: '100%', height: 'auto', display: 'block' }} 
        />
      </div>

      <div className="ticket-container">
        {/* Notch punches */}
        <div className="punch-hole-top" />
        <div className="punch-hole-bottom" />

        {/* ── MAIN TICKET AREA ── */}
        <div className="ticket-main">
          {/* Header */}
          <div className="ticket-header">
            <div className="brand-section">
              <img src="/apple-touch-icon.png" className="logo-img" alt="TS Logo" />
              <div>
                <div className="brand-title">TS BOAT TOURISM</div>
                <div className="brand-subtitle">Official Booking Platform</div>
                <div className="telugu-tag">తెలంగాణ పర్యాటక రంగం · విశ్వసనీయమైన సేవలు</div>
              </div>
            </div>
            <div className="ticket-title-section">
              <div className="ticket-badge">{booking.status.replace(/_/g, ' ')}</div>
              <h2 className="ticket-main-title">{ticketTitle}</h2>
            </div>
          </div>

          {/* Ribbon */}
          <div className="pkg-ribbon-bar">
            <span>{booking.package_title}</span>
            {booking.variant_title && <span className="pkg-ribbon-variant">{booking.variant_title}</span>}
          </div>

          {/* Banner warning notice */}
          {!isRoom && (
            <div className="banner-warning">
              <div className="banner-warning-icon">!</div>
              <div className="banner-warning-text">
                IMPORTANT BOARDING PASS NOTICE: Visit our Bhadrachalam office at the reporting point to verify this summary ticket and collect your manual boarding pass prior to departure.
              </div>
            </div>
          )}

          {/* 3-Column details grid */}
          <div className="info-grid">
            <div className="info-card">
              <div className="info-label">{isRoom ? 'Lodge / Hotel' : 'Boarding Point'}</div>
              <div className="info-value">{boardingTitle}</div>
            </div>
            <div className="info-card">
              <div className="info-label">{isRoom ? 'Check-In Date' : 'Travel Date'}</div>
              <div className="info-value">
                {hasRescheduled ? (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '10px' }}>
                      {oldTravelDateFormatted.split(',')[0]}
                    </span>
                    <span style={{ color: '#ea580c' }}>
                      {travelDateFormatted.split(',')[0]}
                    </span>
                  </div>
                ) : (
                  travelDateFormatted.split(',')[0]
                )}
              </div>
            </div>
            <div className="info-card">
              <div className="info-label">{isRoom ? 'Check-In Time' : 'Reporting Time'}</div>
              <div className="info-value">{reportingTime}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Customer Contact</div>
              <div className="info-value">
                {primaryPassenger?.full_name}<br />
                <span style={{ fontSize: '10px', color: '#475569' }}>📞 {primaryPassenger?.phone_number || 'N/A'}</span>
              </div>
            </div>
            <div className="info-card">
              <div className="info-label">Passengers</div>
              <div className="info-value">{guestSummary}</div>
            </div>
            <div className="info-card">
              <div className="info-label">PNR Number</div>
              <div className="info-value" style={{ fontFamily: 'Courier New', fontSize: '13px', fontWeight: 800 }}>{booking.public_id}</div>
            </div>
          </div>

          {/* Passenger Table */}
          <div className="section-header">Passenger Details</div>
          <table className="pax-table">
            <thead>
              <tr>
                <th style={{ width: '8%' }}>S.No</th>
                <th style={{ width: '40%' }}>Passenger Name</th>
                <th style={{ width: '12%' }}>{booking.student_count > 0 ? 'Class' : 'Age'}</th>
                <th style={{ width: '15%' }}>Gender</th>
                <th style={{ width: '25%' }}>Identity Verification</th>
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
                    </td>
                    <td>
                      {booking.student_count > 0 ? (p.student_class || 'General') : p.age}
                      {' '}
                      <span className={`type-pill ${booking.student_count > 0 ? 'pill-student' : (p.age >= 11 ? 'pill-adult' : 'pill-child')}`}>
                        {booking.student_count > 0 ? 'Student' : (p.age >= 11 ? 'Adult' : 'Child')}
                      </span>
                    </td>
                    <td>{p.gender || '—'}</td>
                    <td>{p.id_proof_number ? `${p.id_proof_type || 'Aadhaar'}: ${p.id_proof_number}` : '(Not Provided)'}</td>
                  </tr>
                ));

                if (quickAdults > 0) {
                  rows.push(
                    <tr key="quick-adults">
                      <td>{rowIndex++}</td>
                      <td><span style={{ color: '#64748b', fontStyle: 'italic' }}>Guest Passenger × {quickAdults}</span></td>
                      <td>— <span className="type-pill pill-adult">Adult</span></td>
                      <td>—</td>
                      <td>—</td>
                    </tr>
                  );
                }
                if (quickChildren > 0) {
                  rows.push(
                    <tr key="quick-children">
                      <td>{rowIndex++}</td>
                      <td><span style={{ color: '#64748b', fontStyle: 'italic' }}>Guest Child × {quickChildren}</span></td>
                      <td>— <span className="type-pill pill-child">Child</span></td>
                      <td>—</td>
                      <td>—</td>
                    </tr>
                  );
                }
                if (quickStudents > 0) {
                  rows.push(
                    <tr key="quick-students">
                      <td>{rowIndex++}</td>
                      <td><span style={{ color: '#64748b', fontStyle: 'italic' }}>Guest Student × {quickStudents}</span></td>
                      <td>— <span className="type-pill pill-student">Student</span></td>
                      <td>—</td>
                      <td>—</td>
                    </tr>
                  );
                }

                return rows;
              })()}
            </tbody>
          </table>

          {/* Bottom layout: Payment & Journey timeline */}
          <div className="bottom-sections-grid">
            {/* Left: Financial Statement */}
            <div className="summary-card">
              <div className="section-header">Financial Summary</div>
              <div className="pay-row">
                <span>
                  {isRoom ? 'Accommodation Fare' : 'Base Fare'}
                  <span className="pay-row-subtext">{booking.variant_title} ({guestSummary})</span>
                </span>
                <span>{money(baseFare, 2)}</span>
              </div>
              
              {transportSelections.map((ts, idx) => (
                <div className="pay-row" key={`trans-${idx}`}>
                  <span>
                    {ts.title}
                    <span className="pay-row-subtext">{describeTransport(ts, booking.adult_count, booking.child_count, booking.student_count)}</span>
                  </span>
                  <span>{money(ts.item_total || 0, 2)}</span>
                </div>
              ))}

              {refreshmentIncluded && (
                <div className="pay-row">
                  <span>
                    Refreshment Addon
                    <span className="pay-row-subtext">{passengerCount} Passengers</span>
                  </span>
                  <span>{refreshmentAmount > 0 ? money(refreshmentAmount, 2) : 'Included'}</span>
                </div>
              )}

              {booking.coupon_discount > 0 && (
                <div className="pay-row" style={{ color: '#16a34a' }}>
                  <span>Coupon Discount ({booking.coupon_applied})</span>
                  <span>−{money(booking.coupon_discount, 2)}</span>
                </div>
              )}

              <div className="pay-row">
                <span>GST (5%)</span>
                <span>{money(booking.gst_amount, 2)}</span>
              </div>

              <div className="pay-row">
                <span>Convenience Gateway Fee</span>
                <span>{money(booking.gateway_fee, 2)}</span>
              </div>

              <div className="pay-row grand-total">
                <span>Total Amount Due</span>
                <span>{money(booking.total_amount, 2)}</span>
              </div>

              <div className="pay-row amt-paid">
                <span>Total Paid Received</span>
                <span>{money(totalPaid, 2)}</span>
              </div>

              {/* Dynamic Payment Transaction History */}
              <div style={{ marginTop: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#0a2351', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  💳 Payment Transaction History
                </div>
                {capturedPayments.length > 0 ? (
                  capturedPayments.map((p, idx) => {
                    const pDate = p.created_at ? new Date(p.created_at) : null;
                    const formattedPDate = pDate
                      ? pDate.toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', hour12: true
                        }).toUpperCase()
                      : travelDateFormatted;

                    const lineLabel = capturedPayments.length === 1
                      ? (isFullyPaid ? 'Full Payment' : 'Advance Payment')
                      : (idx === 0 ? 'Advance Payment' : 'Balance Payment');

                    return (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', borderBottom: idx < capturedPayments.length - 1 ? '1px dashed #cbd5e1' : 'none', paddingBottom: '4px', marginBottom: '4px' }}>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f2f3d' }}>{lineLabel}</div>
                          <div style={{ fontSize: '9px', color: '#475569' }}>
                            Method: {getPaymentMethodLabel(p.payment_method)}
                            {p.payment_reference_id ? ` · Txn: ${p.payment_reference_id}` : ''}
                          </div>
                          <div style={{ fontSize: '9px', color: '#64748b' }}>
                            📅 {formattedPDate}
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, color: '#047857', fontSize: '11px' }}>
                          {money(p.amount, 2)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f2f3d' }}>{isFullyPaid ? 'Full Payment' : 'Advance Payment'}</div>
                      <div style={{ fontSize: '9px', color: '#475569' }}>Method: Online Gateway</div>
                      <div style={{ fontSize: '9px', color: '#64748b' }}>📅 Verified Online</div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#047857', fontSize: '11px' }}>
                      {money(totalPaid, 2)}
                    </div>
                  </div>
                )}
              </div>

              {booking.remaining_balance > 0 && (
                <div className="pay-row amt-balance" style={{ marginTop: '8px' }}>
                  <span>Outstanding Balance</span>
                  <span>{money(booking.remaining_balance, 2)}</span>
                </div>
              )}

              <div className={`status-row ${booking.status === 'FULLY_PAID' ? 'status-paid' : booking.remaining_balance > 0 ? 'status-partial' : 'status-cancelled'}`}>
                Payment Status: {booking.status.replace(/_/g, ' ')}
              </div>
            </div>

            {/* Right: Journey timeline */}
            <div className="summary-card">
              <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{isRoom ? 'Stay Timeline' : 'Itinerary & Timeline'}</span>
                {!isRoom && parsedItineraryDays.length > 0 && (
                  <span style={{ fontSize: '10px', background: '#c8a45a', color: '#0a2351', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                    {parsedItineraryDays.length > 1 ? `${parsedItineraryDays.length} DAYS TOUR` : 'DAY 1 TOUR'}
                  </span>
                )}
              </div>
              <div className="timeline-container">
                {isRoom ? (
                  <>
                    <div className="timeline-event">
                      <div className="timeline-line" />
                      <div className="timeline-dot" />
                      <div className="timeline-time">{booking.room_checkin || '12:00 PM'}</div>
                      <div className="timeline-desc">Check-in at {booking.package_title}</div>
                    </div>
                    {booking.room_highlights && booking.room_highlights.length > 0 ? (
                      booking.room_highlights.map((hi, i) => (
                        <div className="timeline-event" key={i}>
                          <div className="timeline-line" />
                          <div className="timeline-dot" style={{ background: '#e2e8f0' }} />
                          <div className="timeline-time">Service</div>
                          <div className="timeline-desc">{hi.title}</div>
                        </div>
                      ))
                    ) : (
                      <div className="timeline-event">
                        <div className="timeline-line" />
                        <div className="timeline-dot" style={{ background: '#e2e8f0' }} />
                        <div className="timeline-time">Lodge</div>
                        <div className="timeline-desc">Enjoy high-end hotel amenities & sightseeing.</div>
                      </div>
                    )}
                    <div className="timeline-event">
                      <div className="timeline-dot" />
                      <div className="timeline-time">{booking.room_checkout || '11:00 AM'}</div>
                      <div className="timeline-desc">Check-out and exit.</div>
                    </div>
                  </>
                ) : parsedItineraryDays.length > 0 ? (
                  parsedItineraryDays.map((dayGroup, dIdx) => (
                    <div key={`day-${dIdx}`} style={{ marginBottom: dIdx < parsedItineraryDays.length - 1 ? '16px' : '0' }}>
                      {parsedItineraryDays.length > 1 && (
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#c8a45a', background: '#0a2351', padding: '4px 10px', borderRadius: '6px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>🗓️ DAY {dayGroup.dayNumber} SCHEDULE</span>
                        </div>
                      )}
                      {dayGroup.events.map((ev, i) => (
                        <div className="timeline-event" key={i} style={{ marginBottom: '12px', alignItems: 'flex-start' }}>
                          {i < dayGroup.events.length - 1 && <div className="timeline-line" style={{ top: '22px', bottom: '-12px' }} />}
                          <div className="timeline-dot" style={{ background: '#0a2351', marginTop: '4px' }} />
                          <div style={{ flex: 1, paddingLeft: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0a2351' }}>
                                {ev.title && ev.title !== ev.desc ? ev.title : ev.time}
                              </span>
                              {ev.meal_included && (
                                <span style={{ fontSize: '9px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                  🍱 Meal Included
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#1598a1', marginBottom: '2px' }}>
                              ⏰ {ev.time}
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: 500, color: '#475569', lineHeight: 1.4 }}>
                              {ev.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', color: '#64748b', fontStyle: 'italic', fontSize: '10px' }}>
                    Standard boarding departure itinerary details are available at the reporting office.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Inclusions & Meals Card */}
          <div style={{ marginTop: '16px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0a2351', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🍱 Package Inclusions & Meals</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px', color: '#334155' }}>
              <div>
                <strong>Included Meals:</strong><br />
                {isRoom ? (
                  <span>Standard Room Accommodation Stay</span>
                ) : (
                  <span>Delicious Andhra Style Pure Veg Lunch & Morning Breakfast Served On Board</span>
                )}
              </div>
              <div>
                <strong>Fresh-Up Room Facility:</strong><br />
                {booking.has_refreshment_addon ? (
                  <span style={{ color: '#047857', fontWeight: 700 }}>
                    ✅ Fresh-Up Room Addon Included (AC Room Access for Washroom, Fresh-up & Short Stay before Boarding for {booking.adult_count + booking.child_count + booking.student_count} Guests)
                  </span>
                ) : (
                  <span style={{ color: '#64748b' }}>Standard Tour (Fresh-up room not included)</span>
                )}
              </div>
            </div>
          </div>

          {/* Policies Grid */}
          <div className="rules-row" style={{ marginTop: '16px' }}>
            <div className="rule-card">
              <div className="rule-card-title">⛔ Cancellation & Terms</div>
              <ul>
                {isRoom ? (
                  <li>Room stays are strictly non-refundable and non-cancellable once confirmed.</li>
                ) : (
                  <>
                    <li>Cancellations requested 7+ days in advance attract a 35% fee.</li>
                    <li>Inside 7 days, booking is non-refundable.</li>
                  </>
                )}
                <li>Management reserves final boarding approval decisions.</li>
              </ul>
            </div>
            <div className="rule-card">
              <div className="rule-card-title">📋 Safety & Policies</div>
              <ul>
                <li>Valid government-issued ID proofs are required for all guests during check-in.</li>
                <li>Wearing life jackets is mandatory during entire boat rides.</li>
                <li>Littering, alcohol consumption, and smoking are strictly prohibited.</li>
              </ul>
            </div>
            <div className="rule-card">
              <div className="rule-card-title">📍 Support & Office</div>
              <ul>
                <li>Support: 9951369573, 7780119268</li>
                <li>Office: Om Shanti Satram, Kalyana Mandapam Road, near SBI ATM, Bhadrachalam</li>
                <li>Arrive 30 mins before reporting time.</li>
              </ul>
            </div>
          </div>

          {/* Interactive Google Maps Office Navigation Card (PDF Navigable) */}
          <div style={{ marginTop: '16px', background: 'linear-gradient(135deg, #0a2351 0%, #1e3a8a 100%)', borderRadius: '12px', padding: '16px 20px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '2px solid #c8a45a' }}>
            <div style={{ flex: 1, paddingRight: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#c8a45a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📍 Bhadrachalam Collection Office Navigation</span>
              </div>
              <div style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: 1.5 }}>
                Om Shanti Satram, Kalyana Mandapam Road, Near SBI ATM, Bhadrachalam, Telangana 507111
              </div>
            </div>
            <a 
              href="https://maps.app.goo.gl/b9ZvxUvvFq6FgKVU8" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ background: '#c8a45a', color: '#0a2351', textDecoration: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 800, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
              🗺️ Open Google Maps
            </a>
          </div>
        </div>
      </div>

      {/* Agent bar */}
      {booking.agent_id && (
        <div className="agent-bar-ticket">
          <div>Booked by Agent: AGENT_{String(booking.agent_id).padStart(3, '0')} · {booking.agent_name || 'N/A'}</div>
          {booking.agent_gst && <div>GSTIN: {booking.agent_gst}</div>}
          {booking.agent_phone && <div>Phone: {booking.agent_phone}</div>}
        </div>
      )}

      {/* Footer */}
      <div className="ticket-footer">
        <div>Official TS Boat Tourism confirmation voucher</div>
        <div>Support: tstelanganatourism@gmail.com | <a href="https://www.tstelanganatourism.com">www.tstelanganatourism.com</a></div>
      </div>

      <PrintAction showClose />
    </div>
  );
}
