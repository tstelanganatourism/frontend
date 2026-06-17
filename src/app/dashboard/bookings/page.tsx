'use client';

import React, { useEffect, useState } from 'react';
import { Ticket, Loader2 } from 'lucide-react';
import { BookingDateDisplay } from '@/components/ui/BookingDateDisplay';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { getTransportSelections, hasRefreshment, money } from '@/lib/bookingDisplay';
import { OfficeVisitPopup, useOfficeVisitPopup } from '@/components/ui/OfficeVisitPopup';

const getStatusDisplay = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'FULLY_PAID':
    case 'CONFIRMED':
      return { label: 'Confirmed', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' };
    case 'PARTIAL_PAID':
      return { label: 'Advance Paid', className: 'bg-blue-50 text-blue-700 ring-blue-600/20' };
    case 'PENDING':
      return { label: 'Pending Payment', className: 'bg-amber-50 text-amber-700 ring-amber-600/20' };
    case 'CANCELLED':
      return { label: 'Cancelled', className: 'bg-rose-50 text-rose-700 ring-rose-600/20' };
    default:
      return { label: status, className: 'bg-slate-50 text-slate-700 ring-slate-600/20' };
  }
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Office visit popup: reads ?new_booking=TBT-BT-XXXX from URL
  const rawNewBooking = searchParams.get('new_booking');
  const { activeBookingId, dismiss: dismissPopup } = useOfficeVisitPopup(rawNewBooking);
  const activeBooking = bookings.find(b => b.public_id === activeBookingId);

  useEffect(() => {
    // Intercept DLT SMS URLs (e.g., ?TBT-BT-1062 or ?TBT-AC-1062)
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

  return (
    <>
      {/* Office Visit Popup (shown once per new booking) */}
      {activeBookingId && (
        <OfficeVisitPopup
          bookingId={activeBookingId}
          onClose={dismissPopup}
          targetType={activeBooking?.target_type}
          isPartial={activeBooking?.status === 'PARTIAL_PAID'}
          remainingBalance={activeBooking?.remaining_balance}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-border">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-[var(--color-brand-river)]">My Bookings</h1>
              <p className="text-sm text-slate-500">Manage your tickets and trip history.</p>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-border flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
          </div>
        ) : bookings.length > 0 ? (
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-slate-100">
            {bookings.map((b) => {
              const statusDisplay = getStatusDisplay(b.status);
              const transports = getTransportSelections(b.pricing_snapshot);
              const refreshmentIncluded = hasRefreshment(b);
              return (
                <div key={b.id} className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-400">{b.public_id}</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${statusDisplay.className}`}>
                        {statusDisplay.label}
                      </span>
                      {b.is_rescheduled && (
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20">
                          Rescheduled
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-base text-slate-700 mt-1 leading-tight">{b.package_title}</h3>
                    <BookingDateDisplay
                      targetType={b.target_type}
                      travelDate={b.travel_date}
                      roomCheckin={b.room_checkin}
                      roomCheckout={b.room_checkout}
                      roomCheckoutDate={b.room_checkout_date}
                      packageDepartureTime={b.package_departure_time}
                      compact={true}
                      className="!text-sm mt-0.5"
                    />
                    {(transports.length > 0 || refreshmentIncluded) && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {transports.slice(0, 2).map((ts, idx) => (
                          <span key={idx} className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                            {Number(ts.quantity || 1) > 1 ? `${ts.quantity}x ` : ''}{ts.title}
                          </span>
                        ))}
                        {refreshmentIncluded && (
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                            Refreshments
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-8 sm:gap-12 w-full sm:w-auto justify-between sm:justify-end shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0">
                    <div className="text-left sm:text-right min-w-[100px]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Amount</span>
                      <p className="font-black text-base text-slate-800">{money(b.total_amount)}</p>
                    </div>
                    <Link
                      href={`/dashboard/bookings/${b.public_id}`}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                    >
                      Ticket Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-border">
            <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Ticket className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No upcoming bookings</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
              You don&apos;t have any upcoming trips right now. Start exploring the Godavari!
            </p>
            <Link
              href="/packages"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--color-brand-river)] text-white px-6 py-2.5 text-sm font-bold hover:bg-[#1a5663] transition-colors"
            >
              Browse Packages
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
