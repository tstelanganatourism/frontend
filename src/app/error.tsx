'use client';

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F0F8FF] flex flex-col justify-between font-sans antialiased text-[#0d2f5e]">
      {/* Navbar mock/aesthetic header */}
      <header className="px-6 py-4 md:px-12 flex justify-between items-center border-b border-blue-100 bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0d2f5e] flex items-center justify-center text-white font-bold text-lg tracking-wider">
            T
          </div>
          <span className="font-bold text-base tracking-wide uppercase text-[#0d2f5e]">
            TS BOAT TOURISM
          </span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-semibold text-[#0d2f5e]/80">
          <span>Home</span>
          <span>Features</span>
          <span>How it works</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">
        
        {/* Left Side: Content */}
        <div className="flex-1 text-center md:text-left max-w-lg">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[#0d2f5e]">
            Internal Server Error
          </h1>
          <p className="mt-6 text-base md:text-lg text-slate-600 leading-relaxed">
            Oops! Something went wrong on our servers. We're already working on fixing the issue. Please refresh or try again in a few moments.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={() => {
                // Hard reload page
                window.location.reload();
              }}
              className="px-8 py-3.5 bg-[#0d2f5e] text-white font-bold text-sm tracking-wider uppercase rounded-full shadow-lg shadow-blue-900/10 hover:bg-[#1a4a80] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#0d2f5e', color: '#ffffff', minWidth: '200px' }}
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              Refresh Page
            </button>
            <button
              onClick={() => reset()}
              className="px-8 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm tracking-wider uppercase rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>

        {/* Right Side: Beautiful SVG Illustration (Plug Theme matching Image 2) */}
        <div className="flex-1 w-full max-w-md md:max-w-lg">
          <svg
            viewBox="0 0 500 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto drop-shadow-2xl"
          >
            {/* Background card container */}
            <rect width="500" height="400" rx="24" fill="white" />
            
            {/* Aesthethic background abstract mountains/clouds */}
            <path
              d="M50 350C120 280 200 300 250 350"
              stroke="#E6F2FF"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M300 350C350 250 420 280 480 350"
              stroke="#E6F2FF"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Cloud */}
            <path
              d="M240 80C240 70 250 60 265 60C280 60 290 75 290 85C300 85 308 93 308 103C308 113 300 120 290 120H240C230 120 222 112 222 102C222 92 230 80 240 80Z"
              fill="#E1F0FF"
              opacity="0.8"
            />

            {/* Server racks in background (aesthethic boxes) */}
            <rect x="250" y="150" width="150" height="30" rx="4" fill="#F0F7FF" />
            <circle cx="380" cy="165" r="4" fill="#3B82F6" />
            <rect x="260" y="162" width="60" height="6" rx="3" fill="#DBEAFE" />

            <rect x="180" y="200" width="180" height="30" rx="4" fill="#F0F7FF" />
            <circle cx="340" cy="215" r="4" fill="#10B981" />
            <rect x="190" y="212" width="80" height="6" rx="3" fill="#DBEAFE" />

            {/* Man Figure holding disconnected plug cords */}
            {/* Legs */}
            <rect x="245" y="280" width="16" height="80" rx="8" fill="#0d2f5e" />
            <rect x="275" y="280" width="16" height="80" rx="8" fill="#0d2f5e" />
            {/* Shoes */}
            <path d="M235 360H261V368H235V360Z" fill="#1e293b" />
            <path d="M269 360H295V368H269V360Z" fill="#1e293b" />

            {/* Body/Shirt */}
            <path
              d="M220 200C220 185 240 180 268 180C296 180 316 185 316 200V280H220V200Z"
              fill="#2563EB"
            />

            {/* Beard / Head */}
            <circle cx="268" cy="155" r="16" fill="#F59E0B" /> {/* Skin */}
            <path
              d="M252 155C252 165 260 174 268 174C276 174 284 165 284 155H252Z"
              fill="#0F172A"
            /> {/* Beard */}
            <circle cx="268" cy="148" r="12" fill="#0F172A" /> {/* Hair */}

            {/* Arms extending wide */}
            {/* Left Arm holding cord */}
            <path
              d="M220 200C180 205 150 240 150 250"
              stroke="#2563EB"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Skin hand */}
            <circle cx="150" cy="250" r="7" fill="#F59E0B" />

            {/* Right Arm holding cord */}
            <path
              d="M316 200C356 205 386 240 386 250"
              stroke="#2563EB"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Skin hand */}
            <circle cx="386" cy="250" r="7" fill="#F59E0B" />

            {/* Left Cord (Green with Plug) */}
            <path
              d="M150 250C130 270 120 300 130 330"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Plug Head */}
            <rect
              x="138" y="235"
              width="14" height="20"
              rx="4"
              transform="rotate(-45 138 235)"
              fill="#10B981"
            />
            {/* Pins */}
            <line x1="126" y1="230" x2="132" y2="224" stroke="#D1FAE5" strokeWidth="3" />
            <line x1="132" y1="236" x2="138" y2="230" stroke="#D1FAE5" strokeWidth="3" />

            {/* Right Cord (Green with Socket) */}
            <path
              d="M386 250C410 270 430 290 410 320"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Socket Head */}
            <rect
              x="386" y="245"
              width="14" height="20"
              rx="4"
              transform="rotate(45 386 245)"
              fill="#10B981"
            />
            {/* Holes */}
            <circle cx="394" cy="245" r="2" fill="#047857" />
            <circle cx="400" cy="251" r="2" fill="#047857" />

            {/* Floor Plant */}
            <path
              d="M210 350C210 320 220 290 230 280C230 310 220 335 210 350Z"
              fill="#3B82F6"
            />
            <path
              d="M212 350C225 325 240 310 245 295C240 315 225 338 212 350Z"
              fill="#F59E0B"
            />
            <circle cx="210" cy="350" r="1.5" fill="#94A3B8" />

          </svg>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#0d2f5e]/60 border-t border-blue-50 bg-white/40">
        © {new Date().getFullYear()} TSTG Boat Tourism Services Private Limited. All rights reserved.
      </footer>
    </div>
  );
}
