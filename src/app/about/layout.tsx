import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About TS Boat Tourism & Sacred Heritage | Bhadrachalam & Papikondalu',
  description: 'Learn about TS Boat Tourism, authorized booking partner for Godavari river cruises, Papikondalu tourism, Bhadrachalam temple packages, and riverside hut stays.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About TS Boat Tourism & Sacred Heritage',
    description: 'Learn about TS Boat Tourism, authorized booking partner for Godavari river cruises and Papikondalu tourism.',
    url: 'https://www.tstelanganatourism.com/about',
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
