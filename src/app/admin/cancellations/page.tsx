'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import {
  Search, RefreshCw, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, XCircle, AlertCircle, IndianRupee,
  Loader2, Filter
} from 'lucide-react';
import { toast } from 'sonner';

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
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Review Cancellation Request</h3>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Booking ID</p>
                  <p className="font-semibold text-slate-900">{selectedRequest.booking_public_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Customer</p>
                  <p className="font-semibold text-slate-900">{selectedRequest.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Amount Paid</p>
                  <p className="font-semibold text-slate-900">{formatINR(selectedRequest.paid_amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Travel Date</p>
                  <p className="font-semibold text-slate-900">{formatDate(selectedRequest.travel_date)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Reason for Cancellation</p>
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-inset ring-slate-200">
                  {selectedRequest.reason}
                </div>
              </div>

              {selectedRequest.status === 'PENDING' && (
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Admin Notes (Optional)</p>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter notes for this decision..."
                  />
                  <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 flex gap-2">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>
                      Approving will apply a <strong>35% cancellation fee</strong> on the total amount. Refund processing is manual.
                    </p>
                  </div>
                </div>
              )}

              {selectedRequest.status !== 'PENDING' && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Cancellation Fee</p>
                    <p className="font-semibold text-slate-900">
                      {selectedRequest.cancellation_fee !== null ? formatINR(selectedRequest.cancellation_fee) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Refund Amount</p>
                    <p className="font-semibold text-slate-900">
                      {selectedRequest.refund_amount !== null ? formatINR(selectedRequest.refund_amount) : '—'}
                    </p>
                  </div>
                  {selectedRequest.admin_notes && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-slate-500">Admin Notes</p>
                      <p className="text-sm text-slate-700">{selectedRequest.admin_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
              {selectedRequest.status === 'PENDING' && (
                <>
                  <button
                    disabled={isProcessing === selectedRequest.id}
                    onClick={() => handleProcessRequest(selectedRequest.id, 'REJECTED')}
                    className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    {isProcessing === selectedRequest.id ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    disabled={isProcessing === selectedRequest.id}
                    onClick={() => handleProcessRequest(selectedRequest.id, 'APPROVED')}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isProcessing === selectedRequest.id ? 'Processing...' : 'Approve & Deduct Fee'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
