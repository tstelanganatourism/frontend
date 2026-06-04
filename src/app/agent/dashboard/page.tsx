'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { BookingDateDisplay } from '@/components/ui/BookingDateDisplay';
import { 
  Ticket, 
  Map, 
  IndianRupee, 
  CalendarRange, 
  Users, 
  TrendingUp, 
  Loader2 
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { getTransportSelections, hasRefreshment, money } from '@/lib/bookingDisplay';

interface DashboardSummary {
  booking_count: number;
  total_earnings: number;
  this_month_earnings: number;
  total_customers: number;
}

export default function AgentDashboardPage() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchSummaryAndBookings = async () => {
      try {
        setLoading(true);
        const [summaryRes, bookingsRes] = await Promise.all([
          apiClient.get<DashboardSummary>('/api/v1/bookings/agent/dashboard-summary'),
          apiClient.get<any[]>('/api/v1/bookings/agent/bookings', { params: { limit: 3 } })
        ]);
        setSummary(summaryRes.data);
        setRecentBookings(bookingsRes.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to sync sales and earnings statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummaryAndBookings();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-[var(--color-brand-river)] rounded-3xl p-8 sm:p-10 shadow-lg text-white">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-8 opacity-10">
          <Map className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 border border-white/20 uppercase tracking-widest text-[#5ac4d7] mb-4">
            Agent Console Active
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">
            {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Agent'}!
          </h1>
          <p className="text-white/80 text-lg">
            Track your offline tourist ticket bookings and direct margin earnings.
          </p>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <Link 
              href="/agent/dashboard/bookings"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--color-brand-sand)] text-[var(--color-brand-river)] px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#e6d0a3] transition-all hover:-translate-y-0.5"
            >
              See Bookings
            </Link>
            <Link
              href="/packages"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all hover:-translate-y-0.5"
            >
              Book New Tour
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic White KPI Grid */}
      {loading ? (
        <div className="flex h-36 items-center justify-center bg-white rounded-3xl border border-border shadow-sm">
          <div className="flex items-center gap-3 text-[var(--color-brand-teal)]">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm font-semibold text-slate-500">Loading portal metrics...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-2xl p-6 border border-red-100 text-center text-red-600">
          <p className="font-bold text-sm">Failed to sync agent statistics: {error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { 
              label: 'Total Bookings', 
              value: summary?.booking_count || 0, 
              icon: Ticket, 
              color: 'text-blue-600', 
              bg: 'bg-blue-50',
              desc: 'Client reservations'
            },
            { 
              label: 'Total Earnings', 
              value: `₹${(summary?.total_earnings || 0).toLocaleString('en-IN')}`, 
              icon: IndianRupee, 
              color: 'text-emerald-600', 
              bg: 'bg-emerald-50',
              desc: 'Retained instantly'
            },
            { 
              label: 'This Month Earnings', 
              value: `₹${(summary?.this_month_earnings || 0).toLocaleString('en-IN')}`, 
              icon: CalendarRange, 
              color: 'text-[#5ac4d7]', 
              bg: 'bg-teal-50/50',
              desc: 'Current month'
            },
            { 
              label: 'Total Customers', 
              value: summary?.total_customers || 0, 
              icon: Users, 
              color: 'text-purple-600', 
              bg: 'bg-purple-50',
              desc: 'Actual passengers'
            },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                  <stat.icon className={`h-5.5 w-5.5 ${stat.color}`} />
                </div>
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                  <TrendingUp className="h-2.5 w-2.5 text-teal-500" /> Active
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-slate-800 mt-1 leading-none tracking-tight">{stat.value}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-2 border-t border-slate-50 pt-2">{stat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links / Bookings Overview */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
            Recent Client Bookings
          </h2>
          <Link href="/agent/dashboard/bookings" className="text-xs font-bold text-[var(--color-brand-teal)] hover:underline uppercase tracking-wider">
            View All Bookings
          </Link>
        </div>
        {recentBookings.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentBookings.map((b) => {
              const transports = getTransportSelections(b.pricing_snapshot);
              const refreshmentIncluded = hasRefreshment(b);
              return (
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
                  <BookingDateDisplay 
                    targetType={b.target_type} 
                    travelDate={b.travel_date}
                    roomCheckin={b.room_checkin}
                    roomCheckout={b.room_checkout}
                    roomCheckoutDate={b.room_checkout_date}
                    packageDepartureTime={b.package_departure_time}
                    compact={true}
                    className="!text-xs mt-0.5"
                  />
                  {(transports.length > 0 || refreshmentIncluded || b.target_type === 'ROOM') && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {b.target_type === 'ROOM' && (
                        <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700 ring-1 ring-indigo-200">
                          Room stay
                        </span>
                      )}
                      {transports.slice(0, 2).map((ts, idx) => (
                        <span key={idx} className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                          {Number(ts.quantity || 1) > 1 ? `${ts.quantity}x ` : ''}{ts.title}
                        </span>
                      ))}
                      {refreshmentIncluded && (
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                          Refreshments
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-8 sm:gap-12 w-full sm:w-auto justify-between sm:justify-end shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right min-w-[100px]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tourist Bill</span>
                    <p className="font-black text-sm text-slate-800">{money(b.total_amount)}</p>
                  </div>
                  <Link 
                    href={`/dashboard/bookings/${b.public_id}`}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                  >
                    Ticket Details
                  </Link>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <Ticket className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-500 max-w-sm text-xs font-semibold leading-relaxed">
              Your customer bookings will show here. You can download invoices and print tickets.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
