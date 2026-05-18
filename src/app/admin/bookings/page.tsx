'use client';

import React, { useEffect } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import {
  Ticket, Search, Filter, Calendar, TrendingUp,
  Clock, CheckCircle2, XCircle, IndianRupee, AlertCircle
} from 'lucide-react';

export default function AdminBookingsPage() {
  const { stats, fetchStats } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Booking Operations</h1>
          <p className="text-slate-500 mt-1">View and manage customer bookings, payments, and cancellation requests.</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Ticket, label: 'Total Bookings', value: stats?.bookings || 0, color: 'bg-blue-50 text-blue-600' },
          { icon: CheckCircle2, label: 'Confirmed', value: '—', color: 'bg-emerald-50 text-emerald-600' },
          { icon: Clock, label: 'Pending', value: '—', color: 'bg-amber-50 text-amber-600' },
          { icon: IndianRupee, label: 'Revenue', value: '—', color: 'bg-purple-50 text-purple-600' },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={`rounded-xl p-2.5 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{card.value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters Shell */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search bookings by ID, customer name, or contact..."
            disabled
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm outline-none cursor-not-allowed opacity-60" />
        </div>
        <div className="flex gap-2">
          <button disabled className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-400 cursor-not-allowed opacity-60">
            <Filter className="h-4 w-4" /> Status
          </button>
          <button disabled className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-400 cursor-not-allowed opacity-60">
            <Calendar className="h-4 w-4" /> Date Range
          </button>
        </div>
      </div>

      {/* Bookings Table Shell */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Booking ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Package / Room</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Travel Date</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Amount</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="rounded-2xl bg-slate-50 p-6">
                      <Ticket className="h-12 w-12 text-slate-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">No bookings recorded</h3>
                      <p className="text-sm text-slate-500 mt-1 max-w-[350px] mx-auto">
                        The booking management module is architected and ready. Bookings will appear here once the public checkout flow and payment gateway are integrated.
                      </p>
                    </div>

                    {/* Architecture Status */}
                    <div className="mt-4 w-full max-w-lg space-y-2">
                      {[
                        { label: 'Database schema (bookings, passengers, payments)', done: true },
                        { label: 'Agent commission tracking', done: true },
                        { label: 'Cancellation request model', done: true },
                        { label: 'Inventory capacity management', done: true },
                        { label: 'Public checkout API', done: false },
                        { label: 'Razorpay payment integration', done: false },
                        { label: 'Booking confirmation flow', done: false },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2.5 text-left">
                          {item.done ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          )}
                          <span className={`text-xs font-bold ${item.done ? 'text-slate-600' : 'text-slate-400'}`}>{item.label}</span>
                          <span className={`ml-auto text-[10px] font-black uppercase tracking-wider ${item.done ? 'text-emerald-600' : 'text-amber-500'}`}>
                            {item.done ? 'READY' : 'PENDING'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
