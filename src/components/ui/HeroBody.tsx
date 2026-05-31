'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Anchor,
  BadgeCheck,
  BedDouble,
  Camera,
  CalendarCheck,
  Globe2,
  Headphones,
  Home,
  ShieldCheck,
  Ship,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';

const featurePills = [
  { icon: Ship, label: 'Scenic\nGodavari Cruises' },
  { icon: Home, label: 'Riverside\nStays' },
  { icon: Camera, label: 'Stunning\nSightseeing' },
  { icon: ShieldCheck, label: 'Safe & Verified\nBookings' },
];

const bottomTags = [
  { icon: Ship, label: 'Godavari Cruises' },
  { icon: BedDouble, label: 'Riverside Stays' },
  { icon: Camera, label: 'Sightseeing Tours' },
  { icon: Users, label: 'Family Packages' },
  { icon: BadgeCheck, label: 'Aadhaar Verified' },
];

const trustItems = [
  { icon: ShieldCheck, label: 'Official Tourism Partner', sub: 'Telangana & Andhra Pradesh' },
  { icon: BadgeCheck, label: 'Government Approved', sub: 'Safe & Trusted' },
  { icon: Headphones, label: '24/7 Booking Support', sub: 'Quick & Reliable' },
  { icon: Globe2, label: 'Secure Payments', sub: 'Razorpay Protected' },
];

const heroStats = [
  { icon: Users, value: '20+', label: 'Years Experience' },
  { icon: Globe2, value: '100K+', label: 'Happy Travellers' },
];

function TopFlourish() {
  return (
    <svg viewBox="0 0 520 84" className="mx-auto h-14 w-full max-w-[36rem] text-amber-300/80" fill="none" aria-hidden="true">
      <path d="M16 58 C72 58 86 28 130 44 C156 54 176 44 190 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M504 58 C448 58 434 28 390 44 C364 54 344 44 330 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M206 46 C224 22 244 22 260 44 C276 22 296 22 314 46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M260 18 L266 32 L282 38 L266 44 L260 60 L254 44 L238 38 L254 32 Z" fill="currentColor" opacity="0.95" />
      <path d="M16 58 H188 M332 58 H504" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.72" />
      <circle cx="130" cy="44" r="3" fill="currentColor" opacity="0.75" />
      <circle cx="390" cy="44" r="3" fill="currentColor" opacity="0.75" />
    </svg>
  );
}

function TitleOrnament() {
  return (
    <div className="mt-3 flex w-full max-w-[18rem] items-center gap-3 overflow-visible text-amber-300/90">
      <span className="h-px flex-1 bg-amber-300/70" />
      <svg viewBox="0 0 92 20" className="h-5 w-24 shrink-0" fill="none" aria-hidden="true">
        <path d="M4 14 C10 7 18 7 24 14 M34 14 C40 7 48 7 54 14 M66 14 C72 7 80 7 86 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M27 13 L31 6 L35 13 M57 13 L61 6 L65 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      </svg>
      <span className="h-px flex-1 bg-amber-300/70" />
    </div>
  );
}

function SmallDivider() {
  return (
    <div className="mt-4 flex w-full max-w-[15rem] items-center gap-2 text-amber-300/85">
      <span className="h-px flex-1 bg-current/60" />
      <svg viewBox="0 0 62 18" className="h-5 w-16 shrink-0" fill="none" aria-hidden="true">
        <path d="M3 12 C10 4 18 4 24 12 C31 4 39 4 46 12 C50 16 56 16 59 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M31 3 L34 9 L40 11 L34 13 L31 17 L28 13 L22 11 L28 9 Z" fill="currentColor" />
      </svg>
      <span className="h-px flex-1 bg-current/60" />
    </div>
  );
}

function StatBlock({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-white/18 bg-slate-950/34 px-3 py-3 shadow-[0_14px_34px_rgba(0,0,0,0.18)] backdrop-blur-md sm:px-4">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-300 text-slate-950 shadow-[0_10px_26px_rgba(251,191,36,0.22)] sm:h-10 sm:w-10">
        <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5" strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <div className="text-[1.7rem] font-black leading-none text-amber-300 sm:text-[2rem] lg:text-[2.1rem] xl:text-[2.35rem]">{value}</div>
        <div className="mt-1 truncate text-[9px] font-black uppercase leading-3 tracking-[0.1em] text-white/82 sm:text-[10px]">
          {label}
        </div>
      </div>
    </div>
  );
}

