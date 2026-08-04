'use client';

import React, { useEffect, useState } from 'react';
import { Ticket, Loader2, ArrowRight, ChevronRight, Search, Filter, Compass, CheckCircle2, Clock, Ship, Bed, UtensilsCrossed, Navigation } from 'lucide-react';
import { BookingDateDisplay } from '@/components/ui/BookingDateDisplay';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { getTransportSelections, hasRefreshment, money } from '@/lib/bookingDisplay';
import { OfficeVisitPopup, useOfficeVisitPopup } from '@/components/ui/OfficeVisitPopup';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string; bar: string }> = {
  FULLY_PAID:   { label: 'Confirmed',     color: '#059669', bg: '#ecfdf5', dot: '#10b981', bar: '#10b981' },
  CONFIRMED:    { label: 'Confirmed',     color: '#059669', bg: '#ecfdf5', dot: '#10b981', bar: '#10b981' },
  PARTIAL_PAID: { label: 'Advance Paid',  color: '#2563eb', bg: '#eff6ff', dot: '#3b82f6', bar: '#3b82f6' },
  PENDING:      { label: 'Pending Payment', color: '#d97706', bg: '#fffbeb', dot: '#f59e0b', bar: '#f59e0b' },
  CANCELLED:    { label: 'Cancelled',     color: '#dc2626', bg: '#fef2f2', dot: '#ef4444', bar: '#ef4444' },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status?.toUpperCase()] || { label: status, color: '#64748b', bg: '#f8fafc', dot: '#94a3b8', bar: '#94a3b8' };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Office visit popup
  const rawNewBooking = searchParams.get('new_booking');
  const { activeBookingId, dismiss: dismissPopup } = useOfficeVisitPopup(rawNewBooking);
  const activeBooking = bookings.find(b => b.public_id === activeBookingId);

  useEffect(() => {
    // Intercept DLT SMS URLs
    const keys = Array.from(searchParams.keys());
    const ticketId = keys.find(k => k.startsWith('TBT-'));
    if (ticketId) {
      router.replace(`/dashboard/bookings/${ticketId}`);
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await apiClient.get<any[]>('/api/v1/bookings/user/bookings');
        setBookings(res.data);
      } catch (err) {
        console.error('Failed to load bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const statusFilters = ['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'];
  const filteredBookings = filterStatus === 'ALL'
    ? bookings
    : bookings.filter(b => {
        if (filterStatus === 'CONFIRMED') return b.status === 'FULLY_PAID' || b.status === 'CONFIRMED' || b.status === 'PARTIAL_PAID';
        if (filterStatus === 'PENDING') return b.status === 'PENDING';
        if (filterStatus === 'CANCELLED') return b.status === 'CANCELLED';
        return true;
      });

  // Separate upcoming vs past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingBookings = filteredBookings.filter(b => {
    if (!b.travel_date) return false;
    return new Date(b.travel_date) >= today;
  });
  const pastBookings = filteredBookings.filter(b => {
    if (!b.travel_date) return true;
    return new Date(b.travel_date) < today;
  });

  return (
    <>
      {activeBookingId && (
        <OfficeVisitPopup
          bookingId={activeBookingId}
          onClose={dismissPopup}
          targetType={activeBooking?.target_type}
          isPartial={activeBooking?.status === 'PARTIAL_PAID'}
          remainingBalance={activeBooking?.remaining_balance}
        />
      )}

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .booking-ticket {
          background: #fff;
          border-radius: 20px;
          border: 1px solid rgba(30,70,138,0.08);
          box-shadow: 0 2px 14px rgba(30,70,138,0.06);
          transition: all 0.22s ease;
          overflow: hidden;
          animation: fade-up 0.4s ease forwards;
        }
        .booking-ticket:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(30,70,138,0.12);
        }
        .filter-pill {
          padding: 6px 16px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          border: 1.5px solid transparent;
          transition: all 0.18s ease;
          cursor: pointer;
        }
        .filter-pill-active {
          background: #0b3d52;
          color: #fff;
          box-shadow: 0 2px 10px rgba(11,61,82,0.20);
        }
        .filter-pill-inactive {
          background: #fff;
          color: #64748b;
          border-color: #e2e8f0;
        }
        .filter-pill-inactive:hover {
          border-color: #1598a1;
          color: #1598a1;
        }
        .section-label {
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, #e2e8f0, transparent);
        }
        .empty-state-card {
          background: #fafbfc;
          border-radius: 20px;
          border: 1.5px dashed rgba(14,107,116,0.2);
        }
      `}</style>

      <div className="space-y-6 max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Trips</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">Track your bookings and travel history</p>
        </div>

        {/* ── Status Filter Pills ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {statusFilters.map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`filter-pill ${filterStatus === status ? 'filter-pill-active' : 'filter-pill-inactive'}`}
            >
              {status === 'ALL' ? 'All Trips' : status === 'CONFIRMED' ? '✓ Confirmed' : status === 'PENDING' ? 'Pending' : 'Cancelled'}
            </button>
          ))}
          {bookings.length > 0 && (
            <span className="ml-auto text-xs text-slate-400 font-semibold">{filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#1598a1] mb-3" />
            <p className="text-sm text-slate-400 font-medium">Loading your trips...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="empty-state-card p-14 flex flex-col items-center text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: '#e8f8fb', border: '1px solid rgba(14,107,116,0.15)' }}
            >
              <Compass className="h-8 w-8" style={{ color: '#0e6b74' }} />
            </div>
            <h3 className="font-black text-slate-700 text-lg mb-1">
              {filterStatus === 'ALL' ? 'No trips booked yet' : `No ${filterStatus.toLowerCase()} bookings`}
            </h3>
            <p className="text-slate-400 text-sm max-w-xs mb-6">
              {filterStatus === 'ALL'
                ? "You haven't booked any tours yet. Explore the Godavari with TS Boat Tourism!"
                : "No bookings match this filter. Try selecting a different status."}
            </p>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: '#0b3d52', boxShadow: '0 4px 14px rgba(11,61,82,0.20)' }}
            >
              Browse Packages <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming */}
            {upcomingBookings.length > 0 && (
              <div className="space-y-3">
                <p className="section-label">Upcoming</p>
                {upcomingBookings.map((b, idx) => (
                  <BookingTicketCard key={b.id} booking={b} style={{animationDelay: `${idx * 0.06}s`}} />
                ))}
              </div>
            )}

            {/* Past */}
            {pastBookings.length > 0 && (
              <div className="space-y-3">
                <p className="section-label">Past Trips</p>
                {pastBookings.map((b, idx) => (
                  <BookingTicketCard key={b.id} booking={b} style={{animationDelay: `${(upcomingBookings.length + idx) * 0.06}s`}} isPast />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function BookingTicketCard({ booking: b, style, isPast }: { booking: any; style?: React.CSSProperties; isPast?: boolean }) {
  const statusCfg = getStatusConfig(b.status);
  const transports = getTransportSelections(b.pricing_snapshot);
  const refreshmentIncluded = hasRefreshment(b);

  return (
    <div className="booking-ticket" style={style}>
      {/* Top color bar */}
      <div className="h-1.5 w-full" style={{background: isPast ? '#e2e8f0' : `linear-gradient(90deg, ${statusCfg.bar}, ${statusCfg.dot}66)`}} />

      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Info */}
          <div className="flex items-start gap-4 min-w-0">
            {/* Icon */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: isPast ? '#f1f5f9' : statusCfg.bg }}
            >
              {isPast
                ? <CheckCircle2 className="h-5 w-5 text-slate-400" />
                : b.target_type === 'ROOM'
                  ? <Bed className="h-5 w-5" style={{ color: statusCfg.color }} />
                  : <Ship className="h-5 w-5" style={{ color: statusCfg.color }} />}
            </div>

            <div className="min-w-0">
              {/* ID + Status */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">{b.public_id}</span>
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{background: statusCfg.bg, color: statusCfg.color}}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{background: statusCfg.dot}} />
                  {statusCfg.label}
                </span>
                {b.is_rescheduled && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
                    Rescheduled
                  </span>
                )}
              </div>

              {/* Package name */}
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-tight">{b.package_title}</h3>

              {/* Date */}
              <div className="mt-1">
                <BookingDateDisplay
                  targetType={b.target_type}
                  travelDate={b.travel_date}
                  roomCheckin={b.room_checkin}
                  roomCheckout={b.room_checkout}
                  roomCheckoutDate={b.room_checkout_date}
                  packageDepartureTime={b.package_departure_time}
                  compact={true}
                  className="!text-xs !text-slate-500"
                />
              </div>

              {/* Tags */}
              {(transports.length > 0 || refreshmentIncluded) && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {transports.slice(0, 2).map((ts: any, idx: number) => (
                    <span key={idx} className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-slate-500" style={{background:'#f1f5f9', border:'1px solid #e2e8f0'}}>
                      {Number(ts.quantity || 1) > 1 ? `${ts.quantity}x ` : ''}{ts.title}
                    </span>
                  ))}
                  {refreshmentIncluded && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-emerald-700" style={{background:'#ecfdf5', border:'1px solid #bbf7d0'}}>
                      Refreshments
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Amount + CTA */}
          <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-4 sm:pt-0 shrink-0">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</p>
              <p className="font-black text-slate-800 text-lg leading-none mt-0.5">{money(b.total_amount)}</p>
              {b.remaining_balance > 0 && (
                <p className="text-[10px] text-amber-600 font-bold mt-1">Due: {money(b.remaining_balance)}</p>
              )}
            </div>
            <Link
              href={`/dashboard/bookings/${b.public_id}`}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all hover:-translate-y-0.5"
              style={{ background: isPast ? '#f1f5f9' : '#0b3d52', color: isPast ? '#475569' : '#fff', boxShadow: isPast ? 'none' : '0 2px 10px rgba(11,61,82,0.22)' }}
            >
              {isPast ? 'View Ticket' : 'View Ticket'}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
