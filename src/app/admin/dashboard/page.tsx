'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/stores/adminStore';
import {
  Package,
  Bed,
  Ticket,
  Users,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Calendar,
  Layers,
  FolderOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import BookingDetailsModal from '@/components/ui/BookingDetailsModal';

export default function AdminDashboardPage() {
  const { stats, isLoading, fetchStats } = useAdminStore();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cards = [
    {
      title: 'Active Packages',
      value: stats?.packages || 0,
      icon: Package,
      color: 'blue',
      trend: 'Manage tours',
      link: '/admin/packages'
    },
    {
      title: 'Package Categories',
      value: stats?.package_categories || 0,
      icon: FolderOpen,
      color: 'orange',
      trend: 'Tour category groups',
      link: '/admin/packages/categories'
    },
    {
      title: 'Room Categories',
      value: stats?.room_categories || 0,
      icon: Layers,
      color: 'emerald',
      trend: 'Lodge category groups',
      link: '/admin/rooms/categories'
    },
    {
      title: 'Room Types',
      value: stats?.room_types || 0,
      icon: Bed,
      color: 'teal',
      trend: 'Different stay options',
      link: '/admin/rooms'
    },
    {
      title: 'Total Bookings',
      value: stats?.bookings || 0,
      icon: Ticket,
      color: 'purple',
      trend: 'Review transaction ledger',
      link: '/admin/bookings'
    },
    {
      title: 'Registered Users',
      value: stats?.users || 0,
      icon: Users,
      color: 'blue',
      trend: 'Manage registered clients',
      link: '/admin/users'
    },
  ];

  if (isLoading && !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#5ac4d7] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-black mb-2">Operational Overview</h1>
          <p className="text-white/60 leading-relaxed">
            Manage your tours, rooms, and bookings from a centralized control center.
            Real-time data synchronization is active.
          </p>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-[#5ac4d7]/20 to-transparent" />
        <Activity className="absolute -bottom-8 -right-8 h-48 w-48 text-white/5" />
      </div>

      {/* KPI Grid */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((card, i) => {
          const colorClasses = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
            emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
            teal: { bg: 'bg-teal-50', text: 'text-teal-600' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-600' }
          }[card.color] || { bg: 'bg-slate-50', text: 'text-slate-600' };

          return (
            <Link key={card.title} href={card.link} className="block group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 h-full shadow-sm transition-all group-hover:shadow-md group-hover:border-slate-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`rounded-xl ${colorClasses.bg} p-2.5 group-hover:scale-105 transition-transform`}>
                    <card.icon className={`h-5 w-5 ${colorClasses.text}`} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-550 transition-colors" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{card.value}</h3>
                  <p className="text-[10px] font-semibold text-slate-400 mt-2 truncate">
                    {card.trend}
                  </p>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Main Sections Shells */}
      <div className="grid gap-8 lg:grid-cols-2">

        {/* Recent Activity */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#5ac4d7]" /> Most Recent Bookings
            </h3>
            <Link href="/admin/bookings" className="text-sm font-bold text-[#5ac4d7] hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {stats?.recent_bookings && stats.recent_bookings.length > 0 ? (
              stats.recent_bookings.map((booking: any) => (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBookingId(booking.public_id)}
                  className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-slate-50/80 p-2.5 rounded-2xl transition-all group/row"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-slate-900 truncate group-hover/row:text-[#5ac4d7] transition-colors">
                      {booking.public_id} - {booking.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      ₹{booking.amount?.toLocaleString('en-IN')} • {new Date(booking.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${booking.status === 'FULLY_PAID' || booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10' :
                        booking.status === 'PENDING' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10' :
                          booking.status === 'PARTIAL_PAID' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10' :
                            booking.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/10' :
                              'bg-slate-55 text-slate-700 ring-1 ring-slate-600/10'
                      }`}>
                      {booking.status === 'FULLY_PAID' ? 'CONFIRMED' : booking.status}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No recent bookings found.</p>
            )}
          </div>
        </div>

        {/* Departure Calendar Shell -> Booking Analysis */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#5ac4d7]" /> Website Analysis
            </h3>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Booking Status Breakdown</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Confirmed</p>
                <p className="text-2xl font-black text-slate-900">{stats?.analysis?.CONFIRMED || 0}</p>
              </div>

              <div className="rounded-xl bg-amber-50 p-4 border border-amber-100">
                <p className="text-xs font-bold text-amber-600 uppercase mb-1">Pending</p>
                <p className="text-2xl font-black text-slate-900">{stats?.analysis?.PENDING || 0}</p>
              </div>

              <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                <p className="text-xs font-bold text-blue-600 uppercase mb-1">Advance Paid</p>
                <p className="text-2xl font-black text-slate-900">{stats?.analysis?.PARTIAL_PAID || 0}</p>
              </div>

              <div className="rounded-xl bg-rose-50 p-4 border border-rose-100">
                <p className="text-xs font-bold text-rose-600 uppercase mb-1">Cancelled</p>
                <p className="text-2xl font-black text-slate-900">{stats?.analysis?.CANCELLED || 0}</p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Total Revenue</p>
                <p className="text-xl font-black text-slate-900">₹{stats?.total_revenue?.toLocaleString('en-IN') || 0}</p>
              </div>
              <Ticket className="h-8 w-8 text-slate-300" />
            </div>
          </div>
        </div>

      </div>

      {/* Booking Details Modal popup */}
      {selectedBookingId && (
        <BookingDetailsModal
          isOpen={!!selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          publicId={selectedBookingId}
        />
      )}

    </div>
  );
}
