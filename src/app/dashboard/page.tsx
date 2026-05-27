'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { 
  Ticket, 
  History, 
  ChevronRight, 
  MessageCircle, 
  Map, 
  User, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Loader2 
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

interface DashboardSummary {
  booking_count: number;
  past_trips: number;
  upcoming_trips: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [summaryRes, bookingsRes] = await Promise.all([
          apiClient.get<DashboardSummary>('/api/v1/bookings/user/dashboard-summary'),
          apiClient.get<any[]>('/api/v1/bookings/user/bookings')
        ]);
        setSummary(summaryRes.data);
        setRecentBookings(bookingsRes.data.slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

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
      {loading ? (
        <div className="flex h-32 items-center justify-center bg-white rounded-2xl border border-border">
          <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Upcoming Trips', value: summary?.upcoming_trips || '0', icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Past Trips', value: summary?.past_trips || '0', icon: History, color: 'text-slate-600', bg: 'bg-slate-50' },
            { label: 'Total Bookings', value: summary?.booking_count || '0', icon: User, color: 'text-purple-600', bg: 'bg-purple-50' },
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
      )}

      {/* Bookings Overview */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">Recent Activity</h2>
          <Link href="/dashboard/bookings" className="text-xs font-bold text-[var(--color-brand-teal)] hover:underline uppercase tracking-wider">
            View All
          </Link>
        </div>
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          </div>
        ) : recentBookings.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentBookings.map((b) => (
              <div key={b.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">{b.public_id}</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      b.status === 'FULLY_PAID' || b.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' :
                      b.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {b.status === 'FULLY_PAID' || b.status === 'CONFIRMED' ? 'Confirmed' : b.status === 'PENDING' ? 'Pending' : b.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-700 mt-1 leading-tight">{b.package_title}</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Travel Date: {b.travel_date}</p>
                </div>
                <div className="flex items-center gap-8 sm:gap-12 w-full sm:w-auto justify-between sm:justify-end shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right min-w-[100px]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
                    <p className="font-black text-sm text-slate-800">₹{b.total_amount.toLocaleString('en-IN')}</p>
                  </div>
                  <Link 
                    href={`/dashboard/bookings/${b.public_id}`}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                  >
                    Ticket Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <Ticket className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-500 max-w-sm text-sm">
              You don't have any recent bookings. When you book a tour or package, your tickets and status updates will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
