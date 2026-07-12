'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, BadgeCheck, Headphones, Globe2 } from 'lucide-react';

const trustItems = [
  { icon: ShieldCheck, label: 'Authorized Booking Agent', sub: 'Telangana & Andhra Pradesh' },
  { icon: BadgeCheck, label: 'Government Approved', sub: 'Safe & Trusted' },
  { icon: Headphones, label: '24/7 Booking Support', sub: 'Quick & Reliable' },
  { icon: Globe2, label: 'Secure Payments', sub: 'Secure & Encrypted' },
];

export default function TrustBar() {
  return (
    <div className="relative z-20 mx-auto hidden w-full max-w-[92rem] px-4 pt-8 pb-4 sm:px-6 md:block lg:px-10 select-none">
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-slate-950 shadow-[0_12px_32px_rgba(0,0,0,0.06)] sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-center lg:p-4">
        {trustItems.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3 px-1 py-1">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-[var(--color-brand-river)] bg-slate-50">
              <Icon className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black leading-5 text-slate-900">{label}</p>
              <p className="text-sm font-semibold leading-5 text-slate-600">{sub}</p>
            </div>
          </div>
        ))}
        <div className="hidden items-center justify-end gap-4 border-l border-slate-200 pl-5 lg:flex">
          <Image src="/aptdc-logo.svg" alt="APTDC" width={52} height={52} className="rounded-full bg-white p-1" />
          <span className="h-10 w-px bg-slate-300" />
          <Image src="/telangana-tourism-logo.svg" alt="Telangana Tourism" width={52} height={52} className="rounded-full bg-white p-1" />
        </div>
      </div>
    </div>
  );
}
