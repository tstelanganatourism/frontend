'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useMemo, useState, useEffect, useRef } from 'react';
import PremiumSelect from '@/components/ui/PremiumSelect';
import {
  ArrowLeft,
  BadgeCheck,
  BedDouble,
  CalendarDays,
  Camera,
  ChevronRight,
  Clock,
  HelpCircle,
  IndianRupee,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wifi,
  X,
  ChevronLeft,
  Info,
  Calendar,
  CheckCircle2,
  FileText,
  AlertTriangle
} from 'lucide-react';

type RoomVariant = {
  id: number;
  variant_name: string;
  weekday_price: number;
  weekend_price: number;
  capacity_per_room?: number;
};

type GalleryImage = { id: number; image_url: string; alt_text?: string | null; is_cover: boolean };
type RoomPolicy = { id: number; type: string; title: string; description: string; sort_order: number };
type RoomFAQ = { id: number; question: string; answer: string; sort_order: number };
type RoomBookingSlot = { title: string; slot_start: string; slot_end: string };

export type RoomDetailViewModel = {
  id: number;
  slug: string;
  lodge_name: string;
  description?: string | null;
  address?: string | null;
  cover_image_url?: string | null;
  map_url?: string | null;
  is_featured: boolean;
  starting_price?: number | null;
  total_rooms?: number | null;
  slot_start?: string | null;
  slot_end?: string | null;
  booking_slots?: RoomBookingSlot[];
  facilities: string[];
  variants: RoomVariant[];
  gallery: GalleryImage[];
  highlights: Array<{ id: number; title: string; icon?: string | null; sort_order: number }>;
  faqs: RoomFAQ[];
  policies: RoomPolicy[];
};

interface RoomDetailExperienceProps {
  room: RoomDetailViewModel;
}

const fallbackImage =
  'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912237/slider7_fainya.jpg';

const today = new Date().toISOString().slice(0, 10);

const money = (value?: number | null) => {
  const numeric = Number(value || 0);
  if (!numeric) return 'Contact';
  return `₹${numeric.toLocaleString('en-IN')}`;
};

