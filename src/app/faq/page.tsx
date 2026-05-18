import type { Metadata } from 'next';
import FAQClient from './FAQClient';
import { FAQS } from './data';

export const metadata: Metadata = {
  title: 'Papikondalu Tour FAQs | Booking, Refunds & Bhadrachalam Travel',
  description:
    'Answers to common questions about Papikondalu boat bookings, refunds, Bhadrachalam tour timing, weather cancellations and onboard facilities.',
  alternates: { canonical: '/faq' },
  keywords: [
    'Papikondalu tour FAQ',
    'Papikondalu booking questions',
    'Papikondalu refund policy',
    'Bhadrachalam travel FAQ',
    'Godavari boat tour timings',
  ],
};

export default function FAQPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.flatMap((category) =>
      category.questions.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    ),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <FAQClient />
    </>
  );
}
