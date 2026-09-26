'use client';

import Link from 'next/link';
import { Home, Ship, Hotel, Image as ImageIcon, User, ChevronLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function MobileBottomNav({ isStacked = false }: { isStacked?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const profileHref = isAuthenticated
    ? (user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'AGENT' ? '/agent/dashboard' : '/dashboard')
    : '/login';

  const isHome = pathname === '/';

  const navItems = [
    { name: 'Home',           href: '/',        icon: Home      },
    { name: 'Packages',       href: '/packages', icon: Ship      },
    { name: 'Stays',          href: '/stays',    icon: Hotel     },
    { name: 'Gallery',        href: '/gallery',  icon: ImageIcon },
    { name: isAuthenticated ? 'Account' : 'Login', href: profileHref, icon: User },
  ];

  const bottomClass = isStacked ? 'bottom-16 sm:bottom-0' : 'bottom-0';

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div
      className={`fixed ${bottomClass} left-0 right-0 z-50 border-t border-white/80 bg-white/96 px-1.5 pb-[calc(env(safe-area-inset-bottom)_+_0.45rem)] pt-1.5 shadow-[0_-14px_40px_rgba(15,61,86,0.12)] backdrop-blur-md md:hidden`}
    >
      <div className={`mx-auto grid max-w-md items-center gap-0.5 ${isHome ? 'grid-cols-5' : 'grid-cols-6'}`}>
        
        {/* Back button — only on non-home pages */}
        {!isHome && (
          <button
            onClick={handleBack}
            className="flex min-h-[3.45rem] min-w-0 flex-col items-center justify-center rounded-[1.1rem] px-0.5 py-1 text-[#0f3d56] transition-all duration-200 hover:bg-[#e9f7f7] active:scale-95"
          >
            <ChevronLeft className="mb-1 h-5 w-5 stroke-[2.5px]" />
            <span className="w-full text-center text-[8px] font-bold leading-[0.7rem] min-[380px]:text-[8.75px]">
              Back
            </span>
          </button>
        )}

        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex min-h-[3.45rem] min-w-0 flex-col items-center justify-center rounded-[1.1rem] px-0.5 py-1 transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] shadow-[inset_0_0_0_1px_rgba(26,107,122,0.08)]'
                  : 'text-slate-600 hover:text-foreground hover:bg-slate-50'
              }`}
            >
              <Icon className={`mb-1 h-5 w-5 min-[380px]:h-5.5 min-[380px]:w-5.5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className={`w-full text-center text-[8px] font-bold leading-[0.7rem] min-[380px]:text-[8.75px] ${isActive ? 'opacity-100' : 'opacity-90'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
