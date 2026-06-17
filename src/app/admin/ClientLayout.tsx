'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Map, 
  Bed, 
  CalendarDays,
  Ticket, 
  Tag, 
  Users, 
  User,
  Settings, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck,
  ChevronRight,
  Globe,
  AlertTriangle,
  Truck
} from 'lucide-react';
import { logout } from '@/services/authService';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Tours & Packages', href: '/admin/packages', icon: Map },
  { name: 'Hotels & Rooms', href: '/admin/rooms', icon: Bed },
  { name: 'Inventory', href: '/admin/inventory', icon: CalendarDays },
  { name: 'Bookings', href: '/admin/bookings', icon: Ticket },
  { name: 'Transport Planning', href: '/admin/transport', icon: Truck },
  { name: 'Cancellations', href: '/admin/cancellations', icon: AlertTriangle },
  { name: 'Postponements', href: '/admin/postpones', icon: CalendarDays },
  { name: 'Coupons', href: '/admin/coupons', icon: Tag },
  { name: 'Agents', href: '/admin/agents', icon: Users },
  { name: 'Users', href: '/admin/users', icon: User },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'View Website', href: '/', icon: Globe },
];


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/admin/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard';
    
    if (segments.includes('edit')) {
      const parent = segments[segments.indexOf('edit') - 1];
      const type = parent === 'rooms' ? 'Room' : 'Package';
      return `Edit ${type}`;
    }
    
    if (segments.includes('create')) {
      const parent = segments[segments.indexOf('create') - 1];
      const type = parent === 'rooms' ? 'Room' : 'Package';
      return `Create ${type}`;
    }

    const lastSegment = segments[segments.length - 1];
    if (/^\d+$/.test(lastSegment)) {
      return 'Details';
    }

    return lastSegment.replace('-', ' ');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }


  return (
    <ProtectedRoute allowedRoles={['ADMIN']} fallbackUrl="/admin/login">
      <div className="min-h-screen bg-[#f8fafc]">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 z-50 h-screen w-72 bg-slate-900 text-white transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-full flex-col">
            
            {/* Logo Area */}
            <div className="flex h-20 items-center border-b border-white/10 px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[#5ac4d7] text-slate-900 font-bold">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <ShieldCheck className="h-6 w-6" />
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-base font-black tracking-tight">{user?.full_name || 'Admin'}</h1>
                  <p className="text-[10px] uppercase tracking-widest text-white/40">Control Center</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {navItems.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                const Icon = item.icon;
                if (item.name === 'View Website') {
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all text-white/60 hover:bg-white/5 hover:text-white"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-white/40" />
                        {item.name}
                      </div>
                    </a>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-[#5ac4d7] text-slate-900 shadow-lg shadow-[#5ac4d7]/20' 
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${isActive ? 'text-slate-900' : 'text-white/40'}`} />
                      {item.name}
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </Link>
                );
              })}
            </nav>

            {/* User Footer */}
            <div className="border-t border-white/10 p-4">
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Logout Session
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="lg:pl-72">
          
          {/* Top Header */}
          <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h2 className="text-sm font-medium text-slate-500">Welcome back, {user?.full_name || 'Admin'}</h2>
                <p className="text-lg font-bold text-slate-900 capitalize">
                  {getPageTitle()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a 
                href="/" 
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-55 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 shadow-sm transition-all hover:scale-105"
              >
                <Globe className="h-4 w-4 text-[#5ac4d7]" />
                View Website
              </a>
              <div className="hidden sm:flex h-10 items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-600">System Live</span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 sm:p-8">
            {children}
          </main>
        </div>

      </div>

      <ConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Logout Confirmation"
        message="Are you sure you want to exit the admin control panel?"
        confirmText="Logout Now"
        cancelText="Stay Here"
        type="danger"
      />
    </ProtectedRoute>
  );
}
