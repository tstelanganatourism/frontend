'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import {
  CheckCircle2, Circle, MessageSquare, Phone, Mail, Calendar, Users,
  Package, Search, Filter, RefreshCw, ExternalLink, ChevronDown, ChevronUp,
  StickyNote, AlertTriangle, CheckCheck, X, Trash2
} from 'lucide-react';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────
interface PreBooking {
  id: number;
  ref_id: string;
  package_id: string;
  package_name: string;
  travel_date: string;
  adult_count: number;
  child_count: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes?: string;
  is_confirmed: boolean;
  is_contacted: boolean;
  admin_notes?: string;
  user_email_sent: boolean;
  admin_email_sent: boolean;
  created_at: string;
  whatsapp_url: string;
}

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  not_contacted: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function timeAgo(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ── Row Component ─────────────────────────────────────────────────────────────
function PreBookingRow({
  pb,
  accessToken,
  onUpdate,
  onDelete,
}: {
  pb: PreBooking;
  accessToken: string | null;
  onUpdate: (id: number, patch: Partial<PreBooking>) => void;
  onDelete: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(pb.admin_notes || '');
  const [saving, setSaving] = useState(false);

  const patch = useCallback(async (data: Partial<PreBooking>) => {
    setSaving(true);
    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
      const res = await apiClient.patch(`/api/v1/admin/pre-bookings/${pb.id}`, data, { headers });
      onUpdate(pb.id, res.data);
      toast.success('Updated successfully');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  }, [pb.id, onUpdate, accessToken]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm(`Are you sure you want to delete lead ${pb.ref_id} (${pb.customer_name})?`)) return;
    setSaving(true);
    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
      await apiClient.delete(`/api/v1/admin/pre-bookings/${pb.id}`, { headers });
      onDelete(pb.id);
      toast.success('Lead deleted');
    } catch {
      toast.error('Failed to delete lead');
    } finally {
      setSaving(false);
    }
  }, [pb.id, pb.ref_id, pb.customer_name, onDelete, accessToken]);

  const pax = `${pb.adult_count}A${pb.child_count > 0 ? ` + ${pb.child_count}C` : ''}`;

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-all ${pb.is_confirmed ? 'border-green-200' : pb.is_contacted ? 'border-blue-200' : 'border-slate-200'}`}>
      {/* Main row */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start gap-3">
          {/* Status badges */}
          <div className="flex gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md ${pb.is_confirmed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {pb.is_confirmed ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
              {pb.is_confirmed ? 'Confirmed' : 'Pending'}
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md ${pb.is_contacted ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
              <Phone className="w-3 h-3" />
              {pb.is_contacted ? 'Contacted' : 'Not Contacted'}
            </span>
          </div>

          {/* PNR Number */}
          <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200/60 px-2 py-1 rounded ml-auto">PNR: {pb.ref_id}</span>
          <span className="text-[10px] text-slate-400">{timeAgo(pb.created_at)}</span>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Customer info */}
          <div>
            <p className="font-bold text-slate-900 text-sm">{pb.customer_name}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              <a href={`tel:+91${pb.customer_phone}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#5ac4d7]">
                <Phone className="w-3 h-3" />{pb.customer_phone}
              </a>
              <a href={`mailto:${pb.customer_email}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#5ac4d7] truncate max-w-[200px]">
                <Mail className="w-3 h-3" />{pb.customer_email}
              </a>
            </div>
          </div>

          {/* Booking info */}
          <div>
            <p className="font-semibold text-slate-700 text-sm flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#5ac4d7]" />
              {pb.package_name}
            </p>
            <div className="flex gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />{formatDate(pb.travel_date)}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Users className="w-3 h-3" />{pax}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <a
            href={pb.whatsapp_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#1da851] transition-colors"
          >
            💬 WhatsApp
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => patch({ is_contacted: !pb.is_contacted })}
            disabled={saving}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-colors border ${pb.is_contacted ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
          >
            <Phone className="w-3 h-3" />
            {pb.is_contacted ? 'Mark Not Contacted' : 'Mark Contacted'}
          </button>
          <button
            onClick={() => patch({ is_confirmed: !pb.is_confirmed })}
            disabled={saving}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-colors border ${pb.is_confirmed ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
          >
            <CheckCheck className="w-3 h-3" />
            {pb.is_confirmed ? 'Unconfirm' : 'Mark Confirmed'}
          </button>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-colors border bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            title="Delete Pre-Booking Lead"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex items-center gap-1 text-xs text-slate-400 ml-auto hover:text-slate-600 px-2 py-2"
          >
            {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Less</> : <><ChevronDown className="w-3.5 h-3.5" /> More</>}
          </button>
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 p-4 sm:p-5 space-y-4">
          {pb.notes && (
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Customer&apos;s Notes
              </p>
              <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2">{pb.notes}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
              <StickyNote className="w-3.5 h-3.5" /> Admin Notes
            </p>
            <div className="flex gap-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes about this lead..."
                rows={2}
                className="flex-1 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#5ac4d7] resize-none"
              />
              <button
                onClick={() => patch({ admin_notes: notes })}
                disabled={saving || notes === pb.admin_notes}
                className="px-3 text-xs font-bold text-white bg-[#5ac4d7] rounded-lg disabled:bg-slate-200 disabled:text-slate-400 hover:bg-slate-700 transition-colors"
              >
                {saving ? '…' : 'Save'}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400">
            <span>📧 User email: {pb.user_email_sent ? '✓ Sent' : '✗ Failed'}</span>
            <span>📧 Admin email: {pb.admin_email_sent ? '✓ Sent' : '✗ Failed'}</span>
            <span>Submitted: {new Date(pb.created_at).toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPreBookingsPage() {
  const { isHydrated, accessToken } = useAuthStore();
  const [items, setItems] = useState<PreBooking[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, confirmed: 0, not_contacted: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterConfirmed, setFilterConfirmed] = useState<'all' | 'yes' | 'no'>('all');
  const [filterContacted, setFilterContacted] = useState<'all' | 'yes' | 'no'>('all');
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterConfirmed !== 'all') params.set('is_confirmed', filterConfirmed === 'yes' ? 'true' : 'false');
      if (filterContacted !== 'all') params.set('is_contacted', filterContacted === 'yes' ? 'true' : 'false');
      params.set('limit', String(LIMIT));
      params.set('offset', String(offset));

      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
      const [listRes, statsRes] = await Promise.all([
        apiClient.get(`/api/v1/admin/pre-bookings?${params.toString()}`, { headers }),
        apiClient.get('/api/v1/admin/pre-bookings/stats', { headers }),
      ]);
      setItems(listRes.data?.items ?? []);
      setTotal(listRes.data?.total ?? 0);
      setStats(statsRes.data ?? { total: 0, pending: 0, confirmed: 0, not_contacted: 0 });
    } catch (err: unknown) {
      console.error('Failed to load pre-bookings:', err);
      toast.error('Failed to load pre-bookings');
    } finally {
      setLoading(false);
    }
  }, [search, filterConfirmed, filterContacted, offset, accessToken]);

  useEffect(() => {
    if (isHydrated) {
      fetchData();
    }
  }, [fetchData, isHydrated, accessToken]);

  const handleUpdate = (id: number, patch: Partial<PreBooking>) => {
    setItems((prev) => prev.map((pb) => pb.id === id ? { ...pb, ...patch } : pb));
  };

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((pb) => pb.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
    fetchData();
  };

  const hasFilters = search || filterConfirmed !== 'all' || filterContacted !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-slate-900">Pre-Bookings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Early pre-booking leads from tstelanganatourism.com/prebooking</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Leads" value={stats.total} icon={<Package className="w-5 h-5 text-slate-600" />} color="bg-slate-100" />
        <StatCard label="Pending" value={stats.pending} icon={<AlertTriangle className="w-5 h-5 text-amber-600" />} color="bg-amber-100" />
        <StatCard label="Confirmed" value={stats.confirmed} icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} color="bg-green-100" />
        <StatCard label="Not Contacted" value={stats.not_contacted} icon={<Phone className="w-5 h-5 text-red-600" />} color="bg-red-100" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
              placeholder="Search by name, phone, email, PNR number..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#5ac4d7] text-slate-700 placeholder-slate-300"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterConfirmed}
              onChange={(e) => { setFilterConfirmed(e.target.value as 'all' | 'yes' | 'no'); setOffset(0); }}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#5ac4d7] text-slate-700 bg-white"
            >
              <option value="all">All Status</option>
              <option value="yes">Confirmed Only</option>
              <option value="no">Pending Only</option>
            </select>

            <select
              value={filterContacted}
              onChange={(e) => { setFilterContacted(e.target.value as 'all' | 'yes' | 'no'); setOffset(0); }}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#5ac4d7] text-slate-700 bg-white"
            >
              <option value="all">All Contact</option>
              <option value="yes">Contacted</option>
              <option value="no">Not Contacted</option>
            </select>
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setFilterConfirmed('all'); setFilterContacted('all'); setOffset(0); }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-500">No pre-bookings found</p>
          <p className="text-sm text-slate-400 mt-1">
            {hasFilters ? 'Try clearing your filters.' : 'Pre-bookings from the website will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Showing {items.length} of {total} leads</span>
            {total > LIMIT && (
              <div className="flex items-center gap-2">
                <button
                  disabled={offset === 0}
                  onClick={() => setOffset((p) => Math.max(0, p - LIMIT))}
                  className="px-3 py-1 border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  ← Prev
                </button>
                <span>{Math.floor(offset / LIMIT) + 1} / {Math.ceil(total / LIMIT)}</span>
                <button
                  disabled={offset + LIMIT >= total}
                  onClick={() => setOffset((p) => p + LIMIT)}
                  className="px-3 py-1 border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>

          {items.map((pb) => (
            <PreBookingRow
              key={pb.id}
              pb={pb}
              accessToken={accessToken}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
