import React from 'react';
import type { Metadata } from 'next';
import { AlertCircle, CheckCircle2, FileText, Mail, Phone, RefreshCcw, Scale, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms, Cancellation & Refund Policy | Telangana Boat Tourism',
  description:
    'Read booking terms, cancellation rules, refund policy, privacy policy and travel conditions for Papikondalu tours and Bhadrachalam packages.',
  alternates: { canonical: '/terms' },
  keywords: [
    'Papikondalu cancellation policy',
    'Papikondalu refund policy',
    'Bhadrachalam tour terms',
    'Telangana Boat Tourism terms and conditions',
  ],
};

const SECTIONS = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    eyebrow: 'Your data',
    icon: Shield,
    tone: 'bg-emerald-50 text-emerald-700',
    points: [
      'We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.',
      'Trusted service partners may help us operate the website, conduct business, or serve customers when they agree to keep information confidential.',
      'We may release information when required to comply with law, enforce site policies, or protect rights, property, and safety.',
      'Non-personally identifiable visitor information may be used for marketing, advertising, or similar business purposes.',
    ],
  },
  {
    id: 'refund',
    title: 'Cancellation & Refund Policy',
    eyebrow: 'Before travel',
    icon: RefreshCcw,
    tone: 'bg-sky-50 text-sky-700',
    points: [
      'For cancellations made at least 7 days before the travel date, bookings are eligible for a full/partial refund, or a travel voucher credit for future travel.',
      'Cancellations made within 7 days of the scheduled departure are subject to rescheduling options, a travel credit voucher, or a partial refund, subject to administrative charges up to 35%.',
      'In the event of unforeseen cancellations due to weather, floods, safety concerns, or government guidelines, a 100% full refund is processed or customers can choose to reschedule without any additional fees.',
      'Approved refunds are transferred to the customer account within 5 to 7 working days.',
    ],
  },
  {
    id: 'terms',
    title: 'Travel Terms & Conditions',
    eyebrow: 'Journey rules',
    icon: FileText,
    tone: 'bg-amber-50 text-amber-700',
    points: [
      'Passengers should arrive at the travel premises at least 30 minutes before departure.',
      'The company is not responsible for loss of goods or property during travel.',
      'The company is not responsible for delay or inconvenience due to vehicle breakdown or other reasons beyond our control.',
      'If additional facilities fail during the journey, no refund will be provided for such cases.',
      'During bad weather, floods, bandh, technical problems, or similar circumstances, the company has full authority to cancel the tour.',
      'If the company cancels the tour, we will inform customers and transfer the full refund within 3 to 6 working days.',
      'All disputes are subject to Bhadrachalam jurisdiction only.',
    ],
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer',
    eyebrow: 'Website use',
    icon: AlertCircle,
    tone: 'bg-rose-50 text-rose-700',
    points: [
      'Website information is provided for general information purposes only.',
      'We try to keep content updated and correct, but do not provide warranties about completeness, accuracy, or suitability.',
      'Any reliance on website information is strictly at your own risk.',
      'We are not liable for loss or damage arising from website use, including indirect or consequential loss.',
      'External links are provided for convenience. We do not control the nature, content, or availability of external sites.',
      'TSTG Boat Tourism is not liable if the website is temporarily unavailable due to technical issues beyond our control.',
      'Telangana Boat Tourism is a trade name of NALLA SRILATHA.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f7faf9]">
      <section className="relative overflow-hidden bg-[var(--color-brand-river)] px-4 py-20 text-white sm:px-6 md:py-28 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(229,218,197,0.13),transparent_42%),radial-gradient(circle_at_72%_18%,rgba(255,255,255,0.12),transparent_28%)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--color-brand-sand)] backdrop-blur">
            <Scale className="h-4 w-4" />
            Legal framework
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Terms, Refunds & Travel Policies
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
            Clear booking rules for Papikondalu tours, Bhadrachalam trips, cancellations, refunds and customer support.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-brand-teal)]">Policy index</div>
            <nav className="mt-5 space-y-2">
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-[var(--color-brand-river)]"
                >
                  <section.icon className="h-4 w-4 text-[var(--color-brand-teal)]" />
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <article key={section.id} id={section.id} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${section.tone}`}>
                  <section.icon className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-brand-teal)]">{section.eyebrow}</div>
                  <h2 className="mt-2 text-2xl font-bold text-[var(--color-brand-river)] md:text-3xl">{section.title}</h2>
                  <div className="mt-6 grid gap-3">
                    {section.points.map((point) => (
                      <div key={point} className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand-teal)]" />
                        <p className="text-sm leading-6 text-slate-600 md:text-base">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}

          <div className="overflow-hidden rounded-2xl bg-[var(--color-brand-river)] p-6 text-white shadow-2xl md:p-8">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h3 className="text-2xl font-bold">Need clarification before booking?</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Our support team can explain cancellations, tour timing, refund eligibility and Bhadrachalam travel details. Reporting time is 7:00 AM to 7:30 AM, and Aadhaar Xerox is required for all passengers at the boat point.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a href="mailto:bookings@tsboattourism.org" className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-brand-sand)] px-5 py-3 text-sm font-bold text-[var(--color-brand-river)] transition-all duration-200 hover:-translate-y-1 hover:bg-white">
                  <Mail className="h-4 w-4" />
                  Email Support
                </a>
                <a href="tel:919542069573" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:text-[var(--color-brand-river)]">
                  <Phone className="h-4 w-4" />
                  Call Helpline
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
