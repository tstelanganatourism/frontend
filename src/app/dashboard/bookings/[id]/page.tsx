'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Printer, FileText, MapPin, Calendar, Clock,
  CheckCircle2, CreditCard, Loader2, AlertCircle, Shield,
  History, IndianRupee, TrendingUp, Banknote, Wifi
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useRazorpay } from "react-razorpay";
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import {
  describeTransport,
  getBaseFareExcludingAddons,
  getRefreshmentAmount,
  getTransportSelections,
  hasRefreshment,
} from '@/lib/bookingDisplay';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Passenger {
  full_name: string;
  age: number;
  gender: string;
  id_proof_type: string | null;
  id_proof_number: string | null;
  is_lead: boolean;
}

interface BoardingPoint {
  title: string;
  address: string;
  landmark: string | null;
  departure_time: string;
  contact_number: string | null;
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
  target_type: string;
  room_checkin?: string | null;
  room_checkout?: string | null;
  room_checkout_date?: string | null;
  room_address?: string | null;
  passengers: Passenger[];
  agent_id: number | null;
  agent_name: string | null;
  agent_gst?: string | null;
  agent_company?: string | null;
  boarding_point: BoardingPoint | null;
  has_pending_cancellation?: boolean;
  ticket_pdf_url?: string | null;
  ticket_generation_status?: string;
  has_refreshment_addon?: boolean;
  agent_commission?: number | null;
  agent_payable?: number | null;
  payment_ledger: PaymentLedgerEntry[];
  pricing_snapshot?: any;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  RAZORPAY: 'Online (Razorpay)',
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  ADMIN_MANUAL: 'Manual (Admin)',
};

const PAYMENT_STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  CAPTURED: { label: 'Success', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CREATED:  { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  FAILED:   { label: 'Failed',  cls: 'bg-red-50 text-red-700 border-red-200' },
  REFUNDED: { label: 'Refunded', cls: 'bg-slate-50 text-slate-600 border-slate-200' },
};

function getStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'FULLY_PAID':
    case 'CONFIRMED':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          <CheckCircle2 className="h-3.5 w-3.5" /> Confirmed
        </span>
      );
    case 'PARTIAL_PAID':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 ring-1 ring-inset ring-blue-600/20">
          <TrendingUp className="h-3.5 w-3.5" /> Partially Paid
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700 ring-1 ring-inset ring-amber-600/20">
          <Clock className="h-3.5 w-3.5" /> Pending
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700 ring-1 ring-inset ring-red-600/20">
          <AlertCircle className="h-3.5 w-3.5" /> Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 ring-1 ring-inset ring-slate-600/20">
          {status}
        </span>
      );
  }
}

function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

// ─── Payment Timeline Card ────────────────────────────────────────────────────

