'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import {
  Ticket, Search, RefreshCw, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, XCircle, AlertCircle, IndianRupee,
  ExternalLink, Filter, Users, Loader2, Plus
} from 'lucide-react';
import BookingDetailsModal from '@/components/ui/BookingDetailsModal';
import AdminCreateBookingModal from '@/components/admin/AdminCreateBookingModal';
import PremiumSelect from '@/components/ui/PremiumSelect';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingItem {
  id: number;
  public_id: string;
  target_type: 'PACKAGE' | 'ROOM';
  source: string;
  status: string;
  travel_date: string;
  adult_count: number;
  child_count: number;
  subtotal_amount: number;
  coupon_discount: number;
  coupon_applied: string | null;
  gst_amount: number;
  gateway_fee: number;
  total_amount: number;
  paid_amount: number;
  remaining_balance: number;
  created_at: string | null;
  package_title: string;
  variant_title: string;
  customer: {
    id: number | null;
    full_name: string;
    email: string | null;
  };
  agent: {
    id: number | null;
    full_name: string | null;
  } | null;
  agent_commission?: number | null;
  agent_payable?: number | null;
  passenger_count: number;
  primary_passenger_name?: string | null;
}

interface BookingSummary {
  total: number;
  confirmed: number;
  pending: number;
  revenue: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING:      { label: 'Pending',      color: 'bg-amber-50 text-amber-700 border-amber-200',     icon: Clock },
  PARTIAL_PAID: { label: 'Part. Paid',   color: 'bg-blue-50 text-blue-700 border-blue-200',        icon: Clock },
  FULLY_PAID:   { label: 'Confirmed',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  CANCELLED:    { label: 'Cancelled',    color: 'bg-red-50 text-red-700 border-red-200',            icon: XCircle },
  REFUNDED:     { label: 'Refunded',     color: 'bg-slate-100 text-slate-600 border-slate-200',     icon: AlertCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { label: status, color: 'bg-slate-100 text-slate-500 border-slate-200', icon: AlertCircle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
  const isAgent = source === 'AGENT';
  const isAdmin = source === 'ADMIN' || source === 'ADMIN_DIRECT';
  const color = isAgent
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : isAdmin
    ? 'bg-violet-50 text-violet-700 border-violet-200'
    : 'bg-slate-50 text-slate-500 border-slate-200';
  const label = isAgent ? 'Agent' : source === 'ADMIN_DIRECT' ? 'Admin Direct' : isAdmin ? 'Admin' : 'Direct';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${color}`}>
      {label}
    </span>
  );
}

function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PAGE_SIZE = 20;
const STATUS_OPTIONS = ['', 'PENDING', 'PARTIAL_PAID', 'FULLY_PAID', 'CANCELLED', 'REFUNDED'];
const SOURCE_OPTIONS = ['', 'USER', 'AGENT', 'ADMIN', 'ADMIN_DIRECT'];
const TARGET_OPTIONS = ['', 'PACKAGE', 'ROOM'];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [summary, setSummary] = useState<BookingSummary | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPublicId, setSelectedPublicId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { limit: PAGE_SIZE, offset };
      if (statusFilter) params.status_filter = statusFilter;
      if (sourceFilter) params.source_filter = sourceFilter;
      if (targetFilter) params.target_filter = targetFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const [listRes, summaryRes] = await Promise.all([
        apiClient.get('/api/v1/admin/bookings', { params }),
        apiClient.get('/api/v1/admin/bookings/summary', { params: { start_date: startDate, end_date: endDate } }),
      ]);

      setBookings(Array.isArray(listRes.data?.items) ? listRes.data.items : []);
      setTotal(listRes.data?.total ?? 0);
      setSummary(summaryRes.data ?? null);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [offset, statusFilter, sourceFilter, targetFilter, startDate, endDate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Client-side filtering
  const filteredBookings = bookings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const idMatch = b.public_id?.toLowerCase().includes(q);
    const customerMatch = b.customer?.full_name?.toLowerCase().includes(q);
    const primaryMatch = b.primary_passenger_name?.toLowerCase().includes(q);
    const emailMatch = b.customer?.email?.toLowerCase().includes(q);
    const pkgMatch = b.package_title?.toLowerCase().includes(q);
    return idMatch || customerMatch || primaryMatch || emailMatch || pkgMatch;
  });

  const hasFilters = Boolean(search || statusFilter || sourceFilter || targetFilter || startDate || endDate);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setSourceFilter('');
    setTargetFilter('');
    setStartDate('');
    setEndDate('');
    setOffset(0);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const handleStatusFilter = (val: string) => {
    setStatusFilter(val);
    setOffset(0);
  };

  const handleSourceFilter = (val: string) => {
    setSourceFilter(val);
    setOffset(0);
  };

  const handleTargetFilter = (val: string) => {
    setTargetFilter(val);
    setOffset(0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Booking Operations</h1>
          <p className="text-slate-500 mt-1">Live booking records from all channels.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-black text-white shadow-md hover:bg-violet-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Booking
          </button>
          <button
            onClick={fetchBookings}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Admin Create Booking Modal */}
      <AdminCreateBookingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchBookings}
      />

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Ticket,       label: 'Total Bookings', value: summary?.total ?? '—',     color: 'bg-blue-50 text-blue-600' },
          { icon: CheckCircle2, label: 'Confirmed',       value: summary?.confirmed ?? '—', color: 'bg-emerald-50 text-emerald-600' },
          { icon: Clock,        label: 'Pending',          value: summary?.pending ?? '—',   color: 'bg-amber-50 text-amber-600' },
          {
            icon: IndianRupee,
            label: 'Confirmed Revenue',
            value: summary ? formatINR(summary.revenue) : '—',
            color: 'bg-purple-50 text-purple-600',
          },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={`rounded-xl p-2.5 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{card.value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter Row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Booking ID or customer name…"
            className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:border-[#5ac4d7] focus:ring-2 focus:ring-[#5ac4d7]/15 transition-all"
          />
        </div>
        
        {/* Date Range Filters */}
        <div className="flex gap-2 w-full md:w-auto">
          <div className="w-full md:w-[150px]">
            <CustomDatePicker
              value={startDate}
              onChange={(v) => { setStartDate(v); setOffset(0); }}
              placeholder="From Date"
              allowPast={true}
            />
          </div>
          <div className="w-full md:w-[150px]">
            <CustomDatePicker
              value={endDate}
              onChange={(v) => { setEndDate(v); setOffset(0); }}
              placeholder="To Date"
              min={startDate}
              allowPast={true}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Status filter */}
          <div className="w-[180px]">
            <PremiumSelect
              value={statusFilter}
              onChange={handleStatusFilter}
              options={[
                { value: '', label: 'All Status' },
                ...STATUS_OPTIONS.filter(Boolean).map(s => ({ value: s, label: s }))
              ]}
              placeholder="All Status"
            />
          </div>
          {/* Source filter */}
          <div className="w-[180px]">
            <PremiumSelect
              value={sourceFilter}
              onChange={handleSourceFilter}
              options={[
                { value: '', label: 'All Sources' },
                ...SOURCE_OPTIONS.filter(Boolean).map(s => ({ value: s, label: s }))
              ]}
              placeholder="All Sources"
            />
          </div>
          {/* Target filter */}
          <div className="w-[160px]">
            <PremiumSelect
              value={targetFilter}
              onChange={handleTargetFilter}
              options={[
                { value: '', label: 'All Types' },
                ...TARGET_OPTIONS.filter(Boolean).map(s => ({ value: s, label: s }))
              ]}
              placeholder="All Types"
            />
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-red-500 hover:text-red-600 underline underline-offset-2 px-2"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Booking ID</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">Customer</th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Package / Room</th>
                <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Travel Date</th>
                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Amount</th>
                <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-300" />
                    <p className="mt-3 text-sm text-slate-400 font-medium">Loading bookings…</p>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="rounded-2xl bg-slate-50 p-6">
                        <Ticket className="h-12 w-12 text-slate-300" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-700">No bookings found</h3>
                        <p className="text-sm text-slate-400 mt-1">
                          {hasFilters
                            ? 'Try adjusting your search or filters.'
                            : 'Bookings will appear here once customers complete checkout.'}
                        </p>
                        {hasFilters && (
                          <button
                            onClick={clearFilters}
                            className="mt-4 rounded-lg bg-red-50 text-red-600 px-4 py-2 text-xs font-bold hover:bg-red-100 transition-colors"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => {
                      setSelectedPublicId(b.public_id);
                      setIsDetailsOpen(true);
                    }}
                    className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                  >
                    {/* Booking ID */}
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 font-mono text-xs tracking-wide">{b.public_id}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(b.created_at)}</p>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="font-bold text-slate-800 text-xs truncate max-w-[140px]">
                        {b.primary_passenger_name || b.customer?.full_name || 'Guest'}
                      </p>
                      {b.customer?.email && (
                        <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{b.customer.email}</p>
                      )}
                      {b.agent && (
                        <p className="text-[10px] text-blue-500 mt-0.5">via {b.agent.full_name}</p>
                      )}
                    </td>

                    {/* Package / Room */}
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          b.target_type === 'ROOM' ? 'bg-indigo-100 text-indigo-700' : 'bg-pink-100 text-pink-700'
                        }`}>
                          {b.target_type}
                        </span>
                        <p className="font-bold text-slate-800 text-xs truncate max-w-[140px]">{b.package_title}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{b.variant_title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {b.adult_count}A {b.child_count > 0 ? `+ ${b.child_count}C` : ''}
                        {b.passenger_count > 0 && ` · ${b.passenger_count} pax`}
                      </p>
                    </td>

                    {/* Travel Date */}
                    <td className="px-5 py-4 text-center">
                      <p className="text-xs font-bold text-slate-700">{formatDate(b.travel_date)}</p>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 text-right">
                      <p className="font-black text-slate-900 text-sm">{formatINR(b.agent_payable ?? b.total_amount)}</p>
                      {b.agent_commission != null && b.agent_commission > 0 && (
                        <p className="text-[10px] text-orange-600 font-bold">-{formatINR(b.agent_commission)} commission</p>
                      )}
                      {b.coupon_applied && (
                        <p className="text-[10px] text-emerald-600 font-bold">-{formatINR(b.coupon_discount)} coupon</p>
                      )}
                      {b.remaining_balance > 0 && b.remaining_balance < (b.agent_payable ?? b.total_amount) && (
                        <p className="text-[10px] text-amber-600 font-bold">{formatINR(b.remaining_balance)} due</p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center">
                      <StatusBadge status={b.status} />
                    </td>

                    {/* Source */}
                    <td className="px-5 py-4 text-center">
                      <SourceBadge source={b.source} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <p className="text-xs text-slate-400 font-medium">
              Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total} bookings
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={offset + PAGE_SIZE >= total}
                onClick={() => setOffset(offset + PAGE_SIZE)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <BookingDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        publicId={selectedPublicId}
        onPaymentRecorded={fetchBookings}
      />
    </div>
  );
}
