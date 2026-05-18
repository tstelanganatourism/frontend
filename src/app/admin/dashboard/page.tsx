'use client';

import React, { useEffect } from 'react';
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
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
  const { stats, isLoading, fetchStats } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cards = [
    { 
      title: 'Active Packages', 
      value: stats?.packages || 0, 
      icon: Package, 
      color: 'blue',
      trend: '+2 this month'
    },
    { 
      title: 'Total Rooms', 
      value: stats?.rooms || 0, 
      icon: Bed, 
      color: 'emerald',
      trend: 'All systems live'
    },
    { 
      title: 'Total Bookings', 
      value: stats?.bookings || 0, 
      icon: Ticket, 
      color: 'purple',
      trend: '+12% from last week'
    },
    { 
      title: 'Registered Users', 
      value: stats?.users || 0, 
      icon: Users, 
      color: 'orange',
      trend: 'New signups today'
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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`rounded-xl bg-${card.color}-50 p-3 group-hover:scale-110 transition-transform`}>
                <card.icon className={`h-6 w-6 text-${card.color}-600`} />
              </div>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{card.value}</h3>
              <p className="text-xs font-medium text-slate-400 mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> {card.trend}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Sections Shells */}
      <div className="grid gap-8 lg:grid-cols-2">
        
        {/* Recent Activity */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#5ac4d7]" /> Recent System Activity
            </h3>
            <button className="text-sm font-bold text-[#5ac4d7] hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-start gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                <div>
                  <p className="text-sm font-medium text-slate-900">System maintenance completed successfully.</p>
                  <p className="text-xs text-slate-400 mt-1">Today at 10:45 AM</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Departure Calendar Shell */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#5ac4d7]" /> Upcoming Departures
            </h3>
            <Link href="/admin/inventory" className="text-sm font-bold text-[#5ac4d7] hover:underline cursor-pointer">
              Full Calendar
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-2xl bg-slate-50 p-6">
              <Calendar className="h-12 w-12 text-slate-300" />
            </div>
            <h4 className="font-bold text-slate-900">No departures today</h4>
            <p className="text-sm text-slate-500 mt-1 max-w-[200px]">Check the inventory section to manage travel dates.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
