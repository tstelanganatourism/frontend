'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Copy, Check, X, Sparkles, Tag, Zap, Gift, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { Promotion } from '@/hooks/usePromotions';

interface PromoBannerClientProps {
  promotions: Promotion[];
}

const BADGE_CONFIG: Record<string, { icon: typeof Zap; gradient: string; pill: string; label: string }> = {
  LIMITED_TIME:  { icon: Clock,     gradient: 'from-rose-600 to-orange-500',    pill: 'bg-rose-500 text-white',           label: 'Limited Time' },
  BESTSELLER:    { icon: Star,      gradient: 'from-amber-500 to-yellow-400',    pill: 'bg-amber-500 text-black',          label: 'Bestseller'   },
  NEW_OFFER:     { icon: Sparkles,  gradient: 'from-emerald-600 to-teal-500',    pill: 'bg-emerald-500 text-white',        label: 'New Offer'    },
  FESTIVAL_OFFER:{ icon: Gift,      gradient: 'from-fuchsia-600 to-purple-500',  pill: 'bg-fuchsia-500 text-white',        label: 'Festival'     },
  SUMMER_SPECIAL:{ icon: Zap,       gradient: 'from-sky-500 to-cyan-400',        pill: 'bg-sky-500 text-white',            label: 'Summer Deal'  },
  NONE:          { icon: Tag,       gradient: 'from-[#0f3d56] to-[#1598a1]',     pill: 'bg-[#1598a1]/30 text-[#5ac4d7]',  label: 'Offer'        },
};

export default function PromoBannerClient({ promotions }: PromoBannerClientProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [animating, setAnimating] = useState(false);

  const active = promotions[activeIdx];

  // Auto-rotate promotions
  useEffect(() => {
    if (promotions.length <= 1) return;
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setActiveIdx(i => (i + 1) % promotions.length);
        setAnimating(false);
      }, 300);
    }, 6000);
    return () => clearInterval(id);
  }, [promotions.length]);

  const handleCopy = useCallback(async () => {
    const code = active?.title?.match(/[A-Z0-9]{4,}/)?.[0] ?? active?.cta_label ?? '';
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // silent fail
    }
  }, [active]);

  if (!promotions || promotions.length === 0 || dismissed) return null;

  const cfg = BADGE_CONFIG[active?.badge ?? 'NONE'] ?? BADGE_CONFIG.NONE;
  const BadgeIcon = cfg.icon;

  // Extract coupon code from title (all caps 4+ char word)
  const couponCode = active?.title?.match(/\b([A-Z0-9]{4,})\b/)?.[1];

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{
        background: 'linear-gradient(135deg, #060f1a 0%, #0a1e30 25%, #0c2a42 50%, #0a1e30 75%, #060f1a 100%)',
        borderBottom: '1px solid rgba(90,196,215,0.12)',
      }}
    >
      {/* Animated shimmer sweep */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(105deg, transparent 35%, rgba(90,196,215,0.06) 50%, transparent 65%)',
          animation: 'promo-shimmer 4s ease-in-out infinite',
        }}
      />

      {/* Left glow accent */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-24 opacity-30"
        style={{ background: `linear-gradient(to right, ${cfg.gradient.replace('from-', '').replace(' to-', ', ').split(' ')[0]}, transparent)` }}
      />

      {/* Main content */}
      <div
        className="relative mx-auto flex min-h-[40px] max-w-[1800px] items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-5 2xl:px-8"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        {/* LEFT: Badge + Message */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {/* Animated badge pill */}
          <span
            className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest sm:text-[10px] ${cfg.pill}`}
            style={{ boxShadow: '0 0 8px rgba(90,196,215,0.15)' }}
          >
            <BadgeIcon className="h-2.5 w-2.5" strokeWidth={2.5} />
            <span className="hidden sm:inline">{cfg.label}</span>
            <span className="sm:hidden">{cfg.label.split(' ')[0]}</span>
          </span>

          {/* Emoji icon */}
          {active.icon_emoji && (
            <span className="hidden text-sm sm:inline">{active.icon_emoji}</span>
          )}

          {/* Title + subtitle */}
          <div className="min-w-0 leading-tight">
            <span className="truncate text-[11px] font-bold text-white/90 sm:text-xs">
              {active.title}
            </span>
            {active.subtitle && (
              <span className="hidden text-[10px] font-medium text-white/45 ml-1.5 sm:inline">
                {active.subtitle}
              </span>
            )}
          </div>
        </div>

        {/* CENTER: Coupon Code (glass pill) */}
        {couponCode && (
          <button
            onClick={handleCopy}
            className="group relative shrink-0 flex items-center gap-1.5 overflow-hidden rounded-lg px-2.5 py-1.5 transition-all duration-200 hover:scale-105 active:scale-95 sm:gap-2 sm:px-3"
            style={{
              background: 'rgba(90,196,215,0.08)',
              border: '1px solid rgba(90,196,215,0.28)',
              boxShadow: '0 0 12px rgba(90,196,215,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
            title={`Copy code ${couponCode}`}
          >
            {/* Inner shimmer on hover */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(90,196,215,0.08), transparent)' }}
            />
            <Tag className="h-3 w-3 text-[#5ac4d7]" strokeWidth={2} />
            <span
              className="font-mono text-[11px] font-black tracking-[0.18em] text-[#5ac4d7] sm:text-xs"
              style={{ textShadow: '0 0 12px rgba(90,196,215,0.4)' }}
            >
              {couponCode}
            </span>
            <span className="ml-0.5 flex h-5 w-5 items-center justify-center rounded bg-[#5ac4d7]/15 transition-all group-hover:bg-[#5ac4d7]/25">
              {copied ? (
                <Check className="h-3 w-3 text-emerald-400" strokeWidth={2.5} />
              ) : (
                <Copy className="h-3 w-3 text-[#5ac4d7]/70 group-hover:text-[#5ac4d7]" />
              )}
            </span>
            {copied && (
              <span className="ml-1 hidden text-[10px] font-bold text-emerald-400 sm:inline">
                Copied!
              </span>
            )}
          </button>
        )}

        {/* RIGHT: CTA + Dots + Dismiss */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* CTA link */}
          {active.cta_url && (
            <Link
              href={active.cta_url}
              className="hidden items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#5ac4d7] ring-1 ring-[#5ac4d7]/30 transition-all hover:bg-[#5ac4d7]/10 hover:ring-[#5ac4d7]/60 sm:inline-flex"
            >
              {active.cta_label || 'Book Now'}
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}

          {/* Dot indicators */}
          {promotions.length > 1 && (
            <div className="hidden items-center gap-1 sm:flex">
              {promotions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setAnimating(true);
                    setTimeout(() => { setActiveIdx(i); setAnimating(false); }, 300);
                  }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === activeIdx ? '16px' : '6px',
                    height: '6px',
                    background: i === activeIdx ? '#5ac4d7' : 'rgba(255,255,255,0.25)',
                  }}
                />
              ))}
            </div>
          )}

          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-white/30 transition-all hover:bg-white/10 hover:text-white/70"
            title="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Keyframe injection */}
      <style>{`
        @keyframes promo-shimmer {
          0%   { transform: translateX(-120%); }
          50%  { transform: translateX(120%); }
          100% { transform: translateX(120%); }
        }
      `}</style>
    </div>
  );
}
