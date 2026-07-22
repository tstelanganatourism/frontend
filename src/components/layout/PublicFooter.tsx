import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
} from 'lucide-react';

const MAP_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7603.244137815757!2d80.884021!3d17.66805!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a36a9b83aea4343%3A0x7108b8976c666ac7!2sTS%20BOAT%20TOURISM!5e0!3m2!1sen!2sin!4v1784614051800!5m2!1sen!2sin';

const exploreLinks = [
  { label: 'Packages', href: '/packages' },
  { label: 'Brochures', href: '/brochures' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const policyLinks = [
  { label: 'FAQs', href: '/faq' },
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Refunds', href: '/refund' },
  { label: 'Cancellations', href: '/cancellation' },
];

const socialLinks = [
  { label: 'Facebook', href: '#', icon: <FacebookIcon /> },
  { label: 'Instagram', href: 'https://www.instagram.com/ap_ts_boat_tourism/', icon: <InstagramIcon /> },
  { label: 'YouTube', href: 'https://youtube.com/@telanganaboattourism?si=V1bDCkIJD0mE7lXq', icon: <YouTubeIcon /> },
  { label: 'WhatsApp', href: 'https://wa.me/919542069573', icon: <WhatsAppIcon /> },
];

interface PublicFooterProps {
  isDashboard?: boolean;
}

export default function PublicFooter({ isDashboard = false }: PublicFooterProps) {
  return (
    <footer
      className={`relative overflow-hidden border-t border-[#1598a1]/20 bg-[#06232e] text-white ${
        isDashboard
          ? 'pb-[calc(7rem_+_env(safe-area-inset-bottom))] md:pb-8'
          : 'pb-[calc(5.75rem_+_env(safe-area-inset-bottom))] md:pb-8'
      } min-h-[100svh] pt-8 md:min-h-[48svh] md:pt-10`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8eecee]/60 to-transparent" />
      <div className="mx-auto flex min-h-[calc(100svh-8rem)] w-full max-w-[1800px] flex-col justify-between px-4 sm:px-6 md:min-h-0 lg:px-8 xl:px-12">
        <div className="grid gap-4 lg:grid-cols-[minmax(14rem,0.68fr)_minmax(17rem,0.82fr)_minmax(22rem,1fr)_minmax(32rem,1.55fr)]">
          <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-white">
                <Image
                  src="/ts-boat-tourism-logo.png"
                  alt="TS Boat Tourism"
                  width={46}
                  height={46}
                  className="h-11 w-11 rounded-full object-cover"
                />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-lg font-black tracking-tight">
                  TS Boat Tourism
                </span>
                <span className="mt-0.5 block text-[10px] font-black uppercase tracking-[0.18em] text-[#8eecee]">
                  Official Booking Portal
                </span>
              </span>
            </Link>

            <p className="mt-3 text-xs font-semibold leading-6 text-white/64">
              Papikondalu cruises, Bhadrachalam temple trips and guided Godavari booking support.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-white/[0.05] text-white transition-all hover:-translate-y-0.5 hover:border-[#8eecee]/50 hover:bg-[#1598a1]"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4 rounded-md border border-white/10 bg-white/[0.04] p-4">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8eecee]">
                Explore
              </h3>
              <nav className="mt-3 grid gap-2.5">
                {exploreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs font-bold text-white/72 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <a
                href="https://search.google.com/local/writereview?placeid=ChIJz2qgCkOpNjoRyQkNHviubME"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#1598a1] px-3 py-2 text-[11px] font-black text-white transition-colors hover:bg-[#117f87]"
              >
                <Star className="h-3.5 w-3.5 fill-current" />
                Write Review
              </a>
            </div>

            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8eecee]">
                Policies
              </h3>
              <nav className="mt-3 grid gap-2.5">
                {policyLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs font-bold text-white/72 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </section>

          <section className="rounded-md border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8eecee]">
                  Contact
                </h3>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[#8eecee]/20 bg-[#1598a1]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#8eecee]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Authorized
                </span>
              </div>

              <ul className="mt-4 grid gap-2.5">
                <li className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#1598a1]/15 text-[#8eecee]">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-semibold leading-5 text-white/72">
                    Om Shanti satram, Kalyana mandapam road, near SBI ATM, Bhadrachalam, Telangana 507111.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#1598a1]/15 text-[#8eecee]">
                    <Phone className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-black leading-5 text-white">
                    +91 95420 69573, +91 98498 48982
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#1598a1]/15 text-[#8eecee]">
                    <Clock className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-semibold leading-5 text-white/72">
                    Reporting: 7:00 AM to 7:30 AM
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#1598a1]/15 text-[#8eecee]">
                    <Mail className="h-4 w-4" />
                  </span>
                  <span className="break-all text-xs font-semibold leading-5 text-white/72">
                    bookings@tstelanganatourism.com
                  </span>
                </li>
              </ul>
          </section>

          <section className="overflow-hidden rounded-md border border-white/10 bg-white/[0.04] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8eecee]">
                Official Map
              </h3>
              <a
                href="https://www.google.com/maps/place/Telangana+Boat+Tourism/@17.6679145,80.8842764,15z"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/72 hover:text-white"
              >
                Open Maps
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
            <iframe
              title="TS Boat Tourism map"
              src={MAP_EMBED_URL}
              className="h-[15.5rem] w-full rounded-md bg-white md:h-[17.5rem] lg:h-full lg:min-h-[18rem]"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs font-semibold text-white/48 md:flex-row md:items-center md:justify-between">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} TS Boat Tourism. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="currentColor" d="M14 8.5V6.6c0-.8.2-1.2 1.3-1.2H17V2.2C16.2 2.1 15.4 2 14.6 2c-2.7 0-4.5 1.6-4.5 4.6v1.9H7v3.6h3.1V22H14v-9.9h2.9l.5-3.6H14Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <defs>
        <linearGradient id="inst-footer" x1="2" x2="22" y1="22" y2="2">
          <stop offset="0" stopColor="#feda75" />
          <stop offset="0.28" stopColor="#fa7e1e" />
          <stop offset="0.55" stopColor="#d62976" />
          <stop offset="0.78" stopColor="#962fbf" />
          <stop offset="1" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <rect width="20" height="20" x="2" y="2" rx="5" fill="url(#inst-footer)" />
      <path fill="white" d="M12 7.1A4.9 4.9 0 1 0 12 16.9 4.9 4.9 0 0 0 12 7.1Zm0 7.9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6.2-8.1a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#ff0000" d="M21.6 7.1s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C15.8 3.9 12 3.9 12 3.9s-3.8 0-6.7.2c-.4.1-1.3.1-2.1.9-.6.6-.8 2.1-.8 2.1S2.2 8.8 2.2 10.6v1.7c0 1.8.2 3.5.2 3.5s.2 1.5.8 2.1c.8.8 1.9.8 2.4.9 1.7.2 6.4.2 6.4.2s3.8 0 6.7-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.8.2-3.5v-1.7c0-1.8-.2-3.5-.2-3.5Z" />
      <path fill="white" d="m10.1 14.9 5-2.9-5-2.9v5.8Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#25D366" d="M12 2a9.9 9.9 0 0 0-8.5 15L2 22l5.2-1.4A10 10 0 1 0 12 2Z" />
      <path fill="white" d="M17.1 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.6 0-.2-.7-1.6-1-2.2-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.3 3.2c.2.2 2.2 3.4 5.4 4.7.8.3 1.4.5 1.9.6.8.2 1.5.2 2 .1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4Z" />
    </svg>
  );
}
