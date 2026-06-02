import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopLoader from '@/components/layout/TopLoader';
import QueryProvider from '@/components/providers/QueryProvider';
import AuthProvider from '@/components/providers/AuthProvider';
import PromoBanner from "@/components/ui/PromoBanner";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";
import { Toaster } from 'sonner';
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tsboattourism.org"),
  title: {
    default: "Telangana Boat Tourism | Best Papikondalu Tours & Bhadrachalam Travels",
    template: "%s | Telangana Boat Tourism"
  },
  description: "Book the best Papikondalu tours, Bhadrachalam travel packages, Godavari river cruises, Kolluru bamboo huts and premium stays with Telangana Boat Tourism.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=2" },
      { url: "/icon-192x192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png?v=2", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  keywords: ["best Papikondalu tours", "Papikondalu travels", "best tours in TS Bhadrachalam", "Bhadrachalam Tours", "Best River Cruise", "Godavari Tourism", "Telangana Boat Tourism", "Papikondalu Boating", "Kolluru Bamboo Huts", "Bhadrachalam Temple Stays", "bhadrachalam tourism", "telangana tourism", "andhra tourism", "boat rides"],
  authors: [{ name: "TSTG Boat Tourism" }],
  creator: "Satvik",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.tsboattourism.org",
    title: "Telangana Boat Tourism | Best Papikondalu Tours & Bhadrachalam Travels",
    description: "Experience the majestic Godavari. Best Papikondalu tours, Bhadrachalam pilgrimage travel and official booking support.",
    siteName: "Telangana Boat Tourism",
    images: [{
      url: "https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912237/slider7_fainya.jpg",
      width: 1200,
      height: 630,
      alt: "Papikondalu River Cruise"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Telangana Boat Tourism | Best Bhadrachalam Tours",
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
  maximumScale: 5,
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
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "TravelAgency",
                "name": "Telangana Boat Tourism",
                "alternateName": "TS Boat Tourism",
                "url": process.env.NEXT_PUBLIC_SITE_URL || "https://www.tsboattourism.org",
                "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.tsboattourism.org"}/logo.png`,
                "image": "https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912237/slider7_fainya.jpg",
                "description": "Premium travel agency offering Godavari river cruises, Papikondalu tours, and Bhadrachalam travel packages.",
                "telephone": "+91 95420 69573",
                "email": "tsboattourismservices@gmail.com",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "near SBI ATM, SREE SEETHA RAMA TEMPLE PARKING, DR-NO-4-1-78/1, kalyana mandapam road, opp. sbi atm",
                  "addressLocality": "Bhadrachalam",
                  "addressRegion": "Telangana",
                  "postalCode": "507111",
                  "addressCountry": "IN"
                },
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": 17.6685,
                  "longitude": 80.8936
                },
                "openingHoursSpecification": {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": [
                    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
                  ],
                  "opens": "07:00",
                  "closes": "21:00"
                },
                "sameAs": [
                  "https://www.facebook.com/papikondalutourism",
                  "https://www.instagram.com/papikondalutourism"
                ],
                "hasOfferCatalog": {
                  "@type": "OfferCatalog",
                  "name": "Tourism Packages",
                  "itemListElement": [
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "Papikondalu Boat Trips"
                      }
                    },
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "Kolluru Bamboo Huts Packages"
                      }
                    },
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "LodgingBusiness",
                        "name": "Bhadrachalam Accommodation"
                      }
                    }
                  ]
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "ContactPage",
                "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.tsboattourism.org"}/about`,
                "mainEntity": {
                  "@type": "Organization",
                  "name": "Telangana Boat Tourism Support",
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+91 9542069573",
                    "contactType": "customer service",
                    "areaServed": "IN",
                    "availableLanguage": ["en", "hi", "te"]
                  }
                }
              }
            ])
          }}
        ></script>
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
        <AnalyticsProvider />
      </body>
    </html>
  );
}
