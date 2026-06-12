'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  CheckCircle2, AlertTriangle, XCircle, Loader2, 
  ArrowRight, ShieldCheck, Ticket, RefreshCw, Calendar, MapPin
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface VerificationResult {
  status: 'success' | 'pending' | 'failed';
  booking_id?: string;
  message?: string;
}

export default function PaymentStatusPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const merchantTransactionId = searchParams.get('merchantTransactionId');
  const gateway = (searchParams.get('gateway') || 'PHONEPE').toUpperCase();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const retryCountRef = useRef(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const verifyPayment = async (showToast = false) => {
    if (!merchantTransactionId) {
      setResult({
        status: 'failed',
        message: 'No transaction identifier found. Please check your URL.'
      });
      setLoading(false);
      return;
    }

    try {
      const endpoint = gateway === 'CASHFREE'
        ? `/api/v1/payments/verify-cashfree-status`
        : `/api/v1/payments/verify-status`;
      const paramKey = gateway === 'CASHFREE' ? 'order_id' : 'transaction_id';

      const res = await apiClient.get(endpoint, {
        params: { [paramKey]: merchantTransactionId }
      });
      
      const statusData = res.data;
      if (statusData.status === 'success') {
        setResult({
          status: 'success',
          booking_id: statusData.booking_id
        });
        setLoading(false);
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      } else if (statusData.status === 'pending') {
        setResult({
          status: 'pending',
          message: statusData.message || 'Payment is being processed. Please do not refresh.'
        });
        setLoading(false);
      } else {
        setResult({
          status: 'failed',
          message: statusData.message || 'Payment transaction failed. Please try again.'
        });
        setLoading(false);
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      }
    } catch (err: any) {
      console.error('Error verifying payment status:', err);
      if (showToast) {
        toast.error(err.response?.data?.detail || 'Failed to verify transaction status.');
      }
      
      // Stop loading and show error immediately on API errors (like 404) or manual checks
      setResult({
        status: 'failed',
        message: err.response?.data?.detail || 'Failed to verify transaction status with the server. Please try again.'
      });
      setLoading(false);
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    }
  };

  useEffect(() => {
    verifyPayment();

    // Set up auto-polling for pending states every 5 seconds for a maximum of 6 times (30 seconds)
    pollingIntervalRef.current = setInterval(() => {
      retryCountRef.current += 1;
      setRetryCount(retryCountRef.current);
      if (retryCountRef.current >= 6) {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      }
      verifyPayment();
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [merchantTransactionId]);

  const handleManualCheck = () => {
    toast.info('Refreshing status...');
    verifyPayment(true);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 px-4">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes progressSweep {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .custom-sweep {
            animation: progressSweep 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
        `}} />
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-150 shadow-xl max-w-md w-full text-center space-y-6">
          <div className="relative h-24 w-24 mx-auto flex items-center justify-center">
            {/* Outer rotating dashed border */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#1a6b7a] animate-[spin_10s_linear_infinite] opacity-60" />
            
            {/* Inner pulsing background */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-[#1a6b7a] to-[#259b9a] animate-pulse opacity-10" />
            
            {/* Logo image container */}
            <div className="relative h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100 ring-4 ring-[#1a6b7a]/5">
              <img
                src="/apple-touch-icon.png"
                alt="Telangana Boat Tourism"
                className="h-12 w-12 object-contain rounded-xl"
              />
            </div>
            
            {/* Orbiting loading dot */}
            <div className="absolute inset-[-4px] rounded-full animate-[spin_3s_linear_infinite]">
              <div className="h-2.5 w-2.5 rounded-full bg-[#259b9a] shadow-[0_0_8px_#259b9a]" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-800">Verifying Payment</h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed px-2">
              We are securely confirming your transaction status with your payment gateway. This will take just a moment.
            </p>
          </div>
          
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a6b7a] to-[#259b9a] rounded-full custom-sweep" style={{ width: '50%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl">
        
        {/* SUCCESS STATE */}
        {result?.status === 'success' && (
          <div className="text-center space-y-6">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="h-10 w-10 animate-[scaleIn_0.3s_ease-out]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800 leading-tight">Payment Successful!</h2>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Your reservation has been confirmed. Your ticket and invoice are generated and will be sent to your email.
              </p>
            </div>

            {result.booking_id && (
              <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 text-center font-mono">
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 block mb-1">Booking Reference</span>
                <span className="text-sm font-bold text-emerald-800">{result.booking_id}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => router.push(`/dashboard/bookings/${result.booking_id}`)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-[#1a6b7a] text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-[#13505c] transition-all shadow-md hover:shadow-lg"
              >
                <Ticket className="h-4 w-4" /> View Ticket & Form <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        )}

        {/* PENDING STATE */}
        {result?.status === 'pending' && (
          <div className="text-center space-y-6">
            <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-[pulse_2s_infinite]">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800 leading-tight">Verification Pending</h2>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Your bank is processing the payment request. UPI transactions can sometimes experience NPCI gateway delays.
              </p>
            </div>

            <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-150 text-left text-xs leading-relaxed text-amber-800 space-y-2">
              <span className="font-extrabold flex items-center gap-1.5 text-amber-950 uppercase text-[9px] tracking-wider">
                <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600" /> Secure Payment Guarantee
              </span>
              <p className="text-[11px] leading-relaxed">
                Please do not try to pay again. As soon as your bank confirms the transaction, your ticket will be generated automatically and sent to your email.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleManualCheck}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-amber-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-amber-700 transition-colors shadow-md"
              >
                <RefreshCw className="h-4 w-4 animate-spin-slow" /> Refresh Status
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* FAILED STATE */}
        {result?.status === 'failed' && (
          <div className="text-center space-y-6">
            <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <XCircle className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800 leading-tight">Payment Failed</h2>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                {result.message || 'The gateway transaction was cancelled or declined by your bank.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => router.back()}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-[#1a6b7a] text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-[#13505c] transition-colors shadow-md"
              >
                Go Back & Retry Payment
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Return to Packages
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Go to Booking Log
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
