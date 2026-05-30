'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  Ticket, 
  Search, 
  Calendar, 
  ChevronRight, 
  ChevronLeft,
  Loader2, 
  X, 
  UserCheck, 
  Users, 
  TrendingUp 
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import PremiumSelect from '@/components/ui/PremiumSelect';

interface BookingListItem {
  id: number;
  public_id: string;
  travel_date: string;
  adult_count: number;
  child_count: number;
  subtotal_amount: number;
  coupon_discount: number;
  coupon_applied: string | null;
  gst_amount: number;
  gateway_fee: number;
  total_amount: number;
  remaining_balance: number;
  status: string;
  created_at: string | null;
  package_title: string;
  variant_title: string;
  passenger_names: string[];
}

export default function AgentBookingsLedgerPage() {
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreInDB, setHasMoreInDB] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Custom Calendar state & helpers
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(prev => prev - 1);
    } else {
      setCalMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(prev => prev + 1);
    } else {
      setCalMonth(prev => prev + 1);
    }
  };

  const handleDaySelect = (dayNum: number) => {
    const d = new Date(calYear, calMonth, dayNum);
    const yearStr = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    const dateNumStr = String(d.getDate()).padStart(2, '0');
    setDateFilter(`${yearStr}-${monthStr}-${dateNumStr}`);
    setIsCalendarOpen(false);
  };

  useEffect(() => {
    const fetchInitialBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get<BookingListItem[]>('/api/v1/bookings/agent/bookings', {
          params: { limit: 20, offset: 0 }
        });
        setBookings(res.data);
        if (res.data.length < 20) {
          setHasMoreInDB(false);
        } else {
          setHasMoreInDB(true);
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to load client bookings List.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialBookings();
  }, []);

  // Frontend local filtering logic
  const filteredBookings = bookings.filter((b) => {
    // 1. Text Search matching (Booking ID, Passenger names, Package title, Variant title)
    const matchesSearch = 
      searchQuery === '' ||
      b.public_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.package_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.variant_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.passenger_names.some(name => name.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Date match
    const matchesDate = dateFilter === '' || b.travel_date === dateFilter;

    // 3. Status match
    const matchesStatus = 
      statusFilter === 'ALL' || 
      (statusFilter === 'PENDING' && (b.status === 'PENDING' || b.status === 'PARTIAL_PAID')) ||
      (statusFilter === 'FULLY_PAID' && (b.status === 'FULLY_PAID' || b.status === 'CONFIRMED')) ||
      (statusFilter === 'CANCELLED' && b.status === 'CANCELLED');

    return matchesSearch && matchesDate && matchesStatus;
  });

  const displayedBookings = filteredBookings;
  const hasMore = hasMoreInDB;

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      const res = await apiClient.get<BookingListItem[]>('/api/v1/bookings/agent/bookings', {
        params: { limit: 20, offset: bookings.length }
      });
      setBookings(prev => [...prev, ...res.data]);
      if (res.data.length < 20) {
        setHasMoreInDB(false);
      }
    } catch (err: any) {
      console.error('Failed to load more bookings:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'FULLY_PAID':
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            Confirmed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-700 ring-1 ring-inset ring-amber-600/20">
            Pending Payment
          </span>
        );
      case 'PARTIAL_PAID':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-700 ring-1 ring-inset ring-blue-600/20">
            Advance Paid
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-red-700 ring-1 ring-inset ring-red-600/20">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-700 ring-1 ring-inset ring-slate-600/20">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Header Title */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-brand-river)] tracking-tight">Booking List</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Review, filter, and track all your active customer reservations.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-100 text-slate-500">
            <TrendingUp className="h-3.5 w-3.5 text-teal-500 animate-pulse" /> Live List
          </span>
        </div>
      </div>

      {/* Filter Controls (White UI Bar) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-border space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center">
          {/* Name/ID Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by passenger name, booking ID, tour package..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/20 focus:border-[var(--color-brand-teal)] text-sm font-semibold transition-all bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Custom Styled Date Picker Filter */}
          <div className="relative w-full lg:w-56 shrink-0" ref={calendarRef}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsCalendarOpen(!isCalendarOpen);
                }
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all outline-none text-left cursor-pointer select-none ${
                isCalendarOpen
                  ? 'border-[#5ac4d7] bg-white ring-2 ring-[#5ac4d7]/15 shadow-md shadow-[#5ac4d7]/5'
                  : 'border-slate-200 bg-white hover:border-[#5ac4d7]/50 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Calendar className={`h-4.5 w-4.5 text-slate-400 shrink-0 ${isCalendarOpen ? 'text-[#5ac4d7]' : ''}`} />
                <span className={!dateFilter ? 'text-slate-400 font-medium' : 'text-slate-800 font-bold'}>
                  {dateFilter ? new Date(dateFilter).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Travel Date'}
                </span>
              </div>
              {dateFilter && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDateFilter('');
                    setIsCalendarOpen(false);
                  }}
                  className="p-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 shrink-0 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {isCalendarOpen && (
              <div className="absolute right-0 lg:left-0 mt-2 z-50 rounded-2xl border border-slate-150 bg-white p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 w-72">
                <div className="flex justify-between items-center mb-3">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="font-extrabold text-xs text-[#0f3d56] uppercase tracking-wider">
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][calMonth]} {calYear}
                  </div>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-[10px] font-bold text-slate-400 py-1 uppercase tracking-wider">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {(() => {
                    const daysInMonth = getDaysInMonth(calYear, calMonth);
                    const firstDay = getFirstDayOfMonth(calYear, calMonth);
                    const cells = [];
                    for (let i = 0; i < firstDay; i++) {
                      cells.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
                    }
                    for (let i = 1; i <= daysInMonth; i++) {
                      const d = new Date(calYear, calMonth, i);
                      const yearStr = d.getFullYear();
                      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
                      const dateNumStr = String(d.getDate()).padStart(2, '0');
                      const dateStr = `${yearStr}-${monthStr}-${dateNumStr}`;
                      const isSelected = dateStr === dateFilter;
                      cells.push(
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleDaySelect(i)}
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150 cursor-pointer hover:bg-slate-100 text-slate-700
                            ${isSelected ? 'bg-[#5ac4d7] text-white hover:bg-[#48b2c5] font-black shadow-md shadow-[#5ac4d7]/25' : ''}
                          `}
                        >
                          {i}
                        </button>
                      );
                    }
                    return cells;
                  })()}
                </div>
                <div className="flex justify-between items-center border-t border-slate-50 mt-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      const y = today.getFullYear();
                      const m = String(today.getMonth() + 1).padStart(2, '0');
                      const d = String(today.getDate()).padStart(2, '0');
                      setDateFilter(`${y}-${m}-${d}`);
                      setIsCalendarOpen(false);
                    }}
                    className="text-xs font-bold text-[#5ac4d7] hover:underline cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDateFilter('');
                      setIsCalendarOpen(false);
                    }}
                    className="text-xs font-bold text-slate-400 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Custom Styled Dropdown Filter */}
          <div className="w-full lg:w-48 shrink-0">
            <PremiumSelect
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
              }}
              options={[
                { value: 'ALL', label: 'All Bookings' },
                { value: 'FULLY_PAID', label: 'Confirmed' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
              placeholder="All Bookings"
            />
          </div>
        </div>

        {/* Active Filter Badges */}
        {(searchQuery || dateFilter || statusFilter !== 'ALL') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-50 text-xs">
            <span className="text-slate-400 font-bold">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-slate-600 font-semibold">
                Query: {searchQuery}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {dateFilter && (
              <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-slate-600 font-semibold">
                Travel Date: {dateFilter}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setDateFilter('')} />
              </span>
            )}
            {statusFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-slate-600 font-semibold">
                Status: {statusFilter}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter('ALL')} />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bookings List (White Grid Cards) */}
      {loading ? (
        <div className="flex h-56 items-center justify-center bg-white rounded-3xl border border-border shadow-sm">
          <div className="flex items-center gap-3 text-[var(--color-brand-teal)]">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm font-semibold text-slate-500">Querying transaction log...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-3xl p-8 border border-red-100 text-center text-red-600">
          <p className="font-bold text-sm">Failed to retrieve bookings: {error}</p>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-400 px-1">
            Showing {displayedBookings.length} of {filteredBookings.length} bookings matched.
          </div>
          
          {displayedBookings.map((b) => (
            <div 
              key={b.id} 
              className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden transition-all hover:shadow-md group flex flex-col md:flex-row"
            >
              {/* Visual Accent Box */}
              <div className="w-full md:w-56 bg-slate-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 shrink-0">
                <div>
                  <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Reservation ID</span>
                  <p className="font-extrabold text-[var(--color-brand-river)] mt-0.5">{b.public_id}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  {getStatusBadge(b.status)}
                </div>
              </div>

              {/* Details Content Panel */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tour Information */}
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-800 leading-tight group-hover:text-[var(--color-brand-teal)] transition-colors">
                      {b.package_title}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wider">{b.variant_title}</p>
                    
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-4">
                      <Calendar className="h-4 w-4 text-slate-400" /> 
                      <span>Travel Date: <strong className="text-slate-700">{b.travel_date}</strong></span>
                    </div>
                  </div>

                  {/* Passenger details */}
                  <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                      <Users className="h-3.5 w-3.5" /> Passengers ({b.adult_count} Adults, {b.child_count} Kids)
                    </span>
                    {b.passenger_names && b.passenger_names.length > 0 ? (
                      <div className="space-y-1">
                        {b.passenger_names.map((name, i) => (
                          <p key={i} className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                            <UserCheck className="h-3 w-3 text-emerald-500 shrink-0" /> {name}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No passenger lists synced.</p>
                    )}
                  </div>
                </div>

                {/* Pricing footer summary */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-6 pt-6 border-t border-slate-100 gap-4">
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">Subtotal</span>
                      <p className="font-bold text-slate-700">₹{b.subtotal_amount.toLocaleString('en-IN')}</p>
                    </div>
                    {b.coupon_discount > 0 && (
                      <div>
                        <span className="text-slate-400 font-medium">Discount ({b.coupon_applied})</span>
                        <p className="font-bold text-red-600">-₹{b.coupon_discount.toLocaleString('en-IN')}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400 font-medium">GST & Fees</span>
                      <p className="font-bold text-slate-700">₹{(b.gst_amount + b.gateway_fee).toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-8 sm:gap-12 border-t sm:border-t-0 pt-4 sm:pt-0">
                    <div className="text-right min-w-[100px] sm:min-w-[120px]">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Tourist Bill</span>
                      <p className="font-black text-xl text-slate-800 tracking-tight leading-none mt-1">
                        ₹{b.total_amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                    
                    <Link 
                      href={`/dashboard/bookings/${b.public_id}`}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-[var(--color-brand-river)] transition-all shrink-0"
                    >
                      View Ticket
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Load More Pagination Trigger */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-brand-river)] text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#1a5663] transition-all hover:scale-[1.02] shadow-sm disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Bookings'
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-border p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Ticket className="h-7 w-7 text-slate-350" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-base">No bookings found</h3>
          <p className="text-slate-400 max-w-sm mx-auto text-xs font-semibold leading-relaxed mt-2">
            No reservations matched your search query or status criteria. Try clearing active filters.
          </p>
        </div>
      )}
    </div>
  );
}
