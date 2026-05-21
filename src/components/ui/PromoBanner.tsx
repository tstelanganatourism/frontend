import { apiFetch } from '@/lib/api';
import PromoBannerClient from './PromoBannerClient';
import { Promotion } from '@/hooks/usePromotions';

async function fetchActivePromotions(): Promise<Promotion[]> {
  try {
    // Fetch fresh active promotions dynamically so deactivation of promo codes reflects instantly
    const res = await apiFetch('/api/v1/promotions/active', {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      console.warn('Failed to fetch promotions', res.status);
      return [];
    }
    
    return await res.json();
  } catch (error) {
    console.warn('Error fetching promotions:', error);
    return [];
  }
}

export default async function PromoBanner() {
  const promotions = await fetchActivePromotions();

  if (!promotions || promotions.length === 0) {
    return null;
  }

  return <PromoBannerClient promotions={promotions} />;
}
