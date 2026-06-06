import React from 'react';
import type { Metadata } from 'next';
import { Shield, CheckCircle2, Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Telangana Boat Tourism',
  description: 'Read the privacy policy, data collection terms, and safety parameters of Telangana Boat Tourism.',
  alternates: { canonical: '/privacy' },
};

const POINTS = [
  'We collect guest details (Name, Age, Gender, Contact) and government IDs solely for boarding and safety checks.',
  'We do not sell, trade, or otherwise transfer your personally identifiable information to unauthorized outside parties.',
  'Trusted service partners and government authorities may receive passenger data to conduct official tourism operations, provided they maintain complete confidentiality.',
  'Financial transaction credentials are processed securely via encrypted payment gateways and are never stored on our servers.',
];

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
            Understand how we manage, protect, and verify passenger data.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Shield className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-brand-teal)]">Data Protection</div>
              <h2 className="mt-2 text-2xl font-bold text-[var(--color-brand-river)] md:text-3xl">Privacy & Safety Standards</h2>
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
