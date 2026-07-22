import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tstelanganatourism.com"),
  applicationName: "TS Boat Tourism",
  manifest: "/manifest.webmanifest",
  title: {
    default: "TS Boat Tourism | Best Papikondalu Tours, Bhadrachalam & Godavari River Packages",
    template: "%s | TS Boat Tourism"
  },
  description: "Book trusted Papikondalu boat tours, Bhadrachalam pilgrimage packages, Godavari river cruises, and Kolluru bamboo hut stays online with TS Boat Tourism.",
  icons: {
    icon: [
      { url: "/icon-192x192.png?v=4", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png?v=4", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=4", sizes: "512x512", type: "image/png" },
    ],
  },
  keywords: ["best Papikondalu tours", "Papikondalu travels", "best tours in TS Bhadrachalam", "Bhadrachalam Tours", "Best River Cruise", "Godavari Tourism", "TS Boat Tourism", "Papikondalu Boating", "Kolluru Bamboo Huts", "Bhadrachalam Temple Stays", "bhadrachalam tourism", "telangana tourism", "boat rides", "AP tourism boat booking bhadrachalam", "AP tourism papikondalu tour packages", "Telangana tourism boat booking", "papikondalu tourism boat tickets", "bhadrachalam to papikondalu boat ride", "papikondalu packages from hyderabad", "papikondalu boating online booking", "kolluru bamboo huts booking", "bhadrachalam temple rooms booking", "bhadrachalam godavari boating list", "rajahmundry to papikondalu boat price", "papikondalu packages from vizag", "papikondalu packages from vijayawada", "ap tourism boat ride cost", "boat rides near me", "tourism boats in telangana"],
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
    title: "TS Boat Tourism | Best Papikondalu Tours & Bhadrachalam Travels",
    description: "Experience the majestic Godavari. Best Papikondalu tours, Bhadrachalam pilgrimage travel and official booking support.",
    siteName: "TS Boat Tourism",
    images: [{
      url: "https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779431872/maredumilli-13_mdqgmv.jpg",
      width: 1200,
      height: 630,
      alt: "Papikondalu River Cruise"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TS Boat Tourism | Best Bhadrachalam Tours",
    description: "Your premium gateway to the Godavari river, Papikondalu hills and Bhadrachalam travel packages.",
    images: ["https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779431872/maredumilli-13_mdqgmv.jpg"],
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
                "image": "https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779431872/maredumilli-13_mdqgmv.jpg",
                "description": "Premium travel agency offering Godavari river cruises, Papikondalu tours, and Bhadrachalam travel packages.",
                "telephone": "+91 95420 69573",
                "email": "bookings@tstelanganatourism.com",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "Om Shanti satram, Kalyana mandapam road, near SBI ATM",
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
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-[#F9F9F7] text-[#0F3D56] min-h-screen flex flex-col`}>
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
