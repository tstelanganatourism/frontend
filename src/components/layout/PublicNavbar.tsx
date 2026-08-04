'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpenText,
  CalendarDays,
  Camera,
  ChevronDown,
  ClipboardList,
  Home,
  Hotel,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  Phone,
  Settings,
  Ship,
  User,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { logout } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { toast } from 'sonner';



const NAV_LINKS_EN = [
  { name: 'Home', href: '/', icon: Home, path: '/' },
  { name: 'Packages', href: '/packages', icon: Ship, path: '/packages' },
  { name: 'Accommodations', href: '/stays', icon: Hotel, path: '/stays' },
  { name: 'Brochures', href: '/brochures', icon: BookOpenText, path: '/brochures' },
  { name: 'Gallery', href: '/gallery', icon: Camera, path: '/gallery' },
  { name: 'About', href: '/about', icon: Info, path: '/about' },
  { name: 'Contact', href: '/contact', icon: Phone, path: '/contact' },
];

const NAV_LINKS_TE = [
  { name: 'హోమ్', href: '/', icon: Home, path: '/' },
  { name: 'ప్యాకేజీలు', href: '/packages', icon: Ship, path: '/packages' },
  { name: 'వసతి', href: '/stays', icon: Hotel, path: '/stays' },
  { name: 'బ్రోచర్లు', href: '/brochures', icon: BookOpenText, path: '/brochures' },
  { name: 'గ్యాలరీ', href: '/gallery', icon: Camera, path: '/gallery' },
  { name: 'మా గురించి', href: '/about', icon: Info, path: '/about' },
  { name: 'సంప్రదించండి', href: '/contact', icon: Phone, path: '/contact' },
];

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const accountRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);
  const language = useLanguageStore((s) => s.language);
  const toggleLanguage = useLanguageStore((s) => s.toggleLanguage);

  const navLinks = language === 'te' ? NAV_LINKS_TE : NAV_LINKS_EN;
  const isTelugu = language === 'te';

  const isHome = pathname === '/';
  const showTransparent = isHome && !isScrolled;

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar_url]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLinks = useMemo(() => {
    const activeMap: Record<string, boolean> = {};
    navLinks.forEach((link) => {
      activeMap[link.name] = link.path === '/' ? pathname === '/' : pathname === link.path || pathname.startsWith(`${link.path}/`);
    });
    return activeMap;
  }, [pathname, navLinks]);

  const dashboardHref = user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'AGENT' ? '/agent/dashboard' : '/dashboard';

  const closeMenus = () => {
    setIsOpen(false);
    setAccountOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out. See you soon!');
      router.push('/');
      closeMenus();
    } catch {
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] w-full border-b transition-all duration-300 ${
        showTransparent 
          ? 'border-white/15 bg-gradient-to-b from-[#061826]/90 via-[#061826]/75 to-[#061826]/40 backdrop-blur-md shadow-md' 
          : 'border-slate-200/90 bg-white/95 backdrop-blur-md shadow-sm'
      }`}>


        <div className="mx-auto w-full max-w-[1800px] px-3 sm:px-5 2xl:px-8">
          <nav className="grid min-h-[72px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2.5 nav:grid-cols-[auto_minmax(0,1fr)_auto] xl:grid-cols-[auto_minmax(0,1fr)_auto]">
            <Link href="/" onClick={closeMenus} className={`flex min-w-0 items-center gap-3 rounded-xl p-1.5 transition-colors ${
              showTransparent ? 'hover:bg-white/10' : 'hover:bg-slate-50'
            }`}>
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border shadow-sm sm:h-14 sm:w-14 transition-all ${
                showTransparent ? 'border-cyan-400/40 bg-white/15 ring-2 ring-cyan-300/20' : 'border-slate-200 bg-white'
              }`}>
                <Image src="/ts-boat-tourism-logo.png" alt="TS Boat Tourism" width={48} height={48} className="h-10 w-10 object-cover rounded-full sm:h-12 sm:w-12" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className={`block truncate text-[15px] font-black tracking-tight sm:text-lg xl:text-xl transition-colors ${
                  showTransparent ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]' : 'text-[#0f3d56]'
                }`}>TS Boat Tourism</span>
                <span className={`block truncate text-[10px] font-black uppercase tracking-[0.16em] sm:text-[11px] transition-colors ${
                  showTransparent ? 'text-cyan-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'text-[#1598a1]'
                }`}>Official Booking Portal</span>
              </span>
            </Link>

            <div className="hidden min-w-0 items-center justify-center gap-0.5 nav:flex xl:gap-1.5">
              {navLinks.map((link) => {
                const isActive = activeLinks[link.name];
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    prefetch={true}
                    onClick={closeMenus}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group inline-flex h-11 items-center gap-1.5 rounded-lg px-2 text-[12px] font-extrabold transition-all xl:gap-2 xl:px-3.5 xl:text-[13.5px] 2xl:px-4 ${
                      isActive
                        ? showTransparent
                          ? 'bg-cyan-500/30 text-white border border-cyan-300/50 shadow-[0_2px_12px_rgba(0,0,0,0.3)] backdrop-blur-md'
                          : 'bg-[#0f3d56] text-white shadow-[0_10px_24px_rgba(15,61,86,0.18)]'
                        : showTransparent
                          ? 'text-white hover:bg-white/15 hover:text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]'
                          : 'text-slate-700 hover:bg-[#e9f7f7] hover:text-[#0f3d56]'
                    }`}
                  >
                    <link.icon className={`h-4 w-4 hidden xl:block transition-colors ${
                      isActive
                        ? showTransparent ? 'text-cyan-300' : 'text-[#8eecee]'
                        : showTransparent
                          ? 'text-cyan-300/80 group-hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                          : 'text-slate-400 group-hover:text-[#1598a1]'
                    }`} />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 xl:gap-2.5">
              {/* Language Toggle — Desktop */}
              <button
                onClick={toggleLanguage}
                aria-label={isTelugu ? 'Switch to English' : 'తెలుగుకు మారండి'}
                title={isTelugu ? 'Switch to English' : 'Switch to Telugu'}
                className={`hidden nav:inline-flex h-9 items-center gap-0 rounded-full border text-[11px] font-black transition-all overflow-hidden shadow-sm ${
                  showTransparent
                    ? 'border-cyan-400/50 bg-[#061826]/60 shadow-[0_4px_14px_rgba(0,0,0,0.25)] backdrop-blur-md'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <span className={`flex h-full items-center px-3 transition-colors ${
                  !isTelugu
                    ? 'bg-[#1598a1] text-white'
                    : showTransparent ? 'text-white/70 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                }`}>
                  EN
                </span>
                <span className={`flex h-full items-center px-3 font-telugu transition-colors ${
                  isTelugu
                    ? 'bg-[#1598a1] text-white'
                    : showTransparent ? 'text-white/70 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                }`}>
                  తె
                </span>
              </button>


              <div className="hidden nav:block">
                {!isHydrated ? (
                  <div className="h-10 w-24 animate-pulse rounded-md bg-slate-100" />
                ) : isAuthenticated ? (
                  <div className="relative" ref={accountRef}>
                    <button
                      onClick={() => setAccountOpen((open) => !open)}
                      className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-black transition-all ${
                        showTransparent 
                          ? 'border-cyan-400/50 bg-[#061826]/60 text-white hover:bg-cyan-500/20 shadow-[0_4px_14px_rgba(0,0,0,0.3)] backdrop-blur-md' 
                          : 'border-slate-200 bg-white text-[#0f3d56] shadow-sm hover:bg-slate-50'
                      }`}
                    >
                      <span className="relative grid h-7 w-7 place-items-center rounded-lg bg-[#1598a1] text-xs font-bold text-white shadow-xs overflow-hidden shrink-0">
                        <span className="absolute inset-0 flex items-center justify-center font-bold text-white">
                          {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                        {user?.avatar_url && (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name || 'Profile'}
                            className="absolute inset-0 h-full w-full rounded-lg object-cover z-10"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        )}
                      </span>
                      <span className="max-w-[90px] truncate">{user?.full_name?.split(' ')[0] || 'Account'}</span>
                      <ChevronDown className="h-4 w-4 text-cyan-300" />
                    </button>

                    <AnimatePresence>
                      {accountOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,35,58,0.16)]"
                        >
                          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 flex items-center gap-3">
                            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-[#1598a1] text-sm font-bold text-white shadow-xs overflow-hidden shrink-0">
                              <span className="absolute inset-0 flex items-center justify-center font-bold text-white">
                                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                              </span>
                              {user?.avatar_url && (
                                <img
                                  src={user.avatar_url}
                                  alt={user.full_name || 'Profile'}
                                  className="absolute inset-0 h-full w-full rounded-xl object-cover z-10"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-black text-slate-900">{user?.full_name}</p>
                              <p className="truncate text-xs font-semibold text-slate-500">{user?.email}</p>
                            </div>
                          </div>
                          <AccountLinks userRole={user?.role} onNavigate={closeMenus} />
                          <div className="border-t border-slate-100 p-1.5">
                            <button
                              onClick={() => {
                                setAccountOpen(false);
                                setIsLogoutModalOpen(true);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-black text-red-600 transition-colors hover:bg-red-50"
                            >
                              <LogOut className="h-4 w-4" />
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link href="/login" onClick={closeMenus} className={`flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-black transition-all ${
                    showTransparent 
                      ? 'border-cyan-400/50 bg-[#061826]/60 text-white hover:bg-cyan-500/25 shadow-[0_4px_14px_rgba(0,0,0,0.35)] backdrop-blur-md' 
                      : 'border-slate-200 bg-white text-[#0f3d56] shadow-sm hover:bg-slate-50'
                  }`}>
                    <User className="h-4 w-4 text-cyan-300" />
                    Login
                  </Link>
                )}
              </div>

              <Link href="/packages" onClick={closeMenus} className={`hidden h-11 items-center rounded-xl bg-gradient-to-r from-[#1598a1] via-[#117f87] to-[#0d6e75] px-5 text-sm font-black text-white transition-all hover:scale-[1.03] active:scale-[0.97] nav:inline-flex border border-cyan-300/30 ${isTelugu ? 'font-telugu' : ''} ${
                showTransparent ? 'shadow-[0_4px_20px_rgba(21,152,161,0.45)]' : 'shadow-[0_8px_24px_rgba(21,152,161,0.3)]'
              }`}>
                {isTelugu ? 'ఆన్‌లైన్ బుక్ చేయండి' : 'Book Online'}
              </Link>

              <button
                onClick={() => setIsOpen((open) => !open)}
                className={`grid h-11 w-11 place-items-center rounded-xl text-white transition-colors nav:hidden ${
                  showTransparent ? 'bg-white/20 hover:bg-white/30 border border-white/20' : 'bg-[#0f3d56] shadow-sm'
                }`}
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[110] bg-[#071923]/55 backdrop-blur-sm nav:hidden"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 34 }}
              className="fixed bottom-0 right-0 top-0 z-[120] flex w-[min(100%,25rem)] flex-col overflow-hidden bg-white shadow-[0_0_70px_rgba(8,20,30,0.26)] nav:hidden"
            >
              <div className="border-b border-slate-100 bg-[#f4faf9] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Image src="/ts-boat-tourism-logo.png" alt="TS Boat Tourism" width={44} height={44} className="h-11 w-11 rounded-full border border-slate-200 bg-white object-cover p-0.5 shadow-sm" />
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-[#0f3d56]">TS Boat Tourism</p>
                      <p className="truncate text-[10px] font-black uppercase tracking-[0.15em] text-[#1598a1]">Official Portal</p>
                    </div>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="grid h-10 w-10 place-items-center rounded-md bg-white text-slate-700 shadow-sm" aria-label="Close menu">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4 py-3">
                <div className="grid grid-cols-2 gap-2">
                  {navLinks.map((link) => {
                    const isActive = activeLinks[link.name];
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={closeMenus}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex min-h-16 flex-col items-start justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-black transition-colors ${
                          isActive ? 'border-[#0f3d56] bg-[#0f3d56] text-white' : 'border-slate-100 bg-white text-[#0f3d56] hover:bg-[#f4faf9]'
                        }`}
                      >
                        <span className={`grid h-8 w-8 place-items-center rounded-md ${isActive ? 'bg-white/12 text-[#8eecee]' : 'bg-[#eef8f8] text-[#1598a1]'}`}>
                          <link.icon className="h-4.5 w-4.5" />
                        </span>
                        {link.name}
                      </Link>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                  <Link href="/packages" onClick={closeMenus} className={`flex min-h-12 items-center justify-center rounded-md bg-[#1598a1] px-4 text-sm font-black text-white shadow-[0_12px_28px_rgba(21,152,161,0.18)] ${isTelugu ? 'font-telugu' : ''}`}>
                    {isTelugu ? 'ఆన్‌లైన్ బుక్' : 'Book Online'}
                  </Link>
                  <a href="tel:+919951369573" className={`flex min-h-12 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-[#0f3d56] ${isTelugu ? 'font-telugu' : ''}`}>
                    <Phone className="h-4 w-4 text-[#1598a1]" />
                    {isTelugu ? 'కాల్ చేయండి' : 'Call to Book'}
                  </a>
                </div>

                {/* Language Toggle — Mobile */}
                <div className="border-t border-slate-100 pt-3">
                  <button
                    onClick={toggleLanguage}
                    className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-black text-[#0f3d56] transition-colors hover:bg-[#eef8f8]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">🌐</span>
                      <span>{isTelugu ? 'Language / భాష' : 'Language / భాష'}</span>
                    </span>
                    <span className="flex items-center gap-0 overflow-hidden rounded-full border border-slate-200">
                      <span className={`px-2.5 py-1 text-xs font-black transition-colors ${ !isTelugu ? 'bg-[#1598a1] text-white' : 'text-slate-400'}`}>EN</span>
                      <span className={`px-2.5 py-1 text-xs font-black font-telugu transition-colors ${ isTelugu ? 'bg-[#1598a1] text-white' : 'text-slate-400'}`}>తె</span>
                    </span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  {!isHydrated ? (
                    <div className="h-12 animate-pulse rounded-md bg-slate-100" />
                  ) : isAuthenticated ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Link href={dashboardHref} prefetch={false} onClick={closeMenus} className="flex min-h-12 items-center gap-3 rounded-md bg-[#eef8f8] px-3 text-sm font-black text-[#0f3d56]">
                        <LayoutDashboard className="h-4.5 w-4.5 text-[#1598a1]" />
                        Dashboard
                      </Link>
                      <button onClick={() => setIsLogoutModalOpen(true)} className="flex min-h-12 items-center gap-3 rounded-md bg-red-50 px-3 text-left text-sm font-black text-red-600">
                        <LogOut className="h-4.5 w-4.5" />
                        Logout Account
                      </button>
                    </div>
                  ) : (
                    <Link href="/login" onClick={closeMenus} className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#0f3d56] px-4 text-sm font-black text-white">
                      <User className="h-4 w-4 text-[#8eecee]" />
                      Account Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

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

function AccountLinks({ userRole, onNavigate }: { userRole?: string; onNavigate: () => void }) {
  if (userRole === 'ADMIN') {
    return (
      <div className="grid gap-0.5 p-1.5">
        <DropdownLink href="/admin/dashboard" icon={LayoutDashboard} label="Admin Dashboard" onNavigate={onNavigate} />
        <DropdownLink href="/admin/bookings" icon={CalendarDays} label="Bookings" onNavigate={onNavigate} />
        <DropdownLink href="/admin/inventory" icon={ClipboardList} label="Inventory" onNavigate={onNavigate} />
        <DropdownLink href="/admin/settings" icon={Settings} label="System Settings" onNavigate={onNavigate} />
      </div>
    );
  }

  if (userRole === 'AGENT') {
    return (
      <div className="grid gap-0.5 p-1.5">
        <DropdownLink href="/agent/dashboard" icon={LayoutDashboard} label="Agent Dashboard" onNavigate={onNavigate} />
        <DropdownLink href="/agent/dashboard/bookings" icon={Ship} label="Customer Bookings" onNavigate={onNavigate} />
        <DropdownLink href="/dashboard/profile" icon={User} label="Agent Profile" onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="grid gap-0.5 p-1.5">
      <DropdownLink href="/dashboard" icon={LayoutDashboard} label="Dashboard Overview" onNavigate={onNavigate} />
      <DropdownLink href="/dashboard/bookings" icon={Ship} label="My Bookings" onNavigate={onNavigate} />
      <DropdownLink href="/dashboard/profile" icon={User} label="My Profile" onNavigate={onNavigate} />
    </div>
  );
}

function DropdownLink({
  href,
  icon: Icon,
  label,
  onNavigate,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <Link href={href} prefetch={false} onClick={onNavigate} className="flex items-center gap-2 rounded-md px-3 py-2.5 text-xs font-black text-slate-700 transition-colors hover:bg-[#eef8f8] hover:text-[#0f3d56]">
      <Icon className="h-4 w-4 text-[#1598a1]" />
      {label}
    </Link>
  );
}
