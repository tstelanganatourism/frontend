import React from 'react';
import type { Metadata } from 'next';
import { Shield, Fingerprint, Lock, Eye, ArrowRight, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import PublicPageHeader from '@/components/layout/PublicPageHeader';

export const metadata: Metadata = {
  title: 'Privacy Policy | TS Boat Tourism',
  description: 'Learn how TS Boat Tourism collects, uses, and protects your personal data.',
  alternates: { canonical: '/privacy' },
};

const PRIVACY_POINTS = [
  {
    title: '1. Information We Collect',
    icon: Fingerprint,
    color: 'from-[#1598a1] to-[#0f7279]',
    content: 'When you place a booking request or interact with our site, we may collect your name, phone number, email address, address (if required), booking details, payment status details, and communication records.',
  },
  {
    title: '2. How We Use Your Information',
    icon: Eye,
    color: 'from-[#0f6f78] to-[#0f3d56]',
    content: 'We use your information to process bookings, provide support, send booking updates, improve services, and comply with legal requirements.',
  },
  {
    title: '3. Sharing Your Information',
    icon: Shield,
    color: 'from-[#1598a1] to-[#0f7279]',
    content: 'We do not sell or rent personal information. We may share it with trusted service providers (such as payment and technology partners) and lawful authorities where required.',
  },
  {
    title: '4. Data Security',
    icon: Lock,
    color: 'from-[#0f6f78] to-[#0f3d56]',
    content: 'We take reasonable steps to protect personal information from unauthorized access, misuse, or loss. Payment transactions are handled through secure third-party gateways.',
  },
  {
    title: '5. Cookies',
    icon: Eye,
    color: 'from-[#1598a1] to-[#0f7279]',
    content: 'We may use cookies to improve browsing experience and measure website performance. You can manage cookies through your browser settings.',
  },
  {
    title: '6. Your Rights',
    icon: Fingerprint,
    color: 'from-[#0f6f78] to-[#0f3d56]',
    content: 'You may request access, correction, or deletion of your personal information, subject to legal and operational requirements.',
  },
  {
    title: '7. Contact',
    icon: HelpCircle,
    color: 'from-[#1598a1] to-[#0f7279]',
    content: 'For privacy concerns, please contact TS BOAT TOURISM through the details provided on our Contact page.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-[#eaf7f6] selection:bg-teal-100 selection:text-teal-900">
      <PublicPageHeader
        eyebrow="Security & Trust"
        title="Privacy Policy"
        description="How we collect, use, and protect your personal data at TS Boat Tourism."
        icon={Shield}
      />

      {/* Main Content Area */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px] items-start">
          {/* List of Privacy Points */}
          <div className="space-y-5">
            {PRIVACY_POINTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="group relative overflow-hidden rounded-md bg-white p-7 shadow-[0_4px_25px_rgba(15,61,86,0.04)] border border-slate-100/80 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(15,61,86,0.08)] hover:-translate-y-1"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#1598a1] to-[#1e468a] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${item.color} text-white shadow-md shadow-slate-900/10`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#1e468a] tracking-tight">{item.title}</h2>
                      <p className="mt-3 text-slate-600 leading-relaxed text-base md:text-[17px]">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Sidebar */}
          <aside className="lg:sticky lg:top-24 space-y-6">
            {/* Quick Links Card */}
            <div className="rounded-md bg-white p-6 shadow-[0_4px_25px_rgba(15,61,86,0.04)] border border-slate-100/80">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#1598a1] mb-6 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-[#1598a1] rounded-full inline-block" />
                Quick Navigation
              </h3>
              <nav className="flex flex-col gap-2">
                <Link href="/terms" className="flex items-center justify-between rounded-md px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-[#f0f7f8] hover:text-[#0f3d56]">
                  Terms of Use
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-[#0f3d56] to-[#1598a1] px-4 py-3 text-sm font-black text-white shadow-sm">
                  Privacy Policy
                  <Shield className="h-4 w-4 text-[#8eecee]" />
                </div>
                <Link href="/refund" className="flex items-center justify-between rounded-md px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-[#f0f7f8] hover:text-[#0f3d56]">
                  Refund Policy
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </nav>
            </div>

            {/* Need Help Card */}
            <div className="relative overflow-hidden rounded-md bg-[#0f6f78] p-6 text-white shadow-xl">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full" />
              <h3 className="text-lg font-bold tracking-tight">Need assistance?</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-200">
                Contact our customer support desk for questions regarding bookings, cancellations, or data protection.
              </p>
              <div className="mt-5 space-y-3">
                <a href="tel:+919542069573" className="block text-center rounded-md bg-[#1598a1] py-2.5 text-xs font-black text-white hover:bg-[#117f87] transition-colors shadow-sm">
                  Call Customer Care
                </a>
                <a href="mailto:bookings@tstelanganatourism.com" className="block text-center rounded-md border border-white/20 bg-white/10 py-2.5 text-xs font-black text-white hover:bg-white/20 transition-colors">
                  Email Support
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