const cleanTime = (value?: string | null) => {
  if (!value) return 'Confirm';
  const [hour = '0', minute = '0'] = value.split(':');
  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const getStayPriceDetails = (
  arrivalStr: string,
  departureStr: string,
  weekdayPrice: number,
  weekendPrice: number
) => {
  if (!arrivalStr || !departureStr) {
    return { totalPrice: 0, nightsCount: 1, breakdown: [] };
  }

  const arrival = new Date(`${arrivalStr}T00:00:00`);
  const departure = new Date(`${departureStr}T00:00:00`);

  if (departure <= arrival) {
    return { totalPrice: 0, nightsCount: 1, breakdown: [] };
  }

  let total = 0;
  let nightsCount = 0;
  const breakdown = [];

  const current = new Date(arrival);
  while (current < departure) {
    const dayOfWeek = current.getDay();
    // Saturday (6) and Sunday (0) are considered weekend nights
    const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;
    const nightPrice = isWeekend ? weekendPrice : weekdayPrice;

    total += nightPrice;
    nightsCount++;

    breakdown.push({
      dateStr: current.toISOString().slice(0, 10),
      isWeekend,
      price: nightPrice
    });

    current.setDate(current.getDate() + 1);
  }

  return { totalPrice: total, nightsCount: Math.max(nightsCount, 1), breakdown };
};

const formatPolicyType = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getMapEmbedUrl = (rawUrl?: string | null, address?: string | null, lodgeName?: string) => {
  if (rawUrl) {
    if (rawUrl.includes('<iframe')) {
      const match = rawUrl.match(/src="([^"]+)"/);
      if (match?.[1]) return match[1];
    }
    if (rawUrl.includes('google.com/maps/embed') || rawUrl.includes('maps.google.com/maps?')) return rawUrl;
    const coordMatch = rawUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch?.[1] && coordMatch?.[2]) {
      return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=15&output=embed`;
    }
  }

  const querySource = address || lodgeName;
  return querySource ? `https://maps.google.com/maps?q=${encodeURIComponent(querySource)}&z=15&output=embed` : '';
};

export const RoomDetailExperience = ({ room }: RoomDetailExperienceProps) => {
  const validVariants = useMemo(
    () => room.variants.filter((variant) => variant.variant_name?.trim() && Number(variant.weekday_price) > 0),
    [room.variants]
  );

  const slides = useMemo(() => {
    const gallery = [...room.gallery].sort((a, b) => Number(b.is_cover) - Number(a.is_cover));
    if (room.cover_image_url && !gallery.some((image) => image.image_url === room.cover_image_url)) {
      gallery.unshift({ id: -room.id, image_url: room.cover_image_url, alt_text: room.lodge_name, is_cover: true });
    }
    return gallery.length ? gallery : [{ id: -1, image_url: fallbackImage, alt_text: room.lodge_name, is_cover: true }];
  }, [room.cover_image_url, room.gallery, room.id, room.lodge_name]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(() => validVariants[0]?.id ?? null);
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  // Realtime check to bypass Next.js static page cache if lodge was turned inactive
  const [isLodgeInactive, setIsLodgeInactive] = useState(false);
  const [isCheckingActive, setIsCheckingActive] = useState(true);

  useEffect(() => {
    const checkStatus = () => {
      fetch(`/api/v1/rooms/${room.slug}?t=${Date.now()}`)
        .then((res) => {
          setIsLodgeInactive(res.status === 404);
        })
        .catch(() => {})
        .finally(() => {
          setIsCheckingActive(false);
        });
    };
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [room.slug]);
 
  const selectedVariant = useMemo(() => {
    if (!validVariants.length) return undefined;
    return validVariants.find((variant) => variant.id === selectedVariantId) || validVariants[0];
  }, [selectedVariantId, validVariants]);

  const capacity = selectedVariant?.capacity_per_room || 2;
  const roomsCount = Math.max(1, Math.ceil(guests / capacity));

  const stayDetails = useMemo(() => {
    const weekday = Number(selectedVariant?.weekday_price || room.starting_price || 0);
    const weekend = Number(selectedVariant?.weekend_price || selectedVariant?.weekday_price || room.starting_price || 0);
    return getStayPriceDetails(arrivalDate, departureDate, weekday, weekend);
  }, [arrivalDate, departureDate, selectedVariant, room.starting_price]);

  const price = Number(selectedVariant?.weekday_price || room.starting_price || 0);
  const totalPrice = stayDetails.totalPrice * roomsCount;
  const nights = stayDetails.nightsCount;
  const activeImage = slides[activeSlide] || slides[0];
  const facilities = room.facilities.filter(Boolean);
  const slots = room.booking_slots?.length
    ? room.booking_slots
    : [{ title: 'Standard stay', slot_start: room.slot_start || '', slot_end: room.slot_end || '' }];
  const selectedSlot = slots[selectedSlotIndex] || slots[0];
  const embedUrl = getMapEmbedUrl(room.map_url, room.address, room.lodge_name);
  const bookingText = encodeURIComponent(
    `Hi, I want to reserve ${room.lodge_name}${selectedVariant ? ` - ${selectedVariant.variant_name}` : ''}. Rooms: ${roomsCount}, Guests: ${guests}. Dates: ${arrivalDate || 'not selected'} to ${departureDate || 'not selected'}. Timing Slot: ${selectedSlot ? `${selectedSlot.title} (${cleanTime(selectedSlot.slot_start)} to ${cleanTime(selectedSlot.slot_end)})` : 'Standard'}.`
  );

  const moveSlide = (direction: 'left' | 'right') => {
    setActiveSlide((current) => {
      if (direction === 'left') return (current - 1 + slides.length) % slides.length;
      return (current + 1) % slides.length;
    });
  };

  return (
    <main className="min-h-screen bg-[#f5faf9] text-[#102231]">
      <section className="relative overflow-hidden bg-[#062d3c]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#062d3c_0%,#0c7b78_58%,#f4b44e_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(255,255,255,0.22),transparent_26%),linear-gradient(180deg,rgba(3,24,35,0.08),rgba(3,24,35,0.7))]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
          <div className="mb-5 flex min-w-0 items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/70">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/stays" className="transition hover:text-white">Stays</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="truncate text-white">{room.lodge_name}</span>
          </div>

          <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="text-white">
              <Link href="/stays" className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/18">
                <ArrowLeft className="h-4 w-4" />
                Stays
              </Link>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-black backdrop-blur">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
                  Verified stay
                </span>
                {room.is_featured ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-black backdrop-blur">
                    <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                    Featured property
                  </span>
                ) : null}
              </div>

              <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-normal text-white sm:text-4xl lg:text-5xl">
                {room.lodge_name}
              </h1>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/85 sm:text-base">
                {room.description || 'A verified Bhadrachalam stay with room categories, facilities, location, and reservation details shown clearly before booking.'}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <HeroFact icon={IndianRupee} label="Starts from" value={price ? money(price) : money(room.starting_price)} />
                <HeroFact icon={BedDouble} label="Categories" value={`${validVariants.length || 1} option${validVariants.length === 1 ? '' : 's'}`} />
                <HeroFact icon={Clock} label="Check-in" value={cleanTime(room.slot_start)} />
                <HeroFact icon={MapPin} label="Location" value={room.address || 'Bhadrachalam'} />
              </div>
            </div>

            <div className="rounded-xl border border-white/18 bg-white p-2 shadow-2xl shadow-slate-950/18">
              <div className="relative overflow-hidden rounded-lg bg-slate-950">
                <div className="relative aspect-[4/3] min-h-[300px] sm:aspect-[16/10] lg:min-h-[470px]">
                  <Image src={activeImage.image_url} alt={activeImage.alt_text || room.lodge_name} fill priority className="scale-110 object-cover opacity-35 blur-2xl" sizes="(max-width: 1024px) 100vw, 720px" />
                  <Image src={activeImage.image_url} alt={activeImage.alt_text || room.lodge_name} fill priority className="object-cover transition-transform duration-500 hover:scale-[1.015]" sizes="(max-width: 1024px) 100vw, 720px" />
                  <button type="button" onClick={() => setLightboxOpen(true)} className="absolute inset-0 z-10" aria-label="Open stay photos" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent p-3 sm:p-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-1.5 text-xs font-black text-slate-900 shadow-sm">
                      <Camera className="h-3.5 w-3.5" />
                      {slides.length} Photo{slides.length === 1 ? '' : 's'}
                    </span>
                    <span className="hidden rounded-full bg-slate-950/65 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/10 sm:inline-flex">
                      {room.total_rooms ? `${room.total_rooms} rooms` : 'Managed stay'}
                    </span>
                  </div>
                  {slides.length > 1 ? (
                    <>
                      <button type="button" onClick={() => moveSlide('left')} className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-slate-900 shadow-lg transition hover:scale-105" aria-label="Previous photo">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button type="button" onClick={() => moveSlide('right')} className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-slate-900 shadow-lg transition hover:scale-105" aria-label="Next photo">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>

              {slides.length > 1 ? (
                <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {slides.slice(0, 5).map((slide, index) => (
                    <button key={slide.id || index} type="button" onClick={() => setActiveSlide(index)} className={`relative aspect-[4/3] overflow-hidden rounded-md border transition ${index === activeSlide ? 'border-[#1a6b7a] ring-2 ring-[#1a6b7a]/20' : 'border-slate-200 opacity-75 hover:opacity-100'}`} aria-label={`Show photo ${index + 1}`}>
                      <Image src={slide.image_url} alt={slide.alt_text || `Stay photo ${index + 1}`} fill sizes="120px" className="object-cover" />
                      {index === 4 && slides.length > 5 ? <span className="absolute inset-0 flex items-center justify-center bg-slate-950/65 text-xs font-black text-white">+{slides.length - 5}</span> : null}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#f4faf9] px-3 py-2 text-xs font-bold text-[#0f3d56]">
                  <BadgeCheck className="h-4 w-4 text-[#1a6b7a]" />
                  More photos may be shared by the reservations team.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <RoomSectionNav />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8 lg:py-14">
        <div className="space-y-8">
          <Section id="overview" title="Stay Overview" eyebrow="Room details">
            <div className="grid gap-4 md:grid-cols-3">
              <InfoTile icon={MapPin} label="Address" value={room.address || 'Bhadrachalam stay location'} />
              <InfoTile icon={Clock} label="Check-out" value={cleanTime(room.slot_end)} />
              <InfoTile icon={Users} label="Rooms" value={room.total_rooms ? `${room.total_rooms} total rooms` : 'Confirmed by team'} />
            </div>
          </Section>

          {facilities.length ? (
            <Section title="Facilities" eyebrow="From admin">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {facilities.map((facility) => (
                  <div key={facility} className="flex min-h-16 items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                    <Wifi className="h-4 w-4 shrink-0 text-[#0f8d7d]" />
                    <span className="text-sm font-black text-slate-800">{facility}</span>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {validVariants.length ? (
            <Section id="categories" title="Stay Categories" eyebrow="Room tariffs">
              <div className="grid gap-4">
                {validVariants.map((variant) => {
                  const active = selectedVariant?.id === variant.id;
                  return (
                    <button key={variant.id} type="button" onClick={() => setSelectedVariantId(variant.id)} className={`grid gap-5 rounded-lg border p-5 text-left shadow-sm transition duration-300 md:grid-cols-[1fr_auto] md:items-center ${active ? 'border-[#0f8d7d] bg-white shadow-[0_22px_70px_rgba(15,141,125,0.12)]' : 'border-slate-200 bg-white/80 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg'}`}>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black text-[#102231]">{variant.variant_name}</h3>
                          {variant.capacity_per_room ? <span className="rounded-full bg-[#edf8f6] px-3 py-1 text-xs font-black text-[#0f766e]">{variant.capacity_per_room} guests/room</span> : null}
                        </div>
                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">Select this category to update your reservation estimate.</p>
                      </div>
                      <div className="flex gap-8 md:text-right">
                        <PriceBlock label="Weekday" value={variant.weekday_price} highlight />
                        <PriceBlock label="Weekend" value={variant.weekend_price} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </Section>
          ) : null}

          {room.highlights.length || embedUrl ? (
            <Section id="highlights" title="Highlights & Location" eyebrow="Good to know">
              <div className="grid gap-6 md:grid-cols-2">
                {room.highlights.length ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {room.highlights.map((highlight) => (
                      <div key={highlight.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                        <Star className="h-5 w-5 text-[#f2a93b]" />
                        <p className="mt-4 text-base font-black leading-7 text-[#102231]">{highlight.title}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm text-slate-400 font-semibold">Premium stay verified features</p>
                  </div>
                )}

                {embedUrl ? (
                  <div className="relative h-[380px] overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                    <iframe title={`${room.lodge_name} map`} src={embedUrl} className="h-full w-full rounded-lg border-0 grayscale transition duration-700 hover:grayscale-0" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                  </div>
                ) : null}
              </div>
            </Section>
          ) : null}

          {slots.length ? (
            <Section id="timings" title="Stay Timings" eyebrow="Booking slots">
              <div className="grid gap-4 sm:grid-cols-2">
                {slots.map((slot, index) => (
                  <div key={`${slot.title}-${index}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <Clock className="h-5 w-5 text-[#0f8d7d]" />
                    <h3 className="mt-4 text-base font-black text-[#102231]">{slot.title || 'Stay slot'}</h3>
                    <p className="mt-2 text-sm font-bold text-slate-500">{cleanTime(slot.slot_start)} to {cleanTime(slot.slot_end)}</p>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {room.faqs.length ? (
            <Section id="faqs" title="Stay FAQs" eyebrow="Before booking">
              <div className="grid gap-3">
                {room.faqs.map((faq) => (
                  <details key={faq.id} className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-black text-[#102231]">
                      <span>{faq.question}</span>
                      <HelpCircle className="h-5 w-5 shrink-0 text-[#0f8d7d]" />
                    </summary>
                    <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </Section>
          ) : null}

          {room.policies.length ? (
            <Section id="policies" title="Policies" eyebrow="Terms">
              <div className="grid gap-4 md:grid-cols-2">
                {room.policies.map((policy) => (
                  <div key={policy.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0f8d7d]">{formatPolicyType(policy.type)}</p>
                    <h3 className="mt-3 text-base font-black text-[#102231]">{policy.title}</h3>
                    <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{policy.description}</p>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {slides.length > 0 ? (
            <Section id="gallery" title="Stay Gallery" eyebrow="Property photos">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {slides.map((slide, index) => (
                  <button 
                    key={slide.id || index} 
                    type="button" 
                    onClick={() => {
                      setActiveSlide(index);
                      setLightboxOpen(true);
                    }} 
                    className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition hover:scale-[1.03] hover:shadow-lg hover:border-[#0f8d7d]/30" 
                    aria-label={`View photo ${index + 1}`}
                  >
                    <Image src={slide.image_url} alt={slide.alt_text || `Gallery photo ${index + 1}`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
                  </button>
                ))}
              </div>
            </Section>
          ) : null}
        </div>         <aside className="lg:pt-1">
          <div className="sticky top-28 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_28px_90px_rgba(16,34,49,0.12)]">
            {isLodgeInactive && (
              <div className="mb-5 rounded-xl border border-rose-100 bg-rose-50/70 p-3.5 text-xs text-rose-600 font-bold flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black">Online Bookings Suspended</p>
                  <p className="text-slate-500 font-bold text-[11px] mt-0.5 leading-relaxed">
                    This stay / lodge is currently closed or inactive. You cannot submit new reservations.
                  </p>
                </div>
              </div>
            )}

            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Starting from</p>
            <div className="mt-2 flex items-end gap-2">
              <p className="text-4xl font-black text-[#102231]">{money(price)}</p>
              {price ? <span className="pb-1 text-sm font-black text-slate-500">/ night</span> : null}
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm font-black text-[#263241]">Select Dates</p>
                <div className="mt-3 grid gap-3">
                  <CustomDatePicker
                    label="Arrival"
                    value={arrivalDate}
                    min={today}
                    disabled={isLodgeInactive}
                    onChange={(val) => {
                      setArrivalDate(val);
                      if (departureDate && departureDate <= val) {
                        const nextDay = new Date(val);
                        nextDay.setDate(nextDay.getDate() + 1);
                        setDepartureDate(nextDay.toISOString().slice(0, 10));
                      }
                    }}
                  />
                  <CustomDatePicker
                    label="Departure"
                    value={departureDate}
                    min={arrivalDate || today}
                    disabled={isLodgeInactive}
                    onChange={setDepartureDate}
                  />
                </div>
              </div>

              {validVariants.length ? (
                <PremiumSelect
                  label="Stay Category"
                  value={selectedVariantId}
                  disabled={isLodgeInactive}
                  onChange={(value) => setSelectedVariantId(Number(value))}
                  options={validVariants.map((variant) => ({ value: variant.id, label: variant.variant_name }))}
                  placeholder="Select stay category"
                />
              ) : null}

              {slots.length > 0 ? (
                <div>
                  <p className="text-sm font-black text-[#263241]">Check-in/out Timing</p>
                  <div className="mt-3 grid gap-2">
                    {slots.map((slot, index) => {
                      const active = selectedSlotIndex === index;
                      return (
                        <button
                          key={index}
                          type="button"
                          disabled={isLodgeInactive}
                          onClick={() => setSelectedSlotIndex(index)}
                          className={`flex flex-col w-full text-left rounded-lg border px-4 py-3 transition-all cursor-pointer ${
                            isLodgeInactive
                              ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                              : active
                              ? 'border-[#0f8d7d] bg-[#f4faf9] shadow-sm ring-1 ring-[#0f8d7d]/20'
                              : 'border-slate-200 bg-white hover:border-slate-350'
                          }`}
                        >
                          <span className="text-xs font-black text-[#102231]">{slot.title}</span>
                          <span className="mt-1 text-[11px] font-bold text-slate-500">
                            {cleanTime(slot.slot_start)} - {cleanTime(slot.slot_end)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div>
                <p className="text-sm font-black text-[#263241]">Guests</p>
                <div className={`mt-3 flex min-h-14 items-center justify-between rounded-lg border px-4 ${isLodgeInactive ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-slate-200'}`}>
                  <button type="button" disabled={isLodgeInactive} onClick={() => setGuests((value) => Math.max(1, value - 1))} className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition ${isLodgeInactive ? 'cursor-not-allowed text-slate-300' : 'hover:border-[#0f8d7d] hover:text-[#0f8d7d]'}`} aria-label="Decrease guests">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-black">{guests} {guests === 1 ? 'Adult' : 'Adults'}</span>
                  <button type="button" disabled={isLodgeInactive} onClick={() => setGuests((value) => Math.min(12, value + 1))} className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition ${isLodgeInactive ? 'cursor-not-allowed text-slate-300' : 'hover:border-[#0f8d7d] hover:text-[#0f8d7d]'}`} aria-label="Increase guests">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {selectedVariant?.capacity_per_room ? <p className="mt-2 text-xs font-bold text-slate-400">Selected category capacity: {selectedVariant.capacity_per_room} guests per room.</p> : null}
              </div>

              <div className="border-t border-slate-200 pt-5">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm font-black text-slate-500">
                    <span>Total for {nights} {nights === 1 ? 'night' : 'nights'}</span>
                    <span className="text-lg text-[#102231]">{totalPrice ? money(totalPrice) : 'Call'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>Rooms required</span>
                    <span>{roomsCount} {roomsCount === 1 ? 'room' : 'rooms'}</span>
                  </div>
                </div>
                {nights > 0 && selectedVariant && arrivalDate && departureDate && stayDetails.breakdown.some(d => d.isWeekend) ? (
                  <p className="mt-1 text-[11px] font-bold text-slate-400">
                    Includes {stayDetails.breakdown.filter(d => d.isWeekend).length} weekend night(s) at {money(selectedVariant.weekend_price)} / room
                  </p>
                ) : null}
                {isLodgeInactive ? (
                  <button disabled className="mt-5 flex min-h-14 w-full items-center justify-center rounded-lg bg-slate-400 text-sm font-black text-white cursor-not-allowed shadow-none">
                    Reservations Closed / Inactive
                  </button>
                ) : (
                  <a href={`https://wa.me/919542069573?text=${bookingText}`} target="_blank" rel="noopener noreferrer" className="mt-5 flex min-h-14 w-full items-center justify-center rounded-lg bg-[#0f8d7d] text-sm font-black text-white shadow-[0_18px_40px_rgba(15,141,125,0.28)] transition hover:-translate-y-0.5 hover:bg-[#0b7469]">
                    Reserve Now
                  </a>
                )}
                <p className="mt-4 text-center text-xs font-bold leading-5 text-slate-400">Final availability, room count, and cancellation terms are confirmed before payment.</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
 
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/50 bg-white/94 p-3 shadow-[0_-18px_50px_rgba(23,34,50,0.14)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Total ({roomsCount} {roomsCount === 1 ? 'room' : 'rooms'})
            </p>
            <p className="text-2xl font-black text-[#102231]">{totalPrice ? money(totalPrice) : 'Call'}</p>
          </div>
          {isLodgeInactive ? (
            <button disabled className="flex h-12 items-center justify-center rounded-lg bg-slate-400 px-6 text-sm font-black text-white cursor-not-allowed">
              Closed
            </button>
          ) : (
            <a href={`https://wa.me/919542069573?text=${bookingText}`} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center rounded-lg bg-[#0f8d7d] px-6 text-sm font-black text-white">
              Reserve
            </a>
          )}
        </div>
      </div>

      {lightboxOpen ? (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <span className="text-sm font-medium text-white/70">{activeSlide + 1} of {slides.length}</span>
            <button onClick={() => setLightboxOpen(false)} className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="Close gallery">
              <X className="h-7 w-7" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center p-2 md:p-8">
            {slides.length > 1 ? (
              <button onClick={() => moveSlide('left')} className="absolute left-2 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:left-8" aria-label="Previous photo">
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
              </button>
            ) : null}
            <div className="relative h-full w-full max-w-6xl">
              <Image src={activeImage.image_url} alt={activeImage.alt_text || room.lodge_name} fill sizes="100vw" className="object-contain" />
            </div>
            {slides.length > 1 ? (
              <button onClick={() => moveSlide('right')} className="absolute right-2 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:right-8" aria-label="Next photo">
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
};

const HeroFact = ({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) => (
  <div className="min-h-[112px] rounded-lg border border-white/15 bg-[#174b55] p-4 shadow-lg shadow-slate-950/10">
    <Icon className="mb-3 h-4 w-4 text-amber-200" />
    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/65">{label}</p>
    <p className="mt-2 line-clamp-2 text-sm font-black leading-5 text-white">{value}</p>
  </div>
);

const Section = ({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: string; children: ReactNode }) => (
  <section id={id} className="scroll-mt-32">
    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0f8d7d]">{eyebrow}</p>
    <h2 className="mt-2 text-2xl font-black text-[#102231] sm:text-3xl">{title}</h2>
    <div className="mt-5">{children}</div>
  </section>
);

const ROOM_NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'categories', label: 'Categories', icon: BedDouble },
  { id: 'highlights', label: 'Highlights', icon: Star },
  { id: 'timings', label: 'Timings', icon: Clock },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  { id: 'policies', label: 'Policies', icon: FileText },
  { id: 'gallery', label: 'Gallery', icon: Camera },
];

const RoomSectionNav = () => {
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      for (const item of ROOM_NAV_ITEMS) {
        const section = document.getElementById(item.id);
        if (section) {
          const { top } = section.getBoundingClientRect();
          const sectionTop = top + window.scrollY;
          const sectionBottom = sectionTop + section.offsetHeight;
          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // stable: ROOM_NAV_ITEMS is a module-level constant

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const offsetPosition = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-16 z-30 border-b border-slate-200/70 bg-white/92 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-nowrap gap-2 overflow-x-auto py-3 scrollbar-none">
          {ROOM_NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                type="button"
                className={`flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition-all whitespace-nowrap
                  ${isActive ? 'bg-[#0f3d56] text-white shadow-md shadow-[#0f3d56]/15' : 'bg-slate-100 text-slate-600 hover:bg-[#e9f6f4] hover:text-[#0f3d56]'}`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const InfoTile = ({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) => (
  <div className="min-h-32 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <Icon className="h-5 w-5 text-[#0f8d7d]" />
    <p className="mt-4 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
    <p className="mt-2 text-sm font-black leading-6 text-[#102231]">{value}</p>
  </div>
);

const PriceBlock = ({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
    <p className={`mt-1 text-2xl font-black ${highlight ? 'text-[#0f8d7d]' : 'text-[#102231]'}`}>{money(value)}</p>
  </div>
);

const CustomDatePicker = ({
  label,
  value,
  min,
  onChange,
  placeholder = 'Select Date',
  disabled = false,
}: {
  label: string;
  value: string;
  min?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current date or fallback to min or today
  const baseDate = useMemo(() => {
    if (value) return new Date(value);
    if (min) return new Date(min);
    return new Date();
  }, [value, min]);

  const [calYear, setCalYear] = useState(baseDate.getFullYear());
  const [calMonth, setCalMonth] = useState(baseDate.getMonth());

  // Update calendar month/year if value or min changes
  useEffect(() => {
    setCalYear(baseDate.getFullYear());
    setCalMonth(baseDate.getMonth());
  }, [baseDate]);

  // Click outside listener to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const toYYYYMMDD = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const handleDaySelect = (day: number) => {
    const selected = toYYYYMMDD(calYear, calMonth, day);
    onChange(selected);
    setIsOpen(false);
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  const prevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Do not go before the min date's month
    const minD = min ? new Date(min) : new Date();
    if (calYear < minD.getFullYear() || (calYear === minD.getFullYear() && calMonth <= minD.getMonth())) {
      return;
    }

    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const days = [];

    // Empty spacers
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    const minDateStr = min || new Date().toISOString().slice(0, 10);

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = toYYYYMMDD(calYear, calMonth, i);
      const isPast = dateStr < minDateStr;
      const isSelected = dateStr === value;

      days.push(
        <button
          key={i}
          type="button"
          disabled={isPast}
          onClick={() => handleDaySelect(i)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all
            ${isPast
              ? 'text-slate-200 cursor-not-allowed line-through'
              : isSelected
                ? 'bg-[#0f8d7d] text-white shadow-md'
                : 'text-[#102231] hover:bg-[#f4faf9] hover:text-[#0f8d7d] cursor-pointer'
            }
          `}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  const formattedDate = value
    ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : placeholder;

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left rounded-lg border px-4 py-3 shadow-inner transition-all ${
          disabled
            ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-85 text-slate-400'
            : 'bg-white border-slate-200 cursor-pointer hover:border-slate-350 focus:border-[#0f8d7d] focus:outline-none'
        }`}
      >
        <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
          <CalendarDays className="h-4 w-4 text-[#0f8d7d]" />
          {label}
        </span>
        <div className="mt-1.5 text-sm font-black">
          {formattedDate}
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-xl border border-slate-150 bg-white p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 max-w-[320px] mx-auto md:max-w-none">
          <div className="flex justify-between items-center mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 hover:bg-[#f4faf9] rounded-lg text-slate-400 hover:text-[#0f8d7d] transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
              disabled={(() => {
                const minD = min ? new Date(min) : new Date();
                return calYear < minD.getFullYear() || (calYear === minD.getFullYear() && calMonth <= minD.getMonth());
              })()}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-xs font-black text-[#102231] uppercase tracking-wider">
              {monthNames[calMonth]} {calYear}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 hover:bg-[#f4faf9] rounded-lg text-slate-400 hover:text-[#0f8d7d] transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-wider w-8 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 justify-items-center">
            {renderDays()}
          </div>
        </div>
      )}
    </div>
  );
};
