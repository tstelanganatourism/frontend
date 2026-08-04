'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, Tag, ChevronDown, Loader2, X, Scissors, Sparkles, AlertTriangle, Copy } from 'lucide-react';

/* ── CSS-in-JS keyframes injected once ──────────────────────────────────── */
const STYLE_ID = 'coupon-widget-styles';

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
    /* Coupon drawer transition */
    .cw-drawer {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.38s cubic-bezier(0.4,0,0.2,1);
    }
    .cw-drawer.open {
      grid-template-rows: 1fr;
    }
    .cw-drawer > div { overflow: hidden; }

    /* Shimmer animation on coupon input */
    @keyframes cw-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .cw-shimmer-input:focus {
      background: linear-gradient(
        90deg,
        #f0fdfd 0%,
        #e0fafa 40%,
        #c6f5f5 50%,
        #e0fafa 60%,
        #f0fdfd 100%
      );
      background-size: 200% auto;
      animation: cw-shimmer 2s linear infinite;
    }

    /* Shake animation on error */
    @keyframes cw-shake {
      0%,100% { transform: translateX(0); }
      15%  { transform: translateX(-5px); }
      30%  { transform: translateX(5px); }
      45%  { transform: translateX(-4px); }
      60%  { transform: translateX(4px); }
      75%  { transform: translateX(-2px); }
      90%  { transform: translateX(2px); }
    }
    .cw-shake { animation: cw-shake 0.45s ease-in-out; }

    /* Confetti particles */
    @keyframes cw-confetti-fly {
      0%   { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
      100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0.3); opacity: 0; }
    }
    .cw-confetti-dot {
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      animation: cw-confetti-fly 0.85s ease-out forwards;
      pointer-events: none;
    }

    /* Success banner slide-in */
    @keyframes cw-success-slide {
      0%   { transform: translateY(-6px) scale(0.97); opacity: 0; }
      100% { transform: translateY(0) scale(1);       opacity: 1; }
    }
    .cw-success-banner {
      animation: cw-success-slide 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
    }

    /* Badge pulse */
    @keyframes cw-pulse-badge {
      0%,100% { box-shadow: 0 0 0 0 rgba(13,110,117,0.3); }
      50%     { box-shadow: 0 0 0 6px rgba(13,110,117,0); }
    }
    .cw-pulse { animation: cw-pulse-badge 2s ease-in-out infinite; }

    /* Coupon card shine sweep — triggers on hover only */
    @keyframes cw-card-shine {
      0%   { left: -75%; }
      100% { left: 125%; }
    }
    .cw-card-shine::after {
      content: '';
      position: absolute;
      top: 0; bottom: 0;
      width: 50%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
      transform: skewX(-15deg);
      left: -75%;
      transition: none;
    }
    .cw-card-shine:hover::after {
      animation: cw-card-shine 0.7s ease-out forwards;
    }

    /* Ticket dashed divider */
    .cw-ticket-divider {
      width: 1px;
      border-left: 2px dashed rgba(255,255,255,0.4);
      position: relative;
      flex-shrink: 0;
    }
    .cw-ticket-divider::before,
    .cw-ticket-divider::after {
      content: '';
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 14px; height: 14px;
      border-radius: 50%;
      background: #f8fafa;
    }
    .cw-ticket-divider::before { top: -7px; }
    .cw-ticket-divider::after  { bottom: -7px; }

    /* Hide scrollbar — cross-browser */
    .cw-scroll-none {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .cw-scroll-none::-webkit-scrollbar {
      display: none;
    }
    @keyframes cw-copied {
      0%   { opacity:0; transform:translateY(4px); }
      20%  { opacity:1; transform:translateY(0); }
      80%  { opacity:1; }
      100% { opacity:0; }
    }
    .cw-copied-toast {
      animation: cw-copied 1.6s ease forwards;
    }

    /* Header hover glow */
    .cw-header-btn:hover .cw-scissors-icon {
      transform: rotate(-15deg) scale(1.15);
    }
    .cw-scissors-icon {
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
  `;
  document.head.appendChild(el);
}

/* ── Confetti burst component ─────────────────────────────────────────── */
const confettiColors = ['#0d6e75', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];
function ConfettiBurst({ trigger }: { trigger: boolean }) {
  const [dots, setDots] = useState<{ id: number; color: string; tx: string; ty: string; rot: string; left: string; top: string }[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const newDots = Array.from({ length: 16 }, (_, i) => ({
      id: Date.now() + i,
      color: confettiColors[i % confettiColors.length],
      tx: `${(Math.random() - 0.5) * 120}px`,
      ty: `${-(40 + Math.random() * 70)}px`,
      rot: `${Math.random() * 540 - 270}deg`,
      left: `${20 + Math.random() * 60}%`,
      top: `50%`,
    }));
    setDots(newDots);
    const t = setTimeout(() => setDots([]), 1000);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <>
      {dots.map(d => (
        <span
          key={d.id}
          className="cw-confetti-dot"
          style={{
            backgroundColor: d.color,
            left: d.left,
            top: d.top,
            '--tx': d.tx,
            '--ty': d.ty,
            '--rot': d.rot,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

/* ── Suggestion coupon data ──────────────────────────────────────────── */
interface SuggestedCoupon {
  code: string;
  label: string;
  description: string;
  badge: string;
  gradient: string;
  badgeBg: string;
}

const SUGGESTED_COUPONS: SuggestedCoupon[] = [
  {
    code: 'TSBOAT10',
    label: '10% OFF',
    description: 'Save 10% on any Godavari boat tour',
    badge: '10%',
    gradient: 'from-[#0d6e75] to-[#0a4f55]',
    badgeBg: 'bg-amber-400',
  },
  {
    code: 'FIRSTRIDE',
    label: 'First Ride',
    description: 'Welcome aboard! First booking special',
    badge: '1ST',
    gradient: 'from-[#1e3a5f] to-[#162c47]',
    badgeBg: 'bg-rose-400',
  },
  {
    code: 'HOLIDAY20',
    label: '20% OFF',
    description: 'Holiday season — sail & save big!',
    badge: '20%',
    gradient: 'from-[#4f46e5] to-[#3730a3]',
    badgeBg: 'bg-emerald-400',
  },
];

/* ── Main CouponWidget Props ─────────────────────────────────────────── */
export interface CouponWidgetProps {
  couponCode: string;
  setCouponCode: (code: string) => void;
  validatingCoupon: boolean;
  appliedCoupon: { code: string; discount_amount: number } | null;
  couponError: string | null;
  couponSuccess: string | null;
  onApply: () => void;
  onRemove: () => void;
  onAutoApply?: (code: string) => void;
  subtotal?: number;
  stepNumber?: number;
}

/* ── Main Component ──────────────────────────────────────────────────── */
export function CouponWidget({
  couponCode,
  setCouponCode,
  validatingCoupon,
  appliedCoupon,
  couponError,
  couponSuccess,
  onApply,
  onRemove,
  onAutoApply,
  subtotal = 0,
  stepNumber,
}: CouponWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Inject styles once
  useEffect(() => { ensureStyles(); }, []);

  // Auto-open drawer when coupon is pre-filled
  useEffect(() => {
    if (couponCode && !isOpen) setIsOpen(true);
  }, [couponCode]);

  // Trigger confetti on success
  const prevApplied = useRef(appliedCoupon);
  useEffect(() => {
    if (!prevApplied.current && appliedCoupon) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);
    }
    prevApplied.current = appliedCoupon;
  }, [appliedCoupon]);

  // Shake on error
  const prevError = useRef(couponError);
  useEffect(() => {
    if (!prevError.current && couponError) {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    }
    prevError.current = couponError;
  }, [couponError]);

  const handleSuggestionClick = useCallback((code: string) => {
    setCouponCode(code);
    setTimeout(() => {
      if (onAutoApply && subtotal > 0) {
        onAutoApply(code);
      } else {
        onApply();
      }
    }, 120);
  }, [setCouponCode, onAutoApply, onApply, subtotal]);

  const handleCopyCode = useCallback((code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1600);
    });
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && couponCode.trim() && !validatingCoupon && !appliedCoupon) {
      onApply();
    }
  };

  const handleToggle = () => {
    if (appliedCoupon) return; // keep open when coupon applied
    setIsOpen(o => {
      if (!o) setTimeout(() => inputRef.current?.focus(), 380);
      return !o;
    });
  };

  return (
    <div className="relative pt-3 border-t border-slate-100">
      {/* ── HEADER / TOGGLE ── */}
      <button
        type="button"
        onClick={handleToggle}
        className="cw-header-btn w-full flex items-center justify-between gap-2 group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {stepNumber !== undefined && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0d6e75] text-[9px] font-black text-white shrink-0">
              {stepNumber}
            </span>
          )}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="cw-pulse h-6 w-6 rounded-full bg-[#0d6e75]/10 flex items-center justify-center">
                <Scissors className="cw-scissors-icon h-3.5 w-3.5 text-[#0d6e75]" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none">
                {appliedCoupon ? 'Promo Code Applied ✓' : 'Have a Promo Code?'}
              </span>
              {!appliedCoupon && (
                <span className="text-[9px] font-medium text-[#0d6e75] leading-none mt-0.5">
                  🚢 Sail more, spend less
                </span>
              )}
            </div>
          </div>
          {appliedCoupon && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[9px] font-black text-emerald-700 uppercase tracking-wider">
              <CheckCircle2 className="h-2.5 w-2.5" />
              {appliedCoupon.code}
            </span>
          )}
        </div>
        {!appliedCoupon && (
          <ChevronDown
            className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* ── APPLIED COUPON SUCCESS BANNER ── */}
      {appliedCoupon && (
        <div className="relative mt-2.5 overflow-hidden rounded-2xl" style={{ position: 'relative' }}>
          <ConfettiBurst trigger={confetti} />
          <div className="cw-success-banner flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 shadow-lg shadow-emerald-200">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <CheckCircle2 className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[11px] font-black text-white uppercase tracking-wider leading-none">
                  🎉 Coupon Applied!
                </p>
                <p className="text-[10px] font-bold text-emerald-100 mt-0.5 leading-none">
                  {appliedCoupon.code} — you're saving on this booking
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="shrink-0 flex items-center gap-1 rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1.5 text-[10px] font-black text-white uppercase tracking-wider transition-colors"
              title="Remove coupon"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          </div>
        </div>
      )}

      {/* ── COLLAPSIBLE DRAWER ── */}
      {!appliedCoupon && (
        <div className={`cw-drawer ${isOpen ? 'open' : ''}`}>
          <div>
            <div className="pt-3 space-y-3">

              {/* ── SUGGESTION CARDS ── */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-400 fill-amber-400" />
                  Available Offers
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 cw-scroll-none -mx-0.5 px-0.5"
                  style={{ scrollSnapType: 'x mandatory' }}>
                  {SUGGESTED_COUPONS.map((s) => (
                    <div
                      key={s.code}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSuggestionClick(s.code)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSuggestionClick(s.code);
                        }
                      }}
                      className="cw-card-shine group relative flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d6e75] to-[#0a4f55] text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95 cursor-pointer"
                      style={{
                        width: 'min(190px, 68vw)',
                        scrollSnapAlign: 'start',
                      }}
                      title={`Apply ${s.code}`}
                    >
                      <div className="flex h-full">
                        {/* Left: discount badge */}
                        <div className={`flex shrink-0 flex-col items-center justify-center px-3 py-4 ${s.badgeBg} bg-opacity-90`}
                          style={{ minWidth: '64px' }}>
                          <span className="text-[11px] font-black text-white leading-none text-center">{s.badge}</span>
                          <span className="text-[8px] font-bold text-white/80 mt-0.5">OFF</span>
                        </div>
                        {/* Divider */}
                        <div className="cw-ticket-divider self-stretch my-2" />
                        {/* Right: code + description */}
                        <div className="flex flex-1 flex-col justify-center px-3 py-4 text-left min-w-0">
                          <span className="text-[11px] font-black uppercase tracking-wider text-white leading-none truncate">{s.code}</span>
                          <span className="text-[9px] font-medium text-white/70 mt-1 leading-tight line-clamp-2">{s.description}</span>
                          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[8px] font-black text-white/90 uppercase tracking-wider w-fit">
                            Tap to Apply
                          </span>
                        </div>
                        {/* Copy button */}
                        <div className="absolute top-1.5 right-1.5">
                          <button
                            type="button"
                            title="Copy code"
                            onClick={(e) => handleCopyCode(s.code, e)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 transition-colors"
                          >
                            <Copy className="h-3 w-3 text-white" />
                          </button>
                          {copiedCode === s.code && (
                            <span className="cw-copied-toast absolute right-0 top-7 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-0.5 text-[9px] font-bold text-white shadow-lg z-10">
                              Copied!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── MANUAL INPUT ── */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Or enter code manually
                </p>
                <div
                  className={`relative flex items-stretch gap-0 rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                    couponError
                      ? 'border-rose-400 shadow-rose-100 shadow-lg'
                      : couponCode
                      ? 'border-[#0d6e75] shadow-[#0d6e75]/10 shadow-lg'
                      : 'border-slate-200 hover:border-slate-300'
                  } ${shakeError ? 'cw-shake' : ''}`}
                >
                  {/* Tag icon inside input */}
                  <div className="flex items-center pl-3.5 pr-0 bg-white">
                    <Tag className="h-4 w-4 text-slate-400 shrink-0" strokeWidth={2} />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={handleKeyDown}
                    disabled={validatingCoupon}
                    placeholder="ENTER COUPON CODE"
                    spellCheck={false}
                    autoComplete="off"
                    className="cw-shimmer-input flex-1 min-w-0 bg-white px-2 py-3 text-xs font-black uppercase tracking-widest text-slate-800 placeholder:text-slate-300 placeholder:font-bold focus:outline-none transition-all duration-200"
                  />
                  {/* Apply / Clear button */}
                  <button
                    type="button"
                    disabled={!couponCode.trim() || validatingCoupon}
                    onClick={onApply}
                    className="shrink-0 flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#0d6e75] to-[#0a5860] px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:from-[#0b5c62] hover:to-[#094d54] disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed min-w-[72px]"
                  >
                    {validatingCoupon
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : 'Apply'}
                  </button>
                </div>

                {/* Error message */}
                {couponError && (
                  <div className="mt-2 flex items-start gap-1.5 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-500 mt-0.5" />
                    <p className="text-[11px] font-bold text-rose-600 leading-snug">{couponError}</p>
                  </div>
                )}

                {/* Pending / Info message (success before applied) */}
                {couponSuccess && !appliedCoupon && (
                  <div className="mt-2 flex items-start gap-1.5 rounded-xl bg-sky-50 border border-sky-100 px-3 py-2">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-sky-500 mt-0.5 fill-sky-300" />
                    <p className="text-[11px] font-bold text-sky-700 leading-snug">{couponSuccess}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CouponWidget;
