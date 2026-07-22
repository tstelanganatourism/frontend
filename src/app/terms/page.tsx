import React from 'react';
import type { Metadata } from 'next';
import { Scale, BookOpen, ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import PublicPageHeader from '@/components/layout/PublicPageHeader';

export const metadata: Metadata = {
  title: 'Terms of Use & Conditions | TS Boat Tourism',
  description: 'Read the terms of use, conditions, and legal framework governing the TS Boat Tourism platform.',
  alternates: { canonical: '/terms' },
};

const TERMS_OF_USE = [
  {
    title: 'Eligibility and Registration',
    content: 'You agree to provide true, accurate, and complete information during and after registration, and you are responsible for all activity through your account.',
  },
  {
    title: 'Accuracy of Information',
    content: 'Information on this platform may contain inaccuracies or errors. We exclude liability for such inaccuracies to the fullest extent permitted by law.',
  },
  {
    title: 'Use of Services',
    content: 'Your use of our services is at your own risk. You must independently assess whether the services meet your requirements.',
  },
  {
    title: 'Intellectual Property',
    content: 'The platform content, including design, layout, graphics, and text, is proprietary.',
  },
  {
    title: 'Prohibited Use',
    content: 'You agree not to use the platform or services for unlawful purposes or in violation of applicable laws.',
  },
  {
    title: 'Third-Party Links',
    content: 'This platform may include links to third-party websites. Their terms and privacy policies will govern your use of those websites.',
  },
  {
    title: 'Legal Relationship',
    content: 'Initiating a transaction may constitute a legally binding contract between you and TS BOAT TOURISM.',
  },
  {
    title: 'Indemnity',
    content: 'You agree to indemnify and hold harmless TS BOAT TOURISM, its affiliates, and employees against claims arising from your breach of these terms.',
  },
  {
    title: 'Limitation of Liability',
    content: 'TS BOAT TOURISM will not be liable for indirect, incidental, or consequential damages. Maximum liability shall not exceed the amount paid by you for the relevant service, or INR 100, whichever is lower.',
  },
  {
    title: 'Force Majeure',
    content: 'We are not liable for delay or failure to perform obligations due to events beyond our reasonable control.',
  },
  {
    title: 'Governing Law and Jurisdiction',
    content: 'These terms are governed by the laws of India and are subject to applicable court jurisdiction.',
  },
  {
    title: 'Communication',
    content: 'Questions regarding these terms may be directed using the contact details on our Contact page.',
  },
];

export default function TermsPage() {
  return (
    <div className="bg-[#eaf7f6] selection:bg-teal-100 selection:text-teal-900">
      <PublicPageHeader
        eyebrow="Legal Framework"
        title="Terms of Use"
        description="Platform terms of service, customer conditions, and license agreements for TS Boat Tourism."
        icon={Scale}
      />

      {/* Main Content Area */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px] items-start">
          
          {/* Main Terms Content */}
          <div className="space-y-16">
            
            {/* Terms of Use Section */}
            <article id="terms-of-use" className="scroll-mt-28">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-md bg-gradient-to-br from-[#0f6f78] to-[#0f3d56] text-white shadow-lg shadow-blue-500/10">
                  <BookOpen className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#1e468a] tracking-tight">Terms of Use</h2>
                  <p className="text-slate-500 mt-1 text-sm font-medium">Platform ownership, usage rules, and customer definitions</p>
                </div>
              </div>

              <div className="rounded-md bg-white p-7 shadow-[0_4px_30px_rgba(15,61,86,0.04)] border border-slate-100/80 mb-8">
                <p className="text-slate-600 leading-relaxed text-[17px]">
                  The platform is owned and operated by <strong className="font-bold text-[#1e468a]">TS BOAT TOURISM</strong>. Your use of this platform, its services, and tools is governed by the following terms and conditions (&quot;Terms of Use&quot;), including applicable policies incorporated herein by reference. If you transact on the platform, you agree to the policies applicable to such transactions.
                </p>
                <p className="text-slate-600 leading-relaxed text-[17px] mt-4">
                  For these Terms of Use, &quot;you&quot;, &quot;your&quot; or &quot;user&quot; means any natural or legal person using the platform. Accessing, browsing, or otherwise using the platform indicates your agreement to these Terms of Use. Please read them carefully before proceeding.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {TERMS_OF_USE.map((item, idx) => (
                  <div key={idx} className="group relative overflow-hidden rounded-md bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-150/60 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#1598a1] transform origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100" />
                    <span className="text-[11px] font-black text-[#1598a1] tracking-widest uppercase block mb-1">Key Term {idx + 1}</span>
                    <h3 className="text-lg font-bold text-[#1e468a] tracking-tight">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-500">{item.content}</p>
                  </div>
                ))}
              </div>
            </article>

            {/* General Terms & Conditions Section */}
            <article id="general-terms" className="scroll-mt-28">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-md bg-gradient-to-br from-[#1598a1] to-[#0f7279] text-white shadow-lg shadow-teal-500/10">
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#1e468a] tracking-tight">Terms & Conditions</h2>
                  <p className="text-slate-500 mt-1 text-sm font-medium">Orders, liabilities, and service agreements (Updated 2023-11-06)</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-md bg-white p-7 shadow-[0_4px_30px_rgba(15,61,86,0.04)] border border-slate-100/80">
                  <h3 className="text-xl font-bold text-[#1e468a] mb-4 tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-[#1598a1] rounded-full inline-block" />
                    General Terms
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-[16px]">
                    By accessing and placing an order with <strong className="font-bold text-[#1e468a]">TSTELANGANA TOURISM</strong>, you confirm that you are in agreement with and bound by the terms of service contained in the Terms & Conditions outlined below. These terms apply to the entire website and any email or other type of communication between you and TSTELANGANA TOURISM.
                  </p>
                  <p className="text-slate-600 leading-relaxed text-[16px] mt-4">
                    Under no circumstances shall TSTELANGANA TOURISM team be liable for any direct, indirect, special, incidental, or consequential damages, including, but not limited to, loss of data or profit, arising out of the use, or the inability to use, the materials on this site, even if TSTELANGANA TOURISM team or an authorized representative has been advised of the possibility of such damages.
                  </p>
                  <p className="text-slate-600 leading-relaxed text-[16px] mt-4">
                    If your use of materials from this site results in the need for servicing, repair, or correction of equipment or data, you assume any costs thereof. TSTELANGANA TOURISM will not be responsible for any outcome that may occur during the course of usage of our resources. We reserve the right to change prices and revise the resources usage policy at any moment without any prior intimation / notice.
                  </p>
                </div>

                <div className="rounded-md bg-gradient-to-br from-[#d9f1ef] to-[#f7fbfb] p-7 border border-[#1598a1]/15">
                  <h3 className="text-xl font-bold text-[#1e468a] mb-4 tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-[#1e468a] rounded-full inline-block" />
                    License Grant
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-[16px]">
                    TSTELANGANA TOURISM grants you a revocable, non-exclusive, non-transferable, limited license to download, install and use the website strictly in accordance with the terms of this Agreement.
                  </p>
                  <p className="text-slate-600 leading-relaxed text-[16px] mt-4">
                    These Terms & Conditions are a contract between you and TSTELANGANA TOURISM (referred to in these Terms & Conditions as &quot;TSTELANGANA TOURISM&quot;, &quot;us&quot;, &quot;we&quot; or &quot;our&quot;), the provider of the TSTELANGANA TOURISM website and the services accessible from the TSTELANGANA TOURISM website (which are collectively referred to in these Terms & Conditions as the &quot;TSTELANGANA TOURISM Service&quot;).
                  </p>
                  <p className="text-slate-600 leading-relaxed text-[16px] mt-4">
                    You are agreeing to be bound by these Terms & Conditions. If you do not agree to these Terms & Conditions, please do not use the TSTELANGANA TOURISM Service. In these Terms & Conditions, &quot;you&quot; refers both to you as an individual and to the entity you represent. If you violate any of these Terms & Conditions, we reserve the right to cancel your account or block access to your account without notice.
                  </p>
                </div>
              </div>
            </article>

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
                <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-[#0f3d56] to-[#1598a1] px-4 py-3 text-sm font-black text-white shadow-sm">
                  Terms of Use
                  <Scale className="h-4 w-4 text-[#8eecee]" />
                </div>
                <Link href="/privacy" className="flex items-center justify-between rounded-md px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-[#f0f7f8] hover:text-[#0f3d56]">
                  Privacy Policy
                  <ArrowRight className="h-4 w-4" />
                </Link>
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
