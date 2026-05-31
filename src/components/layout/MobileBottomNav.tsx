'use client';

import Link from 'next/link';
import { Home, Map, BedDouble, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function MobileBottomNav({ isStacked = false }: { isStacked?: boolean }) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const profileHref = isAuthenticated 
    ? (user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'AGENT' ? '/agent/dashboard' : '/dashboard') 
    : '/login';

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Packages', href: '/packages', icon: Map },
    { name: 'Rooms', href: '/rooms', icon: BedDouble },
    { name: isAuthenticated ? 'Dashboard' : 'Login', href: profileHref, icon: User },
  ];

  const bottomClass = isStacked ? "bottom-16 sm:bottom-0" : "bottom-0";

  return (
    <div className={`fixed ${bottomClass} left-0 right-0 z-50 border-t border-white/70 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-14px_40px_rgba(15,61,86,0.12)] backdrop-blur-xl md:hidden`}>
      <div className="mx-auto grid max-w-md grid-cols-4 items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex min-h-14 min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-1.5 transition-all duration-200 ${
                isActive 
                  ? 'bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] scale-105' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-slate-50'
              }`}
            >
              <Icon className={`h-6 w-6 mb-1 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className={`w-full truncate text-center text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
