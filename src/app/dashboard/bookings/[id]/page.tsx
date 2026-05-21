'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, FileText, Ship, MapPin, Calendar, Clock, CheckCircle2, User, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useRazorpay } from "react-razorpay";
import { toast } from 'sonner';

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
  status: string;
  created_at: string | null;
  package_title: string;
  variant_title: string;
  passengers: Passenger[];
  agent_id: number | null;
  agent_name: string | null;
  boarding_point: BoardingPoint | null;
  has_pending_cancellation?: boolean;
  ticket_pdf_url?: string | null;
  ticket_generation_status?: string;
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const { Razorpay } = useRazorpay();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingBalance, setIsProcessingBalance] = useState(false);

  // Cancellation state hooks
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleCancelSubmit = async () => {
    if (cancelReason.trim().length < 5) return;
    try {
      setSubmittingCancel(true);
      setCancelError(null);
      await apiClient.post(`/api/v1/bookings/${bookingId}/cancel`, {
        reason: cancelReason
      });
      
      // Construct and open WhatsApp deep link
      const message = `Hello TS Boat Tourism, I would like to request a cancellation for:\n\nBooking ID: ${booking?.public_id}\nPackage: ${booking?.package_title}\nTravel Date: ${new Date(booking?.travel_date || '').toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}\nReason: ${cancelReason}`;
      window.open(`https://wa.me/919849848982?text=${encodeURIComponent(message)}`, '_blank');
      
      // Update local state dynamically
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

  const handlePayBalance = async () => {
    if (!booking) return;
    setIsProcessingBalance(true);
    try {
      const res = await apiClient.post(`/api/v1/bookings/${booking.public_id}/balance-checkout`);
      const { checkout_data } = res.data;

      if (!checkout_data || !checkout_data.key_id) {
        toast.error("Failed to initialize payment gateway. Please try again.");
        setIsProcessingBalance(false);
        return;
      }

      if (!Razorpay) {
        toast.error("Payment gateway is still loading or blocked. Please refresh the page and try again.");
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
              razorpay_signature: response.razorpay_signature
            });
            if (verifyRes.data.status === 'success') {
              toast.success("Balance payment received! Your booking is now FULLY PAID.");
              // Reload details
              const updatedRes = await apiClient.get<BookingDetails>(`/api/v1/bookings/${bookingId}`);
              setBooking(updatedRes.data);
            }
          } catch (err) {
            console.error("Payment verification failed", err);
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setIsProcessingBalance(false);
          }
        },
        prefill: {
          name: booking.passengers?.[0]?.full_name || '',
        },
        theme: { color: "#1a6b7a" },
        modal: {
          ondismiss: () => {
            toast.error("Payment not completed");
            setIsProcessingBalance(false);
          }
        }
      };

      const rzp = new Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment Failed: ${response.error.description}`);
        setIsProcessingBalance(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to initiate balance payment.");
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

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<BookingDetails>(`/api/v1/bookings/${bookingId}`);
        setBooking(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to retrieve reservation details.');
      } finally {
        setLoading(false);
      }
    };
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

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
        <AlertCircle className="h-10 w-10 text-red-650 mx-auto mb-4" />
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
  
  const canCancel = (booking.status === 'FULLY_PAID' || booking.status === 'CONFIRMED' || booking.status === 'PARTIAL_PAID') && !booking.has_pending_cancellation;

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'FULLY_PAID':
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            Confirmed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700 ring-1 ring-inset ring-amber-600/20">
            Pending
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700 ring-1 ring-inset ring-red-600/20">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 ring-1 ring-inset ring-slate-600/20">
            {status}
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  };

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
            <span className="flex items-center justify-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-amber-50 border border-amber-250 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-700">
              <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Cancel Pending
            </span>
          )}
          {booking.status === 'PARTIAL_PAID' && booking.remaining_balance > 0 && (
            <button 
              onClick={handlePayBalance}
              disabled={isProcessingBalance}
              className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#1a6b7a] text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider hover:bg-[#13505c] transition-colors disabled:opacity-50"
            >
              {isProcessingBalance ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
              Pay ₹{booking.remaining_balance.toLocaleString('en-IN')}
            </button>
          )}
          <button 
            onClick={handleDownloadTicket}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            Ticket
          </button>
          <button 
            onClick={handleDownloadForm}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            Form
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Ticket Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-border">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 pb-6 border-b border-slate-100">
              <div>
                <div className="mb-2">
                  {getStatusBadge(booking.status)}
                </div>
                <h1 className="text-xl font-black text-slate-800 leading-tight">{booking.package_title}</h1>
                <p className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wider">
                  {booking.variant_title}
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Booking Ref ID</p>
                <p className="font-mono text-sm font-bold text-[var(--color-brand-river)] bg-[var(--color-brand-teal)]/10 px-3 py-1 rounded-lg">
                  {booking.public_id}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <Calendar className="h-4 w-4 text-slate-400" /> Travel Date
                </p>
                <p className="font-bold text-slate-800 text-sm">
                  {new Date(booking.travel_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <Clock className="h-4 w-4 text-slate-400" /> Reporting Time
                </p>
                <p className="font-bold text-slate-800 text-sm">
                  {booking.boarding_point?.departure_time || 'TBA'} (IST)
                </p>
              </div>
            </div>

            {/* Boarding Point Details */}
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
                  <p className="text-[11px] text-slate-500 mt-2 font-semibold">
                    Contact: {booking.boarding_point.contact_number}
                  </p>
                )}
              </div>
            )}

            {/* Travellers */}
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
                          {p.full_name} {p.is_lead ? <span className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-extrabold uppercase ml-1">Lead</span> : ''}
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

            {/* Silent Agent Footer Indicator */}
            {booking.agent_id && (
              <div className="mt-8 pt-6 border-t border-dashed border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Agent Code: AGT-{booking.agent_id}</span>
                <span>Agent Partner: {booking.agent_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
            <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-slate-400" /> Booking Invoice
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-500 font-semibold">
                <span>Base Fare</span>
                <span className="font-bold text-slate-700">₹{booking.subtotal_amount.toLocaleString('en-IN')}</span>
              </div>
              
              {booking.coupon_discount > 0 && (
                <div className="flex justify-between font-semibold text-rose-600">
                  <span>Discount ({booking.coupon_applied})</span>
                  <span>-₹{booking.coupon_discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              
              <div className="flex justify-between text-slate-500 font-semibold">
                <span>GST & Taxes</span>
                <span className="font-bold text-slate-700">₹{(booking.gst_amount + booking.gateway_fee).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-slate-800">
                <span className="font-extrabold">Grand Total</span>
                <span className="text-lg font-black text-[var(--color-brand-river)]">
                  ₹{booking.total_amount.toLocaleString('en-IN')}
                </span>
              </div>

              {booking.remaining_balance > 0 && (
                <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-2 text-amber-800">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span>Paid Advance</span>
                    <span>₹{(booking.total_amount - booking.remaining_balance).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-black pt-2 border-t border-amber-200/60">
                    <span>Balance Due</span>
                    <span className="text-sm">₹{booking.remaining_balance.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl text-xs font-bold border border-emerald-250">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> Verified Ticket
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-brand-teal)]/10 rounded-3xl p-6 border border-[var(--color-brand-teal)]/20 text-[var(--color-brand-river)]">
            <h4 className="font-bold text-xs uppercase tracking-wider mb-2">Reporting guidelines</h4>
            <p className="text-xs opacity-80 mb-4 leading-relaxed">
              Please present this print ticket or standard mobile confirmation at the reporting counter along with a valid Government Photo ID proof.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-red-700 text-xs leading-relaxed">
              <span className="font-extrabold flex items-center gap-1.5 mb-1">
                <AlertCircle className="h-3.5 w-3.5" /> MANDATORY REQUIREMENT
              </span>
              Both the <strong className="font-bold">Printed Ticket</strong> and the <strong className="font-bold">Customer Detail Form</strong> must be printed, filled out, and submitted at the owner's reporting address to collect your manual ticket before proceeding to your ride or room.
            </div>
            <a 
              href="https://wa.me/919849848982"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-white text-[var(--color-brand-river)] text-xs font-bold py-2.5 rounded-xl shadow-sm hover:shadow transition-all uppercase tracking-wider"
            >
              Contact Desk
            </a>
          </div>
        </div>
      </div>

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
              Approved cancellations are subject to a strict 35% cancellation deduction fee. The remaining 65% will be automatically refunded to your original payment gateway account.
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
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please state the reason for your cancellation request (minimum 5 characters)..."
                rows={4}
                className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/30 focus:border-[var(--color-brand-teal)] transition-all resize-none"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={submittingCancel}
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setCancelError(null);
                }}
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
                {submittingCancel ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  'Confirm Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
