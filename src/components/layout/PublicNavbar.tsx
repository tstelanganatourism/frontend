'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User, Home, Ship, BedDouble, Image as ImageIcon, Info, LogOut, LayoutDashboard, ChevronDown, Settings } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { logout } from '@/services/authService';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'Home', href: '/', icon: Home, path: '/' },
  { name: 'Boat Rides', href: '/boat-rides', icon: Ship, path: '/boat-rides' },
  { name: 'Sightseeing', href: '/sightseeing', icon: Ship, path: '/sightseeing' },
  { name: 'Accommodations', href: '/stays', icon: BedDouble, path: '/stays' },
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLinkActive = (link: (typeof navLinks)[number]) => {
    if (link.path === '/') return pathname === '/';
    return pathname === link.path || pathname.startsWith(`${link.path}/`);
  };

  const handleNavigate = () => {
    setIsOpen(false);
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
      <nav 
        className={`sticky top-0 z-[100] w-full transition-all duration-300 ease-in-out border-b ${
          isScrolled 
            ? 'py-1.5 bg-white/80 backdrop-blur-xl shadow-[0_12px_30px_-5px_rgba(15,61,86,0.08)] border-[#d9e6ea]/60' 
            : 'py-2.5 bg-white/95 backdrop-blur-lg shadow-[0_4px_20px_-10px_rgba(15,61,86,0.04)] border-[#d9e6ea]/30'
        }`}
      >
        <div className="w-full px-3 sm:px-5 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between gap-2 lg:gap-4">
            
            {/* Logo Section (Left) */}
            <div className="flex shrink-0 items-center">
              <Link href="/" prefetch={false} className="group flex items-center gap-2 rounded-2xl p-1 transition-all duration-300 hover:bg-slate-50/80">
                <span className={`relative grid shrink-0 place-items-center rounded-full bg-white shadow-[0_6px_16px_rgba(15,61,86,0.06)] ring-1 ring-slate-100 transition-all duration-300 ${
                  isScrolled ? 'h-9 w-9' : 'h-11 w-11'
                }`}>
                  <img 
                    src="/aptdc-logo.svg" 
                    alt="Andhra Pradesh Tourism Development Corporation"
                    className={`transition-all duration-300 object-contain ${
                      isScrolled ? 'h-8 w-8' : 'h-10 w-10'
                    }`}
                  />
                </span>
                <span className="leading-tight transition-all duration-300">
                  <span className="block text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Andhra Pradesh</span>
                  <span className="block whitespace-nowrap text-[12px] sm:text-[13px] font-extrabold tracking-tight text-[var(--color-brand-river)] group-hover:text-[var(--color-brand-teal)] transition-colors">
                    Official Boat Tourism
                  </span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation (Center) - Visible from lg (1024px) */}
            <div className="hidden min-w-0 flex-1 justify-center lg:flex px-2 xl:px-6">
              <div className="relative flex items-center gap-0.5 xl:gap-1 py-1">
                {navLinks.map((link, index) => {
                  const isActive = isLinkActive(link);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      prefetch={false}
                      onClick={handleNavigate}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      aria-current={isActive ? 'page' : undefined}
                      className="relative inline-flex h-9 items-center justify-center rounded-full px-3 xl:px-4 text-[12px] xl:text-[13px] font-extrabold transition-colors duration-200"
                      style={{ color: isActive ? '#ffffff' : 'var(--color-brand-river)' }}
                    >
                      {/* Active Background Pill */}
                      {isActive && (
                        <motion.span
                          layoutId="activeNavBackground"
                          className="absolute inset-0 rounded-full bg-[var(--color-brand-river)] shadow-[0_6px_16px_rgba(15,61,86,0.18)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}

                      {/* Hover Background Pill */}
                      <AnimatePresence>
                        {hoveredIndex === index && !isActive && (
                          <motion.span
                            layoutId="hoverNavBackground"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 rounded-full bg-slate-100/90 z-[-1] border border-slate-200/50 shadow-sm"
                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                          />
                        )}
                      </AnimatePresence>

                      <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
                        {link.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons & Right Side Logos (Right) */}
            <div className="flex shrink-0 items-center justify-end gap-2 xl:gap-3">
              {/* Auth / Account */}
              {!isHydrated ? (
                <div className="hidden h-9 w-20 animate-pulse rounded-full bg-slate-100 lg:block" />
              ) : isAuthenticated ? (
                <div className="relative hidden lg:block">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-full border border-slate-250 bg-slate-50/80 p-1 pr-3 transition-all hover:bg-slate-100/90 shadow-sm"
                  >
                    <div className="h-7 w-7 rounded-full bg-[var(--color-brand-river)] flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-inner ring-2 ring-white">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        user?.full_name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <span className="text-xs font-extrabold text-slate-700 max-w-[80px] truncate">
                      {user?.full_name?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-45"
                          onClick={() => setDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className="absolute right-0 mt-2.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                        >
                          <div className="px-4 py-3.5 bg-slate-50/50 border-b border-slate-100">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.full_name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            <span className="inline-flex mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-100 text-slate-600 uppercase tracking-wider">
                              {user?.role}
                            </span>
                          </div>
                          <div className="p-1.5 space-y-0.5">
                            {user?.role === 'ADMIN' ? (
                              <>
                                <Link 
                                  href="/admin/dashboard"
                                  prefetch={false}
                                  onClick={() => { setDropdownOpen(false); handleNavigate(); }}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 hover:text-[var(--color-brand-teal)] rounded-xl transition-colors"
                                >
                                  <LayoutDashboard className="h-4 w-4 text-slate-400" />
                                  Admin Dashboard
                                </Link>
                                <Link 
                                  href="/admin/settings"
                                  prefetch={false}
                                  onClick={() => { setDropdownOpen(false); handleNavigate(); }}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 hover:text-[var(--color-brand-teal)] rounded-xl transition-colors"
                                >
                                  <Settings className="h-4 w-4 text-slate-400" />
                                  System Settings
                                </Link>
                              </>
                            ) : user?.role === 'AGENT' ? (
                              <>
                                <Link 
                                  href="/agent/dashboard"
                                  prefetch={false}
                                  onClick={() => { setDropdownOpen(false); handleNavigate(); }}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 hover:text-[var(--color-brand-teal)] rounded-xl transition-colors"
                                >
                                  <LayoutDashboard className="h-4 w-4 text-slate-400" />
                                  Agent Dashboard
                                </Link>
                                <Link 
                                  href="/agent/dashboard/bookings"
                                  prefetch={false}
                                  onClick={() => { setDropdownOpen(false); handleNavigate(); }}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 hover:text-[var(--color-brand-teal)] rounded-xl transition-colors"
                                >
                                  <Ship className="h-4 w-4 text-slate-400" />
                                  Client Bookings
                                </Link>
                                <Link 
                                  href="/dashboard/profile"
                                  prefetch={false}
                                  onClick={() => { setDropdownOpen(false); handleNavigate(); }}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 hover:text-[var(--color-brand-teal)] rounded-xl transition-colors"
                                >
                                  <User className="h-4 w-4 text-slate-400" />
                                  Agent Profile
                                </Link>
                              </>
                            ) : (
                              <>
                                <Link 
                                  href="/dashboard"
                                  prefetch={false}
                                  onClick={() => { setDropdownOpen(false); handleNavigate(); }}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 hover:text-[var(--color-brand-teal)] rounded-xl transition-colors"
                                >
                                  <LayoutDashboard className="h-4 w-4 text-slate-400" />
                                  Dashboard Overview
                                </Link>
                                <Link 
                                  href="/dashboard/bookings"
                                  prefetch={false}
                                  onClick={() => { setDropdownOpen(false); handleNavigate(); }}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 hover:text-[var(--color-brand-teal)] rounded-xl transition-colors"
                                >
                                  <Ship className="h-4 w-4 text-slate-400" />
                                  My Bookings
                                </Link>
                                <Link 
                                  href="/dashboard/profile"
                                  prefetch={false}
                                  onClick={() => { setDropdownOpen(false); handleNavigate(); }}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 hover:text-[var(--color-brand-teal)] rounded-xl transition-colors"
                                >
                                  <User className="h-4 w-4 text-slate-400" />
                                  My Profile
                                </Link>
                              </>
                            )}
                          </div>
                          <div className="p-1.5 border-t border-slate-100">
                            <button
                              onClick={() => { setDropdownOpen(false); setIsLogoutModalOpen(true); }}
                              className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-extrabold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <LogOut className="h-4 w-4" />
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  prefetch={false}
                  onClick={handleNavigate}
                  className="hidden items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold text-[var(--color-brand-river)] transition-colors hover:bg-slate-50/80 lg:flex"
                >
                  <User className="h-3.5 w-3.5" />
                  Login
                </Link>
              )}

              {/* Book Now Action Button */}
              <Link 
                href="/boat-rides" 
                prefetch={false}
                onClick={handleNavigate}
                className="relative hidden overflow-hidden rounded-full bg-[var(--color-brand-river)] px-4 xl:px-5 py-2 text-[11px] xl:text-xs font-black text-white shadow-[0_8px_20px_rgba(15,61,86,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(15,61,86,0.25)] hover:bg-[#154652] active:translate-y-0 lg:inline-flex group/btn"
              >
                Book Now
              </Link>

              {/* Telangana Tourism Logo (Right) */}
              <div className="hidden items-center gap-2 rounded-2xl p-1 transition-all duration-300 hover:bg-slate-50/80 xl:flex">
                <span className="hidden text-right leading-tight xl:block">
                  <span className="block text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Telangana</span>
                  <span className="block whitespace-nowrap text-[13px] font-extrabold tracking-tight text-[var(--color-brand-river)]">Official Tourism</span>
                </span>
                <span className={`relative grid shrink-0 place-items-center rounded-full bg-white shadow-[0_6px_16px_rgba(15,61,86,0.06)] ring-1 ring-slate-100 transition-all duration-300 ${
                  isScrolled ? 'h-9 w-9' : 'h-11 w-11'
                }`}>
                  <img 
                    src="/telangana-tourism-logo.svg" 
                    alt="Telangana Tourism"
                    className={`transition-all duration-300 object-contain ${
                      isScrolled ? 'h-8 w-8' : 'h-10 w-10'
                    }`}
                  />
                </span>
              </div>

              {/* Mobile Menu Toggle (Hamburger) - Visible below lg (1024px) */}
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer rounded-full p-2 text-[var(--color-brand-river)] transition-colors hover:bg-slate-100 lg:hidden focus:outline-none"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Menu Drawer - Visible below lg (1024px) */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Glass backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 top-[60px] z-[90] bg-slate-900/30 backdrop-blur-xs lg:hidden"
              />
              
              {/* Drawer Container */}
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="absolute left-0 top-full w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-2xl z-[95] overflow-hidden lg:hidden"
              >
                {/* Joint States Logo Header */}
                <div className="grid gap-3 border-b border-slate-100 px-4 py-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50/70 p-3">
                    <img src="/aptdc-logo.svg" alt="Andhra Pradesh Tourism Development Corporation" className="h-9 w-9 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Andhra Pradesh</div>
                      <div className="truncate text-xs font-extrabold text-[var(--color-brand-river)]">Official Boat Tourism</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50/70 p-3">
                    <img src="/telangana-tourism-logo.svg" alt="Telangana Tourism" className="h-9 w-9 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Telangana</div>
                      <div className="truncate text-xs font-extrabold text-[var(--color-brand-river)]">Official Tourism</div>
                    </div>
                  </div>
                </div>

                {/* Mobile Links */}
                <div className="space-y-1.5 px-4 pb-6 pt-3.5">
                  {navLinks.map((link) => {
                    const isActive = isLinkActive(link);
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        prefetch={false}
                        onClick={handleNavigate}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-extrabold transition-all ${
                          isActive
                            ? 'bg-[var(--color-brand-river)] text-white shadow-md'
                            : 'text-[var(--color-brand-river)] active:bg-slate-50/80 hover:bg-slate-50/50'
                        }`}
                      >
                        <link.icon className={`h-4.5 w-4.5 ${isActive ? 'text-[var(--color-brand-sand)]' : 'text-slate-400'}`} />
                        {link.name}
                      </Link>
                    );
                  })}

                  {/* Auth Actions in Mobile Drawer */}
                  <div className="pt-4 border-t border-slate-100 mt-4 px-1 space-y-2">
                    {!isHydrated ? (
                      <div className="w-full h-10 bg-slate-50 animate-pulse rounded-xl" />
                    ) : isAuthenticated ? (
                      <>
                        <Link 
                          href={user?.role === 'AGENT' ? "/agent/dashboard" : "/dashboard"}
                          prefetch={false}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3.5 py-2.5 text-sm font-extrabold text-[var(--color-brand-river)] hover:pl-1 transition-all"
                        >
                          <LayoutDashboard className="h-4.5 w-4.5 text-[var(--color-brand-teal)]" />
                          {user?.role === 'AGENT' ? 'Agent Dashboard' : 'User Dashboard'}
                        </Link>
                        <button 
                          onClick={() => { setIsLogoutModalOpen(true); }}
                          className="flex items-center gap-3.5 py-2.5 text-sm font-extrabold text-red-600 w-full text-left hover:pl-1 transition-all"
                        >
                          <LogOut className="h-4.5 w-4.5 text-red-500" />
                          Logout Account
                        </button>
                      </>
                    ) : (
                      <Link 
                        href="/login" 
                        prefetch={false}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3.5 py-2.5 text-sm font-extrabold text-slate-600 hover:pl-1 transition-all"
                      >
                        <User className="h-4.5 w-4.5 text-slate-400" />
                        Account Login
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
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
