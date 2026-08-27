import type { Metadata } from "next";
import { Inter, Noto_Sans_Telugu, Outfit } from "next/font/google";
import "./globals.css";
import TopLoader from '@/components/layout/TopLoader';
import QueryProvider from '@/components/providers/QueryProvider';
import AuthProvider from '@/components/providers/AuthProvider';
import PromoBanner from "@/components/ui/PromoBanner";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";
import { Toaster } from 'sonner';
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';
import PhoneCollectionModal from '@/components/ui/PhoneCollectionModal';
import PwaRegistrar from '@/components/providers/PwaRegistrar';
import InstallPromptModal from '@/components/ui/InstallPromptModal';

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: 'swap' });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: 'swap', preload: false });
const notoTelugu = Noto_Sans_Telugu({ subsets: ["telugu"], variable: "--font-telugu", weight: ["400", "700", "900"], display: 'swap', preload: false });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tstelanganatourism.com"),
  applicationName: "TS Boat Tourism",
  manifest: "/manifest.webmanifest",
  title: {
    default: "TS Boat Tourism | Best Papikondalu Tours, Bhadrachalam & Godavari River Packages",
    template: "%s | TS Boat Tourism"
  },
  description: "Book trusted Papikondalu boat tours, Bhadrachalam temple packages, Godavari boat rides, and Kolluru bamboo hut stays online with TS Boat Tourism.",
  icons: {
    icon: [
      { url: "/icon-192x192.png?v=5", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png?v=5", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=5", sizes: "512x512", type: "image/png" },
    ],
  },
  keywords: [
    "TS Boat Tourism",
    "Papikondalu boat booking",
    "Papikondalu tour packages",
    "Bhadrachalam to Papikondalu boat ride",
    "Rajahmundry to Papikondalu boat booking",
    "Kolluru bamboo huts booking online",
    "Sirivaka bamboo huts stay price",
    "Maredumilli tour packages",
    "Maredumilli and Papikondalu 2 days package",
    "Papikondalu packages from Hyderabad",
    "Papikondalu tour packages from Vijayawada",
    "Papikondalu package from Vizag",
    "Bhadrachalam temple packages",
    "Bhadrachalam room booking online",
    "Godavari river boat booking",
    "Perantapalli temple boat ride",
    "Gandipochamma temple boating point",
    "Pochavaram boating point",
    "AP tourism boat booking bhadrachalam",
    "Telangana tourism boat booking",
    "Papikondalu tourism boat tickets",
    "Papikondalu boat ride price 2025 2026",
    "Kolluru huts resort stay",
    "Bogatha waterfalls Bhadrachalam package",
    "పాపికొండలు బోట్ బుకింగ్",
    "భద్రాచలం పాపికొండలు టూర్",
    "కొల్లూరు వెదురు గుడిసెలు",
    "గోదావరి బోట్ టూర్స్"
  ],
  authors: [{ name: "TS Boat Tourism" }],
  creator: "Satvik",
  appleWebApp: {
    capable: true,
    title: "TS Boat Tourism",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.tstelanganatourism.com",
    title: "TS Boat Tourism | Papikondalu Boat Booking, Bhadrachalam & Godavari Packages",
    description: "Book Papikondalu boat tours, Bhadrachalam temple packages, Godavari boat rides, and Kolluru bamboo hut stays online with TS Boat Tourism.",
    siteName: "TS Boat Tourism",
    images: [{
      url: "https://res.cloudinary.com/r929tquv/image/upload/v1787818364/ts_boat_tourism/brand/logo_og_1200x630.jpg",
      width: 1200,
      height: 630,
      alt: "TS Boat Tourism | Official Booking Partner"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TS Boat Tourism | Papikondalu Boat Booking & Bhadrachalam Packages",
    description: "Book Papikondalu boat tours, Bhadrachalam temple packages, and Kolluru bamboo hut stays online.",
    images: ["https://res.cloudinary.com/r929tquv/image/upload/v1787818364/ts_boat_tourism/brand/logo_og_1200x630.jpg"],
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
  verification: {
    google: "googlea616b17aa0fc3e10",
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
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* Font loading and preloads managed by Next.js */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && window.trustedTypes && !window.trustedTypes.defaultPolicy) {
                window.trustedTypes.createPolicy('default', {
                  createHTML: (string) => string,
                  createScript: (string) => string,
                  createScriptURL: (string) => string,
                });
              }
            `
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.deferredPrompt = e;
                window.dispatchEvent(new CustomEvent('deferredpromptavailable'));
              });
            `
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "TravelAgency",
                "name": "TS Boat Tourism",
                "alternateName": "TS Boat Tourism",
                "url": process.env.NEXT_PUBLIC_SITE_URL || "https://www.tstelanganatourism.com",
                "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.tstelanganatourism.com"}/logo.png?v=3`,
                "image": "https://res.cloudinary.com/r929tquv/image/upload/v1784836276/e62df8f4-a296-43b0-aa24-c63cb3a8f38f_n6bdp6.png",
                "description": "Premium travel agency offering Godavari river cruises, Papikondalu tours, and Bhadrachalam travel packages.",
                "telephone": "+91 99513 69573",
                "email": "tstelanganatourism@gmail.com",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "Door No. 10-1-2/1, Ground Floor, Om Shanthi Building Sataram",
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
                "priceRange": "$$",
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
                  "https://www.instagram.com/ap_ts_boat_tourism/",
                  "https://youtube.com/@telanganaboattourism?si=V1bDCkIJD0mE7lXq"
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
                "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.tstelanganatourism.com"}/about`,
                "mainEntity": {
                  "@type": "Organization",
                  "name": "TS Boat Tourism Support",
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+91 9951369573",
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
      <body className={`${inter.variable} ${outfit.variable} ${notoTelugu.variable} font-sans antialiased bg-[#F9F9F7] text-[#0F3D56] min-h-screen flex flex-col`}>
        <TopLoader />
        <QueryProvider>
          <AuthProvider>
            <ClientLayoutWrapper promoBanner={<PromoBanner />}>
              {children}
            </ClientLayoutWrapper>
            <Toaster position="top-center" richColors />
            <PhoneCollectionModal />
          </AuthProvider>
        </QueryProvider>
        <AnalyticsProvider />
        <PwaRegistrar />
        <InstallPromptModal />
      </body>
    </html>
  );
}
