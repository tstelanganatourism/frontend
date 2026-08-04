'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { BookingDateDisplay } from '@/components/ui/BookingDateDisplay';
import {
  Ticket,
  IndianRupee,
  CalendarRange,
  Users,
  TrendingUp,
  Loader2,
  ArrowRight,
  ChevronRight,
  Ship,
  Briefcase,
  AlertCircle,
  ClipboardList,
  BadgeCheck,
  Bed,
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  FULLY_PAID:   { label: 'Confirmed',    color: '#059669', bg: '#ecfdf5', dot: '#10b981' },
  CONFIRMED:    { label: 'Confirmed',    color: '#059669', bg: '#ecfdf5', dot: '#10b981' },
  PENDING:      { label: 'Pending',      color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
  PARTIAL_PAID: { label: 'Advance Paid', color: '#2563eb', bg: '#eff6ff', dot: '#3b82f6' },
  CANCELLED:    { label: 'Cancelled',    color: '#dc2626', bg: '#fef2f2', dot: '#ef4444' },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status?.toUpperCase()] || { label: status, color: '#64748b', bg: '#f8fafc', dot: '#94a3b8' };
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
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchSummaryAndBookings = async () => {
      try {
        setLoading(true);
        const [summaryRes, bookingsRes] = await Promise.all([
          apiClient.get<DashboardSummary>('/api/v1/bookings/agent/dashboard-summary'),
          apiClient.get<any[]>('/api/v1/bookings/agent/bookings', { params: { limit: 3 } }),
        ]);
        setSummary(summaryRes.data);
        setRecentBookings(bookingsRes.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to load agent statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummaryAndBookings();
  }, []);

  const kpiCards = [
    {
      label: 'Total Bookings',
      value: summary?.booking_count ?? '—',
      icon: Ticket,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      desc: 'All client reservations',
    },
    {
      label: 'Total Earnings',
      value: summary?.total_earnings != null
        ? `₹${summary.total_earnings.toLocaleString('en-IN')}`
        : '—',
      icon: IndianRupee,
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
      desc: 'Margin retained instantly',
    },
    {
      label: 'This Month',
      value: summary?.this_month_earnings != null
        ? `₹${summary.this_month_earnings.toLocaleString('en-IN')}`
        : '—',
      icon: CalendarRange,
      iconBg: '#e8f8fb',
      iconColor: '#0e6b74',
      desc: 'Current month earnings',
    },
    {
      label: 'Total Customers',
      value: summary?.total_customers ?? '—',
      icon: Users,
      iconBg: '#f5f3ff',
      iconColor: '#7c3aed',
      desc: 'Passengers served',
    },
  ];

  return (
    <>
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .agent-kpi-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid rgba(30,70,138,0.07);
          box-shadow: 0 1px 14px rgba(30,70,138,0.06);
          transition: all 0.22s ease;
          animation: fade-up 0.4s ease forwards;
        }
        .agent-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(30,70,138,0.10);
        }
        .booking-row-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(30,70,138,0.07);
          box-shadow: 0 1px 10px rgba(30,70,138,0.05);
          transition: all 0.2s ease;
          overflow: hidden;
          animation: fade-up 0.4s ease forwards;
        }
        .booking-row-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(30,70,138,0.10);
        }
      `}</style>

      <div className="space-y-6 max-w-5xl mx-auto">

        {/* ── Agent Hero Banner ── */}
        <div
          className="rounded-2xl overflow-hidden relative"
          style={{
            background: '#12283a',
            boxShadow: '0 4px 28px rgba(18,40,58,0.2)',
          }}
        >
          {/* Subtle grid texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.025' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10 p-7 sm:p-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 bg-white/8 border border-white/12">
              <BadgeCheck className="h-3 w-3 text-amber-400" />
              <span className="text-white/70 text-[10px] font-black uppercase tracking-widest">Agent Console Active</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  {getGreeting()},<br />
                  <span className="text-amber-300">{user?.full_name?.split(' ')[0] || 'Agent'}!</span>
                </h1>
                <p className="text-white/50 mt-2.5 text-sm font-medium max-w-sm leading-relaxed">
                  Track your offline tourist bookings and direct margin earnings from one place.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/agent/dashboard/bookings"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:-translate-y-0.5"
                    style={{
                      background: '#f59e0b',
                      color: '#12283a',
                      boxShadow: '0 4px 14px rgba(245,158,11,0.28)',
                    }}
                  >
                    <Ticket className="h-4 w-4" />
                    View Bookings
                  </Link>
                  <Link
                    href="/packages"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-white/10 text-white border border-white/15 transition-all hover:bg-white/18 hover:-translate-y-0.5"
                  >
                    <Ship className="h-4 w-4" />
                    Book New Tour
                  </Link>
                </div>
              </div>

              {/* Decorative icon — premium, no emoji */}
              <div className="hidden sm:flex items-center justify-center shrink-0 opacity-10">
                <Briefcase className="h-28 w-28 text-white" strokeWidth={0.8} />
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="flex items-center gap-2.5">
              <Loader2 className="h-5 w-5 animate-spin text-[#0e6b74]" />
              <span className="text-sm text-slate-400 font-semibold">Loading your dashboard...</span>
            </div>
          </div>
        ) : error ? (
          <div
            className="p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold text-rose-700"
            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
          >
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="agent-kpi-card p-5" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: card.iconBg }}
                  >
                    <Icon className="h-5 w-5" style={{ color: card.iconColor }} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
                  <p className="text-xl font-black text-slate-800 mt-1 leading-none tracking-tight">{card.value}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-2">{card.desc}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Recent Client Bookings ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-slate-800">Recent Client Bookings</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Latest reservations from your customers</p>
            </div>
            <Link
              href="/agent/dashboard/bookings"
              className="flex items-center gap-1.5 text-xs font-bold transition-colors"
              style={{ color: '#0e6b74' }}
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
            </div>
          ) : recentBookings.length > 0 ? (
            <div className="space-y-3">
              {recentBookings.map((b, idx) => {
                const statusCfg = getStatusConfig(b.status);
                const transports = getTransportSelections(b.pricing_snapshot);
                const refreshmentIncluded = hasRefreshment(b);
                return (
                  <div key={b.id} className="booking-row-card" style={{ animationDelay: `${idx * 0.07}s` }}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0">
                      {/* Left status strip */}
                      <div
                        className="sm:w-1.5 sm:self-stretch w-full h-1 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none shrink-0"
                        style={{ background: statusCfg.dot }}
                      />

                      <div className="p-5 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-bold text-slate-400 font-mono">{b.public_id}</span>
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ background: statusCfg.bg, color: statusCfg.color }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.dot }} />
                              {statusCfg.label}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-slate-800 text-sm leading-tight">{b.package_title}</h3>
                          <div className="mt-1">
                            <BookingDateDisplay
                              targetType={b.target_type}
                              travelDate={b.travel_date}
                              roomCheckin={b.room_checkin}
                              roomCheckout={b.room_checkout}
                              roomCheckoutDate={b.room_checkout_date}
                              packageDepartureTime={b.package_departure_time}
                              compact={true}
                              className="!text-xs"
                            />
                          </div>
                          {(transports.length > 0 || refreshmentIncluded || b.target_type === 'ROOM') && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {b.target_type === 'ROOM' && (
                                <span
                                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-indigo-700 inline-flex items-center gap-1"
                                  style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}
                                >
                                  <Bed className="h-2.5 w-2.5" /> Room Stay
                                </span>
                              )}
                              {transports.slice(0, 1).map((ts: any, i: number) => (
                                <span
                                  key={i}
                                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-slate-500"
                                  style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}
                                >
                                  {Number(ts.quantity || 1) > 1 ? `${ts.quantity}x ` : ''}{ts.title}
                                </span>
                              ))}
                              {refreshmentIncluded && (
                                <span
                                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
                                  style={{ background: '#ecfdf5', border: '1px solid #bbf7d0' }}
                                >
                                  Refreshments
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 shrink-0">
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tourist Bill</p>
                            <p className="font-black text-slate-800 text-base leading-none mt-0.5">{money(b.total_amount)}</p>
                          </div>
                          <Link
                            href={`/dashboard/bookings/${b.public_id}`}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:-translate-y-0.5"
                            style={{
                              background: '#12283a',
                              boxShadow: '0 2px 8px rgba(18,40,58,0.22)',
                            }}
                          >
                            View <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── Empty State ── */
            <div
              className="p-12 flex flex-col items-center text-center rounded-2xl"
              style={{
                background: '#fafbfc',
                border: '1.5px dashed rgba(14,107,116,0.2)',
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: '#f0f4ff', border: '1px solid rgba(30,70,138,0.12)' }}
              >
                <ClipboardList className="h-8 w-8 text-[#1e468a]" />
              </div>
              <h3 className="font-black text-slate-700 text-base mb-1">No bookings yet</h3>
              <p className="text-slate-400 text-sm max-w-xs mb-5 leading-relaxed">
                Your client bookings will appear here. Start booking tours for your customers!
              </p>
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: '#12283a',
                  boxShadow: '0 4px 14px rgba(18,40,58,0.20)',
                }}
              >
                Book a Tour <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
