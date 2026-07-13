'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User, Home, Ship, BedDouble, Camera, Image as ImageIcon, Info, LogOut, LayoutDashboard, ChevronDown, Settings, FileText, CalendarDays, ClipboardList, Star } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { logout } from '@/services/authService';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const LiveBookingCount = dynamic(() => import('./LiveBookingCount'), { 
  ssr: false, 
  loading: () => <div className="hidden h-9 w-24 animate-pulse rounded-full bg-slate-100 lg:flex" /> 
});
const navLinks = [
  { name: 'Home', href: '/', icon: Home, path: '/' },
  { name: 'Boat Rides', href: '/boat-rides', icon: Ship, path: '/boat-rides' },
  { name: 'Sightseeing', href: '/sightseeing', icon: Camera, path: '/sightseeing' },
  { name: 'Accommodation', href: '/stays', icon: BedDouble, path: '/stays' },
  { name: 'Brochures', href: '/brochures', icon: FileText, path: '/brochures' },
  { name: 'Gallery', href: '/gallery', icon: ImageIcon, path: '/gallery' },
  { name: 'About Us', href: '/about', icon: Info, path: '/about' },
];

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isCurrentlyScrolled = window.scrollY > 15;
          setIsScrolled(prev => {
            if (prev !== isCurrentlyScrolled) return isCurrentlyScrolled;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeLinks = React.useMemo(() => {
    const activeMap: Record<string, boolean> = {};
    navLinks.forEach((link) => {
      if (link.path === '/') {
        activeMap[link.name] = pathname === '/';
      } else {
        activeMap[link.name] = pathname === link.path || pathname.startsWith(`${link.path}/`);
      }
    });
    return activeMap;
  }, [pathname]);

  const primaryLinks = React.useMemo(() => navLinks.slice(0, 3), []);
  const secondaryLinks = React.useMemo(() => navLinks.slice(3), []);
  const isSecondaryActive = React.useMemo(() => secondaryLinks.some(link => activeLinks[link.name]), [activeLinks, secondaryLinks]);

  const handleNavigate = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out. See you soon!');
      router.push('/');
      setIsOpen(false);
    } catch {
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-[100] w-full transition-all duration-300 ease-in-out border-b ${isScrolled
          ? 'py-1.5 bg-white/90 backdrop-blur-md shadow-[0_12px_30px_-5px_rgba(15,61,86,0.08)] border-[#d9e6ea]/60'
          : 'py-2 bg-white/95 backdrop-blur-md shadow-[0_4px_20px_-10px_rgba(15,61,86,0.04)] border-[#d9e6ea]/30 sm:py-2.5'
          }`}
      >
        <div className="w-full px-2.5 xs:px-3 sm:px-5 nav:px-6 xl:px-8">
          <div className="flex min-w-0 items-center justify-between gap-1.5 xs:gap-2 nav:gap-2 xl:gap-4 2xl:gap-6">

            {/* Logo Section (Left) */}
            <div className="flex min-w-0 flex-1 items-center nav:flex-none nav:flex-shrink-0">
              <Link 
                href="/" 
                className="group flex min-w-0 items-center gap-2 rounded-xl p-1 transition-all duration-500 hover:bg-gradient-to-r hover:from-slate-50/90 hover:to-teal-50/30 hover:shadow-[0_4px_20px_-8px_rgba(15,61,86,0.08)] active:scale-[0.98] sm:gap-3 sm:rounded-2xl sm:p-1.5 nav:hover:scale-[1.02]"
              >
                <span className={`relative grid shrink-0 place-items-center rounded-full bg-white shadow-[0_8px_20px_rgba(15,61,86,0.08)] ring-1 ring-slate-100/80 transition-all duration-500 group-hover:ring-[var(--color-brand-teal)]/30 group-hover:shadow-[0_0_24px_rgba(26,107,122,0.18)] h-11 w-11 sm:h-[54px] sm:w-[54px] ${
                  isScrolled ? 'scale-90' : 'scale-100'
                }`}>
                  <img
                    src="/telangana-tourism-logo.svg"
                    alt="Telangana Boat Tourism"
                    width={46}
                    height={46}
                    className="transition-all duration-500 object-contain group-hover:scale-105 h-9 w-9 sm:h-[46px] sm:w-[46px]"
                  />
                  {/* Subtle pulsing background glow behind logo */}
                  <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-teal-400/10 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5 leading-[1.12] transition-all duration-300 sm:leading-[1.15]">
                  <span className="block truncate text-[9px] font-black uppercase tracking-[0.04em] font-outfit text-slate-500 transition-all duration-300 group-hover:translate-x-0.5 xs:text-[9.5px] sm:text-[11.5px] sm:tracking-[0.06em]">
                    <span className="bg-gradient-to-r from-[var(--color-brand-teal)] to-emerald-600 bg-clip-text text-transparent font-extrabold">Telangana</span> Boat Tourism
                  </span>
                  <span className="block truncate whitespace-nowrap text-[10.5px] font-bold font-telugu tracking-wide text-slate-800 group-hover:text-[var(--color-brand-teal)] transition-colors duration-300 xs:text-[11px] sm:text-[13px]">
                    తెలంగాణ బోట్ టూరిజం
                  </span>
                  <span className="hidden truncate text-[11px] font-semibold font-urdu text-slate-600 group-hover:text-emerald-700 transition-colors duration-300 tracking-wide mt-[-1px] mb-[-1px] sm:block sm:text-[14px]" dir="rtl">
                    تلنگانہ بوٹ ٹورزم
                  </span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation (Center) - Visible from lg (1024px) */}
            <div className="hidden min-w-0 flex-1 justify-center nav:flex nav:px-1 xl:px-2 2xl:px-4">
              <div className="relative flex min-w-0 items-center gap-0 2xl:gap-0.5 py-1">
                {/* Primary Links: Always visible in desktop layout */}
                {primaryLinks.map((link, index) => {
                  const isActive = activeLinks[link.name];
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={handleNavigate}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      aria-current={isActive ? 'page' : undefined}
                      className="relative inline-flex h-9 items-center justify-center rounded-full nav:px-1.5 nav:text-[10px] xl:px-2.5 xl:text-[11.5px] 2xl:px-3.5 2xl:text-[13px] font-extrabold transition-colors duration-200"
                      style={{ color: isActive ? '#ffffff' : 'var(--color-brand-river)' }}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeNavBackground"
                          className="absolute inset-0 rounded-full bg-[var(--color-brand-river)] shadow-[0_6px_16px_rgba(15,61,86,0.18)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}

                      <AnimatePresence>
                        {hoveredIndex === index && !isActive && (
                          <motion.span
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

                {/* Secondary Links: Render directly only on 2xl screens (1536px+) */}
                {/* Secondary Links: Render directly when there is space, based on viewport breakpoints */}
                {secondaryLinks.map((link, index) => {
                  const actualIndex = primaryLinks.length + index;
                  const isActive = activeLinks[link.name];

                  // Progressive display breakpoints to prevent overlap
                  let responsiveClass = "min-[1850px]:inline-flex";
                  if (link.name === 'Accommodation') responsiveClass = "min-[1550px]:inline-flex";
                  else if (link.name === 'Brochures') responsiveClass = "min-[1650px]:inline-flex";
                  else if (link.name === 'Gallery') responsiveClass = "min-[1750px]:inline-flex";

                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={handleNavigate}
                      onMouseEnter={() => setHoveredIndex(actualIndex)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`relative hidden h-9 items-center justify-center rounded-full ${responsiveClass} nav:px-1.5 nav:text-[10px] xl:px-2.5 xl:text-[11.5px] 2xl:px-3.5 2xl:text-[13px] font-extrabold transition-colors duration-200`}
                      style={{ color: isActive ? '#ffffff' : 'var(--color-brand-river)' }}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeNavBackground"
                          className="absolute inset-0 rounded-full bg-[var(--color-brand-river)] shadow-[0_6px_16px_rgba(15,61,86,0.18)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}

                      <AnimatePresence>
                        {hoveredIndex === actualIndex && !isActive && (
                          <motion.span
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

                {/* 'More' dropdown for secondary links: visible on screens below 1850px */}
                <div className="relative inline-flex min-[1850px]:hidden" ref={moreRef}>
                  <button
                    onClick={() => setMoreOpen(!moreOpen)}
                    onMouseEnter={() => setHoveredIndex(99)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="relative inline-flex h-9 items-center justify-center rounded-full nav:px-2.5 nav:text-[10px] xl:px-3.5 xl:text-[11.5px] font-extrabold transition-colors duration-200 cursor-pointer"
                    style={{ color: isSecondaryActive ? '#ffffff' : 'var(--color-brand-river)' }}
                  >
                    {isSecondaryActive && (
                      <motion.span
                        layoutId="activeNavBackground"
                        className="absolute inset-0 rounded-full bg-[var(--color-brand-river)] shadow-[0_6px_16px_rgba(15,61,86,0.18)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    <AnimatePresence>
                      {hoveredIndex === 99 && !isSecondaryActive && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute inset-0 rounded-full bg-slate-100/90 z-[-1] border border-slate-200/50 shadow-sm"
                          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        />
                      )}
                    </AnimatePresence>

                    <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap select-none">
                      More <ChevronDown className="h-3 w-3 opacity-80" />
                    </span>
                  </button>

                  <AnimatePresence>
                    {moreOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute left-1/2 -translate-x-1/2 mt-10 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden py-1.5"
                      >
                        {secondaryLinks.map((link) => {
                          const isLinkActive = activeLinks[link.name];

                          // Hide dropdown item dynamically when it becomes visible in the main navbar
                          let dropdownHiddenClass = "min-[1850px]:hidden";
                          if (link.name === 'Accommodation') dropdownHiddenClass = "min-[1550px]:hidden";
                          else if (link.name === 'Brochures') dropdownHiddenClass = "min-[1650px]:hidden";
                          else if (link.name === 'Gallery') dropdownHiddenClass = "min-[1750px]:hidden";

                          return (
                            <Link
                              key={link.name}
                              href={link.href}
                              onClick={() => { setMoreOpen(false); handleNavigate(); }}
                              className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-extrabold transition-colors ${dropdownHiddenClass} ${
                                isLinkActive 
                                  ? 'bg-slate-50 text-[var(--color-brand-teal)]' 
                                  : 'text-slate-700 hover:bg-slate-50 hover:text-[var(--color-brand-teal)]'
                              }`}
                            >
                              <link.icon className={`h-4 w-4 shrink-0 ${isLinkActive ? 'text-[var(--color-brand-teal)]' : 'text-slate-400'}`} />
                              {link.name}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Action Buttons & Right Side Logos (Right) */}
            <div className="flex shrink-0 items-center justify-end gap-1 xs:gap-1.5 nav:gap-1.5 xl:gap-2.5 2xl:gap-3">
              {/* Auth / Account */}
              <div className="hidden min-w-[90px] justify-end nav:flex">
                {!isHydrated ? (
                  <div className="h-9 w-20 animate-pulse rounded-full bg-slate-100" />
                ) : isAuthenticated ? (
                  <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 md:pr-2.5 transition-all hover:bg-slate-50 hover:border-slate-350 hover:shadow-md active:scale-[0.98] shadow-sm"
                  >
                    <div className="h-7 w-7 rounded-full bg-[#0f3d56] flex items-center justify-center text-white text-xs font-black overflow-hidden shadow-inner ring-2 ring-slate-100 select-none">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <span className="leading-none transform -translate-y-[0.5px]">
                          {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <span className="hidden md:flex text-[11.5px] xl:text-[13px] font-outfit font-black text-slate-700 max-w-[65px] xl:max-w-[90px] truncate select-none leading-none items-center ml-1.5">
                      {user?.full_name?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown className="hidden md:block h-3.5 w-3.5 text-slate-400 transition-transform duration-300 shrink-0 nav:ml-0.5 ml-0.5" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <>
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
                                  href="/admin/bookings"
                                  prefetch={false}
                                  onClick={() => { setDropdownOpen(false); handleNavigate(); }}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 hover:text-[var(--color-brand-teal)] rounded-xl transition-colors"
                                >
                                  <CalendarDays className="h-4 w-4 text-slate-400" />
                                  Bookings
                                </Link>
                                <Link
                                  href="/admin/inventory"
                                  prefetch={false}
                                  onClick={() => { setDropdownOpen(false); handleNavigate(); }}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 hover:text-[var(--color-brand-teal)] rounded-xl transition-colors"
                                >
                                  <ClipboardList className="h-4 w-4 text-slate-400" />
                                  Inventory
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
                                  Customer Bookings
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
                  onClick={handleNavigate}
                  className="flex items-center gap-1 rounded-full px-1.5 text-[10.5px] xl:px-2.5 xl:text-xs 2xl:px-4 font-extrabold text-[var(--color-brand-river)] transition-colors hover:bg-slate-50/80"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">Login</span>
                </Link>
              )}
              </div>
              
              {/* Write a Review Button */}
              <a
                href="https://search.google.com/local/writereview?placeid=ChIJz2qgCkOpNjoRyQkNHviubME"
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-1 rounded-full border border-amber-200 bg-amber-50/40 px-2.5 py-1.5 text-[10.5px] font-bold text-amber-800 transition-all hover:bg-amber-100 hover:border-amber-300 hover:shadow-sm active:scale-[0.98] nav:inline-flex xl:px-3"
              >
                <span className="text-amber-500 leading-none">★</span> Write a Review
              </a>

              {/* Mobile Write a Review Button (Minimal) */}
              <a
                href="https://search.google.com/local/writereview?placeid=ChIJz2qgCkOpNjoRyQkNHviubME"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95 nav:hidden ml-1 sm:ml-2"
                aria-label="Write a Google Review"
              >
                <Star className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] font-extrabold uppercase tracking-wide">Review</span>
              </a>

              {/* Live Booking Count */}
              <LiveBookingCount />

              {/* Book Now Action Button */}
              <Link
                href="/boat-rides"
                onClick={handleNavigate}
                className="relative hidden overflow-hidden rounded-full bg-[var(--color-brand-river)] nav:px-3.5 nav:py-1.5 nav:text-[10.5px] xl:px-4.5 xl:py-2 xl:text-[11.5px] 2xl:px-5 2xl:text-xs font-black text-white shadow-[0_8px_20px_rgba(15,61,86,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(15,61,86,0.25)] hover:bg-[#154652] active:translate-y-0 nav:inline-flex group/btn"
              >
                Book Now
              </Link>

              {/* Andhra Pradesh Tourism Logo (Right) */}
              <Link 
                href="/boat-rides" 
                className="group hidden items-center gap-3 rounded-2xl p-1.5 transition-all duration-500 hover:bg-gradient-to-l hover:from-slate-50/90 hover:to-amber-50/30 hover:shadow-[0_4px_20px_-8px_rgba(15,61,86,0.08)] hover:scale-[1.02] active:scale-[0.98] xl:flex"
              >
                <span className="hidden text-right flex-col gap-0.5 leading-[1.15] transition-all duration-300 xl:flex">
                  <span className="block text-[10px] sm:text-[11.5px] font-black uppercase tracking-[0.06em] font-outfit text-slate-500 transition-all duration-300 group-hover:-translate-x-0.5">
                    <span className="bg-gradient-to-l from-[#E0A92C] to-amber-600 bg-clip-text text-transparent font-extrabold">Andhra Pradesh</span> Boat Tourism
                  </span>
                  <span className="block whitespace-nowrap text-[11px] sm:text-[13px] font-bold font-telugu tracking-wide text-slate-800 group-hover:text-[#E0A92C] transition-colors duration-300">
                    ఆంధ్రప్రదేశ్ బోట్ టూరిజం
                  </span>
                  <span className="block text-[12px] sm:text-[14px] font-semibold font-urdu text-slate-600 group-hover:text-amber-700 transition-colors duration-300 tracking-wide mt-[-1px] mb-[-1px]" dir="rtl">
                    آندھرا پردیش بوٹ ٹورزم
                  </span>
                </span>
                <span className={`relative grid shrink-0 place-items-center rounded-full bg-white shadow-[0_8px_20px_rgba(15,61,86,0.08)] ring-1 ring-slate-100/80 transition-all duration-500 group-hover:ring-[#E0A92C]/30 group-hover:shadow-[0_0_24px_rgba(224,169,44,0.18)] h-11 w-11 sm:h-[54px] sm:w-[54px] ${
                  isScrolled ? 'scale-90' : 'scale-100'
                }`}>
                  <img
                    src="/aptdc-logo.svg"
                    alt="Andhra Pradesh Boat Tourism"
                    width={46}
                    height={46}
                    className="transition-all duration-500 object-contain group-hover:scale-105 h-9 w-9 sm:h-[46px] sm:w-[46px]"
                  />
                  {/* Subtle pulsing background glow behind logo */}
                  <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-tl from-amber-400/10 to-orange-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                </span>
              </Link>

              {/* Mobile Menu Toggle (Hamburger) - Visible below lg (1024px) */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full text-[var(--color-brand-river)] transition-colors hover:bg-slate-100 nav:hidden focus:outline-none"
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
              {/* Mobile backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[90] bg-slate-950/45 nav:hidden"
              />

              {/* Drawer Container */}
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="absolute left-2 right-2 top-[calc(100%_+_0.5rem)] z-[95] max-h-[calc(100dvh_-_7.5rem)] overflow-y-auto rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,61,86,0.24)] nav:hidden"
              >
                {/* Joint States Logo Header */}
                <div className="grid gap-2.5 border-b border-slate-100 bg-[linear-gradient(180deg,#f8fbfb,white)] px-3 py-3 xs-menu:grid-cols-2 xs-menu:px-4">
                  <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-sm">
                    <img src="/telangana-tourism-logo.svg" alt="Telangana Tourism" width={36} height={36} className="h-9 w-9 shrink-0 rounded-full bg-white object-contain p-0.5 shadow-sm" />
                    <div className="min-w-0 flex flex-col gap-0.5 leading-tight">
                      <div className="text-[8px] font-black uppercase tracking-wider font-outfit text-slate-500">
                        <span className="text-[var(--color-brand-teal)] font-black">Telangana</span> Boat Tourism
                      </div>
                      <div className="truncate text-[11px] font-bold font-telugu text-slate-800">తెలంగాణ బోట్ టూరిజం</div>
                      <div className="text-[12px] font-semibold font-urdu text-slate-600 leading-normal" dir="rtl">تلنگانہ بوٹ ٹورزم</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-sm">
                    <img src="/aptdc-logo.svg" alt="Andhra Pradesh Tourism Development Corporation" width={36} height={36} className="h-9 w-9 shrink-0 rounded-full bg-white object-contain p-0.5 shadow-sm" />
                    <div className="min-w-0 flex flex-col gap-0.5 leading-tight">
                      <div className="text-[8px] font-black uppercase tracking-wider font-outfit text-slate-500">
                        <span className="text-[#E0A92C] font-black">Andhra Pradesh</span> Boat Tourism
                      </div>
                      <div className="truncate text-[11px] font-bold font-telugu text-slate-800">ఆంధ్రప్రదేశ్ బోట్ టూరిజం</div>
                      <div className="text-[12px] font-semibold font-urdu text-slate-600 leading-normal" dir="rtl">آندھرا پردیش بوٹ ٹورزم</div>
                    </div>
                  </div>
                </div>

                {/* Mobile Links */}
                <div className="grid grid-cols-2 gap-2 px-3 pb-4 pt-3.5">
                  {navLinks.map((link) => {
                    const isActive = activeLinks[link.name];
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={handleNavigate}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex min-h-12 items-center gap-3 rounded-2xl border px-3 py-2.5 text-[13px] font-extrabold transition-all ${isActive
                          ? 'border-[var(--color-brand-river)] bg-[var(--color-brand-river)] text-white shadow-[0_10px_22px_rgba(15,61,86,0.18)]'
                          : 'border-slate-100 bg-slate-50/75 text-[var(--color-brand-river)] active:bg-teal-50 hover:bg-teal-50'
                          }`}
                      >
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${isActive ? 'bg-white/12 text-[var(--color-brand-sand)]' : 'bg-white text-slate-400 shadow-sm'}`}>
                          <link.icon className="h-4.5 w-4.5" />
                        </span>
                        <span className="min-w-0 truncate">{link.name}</span>
                      </Link>
                    );
                  })}

                  {/* Google Reviews Mobile CTA */}
                  <a
                    href="https://search.google.com/local/writereview?placeid=ChIJz2qgCkOpNjoRyQkNHviubME"
                    target="_blank"
                    rel="noreferrer"
                    className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-amber-250 bg-amber-55/40 px-4 py-2.5 text-xs font-extrabold text-amber-800 transition-all hover:bg-amber-100/70 active:scale-[0.99] select-none"
                  >
                    <span className="text-amber-500 text-xs tracking-wider">★★★★★</span>
                    Write a Review on Google
                  </a>

                  {/* Auth Actions in Mobile Drawer */}
                  <div className="col-span-2 mt-1 border-t border-slate-100 pt-3">
                    {!isHydrated ? (
                      <div className="w-full h-10 bg-slate-50 animate-pulse rounded-xl" />
                    ) : isAuthenticated ? (
                      <div className="grid gap-2">
                        <Link
                          href={user?.role === 'ADMIN' ? "/admin/dashboard" : user?.role === 'AGENT' ? "/agent/dashboard" : "/dashboard"}
                          prefetch={false}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 rounded-2xl bg-teal-50 px-3 py-2.5 text-sm font-extrabold text-[var(--color-brand-river)] transition-all hover:bg-teal-100"
                        >
                          <LayoutDashboard className="h-4.5 w-4.5 text-[var(--color-brand-teal)]" />
                          {user?.role === 'ADMIN' ? 'Admin Dashboard' : user?.role === 'AGENT' ? 'Agent Dashboard' : 'User Dashboard'}
                        </Link>
                        {user?.role === 'ADMIN' && (
                          <>
                            <Link
                              href="/admin/bookings"
                              prefetch={false}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 rounded-2xl bg-teal-50 px-3 py-2.5 text-sm font-extrabold text-[var(--color-brand-river)] transition-all hover:bg-teal-100"
                            >
                              <CalendarDays className="h-4.5 w-4.5 text-[var(--color-brand-teal)]" />
                              Bookings
                            </Link>
                            <Link
                              href="/admin/inventory"
                              prefetch={false}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 rounded-2xl bg-teal-50 px-3 py-2.5 text-sm font-extrabold text-[var(--color-brand-river)] transition-all hover:bg-teal-100"
                            >
                              <ClipboardList className="h-4.5 w-4.5 text-[var(--color-brand-teal)]" />
                              Inventory
                            </Link>
                          </>
                        )}
                        <button
                          onClick={() => { setIsLogoutModalOpen(true); }}
                          className="flex w-full items-center gap-3 rounded-2xl bg-red-50 px-3 py-2.5 text-left text-sm font-extrabold text-red-600 transition-all hover:bg-red-100"
                        >
                          <LogOut className="h-4.5 w-4.5 text-red-500" />
                          Logout Account
                        </button>
                      </div>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-3 rounded-2xl bg-[var(--color-brand-river)] px-4 py-3 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(15,61,86,0.18)] transition-all hover:bg-[#154652]"
                      >
                        <User className="h-4.5 w-4.5 text-white/82" />
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