function PaymentTimeline({ ledger }: { ledger: PaymentLedgerEntry[] }) {
  // Filter out CREATED (abandoned checkouts) so they don't clog the ledger
  const activeLedger = ledger.filter(p => p.status !== 'CREATED');
  if (activeLedger.length === 0) return null;

  const captured = activeLedger.filter(p => p.status === 'CAPTURED');

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
        <History className="h-4 w-4 text-slate-400" /> Payment History
      </h3>
      <div className="space-y-3">
        {activeLedger.map((entry, idx) => {
          const statusStyle = PAYMENT_STATUS_STYLE[entry.status] ?? { label: entry.status, cls: 'bg-slate-50 text-slate-600 border-slate-200' };
          const methodLabel = PAYMENT_METHOD_LABEL[entry.payment_method] ?? entry.payment_method;
          const isOnline = entry.collected_by_type === 'RAZORPAY';
          return (
            <div
              key={entry.id}
              className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100"
            >
              {/* Icon */}
              <div className={`mt-0.5 h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                entry.status === 'CAPTURED' ? 'bg-emerald-100 text-emerald-700' :
                entry.status === 'CREATED'  ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-600'
              }`}>
                {isOnline
                  ? <Wifi className="h-3.5 w-3.5" />
                  : <Banknote className="h-3.5 w-3.5" />
                }
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-black text-slate-800">
                    {idx === 0 ? 'Advance Payment' : `Payment ${idx + 1}`}
                  </p>
                  <p className="text-sm font-black text-slate-900">{formatINR(entry.amount)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-[10px] font-semibold text-slate-500">{methodLabel}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{entry.collected_by_label}</span>
                  <span className="text-slate-300">•</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${statusStyle.cls}`}>
                    {statusStyle.label}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[9px] text-slate-400 font-mono truncate">{entry.payment_reference_id}</p>
                  <p className="text-[9px] text-slate-400 shrink-0">{formatDateTime(entry.created_at)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 gap-2 text-xs">
        <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">Captured</p>
          <p className="font-black text-emerald-800 mt-0.5">{formatINR(captured.reduce((s, p) => s + p.amount, 0))}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const { Razorpay } = useRazorpay();
  const { user } = useAuthStore();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guard: only one Razorpay popup can be active at a time
  const isPaymentActiveRef = useRef(false);
  const [isProcessingBalance, setIsProcessingBalance] = useState(false);

  // Cancellation state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // ─── Fetch booking (refreshable) ───────────────────────────────────────────
  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;
    try {
      setLoading(true);
      const res = await apiClient.get<BookingDetails>(`/api/v1/bookings/${bookingId}`);
      setBooking(res.data);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to retrieve reservation details.');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  // ─── Cancellation ───────────────────────────────────────────────────────────
  const handleCancelSubmit = async () => {
    if (cancelReason.trim().length < 5) return;
    try {
      setSubmittingCancel(true);
      setCancelError(null);
      await apiClient.post(`/api/v1/bookings/${bookingId}/cancel`, { reason: cancelReason });
      const message = `Hello TS Boat Tourism, I would like to request a cancellation for:\n\nBooking ID: ${booking?.public_id}\nPackage: ${booking?.package_title}\nTravel Date: ${new Date(booking?.travel_date || '').toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}\nReason: ${cancelReason}`;
      window.open(`https://wa.me/919542069573?text=${encodeURIComponent(message)}`, '_blank');
      setBooking(prev => prev ? { ...prev, has_pending_cancellation: true } : null);
      setShowCancelModal(false);
      setCancelReason('');
      toast.success("Cancellation request logged and WhatsApp chat opened!");
    } catch (err: any) {
      setCancelError(err?.response?.data?.detail || 'Failed to submit cancellation request.');
    } finally {
      setSubmittingCancel(false);
    }
  };

  // ─── Balance Payment (duplicate-safe) ──────────────────────────────────────
  const handlePayBalance = async () => {
    if (!booking) return;
    // Prevent duplicate: if payment popup already active, do nothing
    if (isPaymentActiveRef.current || isProcessingBalance) {
      toast.error("A payment is already in progress. Please complete or dismiss it.");
      return;
    }

    isPaymentActiveRef.current = true;
    setIsProcessingBalance(true);

    try {
      const res = await apiClient.post(`/api/v1/bookings/${booking.public_id}/balance-checkout`);
      const { checkout_data } = res.data;

      if (!checkout_data?.key_id) {
        toast.error("Failed to initialize payment gateway. Please try again.");
        isPaymentActiveRef.current = false;
        setIsProcessingBalance(false);
        return;
      }

      if (!Razorpay) {
        toast.error("Payment gateway is still loading. Please refresh the page.");
        isPaymentActiveRef.current = false;
        setIsProcessingBalance(false);
        return;
      }

      const options = {
        key: checkout_data.key_id,
        amount: checkout_data.amount,
        currency: checkout_data.currency,
        name: "TS Tours",
        description: `Balance Payment for Booking: ${booking.public_id}`,
        order_id: checkout_data.razorpay_order_id,
        handler: async (response: any) => {
          try {
            const verifyRes = await apiClient.post('/api/v1/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.data.status === 'success') {
              toast.success("Payment successful! Your booking is now updated.");
              // Real-time refresh — no browser reload
              await fetchBooking();
            }
          } catch (err) {
            console.error("Payment verification failed", err);
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            isPaymentActiveRef.current = false;
            setIsProcessingBalance(false);
          }
        },
        prefill: { name: booking.passengers?.[0]?.full_name || '' },
        theme: { color: "#1a6b7a" },
        modal: {
          ondismiss: () => {
            apiClient.post('/api/v1/payments/record-failure', {
              razorpay_order_id: checkout_data.razorpay_order_id,
              error_code: 'USER_DISMISSED',
              error_description: 'Customer closed Razorpay checkout before payment completion.',
            }).catch((err) => console.warn('Failed to record payment dismissal', err));
            toast.error("Payment not completed.");
            isPaymentActiveRef.current = false;
            setIsProcessingBalance(false);
          },
        },
      };

      const rzp = new Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        const error = response?.error || {};
        apiClient.post('/api/v1/payments/record-failure', {
          razorpay_order_id: error.metadata?.order_id || checkout_data.razorpay_order_id,
          razorpay_payment_id: error.metadata?.payment_id,
          error_code: error.code,
          error_description: error.description,
          error_source: error.source,
          error_step: error.step,
          error_reason: error.reason,
        }).catch((err) => console.warn('Failed to record payment failure', err));
        toast.error(`Payment Failed: ${error.description || 'Please try again.'}`);
        isPaymentActiveRef.current = false;
        setIsProcessingBalance(false);
      });
      rzp.open();

      // Enforce pointer-events: auto on body/html to override Radix UI Dialog scroll lock blocking on mobile
      if (typeof document !== 'undefined') {
        document.body.style.setProperty('pointer-events', 'auto', 'important');
        document.documentElement.style.setProperty('pointer-events', 'auto', 'important');
        let count = 0;
        const interval = setInterval(() => {
          document.body.style.setProperty('pointer-events', 'auto', 'important');
          document.documentElement.style.setProperty('pointer-events', 'auto', 'important');
          count++;
          if (count > 30) clearInterval(interval);
        }, 100);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to initiate balance payment.");
      isPaymentActiveRef.current = false;
      setIsProcessingBalance(false);
    }
  };

  const handleDownloadTicket = () => {
    if (!booking?.public_id) return;
    window.open(`/print/ticket/${booking.public_id}`, '_blank');
  };

  const handleDownloadForm = () => {
    if (!booking?.public_id) return;
    window.open(`/print/form/${booking.public_id}`, '_blank');
  };

  // ─── Derived values — always from backend ─────────────────────────────────
  const totalAmount     = booking?.total_amount ?? 0;
  const paidAmount      = booking?.paid_amount ?? 0;
  const remainingAmount = booking?.remaining_balance ?? 0;
  // For agents: use agent_payable if present, else fall back to public total
  const displayTotal     = booking?.agent_payable ?? totalAmount;
  const displayPaid      = paidAmount;
  const displayRemaining = remainingAmount;
  const progressPct = displayTotal > 0 ? Math.min(100, (displayPaid / displayTotal) * 100) : 0;
  const transportSelections = booking ? getTransportSelections(booking.pricing_snapshot) : [];
  const refreshmentIncluded = booking ? hasRefreshment(booking) : false;
  const refreshmentAmount = booking ? getRefreshmentAmount(booking.pricing_snapshot) : 0;
  const baseFare = booking ? getBaseFareExcludingAddons(booking.subtotal_amount, booking.pricing_snapshot) : 0;
  const passengerCount = booking ? booking.adult_count + booking.child_count : 0;

  // ─── Loading / error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-white rounded-3xl border border-border shadow-sm">
        <div className="flex flex-col items-center gap-3 text-[var(--color-brand-teal)]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Retrieving reservation log...</span>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="bg-red-50 rounded-3xl p-12 border border-red-100 text-center max-w-lg mx-auto my-12">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-black text-slate-800">Lookup Failure</h3>
        <p className="text-slate-500 text-xs font-semibold mt-2 leading-relaxed">
          {error || 'The requested ticket booking does not exist or access was denied.'}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Bookings
        </button>
      </div>
    );
  }

  const travelDateObj = new Date(booking.travel_date);
  travelDateObj.setHours(0, 0, 0, 0);
  const todayObj = new Date();
  todayObj.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((travelDateObj.getTime() - todayObj.getTime()) / (1000 * 60 * 60 * 24));
  const isEligibleToCancel = diffDays > 7;
  const canCancel = booking.target_type !== 'ROOM' && (
    booking.status === 'FULLY_PAID' || booking.status === 'CONFIRMED' || booking.status === 'PARTIAL_PAID'
  ) && !booking.has_pending_cancellation;

  const isFullyPaid = booking.status === 'FULLY_PAID' || booking.status === 'CONFIRMED';
  const isRazorpay = !!(
    booking.payment_ledger?.some(p => p.payment_method === 'RAZORPAY')
  );
  const gstNumber = isRazorpay ? '29AANCR6717K1ZN' : '36AALFT7063K1ZL';


  return (
    <div className="space-y-6">
      {/* Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[var(--color-brand-river)] transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex gap-1.5 sm:gap-2 items-center flex-wrap">
          {canCancel && (
            isEligibleToCancel ? (
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-700 hover:bg-rose-100 transition-colors"
              >
                Cancel Booking
              </button>
            ) : (
              <span className="flex items-center justify-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[10px] sm:text-xs font-bold text-rose-700 text-center leading-tight">
                No cancel within 7 days
              </span>
            )
          )}
          {booking.has_pending_cancellation && (
            <span className="flex items-center justify-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-700">
              <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Cancel Pending
            </span>
          )}

          {/* Dynamic Pay Button — amount always from backend */}
          {isFullyPaid ? (
            <span className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[10px] sm:text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Booking Fully Paid
            </span>
          ) : remainingAmount > 0 ? (
            <button
              onClick={handlePayBalance}
              disabled={isProcessingBalance}
              id="pay-remaining-btn"
              className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#1a6b7a] text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider hover:bg-[#13505c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isProcessingBalance
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing...</>
                : <><CreditCard className="h-3.5 w-3.5" /> Pay {formatINR(displayRemaining)}</>
              }
            </button>
          ) : null}

          <button
            onClick={handleDownloadTicket}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" /> Ticket
          </button>
          {booking.target_type === 'PACKAGE' && (
            <button
              onClick={handleDownloadForm}
              className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" /> Form
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Ticket Info ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-border">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 pb-6 border-b border-slate-100">
              <div>
                <div className="mb-2">{getStatusBadge(booking.status)}</div>
                <h1 className="text-xl font-black text-slate-800 leading-tight">{booking.package_title}</h1>
                <p className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wider">{booking.variant_title}</p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Booking Ref ID</p>
                <p className="font-mono text-sm font-bold text-[var(--color-brand-river)] bg-[var(--color-brand-teal)]/10 px-3 py-1 rounded-lg">
                  {booking.public_id}
                </p>
              </div>
            </div>

            <div className={`grid grid-cols-2 ${booking.target_type === 'ROOM' ? 'sm:grid-cols-4' : ''} gap-6 mb-8`}>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <Calendar className="h-4 w-4 text-slate-400" /> {booking.target_type === 'ROOM' ? 'Check-in Date' : 'Travel Date'}
                </p>
                <p className="font-bold text-slate-800 text-sm">
                  {new Date(booking.travel_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              {booking.target_type === 'ROOM' && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <Calendar className="h-4 w-4 text-slate-400" /> Check-out Date
                  </p>
                  <p className="font-bold text-slate-800 text-sm">
                    {booking.room_checkout_date ? new Date(booking.room_checkout_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'TBA'}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <Clock className="h-4 w-4 text-slate-400" /> {booking.target_type === 'ROOM' ? 'Check-in Time' : 'Reporting Time'}
                </p>
                <p className="font-bold text-slate-800 text-sm">
                  {booking.target_type === 'ROOM'
                    ? (booking.room_checkin || 'TBA')
                    : (booking.boarding_point?.departure_time || 'TBA')} {booking.target_type === 'ROOM' && booking.room_checkin ? '' : '(IST)'}
                </p>
              </div>
              {booking.target_type === 'ROOM' && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <Clock className="h-4 w-4 text-slate-400" /> Check-out Time
                  </p>
                  <p className="font-bold text-slate-800 text-sm">
                    {booking.room_checkout || 'TBA'}
                  </p>
                </div>
              )}
            </div>

            {/* Boarding Point */}
            {booking.boarding_point && (
              <div className="mb-8 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> Boarding Point Details
                </p>
                <p className="font-bold text-slate-800 text-xs">{booking.boarding_point.title}</p>
                {booking.boarding_point.address && (
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{booking.boarding_point.address}</p>
                )}
                {booking.boarding_point.landmark && (
                  <p className="text-[11px] text-slate-400 mt-1">Landmark: {booking.boarding_point.landmark}</p>
                )}
                {booking.boarding_point.contact_number && (
                  <p className="text-[11px] text-slate-500 mt-2 font-semibold">Contact: {booking.boarding_point.contact_number}</p>
                )}
              </div>
            )}

            {/* Stay / Transport / Addons */}
            {(booking.target_type === 'ROOM' || transportSelections.length > 0 || refreshmentIncluded) && (
              <div className="mb-8">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                  {booking.target_type === 'ROOM' ? 'Room Stay Details' : 'Transport & Addons'}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {booking.target_type === 'ROOM' && (
                    <div className="flex flex-col justify-center p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm">
                      <span className="text-xs font-bold text-indigo-900">{booking.package_title}</span>
                      <span className="text-[10px] text-indigo-700 font-semibold mt-1">
                        {booking.variant_title} • Check-in {booking.room_checkin || 'TBA'} • Check-out {booking.room_checkout || 'TBA'}
                      </span>
                      {booking.room_address && (
                        <span className="text-[10px] text-indigo-600 font-semibold mt-1">{booking.room_address}</span>
                      )}
                    </div>
                  )}
                  {transportSelections.map((ts, idx) => (
                    <div key={idx} className="flex flex-col justify-center p-3.5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                      <span className="text-xs font-bold text-slate-800">{ts.title}</span>
                      <span className="text-[10px] text-slate-500 font-semibold mt-1">
                        {describeTransport(ts, passengerCount)} • {formatINR(Number(ts.item_total || 0))}
                      </span>
                    </div>
                  ))}
                  {refreshmentIncluded && (
                    <div className="flex flex-col justify-center p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm">
                      <span className="text-xs font-bold text-emerald-800">Refreshments</span>
                      <span className="text-[10px] text-emerald-600 font-semibold mt-1">
                        Add-on for {passengerCount} pax • {formatINR(refreshmentAmount)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Passengers */}
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Passenger Roster</h3>
              <div className="space-y-3">
                {booking.passengers && booking.passengers.length > 0 ? (
                  booking.passengers.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="h-10 w-10 rounded-xl bg-[var(--color-brand-river)] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {getInitials(p.full_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-xs truncate">
                          {p.full_name}
                          {p.is_lead && (
                            <span className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-extrabold uppercase ml-1">Lead</span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">
                          {p.gender} • Age {p.age}
                        </p>
                      </div>
                      {p.id_proof_number && (
                        <div className="text-right text-[10px] font-bold text-slate-400 shrink-0">
                          {p.id_proof_type || 'ID'}: {p.id_proof_number}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs italic">No passengers registered on this booking.</p>
                )}
              </div>
            </div>

            {/* Agent Footer */}
            {booking.agent_id && (
              <div className="mt-8 pt-6 border-t border-dashed border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <span>Agent Code: AGENT_{String(booking.agent_id).padStart(3, '0')}</span>
                  <span>Agent Partner: {booking.agent_company || booking.agent_name}</span>
                </div>
                {booking.agent_gst && (
                  <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-500">Agent GST: {booking.agent_gst}</span>
                )}
              </div>
            )}
          </div>

          {/* Payment History Card */}
          {booking.payment_ledger && booking.payment_ledger.length > 0 && (
            <PaymentTimeline ledger={booking.payment_ledger} />
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          {/* Booking Invoice / Summary — backend-authoritative */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-400" /> Booking Invoice
              </h3>
              <div className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                GST: {gstNumber}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-500 font-semibold">
                <span>{booking.target_type === 'ROOM' ? 'Room Tariff' : 'Package Fare'}</span>
                <span className="font-bold text-slate-700">{formatINR(baseFare)}</span>
              </div>
              {transportSelections.map((ts, idx) => (
                <div key={`bill-transport-${idx}`} className="flex justify-between text-slate-500 font-semibold">
                  <span>{ts.title || 'Transport'}</span>
                  <span className="font-bold text-slate-700">{formatINR(Number(ts.item_total || 0))}</span>
                </div>
              ))}
              {refreshmentIncluded && (
                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Refreshments</span>
                  <span className="font-bold text-slate-700">{formatINR(refreshmentAmount)}</span>
                </div>
              )}
              {booking.coupon_discount > 0 && (
                <div className="flex justify-between font-semibold text-rose-600">
                  <span>Discount ({booking.coupon_applied})</span>
                  <span>-{formatINR(booking.coupon_discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 font-semibold">
                <span>GST & Taxes</span>
                <span className="font-bold text-slate-700">{formatINR(booking.gst_amount + booking.gateway_fee)}</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-slate-850">
                <span className="font-extrabold">Grand Total</span>
                <span className="text-base font-black text-slate-800">{formatINR(booking.total_amount)}</span>
              </div>

              {/* Agent commission block — only shown when backend provides it */}
              {booking.agent_commission != null && booking.agent_commission > 0 && (
                <>
                  <div className="flex justify-between font-semibold text-emerald-600">
                    <span>Agent Commission</span>
                    <span>-{formatINR(booking.agent_commission)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-slate-800">
                    <span className="font-extrabold">Agent Net Payable</span>
                    <span className="text-lg font-black text-[var(--color-brand-river)]">
                      {formatINR(booking.agent_payable!)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Payment Progress */}
            <div className="mt-5 pt-5 border-t border-slate-100">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Payment Progress</span>
                <span>{parseFloat(progressPct.toFixed(1))}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressPct}%`,
                    background: isFullyPaid
                      ? 'linear-gradient(90deg, #10b981, #059669)'
                      : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                  }}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">Paid</p>
                  <p className="font-black text-emerald-800 mt-0.5">{formatINR(displayPaid)}</p>
                </div>
                <div className={`rounded-xl p-2.5 text-center ${displayRemaining > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wide ${displayRemaining > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                    Remaining
                  </p>
                  <p className={`font-black mt-0.5 ${displayRemaining > 0 ? 'text-amber-800' : 'text-slate-500'}`}>
                    {displayRemaining > 0 ? formatINR(displayRemaining) : 'None'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl text-xs font-bold border border-emerald-200">
                <Shield className="h-4 w-4 shrink-0" /> Verified Ticket
              </div>
            </div>
          </div>

          {/* Travel info / contact */}
          <div className="bg-[var(--color-brand-teal)]/10 rounded-3xl p-6 border border-[var(--color-brand-teal)]/20 text-[var(--color-brand-river)]">
            <h4 className="font-bold text-xs uppercase tracking-wider mb-2">Reporting guidelines</h4>
            <p className="text-xs opacity-80 mb-4 leading-relaxed">
              Please present this print ticket or standard mobile confirmation at the reporting counter along with a valid Government Photo ID proof.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-red-700 text-xs leading-relaxed">
              <span className="font-extrabold flex items-center gap-1.5 mb-1 text-red-900">
                <AlertCircle className="h-3.5 w-3.5" /> MANDATORY REQUIREMENT
              </span>
              {booking.target_type === 'ROOM' ? (
                <>
                  The <strong>Printed Ticket</strong> must be printed and submitted at the owner's reporting address to collect your manual ticket before proceeding to your room.
                </>
              ) : (
                <>
                  Both the <strong>Printed Ticket</strong> and the <strong>Customer Detail Form</strong> must be printed, filled out, and submitted at the owner's reporting address to collect your manual ticket before proceeding to your ride.
                </>
              )}
            </div>
            <a
              href="https://wa.me/919542069573"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-white text-[var(--color-brand-river)] text-xs font-bold py-2.5 rounded-xl shadow-sm hover:shadow transition-all uppercase tracking-wider"
            >
              Contact Desk
            </a>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-800">Request Cancellation</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              You are requesting to cancel your booking for <span className="font-bold">{booking.package_title}</span>.
            </p>
            <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-850 text-xs leading-relaxed">
              <span className="font-bold flex items-center gap-1.5 mb-1 text-amber-900">
                <AlertCircle className="h-4 w-4 shrink-0" /> Important Cancellation Terms
              </span>
              Approved cancellations are subject to a strict 35% cancellation deduction fee. The remaining 65% will be automatically refunded.
            </div>
            {cancelError && (
              <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {cancelError}
              </div>
            )}
            <div className="mt-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Reason for Cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Please state the reason for your cancellation request (minimum 5 characters)..."
                rows={4}
                className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/30 focus:border-[var(--color-brand-teal)] transition-all resize-none"
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={submittingCancel}
                onClick={() => { setShowCancelModal(false); setCancelReason(''); setCancelError(null); }}
                className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={submittingCancel || cancelReason.trim().length < 5}
                onClick={handleCancelSubmit}
                className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-2xl text-xs font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingCancel
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                  : 'Confirm Cancel'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
