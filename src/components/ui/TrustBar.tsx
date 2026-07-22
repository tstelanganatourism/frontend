'use client';

import React from 'react';
import { ShieldCheck, BadgeCheck, Headphones, Smartphone, Users, Clock } from 'lucide-react';

const trustItems = [
  { icon: ShieldCheck, label: 'Govt. Authorized Agent', sub: 'Official & Trusted' },
  { icon: BadgeCheck, label: 'Govt. Approved', sub: 'Safe & Verified' },
  { icon: Smartphone, label: 'PhonePe Payments', sub: 'Secure & Instant' },
  { icon: Headphones, label: '24/7 Booking Support', sub: 'Quick & Reliable' },
];

const stats = [
  { icon: Clock, value: '20+', label: 'Years Experience' },
  { icon: Users, value: '1L+', label: 'Happy Travellers' },
];

export default function TrustBar() {
  return (
    <div className="relative z-20 mx-auto w-full max-w-[92rem] px-4 pt-6 pb-2 sm:px-6 lg:px-10 select-none">
      <div className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 text-slate-950 shadow-[0_8px_28px_rgba(15,61,86,0.07)] sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-center lg:p-4">
        {trustItems.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3 px-1 py-1">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-100 text-[var(--color-brand-river)] bg-gradient-to-br from-slate-50 to-teal-50/40">
              <Icon className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-[12.5px] font-black leading-5 text-slate-900">{label}</p>
              <p className="text-[11px] font-semibold leading-4 text-slate-500">{sub}</p>
            </div>
          </div>
        ))}
        {/* Stats column */}
        <div className="hidden items-center justify-end gap-5 border-l border-slate-200 pl-5 lg:flex">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center text-center">
              <span className="text-lg font-black text-[var(--color-brand-river)] leading-none">{value}</span>
              <span className="mt-0.5 text-[10px] font-semibold text-slate-500 whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
