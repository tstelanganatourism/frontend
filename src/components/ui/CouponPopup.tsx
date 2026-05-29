'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Info, BadgePercent } from 'lucide-react';
import { toast } from 'sonner';

interface CouponPopupProps {
  targetType: 'PACKAGE' | 'ROOM';
  targetId: number;
}

const Coin = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="#FFD700" stroke="#D97706" strokeWidth="4"/>
    <circle cx="50" cy="50" r="35" fill="#FBBF24" stroke="#D97706" strokeWidth="2"/>
    <text x="50" y="66" fontSize="42" fill="#B45309" textAnchor="middle" fontWeight="black">₹</text>
  </svg>
);

const Sparkle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 0C25 0 28 18 50 25C50 25 28 32 25 50C25 50 22 32 0 25C0 25 22 18 25 0Z" fill="white"/>
  </svg>
);

interface Coupon {
  code: string;
  discount_type: 'FLAT' | 'PERCENTAGE';
  discount_value: number;
  min_booking_amount: number | null;
  max_discount_amount: number | null;
  min_tickets: number | null;
}

export default function CouponPopup({ targetType, targetId }: CouponPopupProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch(`/api/v1/coupons/active?target_type=${targetType}&target_id=${targetId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setCoupons(data);
            // Show popup after a small delay
            setTimeout(() => setIsOpen(true), 1500);
          }
        }
      } catch (err) {
        console.error('Failed to fetch coupons', err);
      }
    };
    fetchCoupons();
  }, [targetType, targetId]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    
    // Dispatch custom window event to automatically fill and apply the copied coupon
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('apply-coupon', { detail: { code } }));
    }
    
    // Give them a moment to see the "Copied!" state, then close it
    setTimeout(() => {
      setCopiedCode(null);
      setIsOpen(false);
    }, 1200);
  };

  if (!isOpen || coupons.length === 0) return null;

  // For simplicity, display the best/first coupon
  const c = coupons[0];
  const roundedDiscount = Math.round(c.discount_value);
  const discountText = c.discount_type === 'PERCENTAGE' 
    ? `${roundedDiscount}% OFF` 
    : `₹${roundedDiscount} OFF`;
    
  let rulesText = '';
  if (c.min_booking_amount && c.min_tickets) {
    rulesText = `Min. ₹${c.min_booking_amount} & ${c.min_tickets}+ Pax`;
  } else if (c.min_booking_amount) {
    rulesText = `On orders above ₹${c.min_booking_amount}`;
  } else if (c.min_tickets) {
    rulesText = `For ${c.min_tickets}+ passengers`;
  } else {
    rulesText = 'Valid on this booking';
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
        >
          {/* Main Wrapper for Popup + Floating Elements */}
          <div className="relative w-full max-w-md">
            
            {/* Floating Coins - responsive sizing and some hidden on mobile to avoid clutter */}
            <motion.div initial={{ y: 50, x: -20, opacity: 0, scale: 0 }} animate={{ y: -60, x: -50, opacity: 1, scale: 1, rotate: -15 }} transition={{ delay: 0.1, type: "spring" }} className="absolute -left-4 top-0 z-20 w-12 h-12 sm:w-16 sm:h-16 pointer-events-none drop-shadow-xl hidden sm:block">
              <Coin />
            </motion.div>
            <motion.div initial={{ y: 50, x: 20, opacity: 0, scale: 0 }} animate={{ y: -60, x: 20, opacity: 1, scale: 1.2, rotate: 25 }} transition={{ delay: 0.2, type: "spring" }} className="absolute -right-4 sm:-right-8 top-10 z-20 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none drop-shadow-xl">
              <Coin />
            </motion.div>
            <motion.div initial={{ y: 50, x: -20, opacity: 0, scale: 0 }} animate={{ y: 40, x: -60, opacity: 1, scale: 0.9, rotate: -40 }} transition={{ delay: 0.3, type: "spring" }} className="absolute -left-6 sm:-left-12 top-20 z-20 w-10 h-10 sm:w-14 sm:h-14 pointer-events-none drop-shadow-xl">
              <Coin />
            </motion.div>
            <motion.div initial={{ y: 50, x: 20, opacity: 0, scale: 0 }} animate={{ y: 80, x: 60, opacity: 1, scale: 1, rotate: 15 }} transition={{ delay: 0.4, type: "spring" }} className="absolute -right-4 sm:-right-6 top-32 z-20 w-14 h-14 sm:w-20 sm:h-20 pointer-events-none drop-shadow-xl">
              <Coin />
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0, scale: 0 }} animate={{ y: -100, x: -10, opacity: 1, scale: 0.7, rotate: 10 }} transition={{ delay: 0.15, type: "spring" }} className="absolute left-1/4 -top-8 z-20 w-8 h-8 sm:w-12 sm:h-12 pointer-events-none drop-shadow-xl">
              <Coin />
            </motion.div>

            {/* Sparkles */}
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute -left-16 top-10 z-10 w-6 h-6">
              <Sparkle />
            </motion.div>
            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="absolute -right-12 -top-4 z-10 w-8 h-8">
              <Sparkle />
            </motion.div>
            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.8, delay: 0.2 }} className="absolute right-20 -top-12 z-10 w-5 h-5">
              <Sparkle />
            </motion.div>
            <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.6, delay: 0.7 }} className="absolute -left-8 top-32 z-10 w-7 h-7">
              <Sparkle />
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative w-full drop-shadow-2xl"
            >
              {/* Ticket Top Area (Pink) */}
              <div className="relative bg-[#FF5A82] px-6 py-10 text-center text-white rounded-t-3xl overflow-hidden"
                   style={{
                     maskImage: 'radial-gradient(circle at bottom, transparent 10px, black 11px)',
                     maskSize: '24px 100%',
                     maskPosition: 'bottom',
                   }}>
                
                <div className="relative z-10 flex flex-col items-center mt-4 sm:mt-6">
                  <h3 className="mb-2 sm:mb-3 text-xs sm:text-sm font-black uppercase tracking-widest text-yellow-200 drop-shadow-sm">
                    ✨ SPECIAL OFFER ✨
                  </h3>
                  <div className="text-5xl sm:text-[5rem] font-black tracking-tighter drop-shadow-lg leading-[1.1] whitespace-nowrap">
                    {discountText}
                  </div>
                  <p className="mt-3 sm:mt-4 text-xs sm:text-base font-bold tracking-wider text-pink-50 uppercase drop-shadow-md bg-black/10 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full inline-block">
                    {rulesText}
                  </p>
                </div>
              </div>

              {/* Ticket Bottom Area (White) */}
              <div className="relative bg-white px-5 py-6 sm:px-8 sm:py-10 text-center rounded-b-3xl">
                {/* Visual dashed line where the ticket tears */}
                <div className="absolute top-0 left-6 right-6 h-[2px] border-t-2 border-dashed border-slate-200 -mt-[1px]"></div>
                
                <div className="mb-8 space-y-3">
                  <div className="flex items-center gap-4 rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-left shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-inner">
                      <Check className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Verified and applicable for your current {targetType === 'PACKAGE' ? 'tour package' : 'room'}.</p>
                  </div>
                  
                  {c.max_discount_amount && (
                    <div className="flex items-center gap-4 rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-left shadow-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-inner">
                        <BadgePercent className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">Maximum discount capped at ₹{c.max_discount_amount}.</p>
                    </div>
                  )}
                  
                  {!c.max_discount_amount && (
                    <div className="flex items-center gap-4 rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-left shadow-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 shadow-inner">
                        <Info className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">Instant direct discount applied during checkout.</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleCopy(c.code)}
                  className="group relative flex w-full items-center justify-center gap-2 sm:gap-3 overflow-hidden rounded-full bg-[#FF5A82] px-4 py-4 sm:px-6 sm:py-5 font-black text-white text-base sm:text-xl shadow-[0_8px_20px_rgba(255,90,130,0.4)] transition-all hover:bg-[#ff4270] hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(255,90,130,0.5)] active:translate-y-0"
                >
                  <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                    <div className="relative h-full w-8 bg-white/20" />
                  </div>
                  {copiedCode === c.code ? (
                    <>
                      <Check className="h-6 w-6 text-white" />
                      <span>Code Copied!</span>
                    </>
                  ) : (
                    <>
                      <span>Copy Code & Book</span>
                    </>
                  )}
                </button>
              </div>

              {/* Close Button placed below the popup like in the image */}
              <div className="absolute -bottom-16 left-0 right-0 flex justify-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-white backdrop-blur-md transition-transform hover:scale-110"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
