import React from 'react';
import type { Metadata } from 'next';
import { RefreshCcw, CheckCircle2, Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund Policy | Telangana Boat Tourism',
  description: 'Understand the refund parameters and credit conditions of Telangana Boat Tourism.',
  alternates: { canonical: '/refund' },
};

const POINTS = [
  'For cancellations made at least 7 days before the travel date, bookings are eligible for a full/partial refund, or a travel voucher credits selection for future travel.',
  'Cancellations made within 7 days of the scheduled departure are subject to rescheduling options, a travel credit voucher, or a partial refund, subject to administrative charges up to 35%.',
  'In the event of unforeseen cancellations due to weather, floods, safety concerns, or government guidelines, a 100% full refund is processed or customers can choose to reschedule without any additional fees.',
  'Refund requests should be raised through your registered account dashboard or by contacting us at bookings@tsboattourism.org.',
  'Approved refunds are credited directly back to the original payment source (bank account/card) within 5 to 7 working days.',
];

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#f7faf9]">
      <section className="relative overflow-hidden bg-[var(--color-brand-river)] px-4 py-20 text-white sm:px-6 md:py-28 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(229,218,197,0.13),transparent_42%),radial-gradient(circle_at_72%_18%,rgba(255,255,255,0.12),transparent_28%)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--color-brand-sand)] backdrop-blur">
            <Scale className="h-4 w-4" />
            Legal Framework
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Refund Policy
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
            Details regarding our customer-friendly refund process.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <RefreshCcw className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-brand-teal)]">Refunds</div>
              <h2 className="mt-2 text-2xl font-bold text-[var(--color-brand-river)] md:text-3xl">Cancellation & Refund Guidelines</h2>
              <div className="mt-6 grid gap-3">
                {POINTS.map((point, idx) => (
                  <div key={idx} className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand-teal)]" />
                    <p className="text-sm leading-6 text-slate-600 md:text-base">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
