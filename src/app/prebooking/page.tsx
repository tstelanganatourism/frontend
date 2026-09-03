import type { Metadata } from 'next';
import PreBookingLandingClient from './PreBookingLandingClient';
import { PREBOOKING_PACKAGES } from './prebookingData';

export const metadata: Metadata = {
  title: 'Early Pre-Booking | TS Boat Tourism',
  description:
    'Pre-book your September 2026 Papikondalu, Bhadrachalam, and Maredumilli tour packages for free. No payment required now.',
  alternates: { canonical: '/prebooking' },
};

export default function PreBookingPage() {
  return <PreBookingLandingClient packages={PREBOOKING_PACKAGES} />;
}
