'use client';

import { useAuthStore } from '@/stores/authStore';
import { Ticket, History, ChevronRight, MessageCircle, Map, User } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-[var(--color-brand-river)] rounded-3xl p-8 sm:p-10 shadow-lg text-white">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-8 opacity-10">
          <Map className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
            {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Traveler'}!
          </h1>
          <p className="text-white/80 text-lg">
            Ready for your next adventure along the Godavari?
          </p>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <Link 
              href="/packages"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--color-brand-sand)] text-[var(--color-brand-river)] px-6 py-3 text-sm font-bold shadow-md hover:bg-[#e6d0a3] transition-all hover:-translate-y-0.5"
            >
              Explore New Tours
            </Link>
            <a 
              href="https://wa.me/919542069573"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-bold backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Support
            </a>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Upcoming Trips', value: '0', icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Past Trips', value: '0', icon: History, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Saved Travellers', value: '1', icon: User, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Unread Messages', value: '0', icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-border shadow-sm flex flex-col justify-between">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bookings Overview */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
          <Link href="/dashboard/bookings" className="text-sm font-bold text-[var(--color-brand-teal)] hover:underline">
            View All
          </Link>
        </div>
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-slate-50 p-4 rounded-full mb-4">
            <Ticket className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-slate-500 max-w-sm text-sm">
            You don't have any recent bookings. When you book a tour or package, your tickets and status updates will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
