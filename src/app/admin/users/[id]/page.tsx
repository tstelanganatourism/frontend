'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminStore } from '@/stores/adminStore';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft, ShieldCheck, ShieldOff, Trash2,
  User, Phone, Mail, Calendar, TrendingUp, Ticket, 
  CheckCircle2, XCircle, Clock, IndianRupee, Activity, 
  ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import BookingDetailsModal from '@/components/ui/BookingDetailsModal';

function StatusPill({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    ACTIVE:   { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Active' },
    BLOCKED:  { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500',     label: 'Blocked' },
    DISABLED: { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400',   label: 'Disabled' },
  };
  const s = cfg[status] || cfg.DISABLED;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

const BOOKING_STATUS_CFG: Record<string, { label: string; color: string }> = {
  PENDING:      { label: 'Pending',      color: 'bg-amber-50 text-amber-700 border-amber-200' },
  PARTIAL_PAID: { label: 'Part. Paid',   color: 'bg-blue-50 text-blue-700 border-blue-200' },
  FULLY_PAID:   { label: 'Confirmed',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CONFIRMED:    { label: 'Confirmed',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED:    { label: 'Cancelled',    color: 'bg-red-50 text-red-700 border-red-200' },
  REFUNDED:     { label: 'Refunded',     color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

function BookingStatusBadge({ status }: { status: string }) {
  const cfg = BOOKING_STATUS_CFG[status.toUpperCase()] ?? { label: status, color: 'bg-slate-50 text-slate-500 border-slate-200' };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function MetricCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`rounded-xl ${color} p-2.5`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id;
  const { currentUser, isLoading, fetchUserById, toggleUserStatus, deleteUser } = useAdminStore();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Pagination state for user's bookings (Client side pagination of the user.bookings array)
  const [currentPage, setCurrentPage] = useState(1);
  const BOOKINGS_PAGE_SIZE = 5;

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPublicId, setSelectedPublicId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) fetchUserById(userId as string);
  }, [userId, fetchUserById]);

  const handleToggleStatus = async () => {
    try {
      const updated = await toggleUserStatus(userId as string);
      fetchUserById(userId as string);
      toast.success(`User status is now ${updated.account_status === 'ACTIVE' ? 'active' : 'blocked'}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async () => {
    await deleteUser(userId as string);
    toast.success('User account deactivated successfully');
    router.push('/admin/users');
  };

  if (isLoading && !currentUser) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#5ac4d7] border-t-transparent" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold text-slate-900">User not found</h2>
        <Link href="/admin/users" prefetch={false} className="text-[#5ac4d7] font-bold hover:underline">Back to Users</Link>
      </div>
    );
  }

  const user = currentUser;
  const bookings = user.bookings || [];

  // Compute metrics dynamically from the bookings array
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b: any) => b.status === 'FULLY_PAID' || b.status === 'CONFIRMED').length;
  const cancelledBookings = bookings.filter((b: any) => b.status === 'CANCELLED').length;
  const pendingBookings = bookings.filter((b: any) => b.status === 'PENDING' || b.status === 'PARTIAL_PAID').length;
  const totalRevenue = bookings
    .filter((b: any) => b.status === 'FULLY_PAID' || b.status === 'CONFIRMED' || b.status === 'PARTIAL_PAID')
    .reduce((acc: number, b: any) => acc + (b.total_amount || 0), 0);

  // Client-side pagination logic
  const paginatedBookings = bookings.slice((currentPage - 1) * BOOKINGS_PAGE_SIZE, currentPage * BOOKINGS_PAGE_SIZE);
  const totalPages = Math.ceil(totalBookings / BOOKINGS_PAGE_SIZE);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/users" prefetch={false} className="rounded-xl bg-slate-100 p-2.5 text-slate-600 hover:bg-slate-200 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Customer Profile</h1>
            <p className="text-slate-500 mt-1">Detailed view of {user.full_name}&apos;s activity.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleToggleStatus}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all cursor-pointer ${
              user.account_status === 'BLOCKED' 
                ? 'border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50' 
                : 'border-red-200 bg-white text-red-600 hover:bg-red-50'
            }`}>
            {user.account_status === 'BLOCKED' ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
            {user.account_status === 'BLOCKED' ? 'Unblock Account' : 'Block Account'}
          </button>
          <button onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer">
            <Trash2 className="h-4 w-4" /> Deactivate
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="h-24 bg-gradient-to-r from-[#0f3d56] to-[#5ac4d7]" />
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="-mt-10 h-20 w-20 shrink-0 rounded-2xl object-cover ring-4 ring-white shadow-lg relative z-10" />
            ) : (
              <div className="-mt-10 h-20 w-20 shrink-0 rounded-2xl bg-gradient-to-br from-[#5ac4d7] to-[#0f3d56] flex items-center justify-center text-white text-2xl font-black ring-4 ring-white shadow-lg relative z-10">
                {user.full_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 pt-4 sm:pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900">{user.full_name}</h2>
                <StatusPill status={user.account_status} />
              </div>
              <p className="text-sm text-slate-500 mt-1">Registered Customer (Tourist)</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <Mail className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-400">Email Address</p>
                <p className={`text-sm font-bold ${user.email ? 'text-slate-700' : 'text-slate-400 italic'}`}>{user.email || 'No email set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <Phone className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-400">Phone Number</p>
                <p className={`text-sm font-bold ${user.phone_number ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                  {user.phone_number || 'No phone number set'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-400">Registered On</p>
                <p className="text-sm font-bold text-slate-700">{user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Metrics */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#5ac4d7]" /> Customer Booking Metrics
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard icon={Ticket} label="Total Bookings" value={totalBookings} color="bg-blue-50 text-blue-600" />
          <MetricCard icon={CheckCircle2} label="Confirmed" value={confirmedBookings} color="bg-emerald-50 text-emerald-600" />
          <MetricCard icon={Clock} label="Pending / Partial" value={pendingBookings} color="bg-amber-50 text-amber-600" />
          <MetricCard icon={XCircle} label="Cancelled" value={cancelledBookings} color="bg-red-50 text-red-600" />
          <MetricCard icon={IndianRupee} label="Total Spending" value={`₹${totalRevenue.toLocaleString('en-IN')}`} color="bg-purple-50 text-purple-600" />
        </div>
      </div>

      {/* Bookings Ledger */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#5ac4d7]" /> Customer Booking History
          </h3>
        </div>

        {totalBookings === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-2xl bg-slate-50 p-6 mb-4">
              <Ticket className="h-12 w-12 text-slate-300" />
            </div>
            <h4 className="font-bold text-slate-900">No bookings made yet</h4>
            <p className="text-sm text-slate-550 mt-1 max-w-[280px]">
              This user has not placed any package tours or hotel room bookings.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Booking ID</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Destination / Variant</th>
                    <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Travel Date</th>
                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Total Amount</th>
                    <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                    <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedBookings.map((b: any) => (
                    <tr
                      key={b.id}
                      onClick={() => {
                        setSelectedPublicId(b.public_id);
                        setIsDetailsOpen(true);
                      }}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-3 font-mono font-bold text-xs text-slate-800 tracking-wide">
                        {b.public_id}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-bold text-slate-800 text-xs truncate max-w-[200px]">{b.package_title}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{b.variant_title}</p>
                      </td>
                      <td className="px-5 py-3 text-center text-xs font-bold text-slate-700">
                        {new Date(b.travel_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3 text-right font-black text-slate-900 text-xs">
                        ₹{Number(b.total_amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <BookingStatusBadge status={b.status} />
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPublicId(b.public_id);
                            setIsDetailsOpen(true);
                          }}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-[#0f3d56] hover:text-white rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-slate-600 transition-all cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-4 pt-4">
                <p className="text-xs text-slate-400 font-semibold">
                  Showing {(currentPage - 1) * BOOKINGS_PAGE_SIZE + 1}–{Math.min(currentPage * BOOKINGS_PAGE_SIZE, totalBookings)} of {totalBookings} bookings
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-700 px-1">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDelete}
        title="Deactivate Account" 
        message={`This will block ${user.full_name} from logging in or booking further. Are you sure you want to proceed?`}
        confirmText="Deactivate" 
        cancelText="Cancel" 
        type="danger" 
      />


      <BookingDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        publicId={selectedPublicId}
      />
    </div>
  );
}
