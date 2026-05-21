'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Ticket, LogOut, User } from 'lucide-react';
import { logout } from '@/services/authService';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

export default function AgentDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { user } = useAuthStore();

  const navItems = [
    { name: 'Dashboard Overview', href: '/agent/dashboard', icon: LayoutDashboard },
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

  return (
    <ProtectedRoute allowedRoles={['AGENT']}>
      <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col md:flex-row gap-8 min-h-[80vh]">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden sticky top-32">
            <div className="p-4 bg-[var(--color-brand-river)] text-white">
              <h2 className="text-lg font-bold">My Account</h2>
              <p className="text-sm opacity-80">Agent Portal</p>
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
        message="Are you sure you want to sign out of the Agent Portal?"
        confirmText="Logout"
        cancelText="Cancel"
        type="danger"
      />
    </ProtectedRoute>
  );
}
