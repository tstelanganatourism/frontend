import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopLoader from '@/components/layout/TopLoader';
import QueryProvider from '@/components/providers/QueryProvider';
import AuthProvider from '@/components/providers/AuthProvider';
import PromoBanner from "@/components/ui/PromoBanner";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://papikondalutourism.com"),
  title: {
    default: "Papikondalu Tourism | Best Papikondalu Tours & Bhadrachalam Travels",
    template: "%s | Papikondalu Tourism"
  },
  description: "Book the best Papikondalu tours, Bhadrachalam travel packages, Godavari river cruises, Kolluru bamboo huts and premium stays with Telangana Boat Tourism.",
  keywords: ["best Papikondalu tours", "Papikondalu travels", "best tours in TS Bhadrachalam", "Bhadrachalam Tours", "Best River Cruise", "Godavari Tourism", "Telangana Boat Tourism", "Papikondalu Boating", "Kolluru Bamboo Huts", "Bhadrachalam Temple Stays"],
  authors: [{ name: "TSTG Boat Tourism" }],
  creator: "Satvik",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://papikondalutourism.com",
    title: "Papikondalu Tourism | Best Papikondalu Tours & Bhadrachalam Travels",
    description: "Experience the majestic Godavari. Best Papikondalu tours, Bhadrachalam pilgrimage travel and official booking support.",
    siteName: "Papikondalu Tourism",
    images: [{
      url: "https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912237/slider7_fainya.jpg",
      width: 1200,
      height: 630,
      alt: "Papikondalu River Cruise"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Papikondalu Tourism | Best Bhadrachalam Tours",
    description: "Your premium gateway to the Godavari river, Papikondalu hills and Bhadrachalam travel packages.",
    images: ["https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912237/slider7_fainya.jpg"],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  themeColor: '#5ac4d7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              "name": "Telangana Boat Tourism Central Booking Office",
              "image": "https://res.cloudinary.com/dpdab3e97/image/upload/v1778914224/logo1_shpjk5.jpg",
              "@id": "https://papikondalutourism.com",
              "url": "https://papikondalutourism.com",
              "telephone": ["+919542069573", "+919573196369"],
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "D.No. 4-1-78/1, Kalyana Mandapam Road, Opp SBI ATM",
                "addressLocality": "Bhadrachalam",
                "addressRegion": "Telangana",
                "postalCode": "507111",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 17.6679203,
                "longitude": 80.8842402
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday"
                ],
                "opens": "00:00",
                "closes": "23:59"
              },
              "sameAs": [
                "https://www.facebook.com/papikondalutours",
                "https://www.instagram.com/papikondalutourism"
              ],
              "priceRange": "$$",
              "areaServed": [
                "Papikondalu",
                "Bhadrachalam",
                "Telangana",
                "Godavari River"
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Papikondalu and Bhadrachalam tour services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "TouristTrip",
                      "name": "Papikondalu Boat Tour Packages"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "TouristTrip",
                      "name": "Bhadrachalam Travel Packages"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "LodgingBusiness",
                      "name": "Bhadrachalam Accommodation Support"
                    }
                  }
                ]
              }
            })
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-[#F9F9F7] text-[#0F3D56] min-h-screen flex flex-col`}>
        <TopLoader />
        <QueryProvider>
          <AuthProvider>
            <ClientLayoutWrapper promoBanner={<PromoBanner />}>
              {children}
            </ClientLayoutWrapper>
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
