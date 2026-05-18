import React from 'react';
import {
  BadgeCheck,
  Flame,
  HeartHandshake,
  Leaf,
  Moon,
  Mountain,
  Ship,
  Sparkles,
  Star,
  Tag as TagIcon,
  Utensils,
  Wind,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TAG_STYLES: Record<string, { icon: React.ElementType; className: string }> = {
  featured: {
    icon: Sparkles,
    className: 'border-white/30 bg-gradient-to-r from-[#f7d88b] via-[#fff3c2] to-[#d7a849] text-[#17384a] shadow-[0_10px_30px_rgba(215,168,73,0.28)]',
  },
  bestseller: {
    icon: Star,
    className: 'border-[#f3d27a]/50 bg-[#fff6d8] text-[#7a5200] shadow-[0_8px_24px_rgba(201,151,35,0.18)]',
  },
  trending: {
    icon: Flame,
    className: 'premium-tag-pulse border-[#ff8a70]/40 bg-[#fff0ec] text-[#9a3412] shadow-[0_8px_24px_rgba(255,106,76,0.18)]',
  },
  recommended: {
    icon: BadgeCheck,
    className: 'border-[#7dd3c7]/40 bg-[#e9fffb] text-[#075f62] shadow-[0_8px_24px_rgba(26,107,122,0.14)]',
  },
  new: {
    icon: Zap,
    className: 'border-[#9ff6df]/50 bg-[#effff9] text-[#047857] shadow-[0_8px_24px_rgba(16,185,129,0.16)]',
  },
  'river cruise': { icon: Ship, className: 'border-[#a8d8e8]/60 bg-[#eef9fc] text-[#0f5f78]' },
  'family friendly': { icon: HeartHandshake, className: 'border-[#d7c7ff]/60 bg-[#f6f1ff] text-[#5b3a95]' },
  spiritual: { icon: Sparkles, className: 'border-[#f0d698]/60 bg-[#fff8e6] text-[#765016]' },
  nature: { icon: Leaf, className: 'border-[#b8e1c2]/60 bg-[#f0fbf2] text-[#28613d]' },
  adventure: { icon: Mountain, className: 'border-[#f5c5a8]/60 bg-[#fff4ed] text-[#8a3d15]' },
  'night stay': { icon: Moon, className: 'border-[#c9d3ff]/60 bg-[#f1f4ff] text-[#334f9c]' },
  'premium stay': { icon: Sparkles, className: 'border-[#efd48f]/60 bg-[#fff8e8] text-[#755614]' },
  'a/c transport': { icon: Wind, className: 'border-[#b9e7e2]/60 bg-[#effcf9] text-[#0f766e]' },
  'meals included': { icon: Utensils, className: 'border-[#f1c4a7]/60 bg-[#fff4ec] text-[#8a3f17]' },
};

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase();
}

export function PremiumTag({ name, compact = false }: { name: string; compact?: boolean }) {
  const style = TAG_STYLES[normalizeTag(name)] || {
    icon: TagIcon,
    className: 'border-white/45 bg-white/70 text-[#24485a] shadow-[0_8px_22px_rgba(15,61,86,0.08)]',
  };
  const Icon = style.icon;

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold leading-none backdrop-blur-md transition-transform duration-300 group-hover/card:-translate-y-0.5',
        compact ? 'text-[10px]' : 'text-[11px]',
        style.className
      )}
    >
      <Icon className={compact ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'} />
      <span className="truncate">{name}</span>
    </span>
  );
}

export function getCardTags(tags: string[] = [], isFeatured?: boolean, limit = 4) {
  const seen = new Set<string>();
  const normalized = tags
    .filter(Boolean)
    .map((tag) => tag.trim())
    .filter((tag) => {
      const key = normalizeTag(tag);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  if (isFeatured && !seen.has('featured')) {
    normalized.unshift('Featured');
  }

  return normalized.slice(0, limit);
}

export function TagPill({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-full">
      <TagIcon className="h-3.5 w-3.5 text-[var(--color-brand-teal)]" />
      {name}
    </div>
  );
}

export function PriceBadge({ price, label = 'from' }: { price: number; label?: string }) {
  return (
    <div className="flex flex-col items-end">
       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
       <span className="text-2xl font-black text-[var(--color-brand-teal)]">₹{price}</span>
    </div>
  );
}
