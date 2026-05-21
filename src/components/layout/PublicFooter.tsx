'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

const MAPS_LOCATION_URL = 'https://maps.app.goo.gl/6YDfViEq3RLuvNN36?g_st=awb';
const MAP_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3809.849929281358!2d80.88166527581907!3d17.667925396556113!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a36a9d062f4c079%3A0x59e5318d95327bde!2sAP%20TOURISM%20PAPIKONDALU!5e0!3m2!1sen!2sin!4v1715840615123!5m2!1sen!2sin';

const socialLinks = [
  { label: 'Facebook', href: '#', icon: <FacebookIcon /> },
  { label: 'Instagram', href: '#', icon: <InstagramIcon /> },
  { label: 'YouTube', href: '#', icon: <YouTubeIcon /> },
  { label: 'WhatsApp', href: 'https://wa.me/919542069573', icon: <WhatsAppIcon /> },
];

export default function PublicFooter() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <footer className="bg-[var(--color-brand-river)] text-white pt-10 pb-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 gap-8 ${isHomePage ? 'lg:grid-cols-[1fr_0.5fr_0.5fr_1fr_1.5fr]' : 'lg:grid-cols-[1.2fr_0.7fr_0.7fr_1.2fr]'} mb-8`}>

          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-block transition-transform duration-200 hover:scale-[1.02]">
              <img
                src="https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778914224/logo1_shpjk5.jpg"
                alt="Papikondalu Tourism Logo"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-white/70 text-[11px] leading-relaxed max-w-xs">
              Experience the breathtaking beauty of the Godavari river and majestic hills. Your premium journey starts here.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white transition-all hover:bg-white hover:text-[var(--color-brand-river)]"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links & Support (2-column on mobile) */}
          <div className="grid grid-cols-2 gap-4 lg:contents">
            <div>
              <h3 className="text-xs font-bold mb-3 text-[var(--color-brand-sand)] uppercase tracking-wider">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/about" prefetch={false} className="text-white/60 hover:text-white transition-colors text-[11px]">About Us</Link></li>
                <li><Link href="/boat-rides" prefetch={false} className="text-white/60 hover:text-white transition-colors text-[11px]">Boat Rides</Link></li>
                <li><Link href="/sightseeing" prefetch={false} className="text-white/60 hover:text-white transition-colors text-[11px]">Sightseeing</Link></li>
                <li><Link href="/stays" prefetch={false} className="text-white/60 hover:text-white transition-colors text-[11px]">Accommodations</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold mb-3 text-[var(--color-brand-sand)] uppercase tracking-wider">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/faq" prefetch={false} className="text-white/60 hover:text-white transition-colors text-[11px]">FAQs</Link></li>
                <li><Link href="/terms" prefetch={false} className="text-white/60 hover:text-white transition-colors text-[11px]">Terms & Conditions</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold mb-3 text-[var(--color-brand-sand)] uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-3.5 w-3.5 text-[var(--color-brand-teal)] shrink-0 mt-0.5" />
                <span className="text-white/70 text-[11px]">Telangana Boat Tourism Central Booking Office, D.No. 4-1-78/1, Kalyana Mandapam Road, Opp SBI ATM, Bhadrachalam, Bhadradri Kothagudem (Dist), Telangana - 507111.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 text-[var(--color-brand-teal)] shrink-0" />
                <span className="text-white/70 text-[11px]">+91 95420 69573, +91 984 984 89 82, +91 984 984 89 83, +91 984 984 89 38</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="h-3.5 w-3.5 text-[var(--color-brand-teal)] shrink-0 mt-0.5" />
                <span className="text-white/70 text-[11px]">Reporting time: 7:00 AM to 7:30 AM</span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-brand-teal)] shrink-0 mt-0.5" />
                <span className="text-white/70 text-[11px]">Carry Aadhaar Xerox for all passengers and submit it at the boat point.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 text-[var(--color-brand-teal)] shrink-0" />
                <span className="text-white/70 text-[11px] truncate">tsboattourismservices@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Conditional Map (Now visible on all screens if on Homepage) */}
          {isHomePage && (
            <div className="overflow-hidden rounded-xl border border-white/10 shadow-lg">
              <iframe
                title="Footer Map"
                src={MAP_EMBED_URL}
                className="w-full h-48 lg:h-64"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-[10px] text-center md:text-left">
            © {new Date().getFullYear()} Papikondalu Tourism. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-white/50 text-[11px] font-medium">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500 mx-0.5" /> by <a href="https://wa.me/918886154275" target="_blank" rel="noreferrer" className="text-white font-bold hover:text-[var(--color-brand-teal)] transition-colors">Satvik</a>
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
