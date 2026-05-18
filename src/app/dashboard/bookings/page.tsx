'use client';

import { useState } from 'react';
import { Ticket, Search, Filter, Ship, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { toast } from 'sonner';

type Tab = 'UPCOMING' | 'PAST' | 'CANCELLED';

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('UPCOMING');

  // Empty state until booking engine is built
  const mockBookings: any[] = [];

  const filtered = mockBookings.filter(b => b.type === activeTab);

  const handleComingSoon = () => {
    toast.info('Search and Filtering will be available once the booking engine is active.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-border">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-[var(--color-brand-river)]">My Bookings</h1>
            <p className="text-sm text-slate-500">Manage your tickets and trip history.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleComingSoon}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[var(--color-brand-river)] transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
            <button 
              onClick={handleComingSoon}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[var(--color-brand-river)] transition-colors flex items-center gap-2 text-sm font-bold"
            >
              <Filter className="h-4 w-4" /> Filter
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mt-8 border-b border-slate-100">
          {(['UPCOMING', 'PAST', 'CANCELLED'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[var(--color-brand-teal)] text-[var(--color-brand-river)]'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()} Trips
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col sm:flex-row transition-all hover:shadow-md group">
              {/* Image Placeholder */}
              <div className="w-full sm:w-48 h-32 sm:h-auto bg-slate-100 relative shrink-0 flex items-center justify-center">
                <Ship className="h-8 w-8 text-slate-300" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase text-slate-800">
                  {booking.id}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-slate-800 leading-tight group-hover:text-[var(--color-brand-teal)] transition-colors">
                      {booking.package}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700 ring-1 ring-inset ring-green-600/20 shrink-0 ml-4">
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" /> {booking.date}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Total Paid</p>
                    <p className="font-black text-slate-800">{booking.amount}</p>
                  </div>
                  <Link 
                    href={`/dashboard/bookings/${booking.id}`}
                    className="flex items-center gap-1 text-sm font-bold text-[var(--color-brand-teal)] hover:underline"
                  >
                    View Ticket <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-border">
            <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No {activeTab.toLowerCase()} bookings</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
              You don't have any {activeTab.toLowerCase()} trips right now. Start exploring the Godavari!
            </p>
            {activeTab === 'UPCOMING' && (
              <Link 
                href="/packages"
                className="inline-flex items-center justify-center rounded-xl bg-[var(--color-brand-river)] text-white px-6 py-2.5 text-sm font-bold hover:bg-[#1a5663] transition-colors"
              >
                Browse Packages
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
