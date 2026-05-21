'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export type PromotionType = 'FLAT_DISCOUNT' | 'PERCENT_DISCOUNT' | 'INFORMATIONAL' | 'FREE_SERVICE' | 'CAMPAIGN';
export type PromotionTarget = 'ALL' | 'TOURS_ONLY' | 'TRIPS_ONLY' | 'ROOMS_ONLY' | 'AP_REGION' | 'TS_REGION' | 'SPECIFIC_PACKAGES';
export type PromotionBadge = 'NONE' | 'LIMITED_TIME' | 'BESTSELLER' | 'NEW_OFFER' | 'FESTIVAL_OFFER' | 'SUMMER_SPECIAL';

export interface Promotion {
  id: number;
  title: string;
  subtitle: string | null;
  icon_emoji: string | null;
  badge: PromotionBadge;
  type: PromotionType;
  target: PromotionTarget;
  discount_value: number | null;
  cta_label: string | null;
  cta_url: string | null;
  bg_gradient: string | null;
  sort_order: number;
}

export function useActivePromotions() {
  return useQuery<Promotion[]>({
    queryKey: ['promotions', 'active'],
    queryFn: async () => {
      const res = await apiFetch('/api/v1/promotions/active');
      if (!res.ok) throw new Error('Failed to fetch promotions');
      return res.json();
    },
    staleTime: 5 * 1000, // 5 seconds
  });
}
