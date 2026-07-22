import Image from 'next/image';
import Link from 'next/link';
import { getHdImageUrl } from '@/lib/utils';
import { BedDouble, Home, MapPin, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';

interface RoomHeroProps {
  lodgeName: string;
  coverImage?: string | null;
  address?: string | null;
  isFeatured?: boolean;
  startingPrice?: number | string | null;
  totalRooms?: number;
}

const fallbackImage = 'https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779431872/maredumilli-13_mdqgmv.jpg';

export const RoomHero = ({ lodgeName, coverImage, address, isFeatured, startingPrice, totalRooms }: RoomHeroProps) => {
  const imageUrl = coverImage || fallbackImage;

  return (
    <section className="relative overflow-hidden bg-[#fafaf7] border-b border-slate-200/60 pb-10">
      <div className="relative mx-auto max-w-[1600px] px-4 pt-6 sm:px-6 lg:px-12">
        {/* Breadcrumb */}
        <div className="mb-4 flex min-w-0 items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#0d6e75]/70">
          <Link href="/" className="transition hover:text-[#0d6e75]">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link href="/stays" className="transition hover:text-[#0d6e75]">
            Stays
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="truncate text-slate-600">Accommodation Detail</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          {/* Left Text */}
          <div className="min-w-0 flex flex-col justify-center">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#0d6e75]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#0d6e75]">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Partner Stay
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700">
                <Home className="h-3 w-3" />
                Bhadrachalam Stay
              </span>
            </div>

            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl break-words">
              {lodgeName}
            </h1>

            <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
              A clean stay page with room variants, facilities, check-in expectations, policy clarity, and reservation support before payment.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <MapPin className="mb-2.5 h-4.5 w-4.5 text-amber-500" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Location</p>
                <p className="mt-1 text-sm font-extrabold text-slate-950 truncate">{address || 'Bhadrachalam, Telangana'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <BedDouble className="mb-2.5 h-4.5 w-4.5 text-amber-500" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Rooms</p>
                <p className="mt-1 text-sm font-extrabold text-slate-950">{totalRooms ? `${totalRooms} rooms` : 'Available Room Options'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm col-span-2 sm:col-span-1">
                <Sparkles className="mb-2.5 h-4.5 w-4.5 text-[#0d6e75]" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tariff starts at</p>
                <p className="mt-1 text-sm font-extrabold text-[#0d6e75]">{startingPrice ? `₹${startingPrice}` : 'Check Fares'}</p>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="#rooms-list"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0d6e75] px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#0b5c62] cursor-pointer"
              >
                Choose Rooms & Book
              </a>
            </div>
          </div>

          {/* Right Image */}
          <div className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
            <div className="relative overflow-hidden rounded-xl bg-slate-950 aspect-[4/3] w-full sm:aspect-[16/10] lg:min-h-[380px]">
              <Image
                src={getHdImageUrl(imageUrl)}
                alt={lodgeName}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 640px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
