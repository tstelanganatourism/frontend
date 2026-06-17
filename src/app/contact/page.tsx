import React from 'react';
import type { Metadata } from 'next';
import { Mail, Phone, MapPin, ShieldCheck, Scale, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | Telangana Boat Tourism',
  description: 'Reach out to Telangana Boat Tourism support desk. Find address, phone, email, and GSTIN details.',
  alternates: { canonical: '/contact' },
};

const CONTACT_CHANNELS = [
  {
    icon: Phone,
    title: 'Customer Helpline',
    desc: 'Call us for package queries, stays support and direct offline bookings.',
    details: [
      '+91 95420 69573',
      '+91 98498 48982',
      '+91 98498 48983',
      '+91 98498 48938'
    ],
    tone: 'bg-emerald-50 text-emerald-700'
  },
  {
    icon: Mail,
    title: 'Email Correspondence',
    desc: 'Send us your inquiries, custom group bookings or cancellation requests.',
    details: [
      'bookings@tsboattourism.org'
    ],
    tone: 'bg-sky-50 text-sky-700'
  },
  {
    icon: MapPin,
    title: 'Central Booking Office',
    desc: 'Visit our ticketing counter in Bhadrachalam.',
    details: [
      'DR NO:4-1-78/1, KALYANA MANDAPAM ROAD OPP SBI ATM, BHADRACHALAM, BHADRADRI KOTHAGUDEM (DIST), TELANGANA-507111'
    ],
    tone: 'bg-amber-50 text-amber-700'
  }
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f7faf9]">
      <section className="relative overflow-hidden bg-[var(--color-brand-river)] px-4 py-20 text-white sm:px-6 md:py-28 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(229,218,197,0.13),transparent_42%),radial-gradient(circle_at_72%_18%,rgba(255,255,255,0.12),transparent_28%)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--color-brand-sand)] backdrop-blur">
            <ShieldCheck className="h-4 w-4" />
            Support Center
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
            We are here to help you plan your Godavari river cruise and stays.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {CONTACT_CHANNELS.map((channel, idx) => {
            const Icon = channel.icon;
            return (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <span className={`grid h-12 w-12 place-items-center rounded-xl mb-4 ${channel.tone}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <h2 className="text-xl font-bold text-[var(--color-brand-river)] mb-2">{channel.title}</h2>
                  <p className="text-slate-500 text-xs mb-4">{channel.desc}</p>
                </div>
                <div className="space-y-1.5 mt-auto">
                  {channel.details.map((detail, dIdx) => (
                    <div key={dIdx} className="text-sm font-black text-slate-700 select-all leading-normal">
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* GSTIN & Office Registration Info */}
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-[var(--color-brand-river)]">Official Tax Registrations</h3>
              <p className="text-slate-500 text-sm">
                Telangana Boat Tourism is a trade name of NALLA SRILATHA, registered under the Goods and Services Tax (GST) Act, Government of India.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <span className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 border border-indigo-150 px-3 py-1.5 text-xs font-black text-indigo-700">
                  <ShieldCheck className="h-4 w-4" />
                  GSTIN: 36AYSPN0044M1ZZ (Telangana State · NALLA SRILATHA)
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-150 px-3 py-1.5 text-xs font-black text-slate-600">
                  <Clock className="h-4 w-4" />
                  Reporting time: 7:00 AM - 7:30 AM
                </span>
              </div>
            </div>
            <div className="text-xs font-bold text-slate-400">
              For disputes, Bhadrachalam jurisdiction applies.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
