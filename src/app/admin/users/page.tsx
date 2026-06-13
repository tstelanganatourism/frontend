'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import Link from 'next/link';
import { 
  Search, Users, Trash2, Eye, KeyRound, Phone, Mail, ChevronDown, MoreHorizontal, Loader2, X, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Pagination from '@/components/ui/Pagination';
import PremiumSelect from '@/components/ui/PremiumSelect';

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

function AvatarInitials({ name }: { name: string }) {
  const initials = (name || '').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#5ac4d7] to-[#0f3d56] flex items-center justify-center text-white text-xs font-black shadow-sm shrink-0">
      {initials || '?'}
    </div>
  );
}

export default function AdminUsersPage() {
  const { 
    users, 
    usersTotal,
    usersPage,
    usersLimit,
    isLoading, 
    fetchUsers, 
    deleteUser, 
    toggleUserStatus,
    resetUserPassword
  } = useAdminStore();

  const [searchVal, setSearchVal] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modals state
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  const [togglingStatusId, setTogglingStatusId] = useState<number | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(searchVal, statusFilter, 1, usersLimit).finally(() => {
        setIsInitialMount(false);
      });
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchUsers, searchVal, statusFilter, usersLimit]);

  const handleDeleteConfirm = async () => {
    if (selectedUserId) {
      await deleteUser(selectedUserId);
      toast.success('User removed successfully');
      setIsDeleteModalOpen(false);
      setSelectedUserId(null);
      fetchUsers(searchVal, statusFilter, usersPage, usersLimit);
    }
  };

  const handleToggleStatus = async (user: any) => {
    if (togglingStatusId) return;
    setTogglingStatusId(user.id);
    try {
      const updated = await toggleUserStatus(user.id);
      toast.success(`${user.full_name} is now ${updated.account_status === 'ACTIVE' ? 'active' : 'blocked'}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle status');
    } finally {
      setTogglingStatusId(null);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsSavingPassword(true);
    try {
      await resetUserPassword(selectedUserId, newPassword);
      toast.success('Password changed successfully');
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setSelectedUserId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">User Directory</h1>
          <p className="text-slate-500 mt-1">Manage tourist customer accounts, credentials, and access statuses.</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search users by name, email, phone..."
            value={searchVal} onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm outline-none focus:border-[#5ac4d7] transition-all" />
        </div>
        <div className="flex gap-4">
          <div className="w-[180px]">
            <PremiumSelect 
              value={statusFilter} 
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'BLOCKED', label: 'Blocked' },
                { value: 'DISABLED', label: 'Disabled' },
              ]} 
              onChange={setStatusFilter} 
              placeholder="All Statuses" 
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">Contact Details</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Account Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(isLoading || isInitialMount) && users.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-5"><div className="h-4 w-full max-w-[120px] animate-pulse rounded-lg bg-slate-100" /></td>
                    ))}
                  </tr>
                ))
              ) : (() => {
                if (users.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="rounded-2xl bg-slate-50 p-6"><Users className="h-12 w-12 text-slate-300" /></div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">No users found</h3>
                            <p className="text-sm text-slate-500 mt-1">Try adjusting your search query or status filter.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-25 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="Profile" className="h-10 w-10 rounded-xl object-cover shrink-0" />
                        ) : (
                          <AvatarInitials name={u.full_name} />
                        )}
                        <div>
                          <Link href={`/admin/users/${u.id}`} prefetch={false} className="font-bold text-slate-900 hover:text-[#5ac4d7] transition-colors">
                            {u.full_name}
                          </Link>
                          <p className="text-xs text-slate-400 mt-0.5 md:hidden">{u.email || 'No Email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="space-y-1">
                        {u.email ? (
                          <div className="flex items-center gap-1.5 text-slate-600"><Mail className="h-3 w-3 text-slate-400" />{u.email}</div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 italic text-xs">No email set</div>
                        )}
                        {u.phone_number ? (
                          <div className="flex items-center gap-1.5 text-slate-600"><Phone className="h-3 w-3 text-slate-400" />{u.phone_number}</div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 italic text-xs">No phone set</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#5ac4d7]/10 text-[#0f3d56] font-bold text-xs border border-[#5ac4d7]/20">
                        {u.total_bookings || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggleStatus(u)} 
                        disabled={togglingStatusId === u.id}
                        className="cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                        title="Click to Toggle Status"
                      >
                        {togglingStatusId === u.id ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Updating
                          </span>
                        ) : (
                          <StatusPill status={u.account_status} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/admin/users/${u.id}`} prefetch={false}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-[#5ac4d7] transition-all" title="View Details & Bookings">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => { setSelectedUserId(u.id); setIsPasswordModalOpen(true); }}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-amber-600 transition-all cursor-pointer" 
                          title="Reset Password"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedUserId(u.id); setIsDeleteModalOpen(true); }}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer" 
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={usersPage}
          totalItems={usersTotal}
          pageSize={usersLimit}
          onPageChange={(page) => fetchUsers(searchVal, statusFilter, page, usersLimit)}
          onPageSizeChange={(size) => fetchUsers(searchVal, statusFilter, 1, size)}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDeleteConfirm}
        title="Remove User Account" 
        message="Are you sure you want to deactivate this user account? They will be unable to log in, but their historical booking records will remain intact."
        confirmText="Deactivate Account" 
        cancelText="Cancel" 
        type="danger" 
      />

      {/* Password Reset Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
            <button 
              onClick={() => { setIsPasswordModalOpen(false); setNewPassword(''); }}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <KeyRound className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-950">Change User Password</h3>
                <p className="text-xs text-slate-500">Provide a new password for password recovery request.</p>
              </div>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">New Password</label>
                <input 
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-[#5ac4d7] focus:ring-1 focus:ring-[#5ac4d7] font-semibold text-slate-800 text-sm transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setIsPasswordModalOpen(false); setNewPassword(''); }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSavingPassword}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingPassword && <Loader2 className="h-3 w-3 animate-spin" />}
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
