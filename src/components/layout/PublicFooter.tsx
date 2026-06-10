import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

const MAP_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15206.499265526056!2d80.88424!3d17.66792!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a36a9d062f4c079%3A0x59e5318d95327bde!2sAP%20TOURISM%20PAPIKONDALU!5e0!3m2!1sen!2sin!4v1780377741415!5m2!1sen!2sin';

const socialLinks = [
  { label: 'Facebook', href: '#', icon: <FacebookIcon /> },
  { label: 'Instagram', href: '#', icon: <InstagramIcon /> },
  { label: 'YouTube', href: '#', icon: <YouTubeIcon /> },
  { label: 'WhatsApp', href: 'https://wa.me/919542069573', icon: <WhatsAppIcon /> },
];

interface PublicFooterProps {
  isDashboard?: boolean;
}

export default function PublicFooter({ isDashboard = false }: PublicFooterProps) {
  return (
    <footer className={`relative overflow-hidden border-t border-white/10 bg-[var(--color-brand-river)] text-white ${isDashboard ? 'pb-[calc(10rem+env(safe-area-inset-bottom))]' : 'pb-[calc(7rem+env(safe-area-inset-bottom))]'} pt-6 sm:pt-7 md:pb-5`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <div className="w-full px-4 sm:px-6 min-[980px]:px-8 min-[1280px]:px-10">
        <div className="grid min-w-0 grid-cols-1 gap-6 min-[760px]:grid-cols-[1fr_0.9fr] min-[1120px]:grid-cols-[0.9fr_0.72fr_1.1fr_1.15fr] min-[1120px]:items-start min-[1120px]:gap-7 min-[1500px]:grid-cols-[0.9fr_0.7fr_1.08fr_1.22fr] min-[1500px]:gap-8">

          {/* Brand Info */}
          <div className="min-w-0 rounded-xl border border-white/0 p-0 min-[1120px]:pr-4">
            <div className="flex flex-col gap-3.5">
              <Link href="/" className="group flex min-w-0 items-center gap-3 transition-transform duration-200 hover:scale-[1.02]">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white p-1 shadow-sm ring-1 ring-white/40">
                  <Image src="/aptdc-logo.svg" alt="Andhra Pradesh Tourism" width={44} height={44} className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/55">Andhra Pradesh</div>
                  <div className="truncate text-[13px] font-extrabold tracking-tight text-white transition-colors group-hover:text-[var(--color-brand-sand)]">Official Tour & Travel Agency</div>
                </div>
              </Link>
              
              <div className="group flex min-w-0 items-center gap-3 transition-transform duration-200 hover:scale-[1.02]">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white p-1 shadow-sm ring-1 ring-white/40">
                  <Image src="/telangana-tourism-logo.svg" alt="Telangana Tourism" width={44} height={44} className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/55">Telangana</div>
                  <div className="truncate text-[13px] font-extrabold tracking-tight text-white transition-colors">Official Tourism</div>
                </div>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-[12px] leading-relaxed text-white/72">
              Experience the breathtaking beauty of the Godavari river and majestic hills. Your premium journey starts here.
            </p>
            <div className="mt-4 flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/10 transition-all hover:-translate-y-0.5 hover:bg-white hover:text-[var(--color-brand-river)]"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="grid min-w-0 grid-cols-2 gap-5 rounded-xl border border-white/10 bg-white/[0.025] p-4 min-[760px]:grid-cols-1 min-[1120px]:grid-cols-2">
            <div className="min-w-0">
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-brand-sand)]">Quick Links</h3>
              <ul className="space-y-2.5">
                <li><Link href="/about" className="text-[12px] text-slate-200 transition-colors hover:text-white">About Us</Link></li>
                <li><Link href="/boat-rides" className="text-[12px] text-slate-200 transition-colors hover:text-white">Boat Rides</Link></li>
                <li><Link href="/sightseeing" className="text-[12px] text-slate-200 transition-colors hover:text-white">Sightseeing</Link></li>
                <li><Link href="/stays" className="text-[12px] text-slate-200 transition-colors hover:text-white">Accommodations</Link></li>
                <li><Link href="/contact" className="text-[12px] text-slate-200 transition-colors hover:text-white font-semibold">Contact Us</Link></li>
              </ul>
            </div>

            <div className="min-w-0">
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-brand-sand)]">Support & Policies</h3>
              <ul className="space-y-2.5">
                <li><Link href="/faq" className="text-[12px] text-slate-200 transition-colors hover:text-white">FAQs</Link></li>
                <li><Link href="/terms" className="text-[12px] text-slate-200 transition-colors hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-[12px] text-slate-200 transition-colors hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/refund" className="text-[12px] text-slate-200 transition-colors hover:text-white">Refund Policy</Link></li>
                <li><Link href="/cancellation" className="text-[12px] text-slate-200 transition-colors hover:text-white">Cancellation Policy</Link></li>
                <li><Link href="/shipping-delivery" className="text-[12px] text-slate-200 transition-colors hover:text-white">Fulfillment Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.025] p-4 min-[760px]:col-span-2 min-[1120px]:col-span-1">
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-brand-sand)]">Contact Us</h3>
            <ul className="grid gap-2.5 sm:grid-cols-2 min-[1120px]:grid-cols-1">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.07] text-[var(--color-brand-teal)] ring-1 ring-white/10"><MapPin className="h-3.5 w-3.5" /></span>
                <span className="min-w-0 text-[12px] leading-relaxed text-slate-100">Telangana Boat Tourism, near SBI ATM, SREE SEETHA RAMA TEMPLE PARKING, DR-NO-4-1-78/1, kalyana mandapam road, opp. sbi atm, Bhadrachalam, Telangana 507111.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.07] text-[var(--color-brand-teal)] ring-1 ring-white/10"><Phone className="h-3.5 w-3.5" /></span>
                <span className="min-w-0 text-[12px] leading-relaxed text-slate-100">+91 95420 69573, +91 984 984 89 82, +91 984 984 89 83, +91 984 984 89 38</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.07] text-[var(--color-brand-teal)] ring-1 ring-white/10"><Clock className="h-3.5 w-3.5" /></span>
                <span className="text-[12px] leading-relaxed text-slate-100">Reporting time: 7:00 AM to 7:30 AM</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.07] text-[var(--color-brand-teal)] ring-1 ring-white/10"><ShieldCheck className="h-3.5 w-3.5" /></span>
                <span className="text-[12px] leading-relaxed text-slate-100">Carry Aadhaar Xerox for all passengers and submit it at the boat point.</span>
              </li>
              <li className="flex items-start gap-2.5 sm:col-span-2">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.07] text-[var(--color-brand-teal)] ring-1 ring-white/10"><Mail className="h-3.5 w-3.5" /></span>
                <span className="min-w-0 break-words text-[12px] leading-relaxed text-slate-100">bookings@tsboattourism.org</span>
              </li>
            </ul>
          </div>

          {/* Map */}
          <div className="min-w-0 overflow-hidden rounded-xl border border-white/12 bg-white/[0.04] p-2 shadow-[0_14px_40px_rgba(0,0,0,0.12)] min-[760px]:col-span-2 min-[1120px]:col-span-1">
            <div className="mb-2 flex items-center justify-between gap-3 px-1.5">
              <h3 className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-brand-sand)]">AP Tourism Papikondalu</h3>
              <a
                href="https://www.google.com/maps/place/AP+TOURISM+PAPIKONDALU"
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-[11px] font-bold text-amber-400 transition-colors hover:text-white"
              >
                Open Maps
              </a>
            </div>
            <div className="h-40 overflow-hidden rounded-lg border border-white/15 bg-white/10 sm:h-48 lg:h-56 2xl:h-64">
              <iframe
                title="AP Tourism Papikondalu map"
                src={MAP_EMBED_URL}
                className="h-full w-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-3 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-4 text-center sm:flex-row sm:pr-20 sm:text-left md:pr-24">
          <p suppressHydrationWarning className="text-center text-[10px] text-slate-100 sm:text-left">
            © {new Date().getFullYear()} Telangana Boat Tourism. All rights reserved.
            <span className="block mt-1 text-slate-300">Telangana Boat Tourism is a trade name of NALLA SRILATHA.</span>
          </p>
          <div className="flex items-center gap-1 text-[11px] font-medium text-white/70">
            Made with <Heart className="mx-0.5 h-3 w-3 fill-red-500 text-red-500" /> by <a href="https://wa.me/918886154275" target="_blank" rel="noreferrer" className="font-bold text-white transition-colors hover:text-[var(--color-brand-teal)]">Satvik</a>
          </div>
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
          <stop offset="0" stopColor="#feda75" /><stop offset="0.28" stopColor="#fa7e1e" /><stop offset="0.55" stopColor="#d62976" /><stop offset="0.78" stopColor="#962fbf" /><stop offset="1" stopColor="#4f5bd5" />
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
