import React from 'react';
import PromoBannerClient from './PromoBannerClient';
import { apiFetch } from '@/lib/api';
import { Promotion } from '@/hooks/usePromotions';

export default async function PromoBanner() {
  try {
    const res = await apiFetch('/api/v1/promotions/active', {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!res.ok) return null;
    
    const promotions: Promotion[] = await res.json();
    if (!promotions || promotions.length === 0) {
      return null;
    }

    return <PromoBannerClient promotions={promotions} />;
  } catch (err) {
    return null;
  }
}
