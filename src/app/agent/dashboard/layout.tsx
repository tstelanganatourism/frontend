'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  LogOut,
  User,
  ChevronRight,
  Menu,
  X,
  Briefcase,
  ShieldCheck,
  Anchor,
} from 'lucide-react';
import { logout } from '@/services/authService';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

export default function AgentDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { user } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', href: '/agent/dashboard', icon: LayoutDashboard },
    { name: 'Customer Bookings', href: '/agent/dashboard/bookings', icon: Ticket },
    { name: 'My Profile', href: '/dashboard/profile', icon: User },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'AG';

  const [imgError, setImgError] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* ── Agent Identity Card ── */}
      <div className="px-4 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          {/* Avatar */}
          <div
            className="relative shrink-0 h-11 w-11 rounded-xl overflow-hidden"
            style={{ boxShadow: '0 2px 10px rgba(30,70,138,0.18)' }}
          >
            {user?.avatar_url && !imgError ? (
              <img
                src={user.avatar_url}
                alt="Avatar"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="h-full w-full flex items-center justify-center text-white font-black text-base"
                style={{ background: 'linear-gradient(135deg, #1e3a5f, #1e468a)' }}
              >
                {initials}
              </div>
            )}
            {/* Online dot */}
            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white" />
          </div>

          {/* Name & role */}
          <div className="min-w-0 flex-1">
            <h2 className="text-slate-900 text-sm font-black truncate leading-tight">
              {user?.full_name || 'Agent'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="h-3 w-3 text-amber-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-400 truncate">
                Agent Portal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Items ── */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/agent/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileNavOpen(false)}
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#1e3a5f] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                    isActive ? 'bg-white/15' : 'bg-slate-100 group-hover:bg-slate-200'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`}
                  />
                </div>
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="h-4 w-4 text-white/50" />}
            </Link>
          );
        })}
      </nav>

      {/* ── Sign Out ── */}
      <div className="px-3 pb-4 border-t border-slate-100 pt-3">
        <button
          onClick={() => { setIsMobileNavOpen(false); setIsLogoutModalOpen(true); }}
          className="group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-150 text-left"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-rose-100 transition-all">
            <LogOut className="h-4 w-4 text-slate-400 group-hover:text-rose-500" />
          </div>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <ProtectedRoute allowedRoles={['AGENT']}>
      {/* ── Mobile Top Bar ── */}
      <div className="md:hidden sticky top-[62px] z-30 bg-white border-b border-slate-100 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="h-7 w-7 rounded-lg overflow-hidden shrink-0"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #1e468a)' }}
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="h-full w-full flex items-center justify-center text-white font-black text-xs">
                {initials}
              </span>
            )}
          </div>
          <div>
            <p className="text-slate-800 font-bold text-sm leading-tight">{user?.full_name || 'Agent'}</p>
            <p className="text-slate-400 text-[10px] font-medium leading-tight">Agent Portal</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          aria-label="Toggle navigation"
        >
          {isMobileNavOpen ? (
            <X className="h-4 w-4 text-slate-600" />
          ) : (
            <Menu className="h-4 w-4 text-slate-600" />
          )}
        </button>
      </div>

      {/* ── Mobile Slide-Down Nav ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-b border-slate-100 ${
          isMobileNavOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-3 py-3">
          <NavContent />
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex flex-col md:flex-row gap-6 lg:gap-8 min-h-[80vh]">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden md:block w-64 shrink-0">
          <div
            className="bg-white rounded-2xl overflow-hidden sticky top-24"
            style={{
              boxShadow: '0 1px 16px rgba(30,70,138,0.07)',
              border: '1px solid rgba(30,70,138,0.07)',
            }}
          >
            {/* Brand mini-bar */}
            <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-slate-50 bg-slate-50/50">
              <Briefcase className="h-4 w-4 text-[#1e468a]" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Agent Console
              </span>
            </div>
            <NavContent />
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of the Agent Portal?"
        confirmText="Sign Out"
        cancelText="Stay"
        type="danger"
      />
    </ProtectedRoute>
  );
}
