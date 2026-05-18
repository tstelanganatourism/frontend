'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminStore } from '@/stores/adminStore';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft, Edit, KeyRound, ShieldCheck, ShieldOff, Trash2,
  User, Phone, Mail, Building2, Percent, Calendar, MapPin,
  TrendingUp, Ticket, CheckCircle2, XCircle, Clock, IndianRupee,
  Wallet, FileText, BarChart3, CreditCard, Activity
} from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Lock, Eye, EyeOff, RefreshCw } from 'lucide-react';

function generatePassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let pw = '';
  for (let i = 0; i < length; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

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

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params?.id;
  const { currentAgent, isLoading, fetchAgentById, toggleAgentStatus, deleteAgent, resetAgentPassword } = useAdminStore();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (agentId) fetchAgentById(agentId as string);
  }, [agentId, fetchAgentById]);

  const handleToggleStatus = async () => {
    try {
      const updated = await toggleAgentStatus(agentId as string);
      // Refresh agent detail to get updated status
      fetchAgentById(agentId as string);
      toast.success(`Agent is now ${updated.account_status === 'ACTIVE' ? 'active' : 'blocked'}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async () => {
    await deleteAgent(agentId as string);
    toast.success('Agent removed');
    router.push('/admin/agents');
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setResetLoading(true);
    try {
      await resetAgentPassword(agentId as string, newPassword);
      toast.success('Password reset successfully');
      setIsResetModalOpen(false);
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  if (isLoading && !currentAgent) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#5ac4d7] border-t-transparent" />
      </div>
    );
  }

  if (!currentAgent) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold text-slate-900">Agent not found</h2>
        <Link href="/admin/agents" prefetch={false} className="text-[#5ac4d7] font-bold hover:underline">Back to Agents</Link>
      </div>
    );
  }

  const agent = currentAgent;
  const metrics = agent.metrics || { total_bookings: 0, confirmed_bookings: 0, cancelled_bookings: 0, pending_bookings: 0, total_revenue: 0, total_commission: 0 };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/agents" prefetch={false} className="rounded-xl bg-slate-100 p-2.5 text-slate-600 hover:bg-slate-200 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Agent Profile</h1>
            <p className="text-slate-500 mt-1">Detailed view of {agent.full_name}&apos;s account.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/admin/agents/edit/${agent.id}`} prefetch={false}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Edit className="h-4 w-4" /> Edit
          </Link>
          <button onClick={() => { setNewPassword(''); setShowNewPassword(false); setIsResetModalOpen(true); }}
            className="flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-bold text-amber-600 hover:bg-amber-50 transition-all cursor-pointer">
            <KeyRound className="h-4 w-4" /> Reset Password
          </button>
          <button onClick={handleToggleStatus}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all cursor-pointer ${
              agent.account_status === 'BLOCKED' 
                ? 'border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50' 
                : 'border-red-200 bg-white text-red-600 hover:bg-red-50'
            }`}>
            {agent.account_status === 'BLOCKED' ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
            {agent.account_status === 'BLOCKED' ? 'Unblock' : 'Block'}
          </button>
          <button onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer">
            <Trash2 className="h-4 w-4" /> Remove
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="h-24 bg-gradient-to-r from-[#0f3d56] to-[#5ac4d7]" />
        <div className="px-8 pb-8 -mt-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#5ac4d7] to-[#0f3d56] flex items-center justify-center text-white text-2xl font-black ring-4 ring-white shadow-lg">
              {agent.full_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900">{agent.full_name}</h2>
                <StatusPill status={agent.account_status} />
              </div>
              <p className="text-sm text-slate-500 mt-1">{agent.company_name || 'Independent Agent'}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Commission Rate</p>
              <p className="text-3xl font-black text-[#0f3d56]">{parseFloat(agent.commission_percentage || 0).toFixed(1)}%</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <Mail className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-400">Email</p>
                <p className="text-sm font-bold text-slate-700">{agent.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <Phone className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-400">Phone</p>
                <p className="text-sm font-bold text-slate-700">{agent.phone_number || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <Building2 className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-400">GST</p>
                <p className="text-sm font-bold text-slate-700">{agent.gst_number || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-400">Joined</p>
                <p className="text-sm font-bold text-slate-700">{agent.created_at ? new Date(agent.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p>
              </div>
            </div>
          </div>

          {/* Address & Notes */}
          {(agent.address || agent.admin_notes) && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {agent.address && (
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-400">Address</p>
                    <p className="text-sm text-slate-700">{agent.address}</p>
                  </div>
                </div>
              )}
              {agent.admin_notes && (
                <div className="flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3">
                  <FileText className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-500">Admin Notes</p>
                    <p className="text-sm text-slate-700">{agent.admin_notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Operational Metrics */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#5ac4d7]" /> Booking & Revenue Metrics
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard icon={Ticket} label="Total Bookings" value={metrics.total_bookings} color="bg-blue-50 text-blue-600" />
          <MetricCard icon={CheckCircle2} label="Confirmed" value={metrics.confirmed_bookings} color="bg-emerald-50 text-emerald-600" />
          <MetricCard icon={XCircle} label="Cancelled" value={metrics.cancelled_bookings} color="bg-red-50 text-red-600" />
          <MetricCard icon={Clock} label="Pending" value={metrics.pending_bookings} color="bg-amber-50 text-amber-600" />
          <MetricCard icon={IndianRupee} label="Revenue Generated" value={`₹${metrics.total_revenue.toLocaleString('en-IN')}`} color="bg-purple-50 text-purple-600" />
          <MetricCard icon={Wallet} label="Commission Earned" value={`₹${metrics.total_commission.toLocaleString('en-IN')}`} color="bg-teal-50 text-teal-600" />
        </div>
      </div>

      {/* Recent Bookings — Empty State (no fake data) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#5ac4d7]" /> Recent Bookings
          </h3>
        </div>
        {metrics.total_bookings === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-2xl bg-slate-50 p-6 mb-4">
              <Ticket className="h-12 w-12 text-slate-300" />
            </div>
            <h4 className="font-bold text-slate-900">No bookings yet</h4>
            <p className="text-sm text-slate-500 mt-1 max-w-[300px]">
              When this agent generates bookings through their referral link or agent panel, they will appear here with full details.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-slate-500">Booking details will be shown here when the booking engine is live.</p>
          </div>
        )}
      </div>

      {/* Future-Ready Sections */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Payout History */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#5ac4d7]" /> Payout History
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-2xl bg-slate-50 p-5 mb-4">
              <CreditCard className="h-10 w-10 text-slate-300" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">No payouts processed</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[250px]">
              Commission payouts will be tracked here once the payment engine is integrated.
            </p>
          </div>
        </div>

        {/* Performance */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#5ac4d7]" /> Performance Analytics
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-2xl bg-slate-50 p-5 mb-4">
              <BarChart3 className="h-10 w-10 text-slate-300" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Analytics coming soon</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[250px]">
              Conversion rates, monthly trends, and performance rankings will be available when booking volume grows.
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirm */}
      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete}
        title="Remove Agent" message={`This will deactivate ${agent.full_name}'s account. They will no longer be able to log in.`}
        confirmText="Remove Agent" cancelText="Keep Agent" type="danger" />

      {/* Password Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsResetModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-2">Reset Password</h3>
            <p className="text-sm text-slate-500 mb-6">Set a new password for {agent.full_name}.</p>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all"
                    placeholder="Minimum 6 characters" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button type="button" onClick={() => { setNewPassword(generatePassword()); setShowNewPassword(true); }}
                  className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsResetModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">Cancel</button>
                <button type="button" onClick={handleResetPassword} disabled={resetLoading}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-all disabled:opacity-50 cursor-pointer">
                  {resetLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <KeyRound className="h-4 w-4" />}
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
