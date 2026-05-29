'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X as CloseIcon, Ticket, Calendar, Clock, CreditCard, ExternalLink,
  Loader2, Users, Phone, FileText, History, Banknote, Wifi,
  CheckCircle2, AlertCircle, IndianRupee, TrendingUp
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Passenger {
  full_name: string;
  age: number;
  gender: string | null;
  is_child: boolean;
  phone_number: string | null;
}

interface PaymentLedgerEntry {
  id: number;
  amount: number;
  payment_method: string;
  status: string;
  collected_by_type: string;
  collected_by_label: string;
  payment_reference_id: string;
  created_at: string | null;
}

interface BookingDetails {
  id: number;
  public_id: string;
  target_type: 'PACKAGE' | 'ROOM';
  travel_date: string;
  adult_count: number;
  child_count: number;
  subtotal_amount: number;
  coupon_discount: number;
  coupon_applied: string | null;
  gst_amount: number;
  gateway_fee: number;
  total_amount: number;
  remaining_balance: number;
  paid_amount: number;
  status: string;
  created_at: string | null;
  package_title: string;
  variant_title: string;

  room_checkin?: string | null;
  passengers: Passenger[];
  agent_id: number | null;
  agent_name: string | null;
  boarding_point: {
    title: string;
    address: string;
    landmark: string;
    departure_time: string;
    contact_number: string;
  } | null;
  ticket_pdf_url?: string | null;
  invoice_pdf_url?: string | null;
  ticket_generation_status?: string;
  invoice_generation_status?: string;
  payment_ledger: PaymentLedgerEntry[];
}

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicId: string | null;
  onPaymentRecorded?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { label: string; bg: string; text: string; ring: string }> = {
  FULLY_PAID:   { label: 'Confirmed',  bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
  CONFIRMED:    { label: 'Confirmed',  bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
  PENDING:      { label: 'Pending',    bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'ring-amber-600/20' },
  PARTIAL_PAID: { label: 'Part. Paid', bg: 'bg-blue-50',    text: 'text-blue-700',    ring: 'ring-blue-600/20' },
  CANCELLED:    { label: 'Cancelled',  bg: 'bg-red-50',     text: 'text-red-700',     ring: 'ring-red-600/20' },
  REFUNDED:     { label: 'Refunded',   bg: 'bg-slate-50',   text: 'text-slate-700',   ring: 'ring-slate-600/20' },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  RAZORPAY: 'Online (Razorpay)',
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  ADMIN_MANUAL: 'Manual (Admin)',
};

const PAYMENT_STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  CAPTURED: { label: 'Success',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CREATED:  { label: 'Pending',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  FAILED:   { label: 'Failed',   cls: 'bg-red-50 text-red-700 border-red-200' },
  REFUNDED: { label: 'Refunded', cls: 'bg-slate-50 text-slate-600 border-slate-200' },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function formatDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

// ─── Payment Ledger Component ─────────────────────────────────────────────────

function PaymentLedgerPanel({ ledger }: { ledger: PaymentLedgerEntry[] }) {
  if (!ledger || ledger.length === 0) {
    return (
      <div className="flex items-center justify-center py-6 text-slate-400 text-xs font-semibold">
        No payment records yet.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {ledger.map((entry, idx) => {
        const statusStyle = PAYMENT_STATUS_STYLE[entry.status] ?? { label: entry.status, cls: 'bg-slate-50 text-slate-600 border-slate-200' };
        const methodLabel = PAYMENT_METHOD_LABEL[entry.payment_method] ?? entry.payment_method;
        const isOnline = entry.collected_by_type === 'RAZORPAY';

        return (
          <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className={`mt-0.5 h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
              entry.status === 'CAPTURED' ? 'bg-emerald-100 text-emerald-700' :
              entry.status === 'CREATED'  ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-600'
            }`}>
              {isOnline ? <Wifi className="h-3 w-3" /> : <Banknote className="h-3 w-3" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-black text-slate-800">
                  {idx === 0 ? 'Advance Payment' : `Payment ${idx + 1}`}
                </p>
                <p className="text-sm font-black text-slate-900">{formatCurrency(entry.amount)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-semibold text-slate-500">{methodLabel}</span>
                <span className="text-slate-300">•</span>
                <span className="text-[9px] text-slate-500 font-semibold">{entry.collected_by_label}</span>
                <span className="text-slate-300">•</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${statusStyle.cls}`}>
                  {statusStyle.label}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[8px] text-slate-400 font-mono truncate max-w-[160px]">{entry.payment_reference_id}</p>
                <p className="text-[8px] text-slate-400 shrink-0">{formatDateTime(entry.created_at)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Record Cash Payment Panel ────────────────────────────────────────────────

function RecordCashPanel({
  booking,
  onSuccess,
}: {
  booking: BookingDetails;
  onSuccess: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER'>('CASH');
  const [collectedByLabel, setCollectedByLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient.post(`/api/v1/admin/bookings/${booking.id}/record-cash-payment`, {
        payment_method: paymentMethod,
        collected_by_label: collectedByLabel || undefined,
      });
      toast.success(res.data.message || 'Payment recorded successfully.');
      setIsOpen(false);
      onSuccess(); // triggers re-fetch — no window.location.reload
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to record cash payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wide border-2 border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-500 hover:text-white transition-all shadow-sm w-full sm:w-auto active:scale-95"
      >
        <Banknote className="w-4 h-4" />
        Record Cash Payment ({formatCurrency(booking.remaining_balance)})
      </button>
    );
  }

  return (
    <div className="mt-3 bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-3">
      <p className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
        <IndianRupee className="h-3.5 w-3.5" />
        Record Cash / Bank Transfer — Balance: {formatCurrency(booking.remaining_balance)}
      </p>

      <div className="flex gap-2">
        {(['CASH', 'BANK_TRANSFER'] as const).map(m => (
          <button
            key={m}
            onClick={() => setPaymentMethod(m)}
            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all ${
              paymentMethod === m
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
            }`}
          >
            {m === 'CASH' ? 'Cash' : 'Bank Transfer'}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={collectedByLabel}
        onChange={e => setCollectedByLabel(e.target.value)}
        placeholder="Collected by (e.g. Admin Ravi) — optional"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
      />

      <div className="flex gap-2">
        <button
          onClick={() => setIsOpen(false)}
          className="flex-1 py-2 rounded-lg text-[10px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 py-2 rounded-lg text-[10px] font-black text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          {isSubmitting ? 'Recording...' : 'Confirm Payment'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function BookingDetailsModal({
  isOpen,
  onClose,
  publicId,
  onPaymentRecorded,
}: BookingDetailsModalProps) {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [isDownloadingTicket, setIsDownloadingTicket] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const { user } = useAuthStore();

  // ─── Fetch booking (re-fetchable) ─────────────────────────────────────────
  const fetchDetails = useCallback(async () => {
    if (!publicId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<BookingDetails>(`/api/v1/bookings/${publicId}`);
      setBooking(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to fetch detailed booking records.');
    } finally {
      setLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    if (!isOpen || !publicId) {
      setBooking(null);
      setError(null);
      return;
    }
    fetchDetails();
  }, [isOpen, publicId, fetchDetails]);

  // Called after successful cash payment recording
  const handlePaymentRecorded = useCallback(async () => {
    await fetchDetails(); // refresh ledger without closing modal
    onPaymentRecorded?.();
  }, [fetchDetails, onPaymentRecorded]);

  const handleDownloadPdf = async (objectKey: string, type: 'invoice' | 'ticket') => {
    if (!objectKey) return;
    if (type === 'invoice') setIsDownloadingInvoice(true);
    else setIsDownloadingTicket(true);
    try {
      const res = await apiClient.post('/api/v1/documents/signed-url', { object_key: objectKey });
      window.open(res.data.url, '_blank');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to generate secure document link');
    } finally {
      if (type === 'invoice') setIsDownloadingInvoice(false);
      else setIsDownloadingTicket(false);
    }
  };

  if (!isOpen) return null;

  const statusCfg = booking
    ? (STATUS_STYLE[booking.status.toUpperCase()] ?? { label: booking.status, bg: 'bg-slate-50', text: 'text-slate-700', ring: 'ring-slate-600/20' })
    : null;

  const isAdmin = user?.role === 'ADMIN';
  const isPartialPaid = booking?.status === 'PARTIAL_PAID';
  const remainingBalance = booking?.remaining_balance ?? 0;
  const progressPct = booking && booking.total_amount > 0
    ? Math.min(100, (booking.paid_amount / booking.total_amount) * 100)
    : 0;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-8 z-10"
          >
            {/* Close button */}
            <div className="absolute top-5 right-5 z-20">
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 px-8 text-[#5ac4d7]">
                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                <span className="text-sm font-semibold text-slate-500">Loading booking dossier...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
                  <Ticket className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">Booking Record Unobtainable</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6">{error}</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            ) : booking ? (
              <div className="flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="bg-slate-50/70 border-b border-slate-100 p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {statusCfg && (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${statusCfg.bg} ${statusCfg.text} ring-1 ring-inset ${statusCfg.ring}`}>
                        {statusCfg.label}
                      </span>
                    )}
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200/60 px-3 py-1 rounded-lg">
                      {booking.public_id}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">{booking.package_title}</h2>
                  <p className="text-xs font-bold text-[#5ac4d7] uppercase tracking-wider mt-1">{booking.variant_title}</p>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-7">
                  {/* Travel Parameters */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 bg-slate-50/50 rounded-2xl border border-slate-100 p-5">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Travel Date</span>
                      <span className="text-sm font-bold text-slate-800">
                        {new Date(booking.travel_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                        {booking.target_type === 'ROOM' ? 'Check-in Time' : 'Reporting Time'}
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {booking.target_type === 'ROOM'
                          ? (booking.room_checkin || 'TBA')
                          : (booking.boarding_point?.departure_time || 'TBA')} {booking.target_type === 'ROOM' && booking.room_checkin ? '' : '(IST)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Passengers</span>
                      <span className="text-sm font-bold text-slate-800">
                        {booking.adult_count} Adults {booking.child_count > 0 ? `+ ${booking.child_count} Children` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Passenger Roster */}
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" /> Passenger Roster
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {booking.passengers && booking.passengers.length > 0 ? (
                        booking.passengers.map((p, idx) => (
                          <div key={idx} className={`flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-slate-200 transition-colors ${booking.passengers.length === 1 ? 'sm:col-span-2' : ''}`}>
                            <div className="h-9 w-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                              {p.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-800 text-xs truncate">{p.full_name}</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">
                                {p.gender || '—'} • Age {p.age} {p.is_child ? '(Child)' : ''}
                              </p>
                            </div>
                            {p.phone_number && (
                              <a href={`tel:${p.phone_number}`} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors" title={p.phone_number}>
                                <Phone className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="col-span-2 text-slate-400 text-xs italic py-2">No traveler records found.</p>
                      )}
                    </div>
                  </div>

                  {/* Billing Summary — backend-authoritative values */}
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-slate-400" /> Billing Breakdown
                    </h4>
                    <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                        <div>Base Subtotal</div>
                        <div className="text-right font-bold text-slate-700">{formatCurrency(booking.subtotal_amount)}</div>
                        {booking.coupon_discount > 0 && (
                          <>
                            <div className="text-rose-600">Promo Discount ({booking.coupon_applied})</div>
                            <div className="text-right font-black text-rose-600">-{formatCurrency(booking.coupon_discount)}</div>
                          </>
                        )}
                        <div>GST & Service Taxes</div>
                        <div className="text-right font-bold text-slate-700">{formatCurrency(booking.gst_amount + booking.gateway_fee)}</div>
                      </div>
                      <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-slate-800">
                        <span className="font-extrabold text-sm">Grand Invoice Total</span>
                        <span className="text-lg font-black text-[#0f3d56]">{formatCurrency(booking.total_amount)}</span>
                      </div>

                      {/* Payment progress */}
                      <div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          <span>Payment Progress</span>
                          <span>{Math.round(progressPct)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${progressPct}%`,
                              background: booking.status === 'FULLY_PAID'
                                ? 'linear-gradient(90deg, #10b981, #059669)'
                                : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                            }}
                          />
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                          <div className="bg-emerald-50 rounded-lg p-2 text-center">
                            <p className="text-emerald-600 font-bold uppercase tracking-wide">Paid</p>
                            <p className="font-black text-emerald-800">{formatCurrency(booking.paid_amount)}</p>
                          </div>
                          <div className={`rounded-lg p-2 text-center ${remainingBalance > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}>
                            <p className={`font-bold uppercase tracking-wide ${remainingBalance > 0 ? 'text-amber-600' : 'text-slate-400'}`}>Remaining</p>
                            <p className={`font-black ${remainingBalance > 0 ? 'text-amber-800' : 'text-slate-500'}`}>
                              {remainingBalance > 0 ? formatCurrency(remainingBalance) : 'None'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {remainingBalance > 0 && (
                        <div className="bg-amber-50 border border-amber-100 text-amber-800 rounded-xl p-3 flex justify-between items-center text-xs font-bold">
                          <span>Balance Due</span>
                          <span className="text-sm font-black">{formatCurrency(remainingBalance)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Ledger */}
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                      <History className="h-4 w-4 text-slate-400" /> Payment History
                    </h4>
                    <PaymentLedgerPanel ledger={booking.payment_ledger || []} />

                    {/* Admin: Record cash payment panel */}
                    {isAdmin && isPartialPaid && remainingBalance > 0 && (
                      <div className="mt-3">
                        <RecordCashPanel booking={booking} onSuccess={handlePaymentRecorded} />
                      </div>
                    )}
                  </div>

                  {/* Agent partner reference */}
                  {booking.agent_id && (
                    <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-x-8 gap-y-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <div>Agent Partner ID: AGT-{booking.agent_id}</div>
                      <div>Agent Partner Name: {booking.agent_name || '—'}</div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="border-t border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-white rounded-b-3xl shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] relative z-10">
                  {/* Left: Close & Cancel */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 w-full md:w-auto">
                    <button
                      onClick={onClose}
                      className="px-6 py-3 rounded-2xl text-xs font-black tracking-widest uppercase border-2 border-slate-200 text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm w-full sm:w-auto active:scale-95"
                    >
                      Close
                    </button>
                    {booking.status !== 'CANCELLED' && booking.status !== 'REFUNDED' && (
                      <button
                        onClick={() => setIsCancelConfirmOpen(true)}
                        className="px-6 py-3 rounded-2xl text-xs font-black tracking-wide border-2 border-red-100 text-red-600 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all shadow-sm w-full sm:w-auto active:scale-95"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>

                  {/* Right: Documents */}
                  <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
                    {booking.status === 'FULLY_PAID' && isAdmin && (
                      booking.invoice_pdf_url ? (
                        <button
                          onClick={() => handleDownloadPdf(booking.invoice_pdf_url!, 'invoice')}
                          disabled={isDownloadingInvoice}
                          className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-50 w-full sm:w-auto border border-slate-700"
                        >
                          {isDownloadingInvoice ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                          Invoice
                        </button>
                      ) : (
                        <a
                          href={`/print/invoice/${booking.public_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 transition-all active:scale-95 w-full sm:w-auto border border-slate-700"
                        >
                          <ExternalLink className="h-4 w-4" /> View Invoice
                        </a>
                      )
                    )}

                    {booking.ticket_pdf_url ? (
                      <button
                        onClick={() => handleDownloadPdf(booking.ticket_pdf_url!, 'ticket')}
                        disabled={isDownloadingTicket}
                        className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-[#0f3d56] to-[#1a5663] hover:from-[#134965] hover:to-[#1e6675] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#0f3d56]/20 transition-all active:scale-95 disabled:opacity-50 w-full sm:w-auto border border-[#0f3d56]"
                      >
                        {isDownloadingTicket ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
                        Ticket PDF
                      </button>
                    ) : (
                      <a
                        href={`/print/ticket/${booking.public_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-[#0f3d56] to-[#1a5663] hover:from-[#134965] hover:to-[#1e6675] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#0f3d56]/20 transition-all active:scale-95 w-full sm:w-auto border border-[#0f3d56]"
                      >
                        <Ticket className="h-4 w-4" /> View Ticket
                      </a>
                    )}

                    {booking.target_type === 'PACKAGE' && (
                      <a
                        href={`/print/form/${booking.public_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex justify-center items-center gap-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 w-full sm:w-auto border-2 border-indigo-100 hover:border-indigo-600"
                      >
                        <FileText className="h-4 w-4" /> Print Form
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Cancellation Confirmation Modal */}
      <AnimatePresence>
        {isCancelConfirmOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !isCancelling && setIsCancelConfirmOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden p-6"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <span className="text-red-600 text-xl font-bold">!</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Cancel Booking?</h3>
                <p className="text-sm text-slate-500 mb-6">
                  Are you sure you want to cancel this booking? A <span className="font-bold text-red-600">35% cancellation fee</span> will be applied to the refund amount.
                </p>
                <div className="flex w-full gap-3">
                  <button
                    onClick={() => setIsCancelConfirmOpen(false)}
                    disabled={isCancelling}
                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={async () => {
                      setIsCancelling(true);
                      try {
                        if (!booking?.id) return;
                        await apiClient.patch(`/api/v1/admin/bookings/${booking.id}/cancel`, {
                          status: 'APPROVED',
                          admin_notes: 'Manual cancellation by admin',
                        });
                        toast.success('Booking cancelled successfully.');
                        setIsCancelConfirmOpen(false);
                        onClose();
                        onPaymentRecorded?.(); // trigger list refresh
                      } catch (err: any) {
                        toast.error(err.response?.data?.detail || 'Failed to cancel booking');
                        setIsCancelling(false);
                        setIsCancelConfirmOpen(false);
                      }
                    }}
                    disabled={isCancelling}
                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors flex justify-center items-center disabled:opacity-50"
                  >
                    {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Cancel'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
