'use client';

import React, { useEffect, useState } from 'react';
import { BookingDateDisplay } from '@/components/ui/BookingDateDisplay';
import { useAuthStore } from '@/stores/authStore';
import {
  Ticket,
  History,
  ChevronRight,
  MessageCircle,
  User,
  Loader2,
  Ship,
  ArrowRight,
  Navigation,
  Map,
  Phone,
  Anchor,
  Compass,
  Sunrise,
  CalendarDays,
  BadgeCheck,
  Waves,
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { getTransportSelections, hasRefreshment, money } from '@/lib/bookingDisplay';

interface DashboardSummary {
  booking_count: number;
  past_trips: number;
  upcoming_trips: number;
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

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.full_name?.split(' ')[0] || 'Traveler';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [summaryRes, bookingsRes] = await Promise.all([
          apiClient.get<DashboardSummary>('/api/v1/bookings/user/dashboard-summary'),
          apiClient.get<any[]>('/api/v1/bookings/user/bookings'),
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

  const stats = [
    {
      label: 'Upcoming Trips',
      value: summary?.upcoming_trips ?? '—',
      icon: Navigation,
      iconBg: '#e8f8fb',
      iconColor: '#0e6b74',
      desc: 'Adventures ahead',
    },
    {
      label: 'Past Trips',
      value: summary?.past_trips ?? '—',
      icon: History,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      desc: 'Memories created',
    },
    {
      label: 'Total Bookings',
      value: summary?.booking_count ?? '—',
      icon: Ticket,
      iconBg: '#f5f3ff',
      iconColor: '#7c3aed',
      desc: 'All reservations',
    },
  ];

  const quickActions = [
    { label: 'My Trips',  href: '/dashboard/bookings', icon: Ticket,  desc: 'View all tickets' },
    { label: 'Packages',  href: '/packages',            icon: Compass,  desc: 'Browse tours' },
    { label: 'Profile',   href: '/dashboard/profile',  icon: User,    desc: 'Manage account' },
    { label: 'Contact',   href: '/contact',             icon: Phone,   desc: 'Get support' },
  ];

  return (
    <>
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-up { animation: fade-up 0.45s ease forwards; }
        .anim-delay-1 { animation-delay: 0.1s; opacity: 0; }
        .anim-delay-2 { animation-delay: 0.2s; opacity: 0; }
        .anim-delay-3 { animation-delay: 0.3s; opacity: 0; }

        .stat-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 1px 14px rgba(30,70,138,0.06);
          border: 1px solid rgba(30,70,138,0.06);
          transition: all 0.22s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(30,70,138,0.10);
        }
        .booking-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(30,70,138,0.07);
          box-shadow: 0 1px 10px rgba(30,70,138,0.05);
          transition: all 0.2s ease;
          overflow: hidden;
        }
        .booking-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(30,70,138,0.10);
        }
        .quick-action-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(30,70,138,0.07);
          box-shadow: 0 1px 10px rgba(30,70,138,0.05);
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .quick-action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(30,70,138,0.10);
          border-color: rgba(14,107,116,0.2);
        }
      `}</style>

      <div className="space-y-5 max-w-4xl mx-auto">

        {/* ── Greeting Hero ── */}
        <div
          className="anim-fade-up rounded-2xl overflow-hidden relative"
          style={{
            background: '#0b3d52',
            boxShadow: '0 4px 28px rgba(11,61,82,0.18)',
          }}
        >
          {/* subtle wave texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10 p-7 sm:p-8">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 bg-white/8 border border-white/12">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Tourist Portal</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  {getGreeting()},<br />
                  <span className="text-teal-300">{firstName}!</span>
                </h1>
                <p className="text-white/55 mt-2.5 text-sm font-medium max-w-sm leading-relaxed">
                  Your next river adventure awaits. Book a cruise, track your trips, and explore scenic Godavari routes.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/packages"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:-translate-y-0.5"
                    style={{
                      background: '#f59e0b',
                      color: '#1c1917',
                      boxShadow: '0 4px 14px rgba(245,158,11,0.3)',
                    }}
                  >
                    <Ship className="h-4 w-4" />
                    Explore Cruises
                  </Link>
                  <a
                    href="https://wa.me/919951369573"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-white/10 text-white border border-white/15 transition-all hover:bg-white/20 hover:-translate-y-0.5"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Help
                  </a>
                </div>
              </div>

              {/* Decorative illustration — premium SVG anchor instead of emoji */}
              <div className="hidden sm:flex items-center justify-center shrink-0 opacity-15">
                <Anchor className="h-28 w-28 text-white" strokeWidth={0.8} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="flex items-center gap-2.5">
              <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
              <span className="text-sm text-slate-400 font-semibold">Loading your journey...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 anim-fade-up anim-delay-1">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="stat-card p-5 flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: stat.iconBg }}
                  >
                    <Icon className="h-5 w-5" style={{ color: stat.iconColor }} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-800 leading-none">{stat.value}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1">{stat.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{stat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 anim-fade-up anim-delay-2">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={i}
                href={action.href}
                className="quick-action-card p-4 flex flex-col items-center text-center gap-2.5"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: '#f0f7f8', border: '1px solid rgba(14,107,116,0.12)' }}
                >
                  <Icon className="h-5 w-5" style={{ color: '#0e6b74' }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">{action.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Recent Bookings ── */}
        <div className="anim-fade-up anim-delay-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-slate-800">My Journey</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Your recent bookings & trips</p>
            </div>
            <Link
              href="/dashboard/bookings"
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
              {recentBookings.map((b) => {
                const statusCfg = getStatusConfig(b.status);
                const transports = getTransportSelections(b.pricing_snapshot);
                const refreshmentIncluded = hasRefreshment(b);
                return (
                  <div key={b.id} className="booking-card">
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Status strip */}
                        <div
                          className="w-1 self-stretch rounded-full shrink-0"
                          style={{ background: statusCfg.dot, minHeight: 48 }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-bold text-slate-400 font-mono">{b.public_id}</span>
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
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
                          {(transports.length > 0 || refreshmentIncluded) && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {transports.slice(0, 2).map((ts: any, idx: number) => (
                                <span
                                  key={idx}
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
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 border-t sm:border-t-0 pt-3 sm:pt-0 shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</p>
                          <p className="font-black text-slate-800 text-base">{money(b.total_amount)}</p>
                        </div>
                        <Link
                          href={`/dashboard/bookings/${b.public_id}`}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:-translate-y-0.5"
                          style={{
                            background: '#0b3d52',
                            boxShadow: '0 2px 8px rgba(11,61,82,0.22)',
                          }}
                        >
                          View Ticket <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── Empty State: premium icon, no emoji ── */
            <div
              className="p-12 flex flex-col items-center text-center rounded-2xl"
              style={{
                background: '#fafbfc',
                border: '1.5px dashed rgba(14,107,116,0.2)',
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: '#e8f8fb', border: '1px solid rgba(14,107,116,0.15)' }}
              >
                <Compass className="h-8 w-8" style={{ color: '#0e6b74' }} />
              </div>
              <h3 className="font-black text-slate-700 text-base mb-1">No trips yet</h3>
              <p className="text-slate-400 text-sm max-w-xs mb-5 leading-relaxed">
                Your Godavari adventure hasn't started yet. Explore our packages and book your first cruise!
              </p>
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                style={{
                  background: '#0b3d52',
                  boxShadow: '0 4px 14px rgba(11,61,82,0.20)',
                }}
              >
                Browse Packages <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
