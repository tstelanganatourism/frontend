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
    <div className="relative z-50 w-full overflow-hidden border-b border-[#1b3449] bg-[#0a192f] py-2.5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0a192f] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0a192f] to-transparent" />
      <div className="promo-marquee flex w-max items-center gap-8 px-4">
        {tickerPromotions.map((promo, index) => (
          <div key={`${promo.id}-${index}`} className="flex shrink-0 items-center">
            {promo.icon_emoji && (
              <span className="mr-2.5 text-lg sm:text-xl drop-shadow-sm">{promo.icon_emoji}</span>
            )}
            
            <div className="flex items-center gap-3">
              {promo.badge !== 'NONE' && (
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${BADGE_COLORS[promo.badge] || BADGE_COLORS.NONE}`}>
                  {formatBadge(promo.badge)}
                </span>
              )}
              
              <p className="text-xs sm:text-sm font-semibold text-white/90 whitespace-nowrap">
                {promo.title}
                {promo.subtitle && (
                  <span className="hidden sm:inline font-normal text-white/60 ml-2">
                    — {promo.subtitle}
                  </span>
                )}
              </p>

              {promo.cta_url && (
                <Link
                  href={promo.cta_url}
                  className="pointer-events-auto ml-2 flex items-center gap-1 text-[11px] font-bold text-[#64ffda] transition-colors hover:text-white sm:text-xs"
                >
                  {promo.cta_label || 'Learn More'} <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
