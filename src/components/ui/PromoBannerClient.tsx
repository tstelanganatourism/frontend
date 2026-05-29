import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Promotion } from '@/hooks/usePromotions';

interface PromoBannerClientProps {
  promotions: Promotion[];
}

const BADGE_COLORS: Record<string, string> = {
  LIMITED_TIME: 'bg-red-500 text-white',
  BESTSELLER: 'bg-amber-500 text-white',
  NEW_OFFER: 'bg-emerald-500 text-white',
  FESTIVAL_OFFER: 'bg-fuchsia-500 text-white',
  SUMMER_SPECIAL: 'bg-sky-500 text-white',
  NONE: 'bg-white/20 text-white',
};

const formatBadge = (badge: string) => badge.replace('_', ' ');

export default function PromoBannerClient({ promotions }: PromoBannerClientProps) {
  if (!promotions || promotions.length === 0) return null;

  const visiblePromotions = promotions.slice(0, 6);
  const tickerPromotions = [...visiblePromotions, ...visiblePromotions];

  return (
    <div className="relative z-50 w-full overflow-hidden border-b border-[#1b3449] bg-[#0a192f] py-3.5 flex items-center">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0a192f] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0a192f] to-transparent" />
      <div className="promo-marquee flex w-max items-center gap-10 px-4">
        {tickerPromotions.map((promo, index) => (
          <div key={`${promo.id}-${index}`} className="inline-flex items-center gap-3 shrink-0">
            {promo.icon_emoji && (
              <span className="text-lg sm:text-xl leading-none flex items-center select-none">{promo.icon_emoji}</span>
            )}
            
            {promo.badge !== 'NONE' && (
              <span className={`inline-flex items-center justify-center text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded leading-none select-none ${BADGE_COLORS[promo.badge] || BADGE_COLORS.NONE}`}>
                {formatBadge(promo.badge)}
              </span>
            )}
            
            <span className="text-xs sm:text-sm font-bold text-white/95 whitespace-nowrap leading-none flex items-center">
              {promo.title}
              {promo.subtitle && (
                <span className="hidden sm:inline font-normal text-white/60 ml-2 leading-none">
                  — {promo.subtitle}
                </span>
              )}
            </span>

            {promo.cta_url && (
              <Link
                href={promo.cta_url}
                className="pointer-events-auto flex items-center gap-0.5 text-[11px] font-bold text-[#64ffda] transition-colors hover:text-white sm:text-xs leading-none"
              >
                {promo.cta_label || 'Learn More'} <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
