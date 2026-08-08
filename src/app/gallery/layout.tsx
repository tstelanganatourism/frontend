import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo & Video Gallery | Papikondalu, Godavari & Bhadrachalam Tours',
  description: 'Explore HD photos and cinematic videos of Papikondalu gorges, Godavari river cruises, Kolluru bamboo huts, Bhadrachalam temple, and Maredumilli rainforest — TS Boat Tourism official gallery.',
  openGraph: {
    title: 'Gallery | TS Boat Tourism',
    description: 'Breathtaking photos and videos from Papikondalu, Bhadrachalam, and Godavari river cruises.',
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
