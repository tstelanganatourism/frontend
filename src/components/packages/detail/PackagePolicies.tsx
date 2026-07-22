'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw, Anchor, FileText } from 'lucide-react';

interface Policy {
  id: number;
  type: string;
  title: string;
  description: string;
}

interface BoardingPoint {
  title: string;
  address?: string | null;
  map_url?: string | null;
}

interface PackagePoliciesProps {
  policies: Policy[];
  primaryBoarding?: BoardingPoint;
}

const getPolicyColorClass = (type: string) => {
  switch (type) {
    case 'CANCELLATION':
      return {
        bg: 'bg-rose-50 border-rose-100',
        text: 'text-rose-700',
        iconBg: 'bg-rose-500 text-white',
      };
    case 'CHECK_IN_OUT':
      return {
        bg: 'bg-indigo-50 border-indigo-100',
        text: 'text-indigo-700',
        iconBg: 'bg-indigo-500 text-white',
      };
    case 'TRAVEL_RULES':
      return {
        bg: 'bg-amber-50 border-amber-100',
        text: 'text-amber-700',
        iconBg: 'bg-amber-500 text-white',
      };
    default:
      return {
        bg: 'bg-slate-50 border-slate-100',
        text: 'text-slate-700',
        iconBg: 'bg-slate-500 text-white',
      };
  }
};

const getPolicyIcon = (type: string) => {
  switch (type) {
    case 'CANCELLATION':
      return <ShieldAlert className="h-5.5 w-5.5" />;
    case 'CHECK_IN_OUT':
      return <Anchor className="h-5.5 w-5.5" />;
    case 'TRAVEL_RULES':
      return <RefreshCw className="h-5.5 w-5.5" />;
    default:
      return <FileText className="h-5.5 w-5.5" />;
  }
};

export const PackagePolicies = ({ policies, primaryBoarding }: PackagePoliciesProps) => {
  const standardPolicies: Policy[] = [
    {
      id: -1,
      type: 'CHECK_IN_OUT',
      title: 'Government ID and reporting verification',
      description: 'All passengers must carry a valid physical government ID. Aadhaar details or document references may be required during final ticket verification.',
    },
    {
      id: -2,
      type: 'TRAVEL_RULES',
      title: 'Timings confirmed before travel',
      description: 'Reporting point, boarding time, pickup location, and return timing are confirmed by the operator before departure based on date, weather, and official permissions.',
    },
    {
      id: -3,
      type: 'CANCELLATION',
      title: 'Cancellation and refund confirmation',
      description: 'Cancellation terms depend on boat slot blocking, transport arrangement, stay allocation, and operator policy for the selected travel date.',
    },
  ];
  const visiblePolicies = policies.length ? policies : standardPolicies;

  // Attempt to build a safe Maps Embed URL
  let embedUrl = '';
  const rawUrl = primaryBoarding?.map_url;
  if (rawUrl) {
    if (rawUrl.includes('<iframe')) {
      const match = rawUrl.match(/src="([^"]+)"/);
      if (match && match[1]) {
        embedUrl = match[1];
      }
    } else if (rawUrl.includes('google.com/maps/embed') || rawUrl.includes('maps.google.com/maps?')) {
      embedUrl = rawUrl;
    } else {
      const coordMatch = rawUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch && coordMatch[1] && coordMatch[2]) {
        embedUrl = `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=15&output=embed`;
      }
    }
  }
  
  if (!embedUrl && (primaryBoarding?.address || primaryBoarding?.title)) {
    const query = encodeURIComponent(primaryBoarding.address || primaryBoarding.title);
    embedUrl = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  return (
    <section id="policies" className="scroll-mt-[170px] mb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d6e75]/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#0d6e75]">
          <ShieldAlert className="h-3.5 w-3.5" />
          Booking Rules
        </span>
        <h2 className="mt-3 text-2xl font-black text-slate-900 tracking-tight mb-2 md:text-3xl">
          Terms & Conditions
        </h2>
        <p className="mb-6 border-b border-slate-100 pb-4 text-xs font-semibold text-slate-500">
          Operator regulations, cancellation guidelines, identity checks, and safe travel instructions.
        </p>

      {!policies.length ? (
        <div className="mb-5 rounded-xl border border-blue-150 bg-blue-500/5 px-4 py-3 text-xs font-semibold leading-relaxed text-[#0d6e75]">
          Standard association guidelines are shown because package-specific terms are not published yet.
        </div>
      ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {visiblePolicies.map((policy, index) => {
            const colors = getPolicyColorClass(policy.type);
            return (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between h-full hover:border-[#0d6e75]/35 transition-colors`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0d6e75]/10 text-[#0d6e75]`}>
                      {getPolicyIcon(policy.type)}
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        {policy.type}
                      </span>
                      <h3 className="text-xs font-black leading-relaxed text-slate-900 mt-0.5">
                        {policy.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs font-semibold leading-relaxed text-slate-500">
                    {policy.description}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3.5 flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-400">
                  <span>Code: TSTG-POL-{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-[#0d6e75]">Official Policy</span>
                </div>
              </motion.div>
            );
          })}
          
          {/* Empty Space filler: Google Maps Embed */}
          {embedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="rounded-xl border border-slate-200 overflow-hidden h-[260px] shadow-3xs relative group"
            >
              <iframe
                title="Location Map"
                src={embedUrl}
                className="w-full h-full border-0 grayscale group-hover:grayscale-0 transition-all duration-700"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-md border border-slate-200 flex items-center gap-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Boarding Location</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
