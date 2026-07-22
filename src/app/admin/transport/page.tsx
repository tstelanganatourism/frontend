'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/lib/api';
import {
  Truck, Users, Car, Bus, ChevronDown, ChevronUp,
  Calendar, Package, RefreshCw, ArrowRight,
  CheckCircle2, XCircle, AlertCircle, Info, Search, ChevronRight, User, MapPin, Clock, Ticket
} from 'lucide-react';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingTransportSel {
  type: 'SHARED' | 'SEPARATE_VEHICLE';
  title: string;
  quantity?: number;
  capacity?: number;
  pax?: number;
}

interface BookingDetail {
  public_id: string;
  booking_id: number;
  customer_name: string;
  customer_email: string | null;
  adult_count: number;
  child_count: number;
  student_count?: number;
  total_pax: number;
  has_transport: boolean;
  has_refreshment_addon: boolean;
  transport_selections: BookingTransportSel[];
  status: string;
}

interface SeparateVehicleSummary {
  title: string;
  total_quantity: number;
  capacity_per_vehicle: number;
  total_capacity: number;
}

interface PackageGroup {
  package_id: number;
  package_title: string;
  package_type: string;
  bookings_count: number;
  pax_count: number;
  with_transport_count: number;
  without_transport_count: number;
  refreshment_pax_count: number;
  separate_vehicles_summary: SeparateVehicleSummary[];
  total_separate_vehicles: number;
  shared_pax_count: number;
  shared_option_title: string | null;
  shared_vehicle_capacity: number | null;
  shared_vehicles_needed: number | null;
  bookings: BookingDetail[];
}

interface DateGroup {
  travel_date: string;
  total_bookings: number;
  total_pax: number;
  with_transport_count: number;
  without_transport_count: number;
  package_groups: PackageGroup[];
}

