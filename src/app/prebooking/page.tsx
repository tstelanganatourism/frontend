import type { Metadata } from 'next';
import { apiFetch } from '@/lib/api';
import PreBookingLandingClient from './PreBookingLandingClient';

export const metadata: Metadata = {
  title: 'Early Pre-Booking | TS Boat Tourism',
  description:
    'Pre-book your September 2026 Papikondalu, Bhadrachalam, Kolluru, and Maredumilli tour slots for free. No payment required now.',
  alternates: { canonical: '/prebooking' },
};

// Fetch active published packages from the API
async function fetchPackages() {
  try {
    const res = await apiFetch('/api/v1/packages?size=20&sort=priority', {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return null;
  }
}

export default async function PreBookingPage() {
  const packages = await fetchPackages();
  return <PreBookingLandingClient packages={packages} />;
}
