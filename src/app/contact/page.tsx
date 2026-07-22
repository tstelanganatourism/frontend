import React from 'react';
import type { Metadata } from 'next';
import { Mail, Phone, MapPin, ShieldCheck, Clock, Star, Landmark } from 'lucide-react';
import PublicPageHeader from '@/components/layout/PublicPageHeader';

export const metadata: Metadata = {
  title: 'Contact Us | TS Boat Tourism',
  description: 'Reach out to TS Boat Tourism support desk. Find address, phone, email, and GSTIN details.',
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
    color: 'from-[#1598a1] to-[#0f7279]'
  },
  {
    icon: Mail,
    title: 'Email Correspondence',
    desc: 'Send us your inquiries, custom group bookings or cancellation requests.',
    details: [
      'bookings@tstelanganatourism.com'
    ],
    color: 'from-[#0f6f78] to-[#0f3d56]'
  },
  {
    icon: MapPin,
    title: 'Central Booking Office',
    desc: 'Visit our ticketing counter in Bhadrachalam.',
    details: [
      'Om Shanti satram, Kalyana mandapam road, near SBI ATM, Bhadrachalam, Telangana 507111'
    ],
    color: 'from-[#1598a1] to-[#0f6f78]'
  }
];

export default function ContactPage() {
  return (
    <div className="bg-[#eaf7f6] selection:bg-teal-100 selection:text-teal-900">
      <PublicPageHeader
        eyebrow="Support Center"
        title="Contact Us"
        description="Call, email, or visit our Bhadrachalam booking office for Papikondalu cruises, stays, and package support."
        icon={ShieldCheck}
      />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        
        {/* Contact Cards Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {CONTACT_CHANNELS.map((channel, idx) => {
            const Icon = channel.icon;
            return (
              <div 
                key={idx} 
                className="group relative overflow-hidden rounded-md bg-white p-7 shadow-[0_4px_25px_rgba(15,61,86,0.04)] border border-slate-100 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(15,61,86,0.08)] hover:-translate-y-1"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-[#1598a1] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <span className={`grid h-14 w-14 place-items-center rounded-md mb-6 bg-gradient-to-br ${channel.color} text-white shadow-md shadow-slate-900/10`}>
                      <Icon className="h-7 w-7" />
                    </span>
                    <h2 className="text-xl font-bold text-[#1e468a] mb-3 tracking-tight">{channel.title}</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">{channel.desc}</p>
                  </div>
                  <div className="space-y-2 mt-auto border-t border-slate-100 pt-5">
                    {channel.details.map((detail, dIdx) => (
                      <div key={dIdx} className="text-base font-extrabold text-slate-800 select-all leading-normal tracking-wide">
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Google Reviews Banner (Ultra Premium Redesign) */}
        <div className="mt-8 rounded-md bg-gradient-to-r from-[#0f6f78] to-[#1598a1] p-7 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-[#8eecee] text-[#8eecee]" />
                ))}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Loved your journey with us?
              </h3>
              <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed">
                Your feedback matters! Leave a review on Google to share your experience with other travelers looking for Godavari cruise packages and Kolluru stay reservations.
              </p>
            </div>
            <a
              href="https://g.page/r/CcdqZmyXuAhxEAI/review"
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center rounded-md bg-white px-7 py-4 text-sm font-black text-[#0f3d56] transition-all hover:-translate-y-0.5 hover:bg-[#e9f7f7] shadow-md uppercase tracking-wider"
            >
              Write Google Review
            </a>
          </div>
        </div>

        {/* Official Shop License Info (Premium Redesign) */}
        <div className="mt-8 rounded-md bg-white p-7 shadow-[0_4px_25px_rgba(15,61,86,0.04)] border border-slate-100 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Landmark className="h-6 w-6 text-[#1598a1]" />
                <h3 className="text-xl font-bold text-[#1e468a] tracking-tight">Official Shop Registration</h3>
              </div>
              <p className="text-slate-500 text-base leading-relaxed">
                TS Boat Tourism (officially registered as TELANGANA BOAT TOURISM) is operated by NALLA SAI BABU, registered under the Telangana Shops &amp; Establishments Act, 1988.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <span className="inline-flex items-center gap-2 rounded-md bg-[#e9f7f7] border border-[#1598a1]/20 px-4 py-2.5 text-xs font-black text-[#0f3d56]">
                  <ShieldCheck className="h-4 w-4 text-[#1598a1]" />
                  Registration No: SEA/KMM/ALO/BC/09998/2016
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-150 px-4 py-2.5 text-xs font-black text-slate-600">
                  <Clock className="h-4 w-4" />
                  Reporting time: 7:00 AM - 7:30 AM
                </span>
              </div>
            </div>
            <div className="text-xs font-bold text-slate-400 lg:border-l lg:border-slate-100 lg:pl-8 max-w-[200px]">
              For any disputes or claims, Bhadrachalam court jurisdiction applies exclusively.
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