interface TransportPlanningData {
  start_date: string;
  end_date: string;
  date_groups: DateGroup[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

function formatDateShort(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function isToday(iso: string) {
  return iso === new Date().toISOString().split('T')[0];
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

function getFutureISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-400',
    PARTIAL_PAID: 'bg-blue-400',
    FULLY_PAID: 'bg-emerald-500',
  };
  return <span className={`inline-block h-2 w-2 rounded-full ${map[status] || 'bg-slate-300'}`} />;
}

// ─── Package Type Badge ───────────────────────────────────────────────────────

function PackageTypeBadge({ type }: { type: string }) {
  if (type === 'TOUR') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-700">
        🚤 Boat Ride
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-violet-700">
      🏔️ Sightseeing
    </span>
  );
}

// ─── Transport Type Icon ──────────────────────────────────────────────────────

function VehicleIcon({ title }: { title: string }) {
  const t = title.toLowerCase();
  if (t.includes('bus') || t.includes('coach')) return <Bus className="h-4 w-4" />;
  return <Car className="h-4 w-4" />;
}

// ─── Booking Row ──────────────────────────────────────────────────────────────

function BookingRow({ booking }: { booking: BookingDetail }) {
  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <StatusDot status={booking.status} />
          <div>
            <p className="text-xs font-bold text-slate-800">{booking.customer_name}</p>
            {booking.customer_email && (
              <p className="text-[10px] text-slate-400">{booking.customer_email}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-xs font-mono text-slate-500">{booking.public_id}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-xs font-bold text-slate-700">
          {booking.student_count && booking.student_count > 0 ? (
            `${booking.student_count}S`
          ) : (
            <>{booking.adult_count}A{booking.child_count > 0 ? ` + ${booking.child_count}C` : ''}</>
          )}
        </span>
        <p className="text-[10px] text-slate-400">{booking.total_pax} pax</p>
      </td>
      <td className="px-4 py-3">
        {!booking.has_transport && !booking.has_refreshment_addon ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            <XCircle className="h-3 w-3" /> None
          </span>
        ) : (
          <div className="flex flex-col gap-1 items-start">
            {booking.transport_selections?.map((ts, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {ts.type === 'SEPARATE_VEHICLE' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                    <Car className="h-3 w-3" />
                    {ts.quantity && ts.quantity > 1 ? `${ts.quantity}× ` : ''}{ts.title}
                    {ts.capacity ? ` (${ts.capacity} seats)` : ''}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                    <Users className="h-3 w-3" />
                    Shared — {ts.title}
                    {ts.pax ? ` · ${ts.pax} pax` : ''}
                  </span>
                )}
              </div>
            ))}
            {booking.has_refreshment_addon && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                Refreshments
              </span>
            )}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <a
          href={`/print/ticket/${booking.public_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 active:scale-95"
        >
          <Ticket className="h-3.5 w-3.5" /> Ticket
        </a>
      </td>
    </tr>
  );
}

// ─── Package Section ──────────────────────────────────────────────────────────

function PackageSection({ group }: { group: PackageGroup }) {
  const [expanded, setExpanded] = useState(group.bookings_count <= 2);

  const hasAnySeparate = group.separate_vehicles_summary.length > 0;
  const hasAnyShared = group.shared_pax_count > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Package Header */}
      <div className="flex items-start gap-3 px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <PackageTypeBadge type={group.package_type} />
            <h3 className="text-sm font-black text-slate-900 truncate">{group.package_title}</h3>
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1"><Package className="h-3 w-3" />{group.bookings_count} bookings</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{group.pax_count} total pax</span>
            {group.with_transport_count > 0 && (
              <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3 w-3" />{group.with_transport_count} with transport</span>
            )}
            {group.without_transport_count > 0 && (
              <span className="flex items-center gap-1 text-slate-400"><XCircle className="h-3 w-3" />{group.without_transport_count} no transport</span>
            )}
          </div>
        </div>
      </div>

      {/* Transport Summary Cards */}
      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Separate Vehicles */}
          {hasAnySeparate && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                  <Car className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-indigo-900">Separate Vehicles Required</p>
                  <p className="text-[10px] text-indigo-600 font-medium">{group.total_separate_vehicles} vehicle{group.total_separate_vehicles !== 1 ? 's' : ''} to arrange</p>
                </div>
              </div>
              <div className="space-y-2">
                {group.separate_vehicles_summary.map((sv, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 border border-indigo-100">
                    <div className="flex items-center gap-2">
                      <VehicleIcon title={sv.title} />
                      <span className="text-xs font-bold text-slate-800">{sv.title}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{sv.capacity_per_vehicle} seats each</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-indigo-700">{sv.total_quantity}×</span>
                      <p className="text-[10px] text-slate-400">{sv.total_capacity} total seats</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shared Transport */}
          {hasAnyShared && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 h-fit">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500">
                  <Bus className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-amber-900">Shared Transport Required</p>
                  <p className="text-[10px] text-amber-600 font-medium">
                    {group.shared_option_title || 'Shared'}{group.shared_vehicle_capacity ? ` · ${group.shared_vehicle_capacity} seats/vehicle` : ''}
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-white/70 px-3 py-3 border border-amber-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-700 font-semibold">Total Passengers</span>
                  <span className="text-xl font-black text-amber-800">{group.shared_pax_count}</span>
                </div>
                {group.shared_vehicle_capacity && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-700 font-semibold">Vehicles to Arrange</span>
                    <span className="text-xl font-black text-amber-800">
                      {group.shared_vehicles_needed ?? '—'}
                      <span className="text-xs font-medium text-amber-600 ml-1">vehicles</span>
                    </span>
                  </div>
                )}
                {!group.shared_vehicle_capacity && (
                  <p className="text-[10px] text-amber-500 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Set capacity in package settings to auto-calculate vehicles needed
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Refreshments */}
        {group.refreshment_pax_count > 0 && (
          <div className="flex items-center gap-3 w-fit rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Refreshments Required</p>
              <p className="text-sm font-black text-emerald-900 leading-none mt-0.5">{group.refreshment_pax_count} <span className="text-[10px] font-semibold text-emerald-600">Passengers</span></p>
            </div>
          </div>
        )}

        {/* No transport at all */}
        {!hasAnySeparate && !hasAnyShared && !group.refreshment_pax_count && (
          <div className="w-full rounded-xl border border-slate-100 bg-slate-50 p-4 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-slate-300 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-500">No transport or addons booked for this package on this date</p>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Booking Table */}
      <div className="border-t border-slate-100">
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            View all {group.bookings_count} booking{group.bookings_count !== 1 ? 's' : ''} on this date
          </span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {expanded && (
          <div className="overflow-hidden">
            {/* Desktop Table View */}
            <table className="w-full text-left hidden md:table">
              <thead>
                <tr className="bg-slate-50 border-t border-slate-100">
                  <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500">Customer</th>
                  <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500 text-center">PNR NUMBER</th>
                  <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500 text-center">Pax</th>
                  <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500">Transport Chosen</th>
                  <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {group.bookings.map(b => (
                  <BookingRow key={b.public_id} booking={b} />
                ))}
              </tbody>
            </table>

            {/* Mobile Card List View */}
            <div className="divide-y divide-slate-100 md:hidden bg-slate-50/30 border-t border-slate-100">
              {group.bookings.map(b => (
                <div key={b.public_id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusDot status={b.status} />
                      <span className="text-xs font-bold text-slate-800">{b.customer_name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{b.public_id}</span>
                  </div>
                  {b.customer_email && (
                    <p className="text-[10px] text-slate-400 -mt-2 truncate">{b.customer_email}</p>
                  )}
                  
                  <div className="flex flex-col gap-1 items-start">
                    {!b.has_transport && !b.has_refreshment_addon ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-500">
                        <XCircle className="h-2.5 w-2.5" /> No Transport
                      </span>
                    ) : (
                      <>
                        {b.transport_selections?.map((ts, i) => (
                          <div key={i} className="flex items-center gap-1">
                            {ts.type === 'SEPARATE_VEHICLE' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[9px] font-bold text-indigo-700">
                                <Car className="h-2.5 w-2.5" />
                                {ts.quantity && ts.quantity > 1 ? `${ts.quantity}× ` : ''}{ts.title}
                                {ts.capacity ? ` (${ts.capacity} seats)` : ''}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[9px] font-bold text-amber-700">
                                <Users className="h-2.5 w-2.5" />
                                Shared — {ts.title}
                                {ts.pax ? ` · ${ts.pax} pax` : ''}
                              </span>
                            )}
                          </div>
                        ))}
                        {b.has_refreshment_addon && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[9px] font-bold text-emerald-700">
                            Refreshments
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2.5">
                    <div>
                      <span className="text-slate-400 font-medium">Pax:</span>{' '}
                      <span className="font-bold text-slate-700">
                        {b.student_count && b.student_count > 0 ? (
                          `${b.student_count}S`
                        ) : (
                          <>{b.adult_count}A{b.child_count > 0 ? ` + ${b.child_count}C` : ''}</>
                        )} ({b.total_pax} total)
                      </span>
                    </div>
                    <a
                      href={`/print/ticket/${b.public_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                    >
                      <Ticket className="h-3.5 w-3.5" /> Ticket
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Date Card ────────────────────────────────────────────────────────────────

function DateCard({ group }: { group: DateGroup }) {
  const today = isToday(group.travel_date);

  return (
    <div className={`rounded-3xl border shadow-sm overflow-hidden ${today ? 'border-[#5ac4d7]/50 ring-2 ring-[#5ac4d7]/20' : 'border-slate-200'}`}>
      {/* Date Header */}
      <div className={`px-6 py-5 flex items-center justify-between ${today ? 'bg-gradient-to-r from-[#5ac4d7]/10 to-indigo-50' : 'bg-gradient-to-r from-slate-50 to-white'}`}>
        <div className="flex items-center gap-4">
          <div className={`flex flex-col items-center justify-center h-14 w-14 rounded-2xl font-black shadow-sm ${today ? 'bg-[#5ac4d7] text-white' : 'bg-slate-900 text-white'}`}>
            <span className="text-xl leading-none">{new Date(group.travel_date + 'T00:00:00').getDate()}</span>
            <span className="text-[9px] uppercase tracking-widest opacity-80">
              {new Date(group.travel_date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900">{formatDate(group.travel_date)}</h2>
              {today && (
                <span className="rounded-full bg-[#5ac4d7] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">Today</span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1"><Package className="h-3 w-3" />{group.total_bookings} bookings</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{group.total_pax} pax</span>
              <span className="flex items-center gap-1 text-emerald-600"><Truck className="h-3 w-3" />{group.with_transport_count} with transport</span>
              {group.without_transport_count > 0 && (
                <span className="text-slate-400">{group.without_transport_count} no transport</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Package Groups */}
      <div className="p-5 space-y-4">
        {group.package_groups.map(pg => (
          <PackageSection key={pg.package_id} group={pg} />
        ))}
      </div>
    </div>
  );
}

export default function TransportPlanningPage() {
  const [data, setData] = useState<TransportPlanningData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(getTodayISO());
  const [endDate, setEndDate] = useState(getFutureISO(30));
  const [isSingleDateMode, setIsSingleDateMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SHARED' | 'SEPARATE' | 'NONE'>('ALL');
  const [filterAddons, setFilterAddons] = useState<'ALL' | 'REFRESHMENTS' | 'NONE'>('ALL');
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const activeEndDate = isSingleDateMode ? startDate : endDate;
      const res = await apiClient.get('/api/v1/admin/bookings/transport-planning', {
        params: { start_date: startDate, end_date: activeEndDate },
      });
      setData(res.data);
    } catch (err: any) {
      setError('Failed to load transport data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, isSingleDateMode]);

  useEffect(() => {
    if (startDate > endDate) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client-side filtering logic
  const filteredDateGroups = useMemo(() => {
    if (!data) return [];
    
    return data.date_groups.map(dg => {
      const filteredPackageGroups = dg.package_groups.map(pg => {
        const filteredBookings = pg.bookings.filter(b => {
          // 1. Search Query filter (matches Customer Name, Booking ID, Package Title, or Transport title)
          const matchesSearch = searchQuery.trim() === '' || 
            b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.customer_email && b.customer_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            b.public_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pg.package_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.transport_selections.some(ts => ts.title.toLowerCase().includes(searchQuery.toLowerCase()));

          if (!matchesSearch) return false;

          // 2. Transport type filter
          if (filterType === 'SHARED') {
            const hasShared = b.transport_selections.some(ts => ts.type === 'SHARED');
            if (!hasShared) return false;
          } else if (filterType === 'SEPARATE') {
            const hasSeparate = b.transport_selections.some(ts => ts.type === 'SEPARATE_VEHICLE');
            if (!hasSeparate) return false;
          } else if (filterType === 'NONE') {
            if (b.transport_selections.length > 0) return false;
          }

          // 3. Addon filter
          if (filterAddons === 'REFRESHMENTS') {
            if (!b.has_refreshment_addon) return false;
          } else if (filterAddons === 'NONE') {
            if (b.has_refreshment_addon) return false;
          }

          return true;
        });

        if (filteredBookings.length === 0) return null;

        // Re-calculate package group stats based on filtered bookings
        const bookingsCount = filteredBookings.length;
        const paxCount = filteredBookings.reduce((sum, b) => sum + b.total_pax, 0);
        const withTransportCount = filteredBookings.filter(b => b.has_transport).length;
        const withoutTransportCount = bookingsCount - withTransportCount;
        const refreshmentPaxCount = filteredBookings.filter(b => b.has_refreshment_addon).reduce((sum, b) => sum + b.total_pax, 0);
        
        // Recompute separate vehicles summary
        const separateVehicles: Record<string, { qty: number; cap: number }> = {};
        let sharedPax = 0;
        let sharedOptionTitle = null;
        let sharedCapacity = pg.shared_vehicle_capacity;

        filteredBookings.forEach(b => {
          b.transport_selections.forEach(ts => {
            if (ts.type === 'SEPARATE_VEHICLE') {
              const qty = ts.quantity || 1;
              if (separateVehicles[ts.title]) {
                separateVehicles[ts.title].qty += qty;
              } else {
                separateVehicles[ts.title] = { qty, cap: ts.capacity || 1 };
              }
            } else if (ts.type === 'SHARED') {
              sharedPax += b.total_pax;
              sharedOptionTitle = ts.title;
            }
          });
        });

        const separateVehiclesSummary = Object.entries(separateVehicles).map(([title, item]) => ({
          title,
          total_quantity: item.qty,
          capacity_per_vehicle: item.cap,
          total_capacity: item.qty * item.cap
        }));

        const totalSeparateVehicles = separateVehiclesSummary.reduce((sum, s) => sum + s.total_quantity, 0);
        const sharedVehiclesNeeded = sharedPax > 0 && sharedCapacity ? Math.ceil(sharedPax / sharedCapacity) : null;

        return {
          ...pg,
          bookings_count: bookingsCount,
          pax_count: paxCount,
          with_transport_count: withTransportCount,
          without_transport_count: withoutTransportCount,
          refreshment_pax_count: refreshmentPaxCount,
          separate_vehicles_summary: separateVehiclesSummary,
          total_separate_vehicles: totalSeparateVehicles,
          shared_pax_count: sharedPax,
          shared_option_title: sharedOptionTitle,
          shared_vehicles_needed: sharedVehiclesNeeded,
          bookings: filteredBookings
        };
      }).filter((pg): pg is NonNullable<typeof pg> => pg !== null);

      if (filteredPackageGroups.length === 0) return null;

      // Re-calculate date group level stats
      const totalBookings = filteredPackageGroups.reduce((sum, pg) => sum + pg.bookings_count, 0);
      const totalPax = filteredPackageGroups.reduce((sum, pg) => sum + pg.pax_count, 0);
      const withTransportCount = filteredPackageGroups.reduce((sum, pg) => sum + pg.with_transport_count, 0);
      const withoutTransportCount = filteredPackageGroups.reduce((sum, pg) => sum + pg.without_transport_count, 0);

      return {
        ...dg,
        total_bookings: totalBookings,
        total_pax: totalPax,
        with_transport_count: withTransportCount,
        without_transport_count: withoutTransportCount,
        package_groups: filteredPackageGroups
      };
    }).filter((dg): dg is NonNullable<typeof dg> => dg !== null);
  }, [data, searchQuery, filterType, filterAddons]);

  const emptyDates = filteredDateGroups.length === 0;

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden px-1 md:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            Transport Planning
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 font-medium">
            Vehicle requirements by travel date — arrange Shared &amp; Separate transport precisely.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50 w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Date & Search Filter Panel */}
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        {/* Date Mode Toggle and Date Pickers */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-2 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Date Mode</span>
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setIsSingleDateMode(true)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${isSingleDateMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Single Date
              </button>
              <button
                type="button"
                onClick={() => setIsSingleDateMode(false)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${!isSingleDateMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Date Range
              </button>
            </div>
          </div>

          <div className="w-full sm:w-[180px]">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
              {isSingleDateMode ? 'Select Date' : 'From Date'}
            </label>
            <CustomDatePicker
              value={startDate}
              onChange={setStartDate}
              allowPast={true}
            />
          </div>

          {!isSingleDateMode && (
            <div className="w-full sm:w-[180px]">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">To Date</label>
              <CustomDatePicker
                value={endDate}
                onChange={setEndDate}
                min={startDate}
                allowPast={true}
                align="right"
              />
            </div>
          )}

          {!isSingleDateMode && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
              {[
                { label: 'Today', start: getTodayISO(), end: getTodayISO() },
                { label: '7 Days', start: getTodayISO(), end: getFutureISO(7) },
                { label: '30 Days', start: getTodayISO(), end: getFutureISO(30) },
              ].map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => { setStartDate(preset.start); setEndDate(preset.end); }}
                  className={`rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    startDate === preset.start && endDate === preset.end
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Search & Client-side Filters */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 border-t border-slate-100 pt-4">
          {/* Search bar */}
          <div className="relative">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Search Bookings</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search name, ID, package..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Transport filter */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Transport Type</label>
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
              {(['ALL', 'SHARED', 'SEPARATE', 'NONE'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilterType(type)}
                  className={`rounded-lg py-1.5 text-[9px] font-black uppercase tracking-wider transition-all text-center ${
                    filterType === type ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {type === 'SEPARATE' ? 'Private' : type.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Refreshments filter */}
          <div className="sm:col-span-2 md:col-span-1">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Refreshments</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { label: 'All', value: 'ALL' },
                { label: 'Yes', value: 'REFRESHMENTS' },
                { label: 'No', value: 'NONE' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFilterAddons(opt.value as any)}
                  className={`rounded-lg py-1.5 text-[9px] font-black uppercase tracking-wider transition-all text-center ${
                    filterAddons === opt.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[10px] sm:text-[11px] font-semibold text-slate-500 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-indigo-500"></span> Separate Vehicle
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-amber-400"></span> Shared Transport
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-slate-300"></span> No Transport
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#5ac4d7]"></span> Today
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-medium">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6 animate-pulse">
              <div className="flex gap-4 items-center mb-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-100"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-64 rounded-lg bg-slate-100"></div>
                  <div className="h-3 w-40 rounded-lg bg-slate-100"></div>
                </div>
              </div>
              <div className="h-32 rounded-2xl bg-slate-100"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && emptyDates && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 border border-slate-100 mb-4 text-slate-400">
            <Truck className="h-7 w-7" />
          </div>
          <h3 className="text-sm font-black text-slate-800">No bookings match the filters</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">Try expanding the date range, changing presets, or checking your search keywords.</p>
        </div>
      )}

      {/* Date Groups */}
      {!isLoading && filteredDateGroups.length > 0 && (
        <div className="space-y-6">
          {filteredDateGroups.map(dg => (
            <DateCard key={dg.travel_date} group={dg} />
          ))}
        </div>
      )}
    </div>
  );
}
