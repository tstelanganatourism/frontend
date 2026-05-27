'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import {
  Search, RefreshCw, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, XCircle, AlertCircle, IndianRupee,
  Loader2, Filter, FileText, X as CloseIcon, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface CancellationRequest {
  id: number;
  booking_id: number;
  booking_public_id: string;
  customer_name: string;
  travel_date: string;
  total_amount: number;
  paid_amount: number;
  reason: string;
  status: string;
  requested_at: string;
  processed_at: string | null;
  cancellation_fee: number | null;
  refund_amount: number | null;
  admin_notes: string | null;
}

const PAGE_SIZE = 50;

function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminCancellationsPage() {
  const [requests, setRequests] = useState<CancellationRequest[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  
  const [selectedRequest, setSelectedRequest] = useState<CancellationRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/api/v1/admin/bookings/cancellation-requests', {
        params: { limit: PAGE_SIZE, offset }
      });
      setRequests(res.data || []);
    } catch (err) {
      console.error('Failed to load cancellation requests:', err);
      toast.error('Failed to load cancellation requests');
    } finally {
      setIsLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleProcessRequest = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    if (!selectedRequest) return;
    
    setIsProcessing(id);
    try {
      await apiClient.patch(`/api/v1/admin/bookings/${selectedRequest.booking_id}/cancel`, {
        status,
        admin_notes: adminNotes
      });
      toast.success(`Cancellation request ${status.toLowerCase()} successfully`);
      setSelectedRequest(null);
      setAdminNotes('');
      fetchRequests();
    } catch (err: any) {
      console.error('Failed to process request:', err);
      toast.error(err.response?.data?.detail || 'Failed to process request');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cancellation Requests</h1>
          <p className="text-sm text-slate-500">Manage tourist and agent booking cancellations</p>
        </div>
        <button
          onClick={() => fetchRequests()}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900">Booking</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900">Travel Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900">Amount Paid</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900">Requested At</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
                    <p className="mt-2 text-sm text-slate-500">Loading requests...</p>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    No cancellation requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{req.booking_public_id}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {req.customer_name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {formatDate(req.travel_date)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900 font-medium">
                      {formatINR(req.paid_amount)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {req.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      )}
                      {req.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          <CheckCircle2 className="h-3 w-3" /> Approved
                        </span>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                          <XCircle className="h-3 w-3" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {formatDate(req.requested_at)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
          <button
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm text-slate-600">
            Showing offset {offset}
          </span>
          <button
            disabled={requests.length < PAGE_SIZE}
            onClick={() => setOffset(offset + PAGE_SIZE)}
            className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 z-10 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-slate-50/80 border-b border-slate-100 p-6 md:p-8 flex justify-between items-start shrink-0">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                      Cancellation Request
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200/60 px-3 py-1 rounded-lg tracking-wider">
                      {selectedRequest.booking_public_id}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">Review Request</h3>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600 cursor-pointer bg-slate-100/50"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 space-y-8 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-slate-50/50 rounded-2xl border border-slate-100 p-5">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Customer</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{selectedRequest.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Amount Paid</p>
                    <p className="text-sm font-bold text-slate-800">{formatINR(selectedRequest.paid_amount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Travel Date</p>
                    <p className="text-sm font-bold text-slate-800">{formatDate(selectedRequest.travel_date)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Requested At</p>
                    <p className="text-sm font-bold text-slate-800">{formatDate(selectedRequest.requested_at)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" /> Reason for Cancellation
                  </h4>
                  <div className="rounded-2xl bg-white p-5 text-sm text-slate-700 border border-slate-200 shadow-sm leading-relaxed">
                    {selectedRequest.reason}
                  </div>
                </div>

                {selectedRequest.status === 'PENDING' && (
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Admin Notes (Optional)</h4>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm focus:border-[#0f3d56] focus:ring-2 focus:ring-[#0f3d56]/20 outline-none transition-all shadow-sm resize-none font-medium"
                        rows={3}
                        placeholder="Enter internal notes for this decision..."
                      />
                    </div>
                    <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-5 text-sm text-indigo-800 flex gap-4 items-start shadow-sm">
                      <AlertCircle className="h-6 w-6 shrink-0 text-indigo-600 mt-0.5" />
                      <div className="leading-relaxed">
                        <p className="font-black text-indigo-900 mb-1 text-base">Cancellation Policy Applies</p>
                        <p className="font-medium">Approving will automatically deduct a <span className="font-extrabold text-indigo-900 bg-indigo-100 px-1.5 py-0.5 rounded">35% cancellation fee</span> from the total amount. Refund processing to the customer is manual.</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedRequest.status !== 'PENDING' && (
                  <div className="pt-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                      <Info className="h-4 w-4 text-slate-400" /> Resolution Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4 bg-slate-50/50 rounded-2xl border border-slate-100 p-5">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Cancellation Fee Deducted</p>
                        <p className="text-xl font-black text-red-600">
                          {selectedRequest.cancellation_fee !== null ? formatINR(selectedRequest.cancellation_fee) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Refund Amount Due</p>
                        <p className="text-xl font-black text-emerald-600">
                          {selectedRequest.refund_amount !== null ? formatINR(selectedRequest.refund_amount) : '—'}
                        </p>
                      </div>
                      {selectedRequest.admin_notes && (
                        <div className="col-span-2 pt-4 mt-4 border-t border-slate-200 border-dashed">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Admin Notes</p>
                          <p className="text-sm text-slate-700 italic font-medium bg-white p-3 rounded-xl border border-slate-100">{selectedRequest.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-100 p-6 md:px-8 md:py-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-b-[32px] shrink-0">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-black tracking-widest uppercase border-2 border-slate-200 text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                >
                  Close
                </button>
                {selectedRequest.status === 'PENDING' && (
                  <div className="flex w-full sm:w-auto gap-3">
                    <button
                      disabled={isProcessing === selectedRequest.id}
                      onClick={() => handleProcessRequest(selectedRequest.id, 'REJECTED')}
                      className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-red-700 bg-red-50 border-2 border-red-100 hover:bg-red-100 hover:border-red-200 transition-all disabled:opacity-50 active:scale-95"
                    >
                      {isProcessing === selectedRequest.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject Request'}
                    </button>
                    <button
                      disabled={isProcessing === selectedRequest.id}
                      onClick={() => handleProcessRequest(selectedRequest.id, 'APPROVED')}
                      className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 active:scale-95"
                    >
                      {isProcessing === selectedRequest.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {isProcessing === selectedRequest.id ? 'Processing...' : 'Approve & Deduct Fee'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
