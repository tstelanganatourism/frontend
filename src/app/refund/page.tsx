import React from 'react';
import type { Metadata } from 'next';
import { RefreshCcw, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import PublicPageHeader from '@/components/layout/PublicPageHeader';

export const metadata: Metadata = {
  title: 'Refund Policy | TS Boat Tourism',
  description: 'Understand the refund parameters and credit conditions of TS Boat Tourism.',
  alternates: { canonical: '/refund' },
};

export default function RefundPage() {
  return (
    <div className="bg-[#eaf7f6] selection:bg-teal-100 selection:text-teal-900">
      <PublicPageHeader
        eyebrow="Refunds & Cancellations"
        title="Refund Policy"
        description="Refund guidelines, timelines, and claim procedures for TS Boat Tourism bookings."
        icon={RefreshCcw}
      />

      {/* Main Content Area */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px] items-start">
          {/* Main Refund Content Card */}
          <div className="rounded-md bg-white p-7 sm:p-10 shadow-[0_4px_30px_rgba(15,61,86,0.04)] border border-slate-100/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#1598a1]/5 rounded-full blur-3xl opacity-50 pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b border-slate-100 pb-8 mb-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gradient-to-br from-[#1598a1] to-[#0f7279] text-white shadow-lg shadow-teal-500/10">
                <RefreshCcw className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#1e468a] tracking-tight">Refund Processing & Terms</h2>
                <p className="text-slate-500 mt-1 text-sm font-medium">Standard guidelines for cancellation and refunds</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex gap-4 items-start bg-slate-50 p-6 rounded-md border border-slate-100">
                <CheckCircle2 className="h-6 w-6 text-[#1598a1] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Sole Discretion</h3>
                  <p className="text-slate-600 mt-2 leading-relaxed text-[16px]">
                    Refunds, if applicable, are processed at the sole discretion of <span className="font-extrabold text-[#1e468a]">TS BOAT TOURISM</span>.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-slate-50 p-6 rounded-md border border-slate-100">
                <CheckCircle2 className="h-6 w-6 text-[#1598a1] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">14 Working Days Window</h3>
                  <p className="text-slate-600 mt-2 leading-relaxed text-[16px]">
                    If approved, refunds are credited to the original payment method within <strong className="font-extrabold text-[#1e468a]">14 working days</strong>, subject to bank or payment partner processing timelines.
                  </p>
                </div>
              </div>
            </div>

            {/* Support Notice */}
            <div className="mt-8 rounded-md bg-[#dff4f3] p-6 border border-[#1598a1]/25 flex items-start gap-4">
              <ShieldCheck className="h-6 w-6 text-[#1598a1] shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                Need to request a cancellation or trace your refund status? Contact our central billing support desk with your booking reference ID.
              </p>
            </div>
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
                <Link href="/privacy" className="flex items-center justify-between rounded-md px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-[#f0f7f8] hover:text-[#0f3d56]">
                  Privacy Policy
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-[#0f3d56] to-[#1598a1] px-4 py-3 text-sm font-black text-white shadow-sm">
                  Refund Policy
                  <RefreshCcw className="h-4 w-4 text-[#8eecee]" />
                </div>
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
                <a href="tel:+919951369573" className="block text-center rounded-md bg-[#1598a1] py-2.5 text-xs font-black text-white hover:bg-[#117f87] transition-colors shadow-sm">
                  Call Customer Care
                </a>
                <a href="mailto:tstelanganatourism@gmail.com" className="block text-center rounded-md border border-white/20 bg-white/10 py-2.5 text-xs font-black text-white hover:bg-white/20 transition-colors">
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
