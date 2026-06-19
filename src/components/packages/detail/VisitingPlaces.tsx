'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Landmark } from 'lucide-react';
import { Sparkles, Ship, TreePine, Sunrise } from 'lucide-react';

interface HighlightItem {
  id: number;
  title?: string;
  label?: string;
  icon?: string | null;
}

interface VisitingPlacesProps {
  highlights: HighlightItem[];
}

const getExperientialIcon = (index: number) => {
  const icons = [TreePine, Ship, Sunrise, Sparkles];
  const IconComponent = icons[index % icons.length];
  return <IconComponent className="h-6 w-6" />;
};

const getBackgroundGradient = (index: number) => {
  const gradients = [
    'from-[#0F3D56]/5 to-[#0F3D56]/20',
    'from-[#1A6B7A]/5 to-[#1A6B7A]/20',
    'from-[#2C5E43]/5 to-[#2C5E43]/20',
  ];
  return gradients[index % gradients.length];
};

export const VisitingPlaces = ({ highlights }: VisitingPlacesProps) => {
  if (!highlights || highlights.length === 0) return null;

  return (
    <section id="visiting-places" className="scroll-mt-[170px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-[#1a6b7a]">
          <Landmark className="h-3.5 w-3.5" />
          Scenic Highlights
        </span>
        <h2 className="mt-3 text-3xl font-black text-[#0f3d56] tracking-tight md:text-4xl">
          Major Expedition Milestones
        </h2>
        <p className="mt-2 text-slate-500 font-semibold text-sm">
          Stunning destinations you will cruise past and explore on this journey
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative flex min-h-40 flex-col justify-between overflow-hidden rounded-2xl border border-[#dfe8e2]/70 bg-gradient-to-br ${getBackgroundGradient(index)} p-5 shadow-[0_10px_35px_rgba(15,61,86,0.03)] transition-all`}
          >
            {/* Design Watermark */}
            <div className="absolute -right-6 -bottom-6 opacity-[0.03] text-[#0f3d56]">
              {getExperientialIcon(index)}
            </div>

            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#1a6b7a] shadow-sm">
                {getExperientialIcon(index)}
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1a6b7a]/80">
                  Milestone {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-1.5 text-xl font-black leading-7 text-[#0f3d56]">
                  {item.title || item.label || 'Scenic Spot'}
                </h3>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#1a6b7a]">
              <span>Scenic stop</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-400 font-bold capitalize">Local guide</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
