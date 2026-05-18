'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User, Home, Ship, BedDouble, Image as ImageIcon, Info, LogOut, LayoutDashboard, ChevronDown, Settings } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { logout } from '@/services/authService';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';

const navLinks = [
  { name: 'Home', href: '/', icon: Home, path: '/' },
  { name: 'Boat Rides', href: '/boat-rides', icon: Ship, path: '/boat-rides' },
  { name: 'Sightseeing', href: '/sightseeing', icon: Ship, path: '/sightseeing' },
  { name: 'Stays', href: '/stays', icon: BedDouble, path: '/stays' },
  { name: 'Gallery', href: '/gallery', icon: ImageIcon, path: '/gallery' },
  { name: 'About Us', href: '/about', icon: Info, path: '/about' },
];

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isLinkActive = (link: (typeof navLinks)[number]) => {
    if (link.path === '/') return pathname === '/';
    return pathname === link.path || pathname.startsWith(`${link.path}/`);
  };

  const handleNavigate = () => {
    setIsOpen(false);
    // Force a fresh server refresh on every navigation click to ensure 100% real-time data
    setTimeout(() => {
      router.refresh();
    }, 50);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out. See you soon!');
      router.push('/');
      setIsOpen(false);
    } catch (err) {
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-[100] w-full bg-white/90 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" prefetch={false} className="flex items-center gap-2 transition-transform duration-200 hover:scale-[1.02]">
                <img 
                  src="https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778914224/logo1_shpjk5.jpg" 
                  alt="Papikondalu Tourism Logo"
                  className="h-10 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = isLinkActive(link);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    prefetch={false}
                    onClick={handleNavigate}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative group rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-[var(--color-brand-river)] text-white shadow-md'
                        : 'text-[var(--color-brand-river)] hover:bg-slate-50 hover:text-[var(--color-brand-teal)]'
                    }`}
                  >
                    <span className="relative z-10">{link.name}</span>
                    {/* Hover Underline Animation */}
                    <span className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-[var(--color-brand-teal)] transition-transform duration-300 ${
                      isActive ? 'scale-x-0' : 'scale-x-0 group-hover:scale-x-100'
                    }`} />
                  </Link>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {!isHydrated ? (
                <div className="hidden sm:block w-20 h-8 bg-slate-200 animate-pulse rounded-lg" />
              ) : isAuthenticated ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all"
                  >
                    <div className="h-7 w-7 rounded-full bg-[var(--color-brand-river)] flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        user?.full_name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <span className="text-sm font-bold text-slate-700 max-w-[100px] truncate">
                      {user?.full_name?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                          <p className="text-sm font-bold text-slate-800 truncate">{user?.full_name}</p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                        <div className="p-2 space-y-1">
                          {user?.role === 'ADMIN' ? (
                            <>
                              <Link 
                                href="/admin/dashboard"
                                prefetch={false}
                                onClick={() => { setDropdownOpen(false); handleNavigate(); }}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[var(--color-brand-teal)] rounded-xl transition-colors"
                              >
                                <LayoutDashboard className="h-4 w-4" />
                                Admin Dashboard
                              </Link>
                              <Link 
                                href="/admin/settings"
                                prefetch={false}
                                onClick={() => { setDropdownOpen(false); handleNavigate(); }}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[var(--color-brand-teal)] rounded-xl transition-colors"
                              >
                                <Settings className="h-4 w-4" />
                                System Settings
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link 
                                href="/dashboard"
                                prefetch={false}
                                onClick={() => { setDropdownOpen(false); handleNavigate(); }}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[var(--color-brand-teal)] rounded-xl transition-colors"
                              >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard Overview
                              </Link>
                              <Link 
                                href="/dashboard/bookings"
                                prefetch={false}
                                onClick={() => { setDropdownOpen(false); handleNavigate(); }}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[var(--color-brand-teal)] rounded-xl transition-colors"
                              >
                                <Ship className="h-4 w-4" />
                                My Bookings
                              </Link>
                              <Link 
                                href="/dashboard/profile"
                                prefetch={false}
                                onClick={() => { setDropdownOpen(false); handleNavigate(); }}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[var(--color-brand-teal)] rounded-xl transition-colors"
                              >
                                <User className="h-4 w-4" />
                                My Profile
                              </Link>
                            </>
                          )}
                        </div>
                        <div className="p-2 border-t border-slate-100">
                          <button
                            onClick={() => { setDropdownOpen(false); setIsLogoutModalOpen(true); }}
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link 
                  href="/login" 
                  prefetch={false}
                  onClick={handleNavigate}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold text-[var(--color-brand-river)] hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <User className="h-4 w-4" />
                  Login
                </Link>
              )}
              <Link 
                href="/boat-rides" 
                prefetch={false}
                onClick={handleNavigate}
                className="bg-[var(--color-brand-river)] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#1a5663] transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Book Now
              </Link>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 text-[var(--color-brand-river)] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-border shadow-2xl animate-in slide-in-from-top duration-300">
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => {
                const isActive = isLinkActive(link);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    prefetch={false}
                    onClick={handleNavigate}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-4 rounded-xl px-4 py-4 text-base font-bold transition-all ${
                      isActive
                        ? 'bg-[var(--color-brand-river)] text-white shadow-md'
                        : 'text-[var(--color-brand-river)] active:bg-slate-50'
                    }`}
                  >
                    <link.icon className={`h-5 w-5 ${isActive ? 'text-[var(--color-brand-sand)]' : 'text-slate-400'}`} />
                    {link.name}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-slate-100 mt-4 px-4 space-y-2">
                {!isHydrated ? (
                  <div className="w-full h-10 bg-slate-100 animate-pulse rounded-xl" />
                ) : isAuthenticated ? (
                  <>
                    <Link 
                      href="/dashboard"
                      prefetch={false}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 py-3 text-base font-bold text-[var(--color-brand-river)]"
                    >
                      <LayoutDashboard className="h-5 w-5 text-[var(--color-brand-teal)]" />
                      Dashboard
                    </Link>
                    <button 
                      onClick={() => { setIsLogoutModalOpen(true); }}
                      className="flex items-center gap-4 py-3 text-base font-bold text-red-600 w-full text-left"
                    >
                      <LogOut className="h-5 w-5 text-red-500" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link 
                    href="/login" 
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 py-3 text-base font-bold text-slate-500"
                  >
                    <User className="h-5 w-5 text-slate-400" />
                    User Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <ConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Logging out?"
        message="You are about to be logged out of your session. Do you want to continue?"
        confirmText="Yes, Logout"
        cancelText="Stay logged in"
        type="danger"
      />
    </>
  );
}
