import React from 'react';
import type { Metadata } from 'next';
import { FileText, CheckCircle2, Scale } from 'lucide-react';
import PublicPageHeader from '@/components/layout/PublicPageHeader';

export const metadata: Metadata = {
  title: 'Cancellation Policy | TS Boat Tourism',
  description: 'Understand the cancellation parameters, deadlines, and rescheduling terms of TS Boat Tourism.',
  alternates: { canonical: '/cancellation' },
};

const POINTS = [
  'Cancellations requested at least 7 days before departure can be processed without administrative fees or converted to full travel credit vouchers.',
  'For cancellations made within 7 days of travel, a reschedule request or administrative fee of up to 35% applies depending on the package partner limits.',
  'If TS Boat Tourism cancels a tour due to weather conditions, technical problems, or administrative rules, you are entitled to a 100% full refund or immediate rescheduling.',
  'To request a cancellation, log in to your dashboard, click "Cancel Booking", or reach out to us at tstelanganatourism@gmail.com.',
];

export default function CancellationPage() {
  return (
    <div className="bg-[#eaf7f6]">
      <PublicPageHeader
        eyebrow="Legal Framework"
        title="Cancellation Policy"
        description="Cancellation deadlines, rescheduling options, and refund handling for booked journeys."
        icon={Scale}
      />

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <article className="rounded-md border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-[#e9f7f7] text-[#1598a1]">
              <FileText className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-brand-teal)]">Cancellations</div>
              <h2 className="mt-2 text-2xl font-bold text-[var(--color-brand-river)] md:text-3xl">Cancellation Rules & Deadlines</h2>
              <div className="mt-6 grid gap-3">
                {POINTS.map((point, idx) => (
                  <div key={idx} className="flex gap-3 rounded-md bg-slate-50 px-4 py-3">
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