export default function HeroBody() {
  return (
    <section className="relative isolate flex h-[calc(100dvh-7.3125rem)] flex-col overflow-hidden text-white lg:h-[calc(100dvh-8.45rem)]">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,16,30,0.96)_0%,rgba(2,24,38,0.82)_34%,rgba(2,19,32,0.36)_63%,rgba(2,19,32,0.12)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(2,14,26,0.16)_0%,rgba(2,14,26,0.12)_48%,rgba(2,14,26,0.72)_100%)]" />

      <div className="relative z-10 mr-auto ml-0 flex w-full max-w-[120rem] flex-1 items-center px-4 py-4 sm:px-6 sm:py-6 lg:px-10 xl:px-14 2xl:px-16">
        <div className="w-full">
          <div className="hidden xl:block">
            <TopFlourish />
          </div>

          <div className="mb-4 flex w-full justify-center lg:mb-5 lg:justify-start">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-amber-300/70 bg-slate-950/40 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur-md sm:px-5 sm:text-[12px]">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-300" />
              <span className="truncate">Official Pappikondalu &amp; Bhadrachalam Booking</span>
            </div>
          </div>

          <div className="hidden max-w-[78rem] grid-cols-[0.86fr_1.38fr_0.86fr] items-start gap-5 xl:grid xl:gap-7">
            <div className="border-r border-amber-300/58 pr-7">
              <h2 className="text-[2.75rem] font-black leading-[1.03] tracking-tight text-amber-300 xl:text-[3.3rem] whitespace-nowrap">తెలంగాణ & ఏపీ</h2>
              <div className="mt-2 text-[2.75rem] font-black leading-[1.02] tracking-tight text-white xl:text-[3.15rem]">బోట్ టూరిజం</div>
              <p className="mt-5 max-w-[16rem] text-lg font-semibold leading-7 text-white/88">ప్రకృతితో ఒక అందమైన ప్రయాణం</p>
              <SmallDivider />
            </div>

            <div className="px-1">
              <h1 className="font-serif text-[3.25rem] font-black leading-[0.96] tracking-normal xl:text-[4.15rem]">
                <span className="block whitespace-nowrap text-amber-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.28)]">Telangana & AP</span>
                <span className="block whitespace-nowrap text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.28)]">Boat Tourism</span>
              </h1>
              <TitleOrnament />
              <p className="mt-3 text-lg font-semibold leading-7 text-white/92 xl:text-xl">Journey into Nature, Peace &amp; Culture</p>
              <SmallDivider />
            </div>

            <div className="border-l border-amber-300/58 pl-7 text-right" dir="rtl">
              <h2 className="text-[2.6rem] font-black leading-[1.08] tracking-tight text-amber-300 xl:text-[3.15rem] whitespace-nowrap">تلنگانہ اور اے پی</h2>
              <div className="mt-2 text-[2.75rem] font-black leading-[1.14] tracking-tight text-white xl:text-[3.15rem]">بوٹ టూరిజం</div>
              <p className="mr-auto mt-5 max-w-[16rem] text-lg font-semibold leading-7 text-white/88">قدرت، سکون اور یادوں کا سفر</p>
              <div className="flex justify-end">
                <SmallDivider />
              </div>
            </div>
          </div>

          <div className="xl:hidden">
            <div className="mx-auto max-w-[25rem] border-x border-amber-300/55 px-4 text-center">
              <h1 className="font-serif text-[clamp(2.5rem,11vw,3.8rem)] font-black leading-[0.92] tracking-normal">
                <span className="block text-amber-300">Telangana & AP</span>
                <span className="block text-white">Boat</span>
                <span className="block text-white">Tourism</span>
              </h1>
              <div className="mx-auto flex justify-center">
                <TitleOrnament />
              </div>
              <p className="mt-3 text-base font-bold leading-6 text-white/92">Journey into Nature, Peace &amp; Culture</p>
            </div>

          </div>

          <div className="mt-4 w-full max-w-[49rem] rounded-[2rem] border border-white/28 bg-slate-950/20 p-2.5 shadow-[0_16px_44px_rgba(0,0,0,0.22)] backdrop-blur-md sm:p-3 lg:mt-6">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {featurePills.map(({ icon: Icon, label }) => (
                <div key={label} className="flex min-h-14 items-center gap-2.5 rounded-[1.45rem] px-2.5 py-2 text-[13px] font-bold leading-snug text-white sm:min-h-16 sm:gap-3 sm:px-3 sm:py-2.5 sm:text-sm">
                  <Icon className="h-7 w-7 shrink-0 text-white sm:h-8 sm:w-8" strokeWidth={1.8} />
                  <span className="whitespace-pre-line">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid w-full max-w-[58rem] grid-cols-1 gap-2.5 min-[390px]:grid-cols-3 sm:flex sm:gap-4 lg:mt-5">
            <Link
              href="/boat-rides"
              prefetch={false}
              className="inline-flex min-h-[3.25rem] flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-amber-400 px-4 text-[13px] font-black text-slate-950 shadow-[0_18px_42px_rgba(251,191,36,0.34)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(251,191,36,0.46)] min-[390px]:min-h-14 min-[390px]:px-2 min-[390px]:text-[12px] sm:flex-none sm:gap-3 sm:px-7 sm:text-base"
            >
              <Anchor className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
              <span className="leading-tight">Boat Rides</span>
            </Link>
            <Link
              href="/sightseeing"
              prefetch={false}
              className="inline-flex min-h-[3.25rem] flex-1 items-center justify-center gap-2 rounded-full border border-teal-200/45 bg-teal-500/92 px-4 text-[13px] font-black text-white shadow-[0_18px_42px_rgba(20,184,166,0.24)] backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-[0_22px_48px_rgba(20,184,166,0.34)] min-[390px]:min-h-14 min-[390px]:px-2 min-[390px]:text-[12px] sm:flex-none sm:gap-3 sm:px-7 sm:text-base"
            >
              <Camera className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
              <span className="leading-tight min-[390px]:max-w-[4.5rem] min-[390px]:text-center sm:max-w-none">Scenic Sightseeing</span>
            </Link>
            <Link
              href="/stays"
              prefetch={false}
              className="inline-flex min-h-[3.25rem] flex-1 items-center justify-center gap-2 rounded-full border border-sky-300/45 bg-blue-950/76 px-4 text-[13px] font-black text-white shadow-[0_18px_42px_rgba(0,0,0,0.28)] backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:bg-blue-900/86 min-[390px]:min-h-14 min-[390px]:px-2 min-[390px]:text-[12px] sm:flex-none sm:gap-3 sm:px-7 sm:text-base"
            >
              <CalendarCheck className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
              <span className="leading-tight min-[390px]:max-w-[4rem] min-[390px]:text-center sm:max-w-none">Riverside Stays</span>
            </Link>
          </div>

          <div className="mx-auto mt-3 grid w-full max-w-[25rem] grid-cols-2 gap-2 md:hidden">
            <div className="min-w-0 rounded-2xl border border-white/14 bg-slate-950/30 p-2.5 backdrop-blur-md">
              <div className="truncate text-base font-black leading-tight text-amber-300">తెలంగాణ & ఏపీ</div>
              <div className="mt-0.5 truncate text-sm font-black leading-tight text-white">బోట్ టూరిజం</div>
            </div>
            <div className="min-w-0 rounded-2xl border border-white/14 bg-slate-950/30 p-2.5 text-right backdrop-blur-md" dir="rtl">
              <div className="truncate text-base font-black leading-tight text-amber-300">تلنگانہ اور اے پی</div>
              <div className="mt-0.5 truncate text-sm font-black leading-tight text-white">بوట్ టూరిజం</div>
            </div>
            {heroStats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/14 bg-slate-950/34 p-2.5 backdrop-blur-md">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-300 text-slate-950">
                  <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-black leading-none text-amber-300">{value}</div>
                  <div className="mt-0.5 truncate text-[8px] font-black uppercase tracking-[0.08em] text-white/82">{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 hidden max-w-[58rem] flex-wrap gap-2.5 md:flex lg:mt-4">
            {bottomTags.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-full border border-white/23 bg-slate-950/22 px-4 py-2 text-xs font-bold text-white/90 backdrop-blur-md">
                <Icon className="h-4 w-4 text-amber-300" />
                {label}
              </span>
            ))}
          </div>

          <div className="mx-auto mt-4 hidden max-w-[25rem] grid-cols-2 gap-3 md:grid xl:hidden">
            <div className="rounded-2xl border border-white/13 bg-slate-950/28 p-3 backdrop-blur-md">
              <div className="text-xl font-black leading-tight text-amber-300">తెలంగాణ & ఏపీ</div>
              <div className="mt-1 text-lg font-black leading-tight text-white">బోట్ టూరిజం</div>
              <p className="mt-2 text-[11px] font-semibold leading-4 text-white/78">ప్రకృతితో ఒక అందమైన ప్రయాణం</p>
            </div>
            <div className="rounded-2xl border border-white/13 bg-slate-950/28 p-3 text-right backdrop-blur-md" dir="rtl">
              <div className="text-xl font-black leading-tight text-amber-300">تلنگانہ اور اے پی</div>
              <div className="mt-1 text-lg font-black leading-tight text-white">بوట్ టూరిజం</div>
              <p className="mt-2 text-[11px] font-semibold leading-4 text-white/78">قدرت، سکون اور یادوں کا سفر</p>
            </div>
          </div>

          <div className="mx-auto mt-4 hidden w-full max-w-[25rem] grid-cols-2 gap-2.5 md:grid xl:hidden">
            {heroStats.map((stat) => (
              <StatBlock key={stat.label} {...stat} />
            ))}
            <div className="col-span-2 flex items-center justify-center gap-2 rounded-full border border-amber-300/35 bg-amber-300/12 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/88 backdrop-blur-md">
              <BadgeCheck className="h-4 w-4 shrink-0 text-amber-300" />
              Verified support from booking to boarding
            </div>
          </div>
        </div>

      </div>

      {/* Floating Elements relative to full screen */}
      <div className="pointer-events-none absolute right-8 top-[17%] z-20 hidden text-right 2xl:block">
        <div className="font-serif text-5xl italic leading-[0.92] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)]">Explore</div>
        <div className="mt-1 text-2xl font-semibold italic text-white/88">the Beauty of</div>
        <div className="font-serif text-6xl italic leading-none text-amber-300 drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)]">Godavari</div>
        <span className="ml-auto mt-1 block h-1 w-44 rounded-full bg-amber-300" />
      </div>

      <div className="pointer-events-none absolute bottom-28 right-10 z-20 hidden items-center gap-3 lg:flex xl:gap-4">
        {heroStats.map((stat) => (
          <StatBlock key={stat.label} {...stat} />
        ))}
      </div>

      <div className="relative z-10 mx-auto mt-auto hidden w-full max-w-[92rem] px-4 pb-4 sm:px-6 md:block lg:px-10">
        <div className="grid gap-3 rounded-2xl border border-white/20 bg-white/92 p-3 text-slate-950 shadow-[0_18px_55px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-center lg:p-4">
          {trustItems.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 px-1 py-1">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-[var(--color-brand-river)]">
                <Icon className="h-6 w-6" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black leading-5 text-slate-900">{label}</p>
                <p className="text-sm font-semibold leading-5 text-slate-600">{sub}</p>
              </div>
            </div>
          ))}
          <div className="hidden items-center justify-end gap-4 border-l border-slate-200 pl-5 lg:flex">
            <Image src="/aptdc-logo.svg" alt="APTDC" width={52} height={52} className="rounded-full bg-white p-1" />
            <span className="h-10 w-px bg-slate-300" />
            <Image src="/telangana-tourism-logo.svg" alt="Telangana Tourism" width={52} height={52} className="rounded-full bg-white p-1" />
          </div>
        </div>
      </div>
    </section>
  );
}
