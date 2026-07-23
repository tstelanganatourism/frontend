'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Landmark, Sparkles, Ship, TreePine, SunMedium, MapPin, CheckCircle2 } from 'lucide-react';

interface HighlightItem {
  id: number;
  title?: string;
  label?: string;
  icon?: string | null;
}

interface VisitingPlacesProps {
  highlights: HighlightItem[];
}

const getExperientialTheme = (index: number) => {
  const themes = [
    {
      icon: TreePine,
      badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/80',
      gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      hoverBorder: 'group-hover:border-emerald-500/40',
      glow: 'group-hover:shadow-emerald-500/10',
      iconBg: 'bg-emerald-600 text-white shadow-emerald-600/20',
      tag: 'Forest & River Walk',
    },
    {
      icon: Ship,
      badge: 'bg-teal-500/10 text-teal-700 border-teal-200/80',
      gradient: 'from-teal-500/10 via-cyan-500/5 to-transparent',
      hoverBorder: 'group-hover:border-teal-500/40',
      glow: 'group-hover:shadow-teal-500/10',
      iconBg: 'bg-[#0d6e75] text-white shadow-teal-700/20',
      tag: 'Scenic Cruise Halt',
    },
    {
      icon: SunMedium,
      badge: 'bg-amber-500/10 text-amber-700 border-amber-200/80',
      gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
      hoverBorder: 'group-hover:border-amber-500/40',
      glow: 'group-hover:shadow-amber-500/10',
      iconBg: 'bg-amber-500 text-white shadow-amber-500/20',
      tag: 'Beachside Stay',
    },
    {
      icon: Sparkles,
      badge: 'bg-indigo-500/10 text-indigo-700 border-indigo-200/80',
      gradient: 'from-indigo-500/10 via-sky-500/5 to-transparent',
      hoverBorder: 'group-hover:border-indigo-500/40',
      glow: 'group-hover:shadow-indigo-500/10',
      iconBg: 'bg-indigo-600 text-white shadow-indigo-600/20',
      tag: 'Night Activity',
    },
  ];
  return themes[index % themes.length];
};

export const VisitingPlaces = ({ highlights }: VisitingPlacesProps) => {
  if (!highlights || highlights.length === 0) return null;

  return (
    <section id="visiting-places" className="scroll-mt-[140px] max-w-full overflow-hidden my-8 sm:my-12">
      {/* Section Header */}
      <div className="mb-6 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d6e75]/10 border border-[#0d6e75]/20 text-[#0d6e75] text-xs font-black uppercase tracking-widest shadow-2xs mb-3">
          <Landmark className="h-3.5 w-3.5" />
          <span>Scenic Highlights & Sightseeing</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          Major Expedition <span className="text-[#0d6e75] bg-gradient-to-r from-[#0d6e75] to-teal-600 bg-clip-text text-transparent">Milestones</span>
        </h2>
        <p className="mt-2 text-slate-500 font-semibold text-xs sm:text-sm leading-relaxed max-w-2xl">
          Handpicked natural wonders, beach stays, and river halts you will cruise past and explore on this journey.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map((item, index) => {
          const theme = getExperientialTheme(index);
          const IconComp = theme.icon;

          return (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 ${theme.hoverBorder} ${theme.glow}`}
            >
              {/* Top ambient gradient glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

              {/* Decorative Background Icon Watermark */}
              <div className="absolute -right-4 -bottom-4 opacity-[0.04] text-slate-900 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6 pointer-events-none">
                <IconComp className="h-28 w-28 sm:h-32 sm:w-32" />
              </div>

              {/* Card Content Top */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl ${theme.iconBg} shadow-md transition-transform duration-300 group-hover:scale-110`}>
                    <IconComp className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-2xs ${theme.badge}`}>
                    Milestone {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-[#0d6e75] transition-colors">
                    {item.title || item.label || 'Scenic Spot'}
                  </h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-[#0d6e75] shrink-0" />
                    <span>{theme.tag}</span>
                  </div>
                </div>
              </div>

              {/* Card Content Footer */}
              <div className="relative z-10 mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
                <span className="flex items-center gap-1 text-[#0d6e75]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Guided Experience
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold group-hover:text-slate-600 transition-colors">
                  Explore →
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
