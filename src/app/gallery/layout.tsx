import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo & Video Gallery | Papikondalu, Godavari & Bhadrachalam Tours',
  description: 'Explore HD photos and videos of Papikondalu, Godavari boat trips, Kolluru bamboo huts, Bhadrachalam temple, and Maredumilli — TS Boat Tourism gallery.',
  alternates: {
    canonical: '/gallery',
  },
  openGraph: {
    title: 'Gallery | TS Boat Tourism',
    description: 'Breathtaking photos and videos from Papikondalu, Bhadrachalam, and Godavari boat trips.',
    type: 'website',
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
