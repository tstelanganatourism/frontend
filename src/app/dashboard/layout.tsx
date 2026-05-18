'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, Ticket, LogOut } from 'lucide-react';
import { logout } from '@/services/authService';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', href: '/dashboard/profile', icon: User },
    { name: 'My Bookings', href: '/dashboard/bookings', icon: Ticket },
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

  return (
    <ProtectedRoute allowedRoles={['USER']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col md:flex-row gap-8 min-h-[80vh]">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden sticky top-32">
            <div className="p-4 bg-[var(--color-brand-river)] text-white">
              <h2 className="text-lg font-bold">My Account</h2>
              <p className="text-sm opacity-80">Tourist Portal</p>
            </div>
            <nav className="p-2 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-river)]' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-[var(--color-brand-teal)]' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
              <div className="pt-2 mt-2 border-t border-border">
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5 text-red-500" />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

      </div>

      <ConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to sign out of your account?"
        confirmText="Logout"
        cancelText="Cancel"
        type="danger"
      />
    </ProtectedRoute>
  );
}
