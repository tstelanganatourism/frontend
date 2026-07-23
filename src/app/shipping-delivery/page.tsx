import React from 'react';
import type { Metadata } from 'next';
import { Truck, CheckCircle2, Scale } from 'lucide-react';
import PublicPageHeader from '@/components/layout/PublicPageHeader';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | TS Boat Tourism',
  description: 'Understand how tour tickets, invoices, and vouchers are delivered dynamically.',
  alternates: { canonical: '/shipping-delivery' },
};

const POINTS = [
  'TS Boat Tourism provides digital ticketing and services. No physical shipping is required.',
  'Upon successful payment completion, your official booking ticket, tax invoice, and travel details are sent instantly via Email and WhatsApp (within 5-10 minutes).',
  'You can access and print your booking receipts, ticket passes, and invoice sheets at any time by logging into the customer dashboard.',
  'If you do not receive your digital confirmation within 30 minutes, please contact our support team at tstelanganatourism@gmail.com or call +91 99513 69573.',
];

export default function ShippingDeliveryPage() {
  return (
    <div className="bg-[#eaf7f6]">
      <PublicPageHeader
        eyebrow="Fulfillment Framework"
        title="Shipping & Delivery Policy"
        description="How digital tickets, invoices, and booking confirmations are delivered."
        icon={Scale}
      />

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <article className="rounded-md border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-[#e9f7f7] text-[#1598a1]">
              <Truck className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-brand-teal)]">Fulfillment</div>
              <h2 className="mt-2 text-2xl font-bold text-[var(--color-brand-river)] md:text-3xl">Service Delivery & Transmission</h2>
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
