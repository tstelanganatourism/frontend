'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Printer, Ship, MapPin, Calendar, Clock, CheckCircle2, User, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  // Static mock data for UI shell demonstration
  return (
    <div className="space-y-6">
      {/* Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[var(--color-brand-river)] transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Bookings
        </button>
        <div className="flex gap-2">
          <button className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            <Printer className="h-4 w-4" /> Print
          </button>
          <button className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-[var(--color-brand-river)] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#1a5663] transition-colors">
            <Download className="h-4 w-4" /> Download Ticket
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Ticket Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-border">
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
              <div>
                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20 mb-2">
                  Confirmed
                </span>
                <h1 className="text-2xl font-black text-slate-800">Papikondalu 1 Day River Cruise</h1>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> Rajahmundry to Papikondalu
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Booking ID</p>
                <p className="font-mono text-lg font-bold text-[var(--color-brand-river)] bg-[var(--color-brand-teal)]/10 px-3 py-1 rounded-lg">
                  {bookingId}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-1"><Calendar className="h-4 w-4" /> Date</p>
                <p className="font-bold text-slate-800">24 Oct 2026</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-1"><Clock className="h-4 w-4" /> Time</p>
                <p className="font-bold text-slate-800">08:00 AM</p>
              </div>
            </div>

            {/* Travellers */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Traveller Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="h-10 w-10 rounded-full bg-[var(--color-brand-river)] text-white flex items-center justify-center font-bold">
                    SR
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">Srinivas Rao (Lead)</p>
                    <p className="text-xs text-slate-500">Adult • Male • 45</p>
                  </div>
                  <div className="text-right text-xs font-mono text-slate-500">
                    ID: XXXX-1234
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Payment Summary
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Adult Ticket (1x)</span>
                <span>₹2,500</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18%)</span>
                <span>₹450</span>
              </div>
              <div className="flex justify-between text-slate-600 pb-3 border-b border-slate-100">
                <span>Discount</span>
                <span className="text-green-600">-₹200</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-slate-800">Total Amount</span>
                <span className="text-xl font-black text-[var(--color-brand-river)]">₹2,750</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-500 text-center mb-2">Paid securely via Razorpay</p>
              <div className="flex items-center justify-center gap-1.5 text-green-700 bg-green-50 px-3 py-2 rounded-lg text-sm font-bold border border-green-200">
                <CheckCircle2 className="h-4 w-4" /> Payment Successful
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-brand-teal)]/10 rounded-3xl p-6 border border-[var(--color-brand-teal)]/20 text-[var(--color-brand-river)]">
            <h4 className="font-bold mb-2">Need help?</h4>
            <p className="text-sm opacity-80 mb-4">If you have any questions regarding this booking, please contact our support team.</p>
            <a 
              href="https://wa.me/919542069573"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-white text-[var(--color-brand-river)] text-sm font-bold py-2 rounded-xl shadow-sm hover:shadow transition-all"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
