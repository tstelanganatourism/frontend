import Image from 'next/image';
import { getHdImageUrl } from '@/lib/utils';
import { BedDouble, Home, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

interface RoomHeroProps {
  lodgeName: string;
  coverImage?: string | null;
  address?: string | null;
  isFeatured?: boolean;
  startingPrice?: number | string | null;
  totalRooms?: number;
}

export const RoomHero = ({ lodgeName, coverImage, address, isFeatured, startingPrice, totalRooms }: RoomHeroProps) => {
  return (
    <section className="relative min-h-[640px] overflow-hidden bg-[#102f32] text-white md:min-h-[720px]">
      {coverImage ? (
        <Image src={getHdImageUrl(coverImage)} alt={lodgeName} fill priority sizes="100vw" className="object-cover" quality={85} />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f3d56,#2c5e43)]" />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,28,31,0.92),rgba(8,28,31,0.58)_50%,rgba(8,28,31,0.16))]" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#f7f6f1] via-[#f7f6f1]/75 to-transparent" />

      <div className="relative mx-auto flex min-h-[640px] max-w-7xl flex-col justify-end px-4 pb-12 pt-28 md:min-h-[720px]">
        <div className="max-w-4xl">
          <div className="mb-6 flex flex-wrap gap-2">
            {isFeatured ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-[#e5dac5]" />
                Verified premium stay
              </span>
            ) : null}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/16 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] backdrop-blur-md">
              <Home className="h-4 w-4 text-[#e5dac5]" />
              Bhadrachalam accommodation
            </span>
          </div>
          <h1 className="text-4xl font-black leading-[1.04] md:text-6xl lg:text-7xl">{lodgeName}</h1>
          <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-white/78 md:text-xl">
            A clearer stay page with room variants, facilities, check-in expectations, policy clarity, and reservation support before payment.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/16 bg-white/12 p-4 backdrop-blur-md">
              <MapPin className="mb-4 h-5 w-5 text-[#e5dac5]" />
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/54">Location</p>
              <p className="mt-2 line-clamp-2 text-sm font-bold text-white">{address || 'Bhadrachalam, Telangana'}</p>
            </div>
            <div className="rounded-2xl border border-white/16 bg-white/12 p-4 backdrop-blur-md">
              <BedDouble className="mb-4 h-5 w-5 text-[#e5dac5]" />
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/54">Rooms</p>
              <p className="mt-2 text-sm font-bold text-white">{totalRooms ? `${totalRooms} listed rooms` : 'Room Options'}</p>
            </div>
            <div className="rounded-2xl border border-white/16 bg-white/12 p-4 backdrop-blur-md">
              <Sparkles className="mb-4 h-5 w-5 text-[#e5dac5]" />
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/54">Starts from</p>
              <p className="mt-2 text-sm font-bold text-white">{startingPrice ? `₹${startingPrice}` : 'Contact support'}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
