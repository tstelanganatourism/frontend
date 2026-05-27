'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Home,
  LifeBuoy,
  RefreshCw,
  ShieldCheck,
  Waves,
} from 'lucide-react';

type ErrorRecoveryScreenProps = {
  reset?: () => void;
  showShell?: boolean;
};

export default function ErrorRecoveryScreen({ reset, showShell = true }: ErrorRecoveryScreenProps) {
  const handleRefresh = () => window.location.reload();
  const handleRetry = () => {
    if (reset) {
      reset();
      return;
    }
    handleRefresh();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f1e8] text-[#082a3a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(245,188,66,0.2),transparent_30%),radial-gradient(circle_at_83%_22%,rgba(21,113,124,0.18),transparent_34%),linear-gradient(180deg,#f9fbf6_0%,#eef6f2_46%,#f4f1e8_100%)]" />
      <div className="absolute inset-x-0 top-0 h-[22rem] bg-[linear-gradient(180deg,rgba(6,42,58,0.08),transparent)]" />

      {showShell && (
        <header className="relative z-10 border-b border-[#d9e6dc] bg-white/78 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#0b3b55] text-base font-black text-white shadow-[0_10px_26px_rgba(8,42,58,0.16)]">
                TS
              </span>
              <span className="leading-tight">
                <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-[#6f827a]">Boat Tourism</span>
                <span className="block text-sm font-black text-[#0b3b55] sm:text-base">Admin Recovery</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-2 sm:flex">
              <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-black text-[#0b3b55] hover:bg-[#eef6f2]">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link href="/admin/dashboard" className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-black text-[#0b3b55] hover:bg-[#eef6f2]">
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            </nav>
          </div>
        </header>
      )}

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-16">
        <section className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-white/74 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#0b3b55] shadow-[0_12px_32px_rgba(8,42,58,0.08)] backdrop-blur-md">
            <Waves className="h-4 w-4 text-amber-500" />
            Booking system recovery
          </div>

          <h1 className="text-4xl font-black leading-[0.95] tracking-tight text-[#082a3a] sm:text-6xl lg:text-7xl">
            We hit a booking
            <span className="block text-[#d99b18]">service issue.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base font-semibold leading-7 text-[#50665f] sm:text-lg lg:mx-0">
            The dashboard could not finish loading this request. Your team can retry the page, return to the admin dashboard, or continue once the service responds again.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <button
              onClick={handleRefresh}
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#0b3b55] px-6 text-sm font-black text-white shadow-[0_16px_40px_rgba(8,42,58,0.22)] transition hover:-translate-y-0.5 hover:bg-[#11506f]"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </button>
            <button
              onClick={handleRetry}
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-[#cfddd5] bg-white/84 px-6 text-sm font-black text-[#0b3b55] shadow-[0_12px_32px_rgba(8,42,58,0.08)] transition hover:-translate-y-0.5 hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Try Again
            </button>
          </div>

          <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
            {[
              ['Status', 'Request stopped before completion'],
              ['Action', 'Retry or reload safely'],
              ['Support', 'Bookings remain protected'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/70 bg-white/66 p-4 shadow-[0_12px_30px_rgba(8,42,58,0.06)] backdrop-blur-md">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8a9b93]">{label}</div>
                <div className="mt-1 text-sm font-black leading-5 text-[#0b3b55]">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-2xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 p-3 shadow-[0_30px_90px_rgba(8,42,58,0.18)] backdrop-blur-xl sm:p-4">
            <Image
              src="/images/error-recovery-support.png"
              alt="Boat tourism support team restoring booking service"
              width={1536}
              height={1152}
              priority
              className="aspect-[4/3] w-full rounded-[1.45rem] object-cover"
            />
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/45 bg-[#082a3a]/78 p-4 text-white shadow-[0_16px_40px_rgba(8,42,58,0.24)] backdrop-blur-md sm:left-auto sm:max-w-xs">
              <div className="flex items-center gap-2 text-sm font-black">
                <LifeBuoy className="h-5 w-5 text-amber-300" />
                Recovery team is on it
              </div>
              <p className="mt-1 text-xs font-semibold leading-5 text-white/78">
                Reloading is safe. If the issue repeats, check the API service health.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
