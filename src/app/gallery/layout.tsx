import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery | Papikondalu & Godavari Tourism Photos',
  description: 'View breathtaking photos of Papikondalu tours, Godavari river cruises, Maredumilli forest, and Kolluru bamboo huts.',
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
