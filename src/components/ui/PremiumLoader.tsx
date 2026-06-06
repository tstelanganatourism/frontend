import React from 'react';

/**
 * PremiumLoader — Telangana Boat Tourism
 * A cinematic, brand-matched full-screen loading overlay.
 * Used by: root loading.tsx (Suspense) + TopLoader navigation overlay.
 */
export default function PremiumLoader() {
  return (
    <div className="premium-loader-root" role="status" aria-label="Loading Telangana Boat Tourism">
      <style dangerouslySetInnerHTML={{ __html: `
        /* ── Root container ──────────────────────────────── */
        .premium-loader-root {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: linear-gradient(
            160deg,
            #071b2a 0%,
            #0d3247 28%,
            #0F3D56 55%,
            #134a66 80%,
            #0a2d42 100%
          );
          -webkit-font-smoothing: antialiased;
        }

        /* ── Starfield / subtle noise overlay ───────────── */
        .premium-loader-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(1px 1px at 15% 20%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 72% 10%, rgba(255,255,255,0.18) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 65%, rgba(255,255,255,0.12) 0%, transparent 100%),
            radial-gradient(1px 1px at 85% 45%, rgba(255,255,255,0.20) 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 80%, rgba(255,255,255,0.15) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 60% 35%, rgba(255,255,255,0.10) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 75%, rgba(255,255,255,0.22) 0%, transparent 100%),
            radial-gradient(1px 1px at 5% 50%, rgba(255,255,255,0.14) 0%, transparent 100%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── Ambient teal glow top-left ──────────────────── */
        .pl-glow-tl {
          position: absolute;
          top: -10%;
          left: -10%;
          width: 55vw;
          height: 55vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(26, 107, 122, 0.22) 0%, transparent 70%);
          pointer-events: none;
          animation: pl-glow-drift-tl 8s ease-in-out infinite;
        }

        /* ── Ambient gold glow bottom-right ─────────────── */
        .pl-glow-br {
          position: absolute;
          bottom: -15%;
          right: -10%;
          width: 60vw;
          height: 60vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(229, 218, 197, 0.10) 0%, transparent 65%);
          pointer-events: none;
          animation: pl-glow-drift-br 10s ease-in-out infinite;
        }

        /* ── Moon glow top-right ─────────────────────────── */
        .pl-moon {
          position: absolute;
          top: 8%;
          right: 12%;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: radial-gradient(circle at 40% 40%, rgba(229, 218, 197, 0.35) 0%, rgba(229, 218, 197, 0.05) 60%, transparent 80%);
          box-shadow: 0 0 40px 12px rgba(229, 218, 197, 0.08), 0 0 80px 30px rgba(229, 218, 197, 0.03);
          pointer-events: none;
          animation: pl-moon-pulse 6s ease-in-out infinite;
        }

        /* ── Water / Horizon line ────────────────────────── */
        .pl-horizon {
          position: absolute;
          bottom: 28%;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(26, 107, 122, 0.0) 10%,
            rgba(26, 107, 122, 0.4) 35%,
            rgba(229, 218, 197, 0.5) 50%,
            rgba(26, 107, 122, 0.4) 65%,
            rgba(26, 107, 122, 0.0) 90%,
            transparent 100%
          );
          pointer-events: none;
        }

        /* ── Wave SVG layer ──────────────────────────────── */
        .pl-wave-wrap {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 32%;
          pointer-events: none;
          overflow: hidden;
        }

        .pl-wave-1 {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 200%;
          height: 100%;
          animation: pl-wave-move 12s linear infinite;
        }

        .pl-wave-2 {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 200%;
          height: 100%;
          animation: pl-wave-move 18s linear infinite reverse;
          opacity: 0.6;
        }

        .pl-wave-3 {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 200%;
          height: 100%;
          animation: pl-wave-move 8s linear infinite;
          opacity: 0.35;
        }

        /* ── Boat container ──────────────────────────────── */
        .pl-boat-wrap {
          position: absolute;
          bottom: 28%;
          left: 50%;
          transform: translateX(-50%);
          width: 180px;
          animation: pl-boat-float 4s ease-in-out infinite;
          pointer-events: none;
        }

        /* ── Center content card ─────────────────────────── */
        .pl-card {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          /* Push the card above the waves */
          margin-bottom: 36%;
        }

        /* ── Logo ring ───────────────────────────────────── */
        .pl-logo-ring {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.96);
          border: 2px solid rgba(229, 218, 197, 0.40);
          box-shadow:
            0 0 0 10px rgba(26, 107, 122, 0.10),
            0 0 50px rgba(26, 107, 122, 0.30),
            0 8px 32px rgba(0, 0, 0, 0.25);
          animation: pl-logo-pulse 3s ease-in-out infinite;
        }

        .pl-logo-ring-orbit {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          border: 1px solid rgba(229, 218, 197, 0.12);
          animation: pl-orbit-spin 8s linear infinite;
        }

        .pl-logo-ring-orbit::before {
          content: '';
          position: absolute;
          top: -3px;
          left: 50%;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(229, 218, 197, 0.6);
          transform: translateX(-50%);
          box-shadow: 0 0 8px rgba(229, 218, 197, 0.8);
        }

        .pl-logo-img {
          width: 76px;
          height: 76px;
          object-fit: contain;
          border-radius: 50%;
          animation: pl-logo-shimmer 4s ease-in-out infinite;
        }

        /* ── Brand name ──────────────────────────────────── */
        .pl-brand {
          margin-top: 24px;
          text-align: center;
        }

        .pl-brand-primary {
          display: block;
          font-family: 'Outfit', sans-serif;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 0.20em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.92);
          text-shadow: 0 0 30px rgba(26, 107, 122, 0.6);
        }

        .pl-brand-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 8px;
        }

        .pl-brand-divider-line {
          width: 32px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(229, 218, 197, 0.5), transparent);
        }

        .pl-brand-secondary {
          font-family: 'Outfit', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.30em;
          text-transform: uppercase;
          color: rgba(229, 218, 197, 0.70);
        }

        /* ── Loading progress bar ────────────────────────── */
        .pl-progress-wrap {
          margin-top: 32px;
          width: 160px;
          height: 2px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          overflow: hidden;
          position: relative;
        }

        .pl-progress-bar {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          background: linear-gradient(90deg,
            rgba(26, 107, 122, 0.0) 0%,
            rgba(26, 107, 122, 0.9) 40%,
            rgba(229, 218, 197, 0.95) 60%,
            rgba(26, 107, 122, 0.0) 100%
          );
          animation: pl-progress-sweep 2s ease-in-out infinite;
        }

        .pl-loading-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 16px;
        }

        .pl-loading-dots span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(26, 107, 122, 0.8);
          animation: pl-dot-bounce 1.4s ease-in-out infinite;
        }

        .pl-loading-dots span:nth-child(1) { animation-delay: 0s; }
        .pl-loading-dots span:nth-child(2) { animation-delay: 0.2s; background: rgba(229, 218, 197, 0.7); }
        .pl-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        .pl-loading-dots span:nth-child(4) { animation-delay: 0.6s; background: rgba(229, 218, 197, 0.7); }
        .pl-loading-dots span:nth-child(5) { animation-delay: 0.8s; }

        /* ── Water reflection shimmer ────────────────────── */
        .pl-reflection {
          position: absolute;
          bottom: 27%;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 60px;
          background: linear-gradient(to bottom, rgba(229, 218, 197, 0.35), transparent);
          border-radius: 2px;
          animation: pl-reflection-flicker 3s ease-in-out infinite;
          pointer-events: none;
        }

        /* ══════════════════ KEYFRAMES ══════════════════════ */

        @keyframes pl-glow-drift-tl {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
          50% { transform: translate(4%, 3%) scale(1.08); opacity: 1; }
        }

        @keyframes pl-glow-drift-br {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          50% { transform: translate(-3%, -4%) scale(1.06); opacity: 1; }
        }

        @keyframes pl-moon-pulse {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        @keyframes pl-wave-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes pl-boat-float {
          0%, 100% { transform: translateX(-50%) translateY(0) rotate(-0.5deg); }
          25% { transform: translateX(-50%) translateY(-5px) rotate(0.5deg); }
          50% { transform: translateX(-50%) translateY(-9px) rotate(-0.5deg); }
          75% { transform: translateX(-50%) translateY(-4px) rotate(0.3deg); }
        }

        @keyframes pl-logo-pulse {
          0%, 100% {
            box-shadow:
              0 0 0 8px rgba(26, 107, 122, 0.08),
              0 0 40px rgba(26, 107, 122, 0.20),
              inset 0 1px 0 rgba(255,255,255,0.15);
          }
          50% {
            box-shadow:
              0 0 0 14px rgba(26, 107, 122, 0.05),
              0 0 60px rgba(26, 107, 122, 0.35),
              0 0 100px rgba(229, 218, 197, 0.08),
              inset 0 1px 0 rgba(255,255,255,0.20);
          }
        }

        @keyframes pl-orbit-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pl-logo-shimmer {
          0%, 100% { filter: brightness(1.0) drop-shadow(0 2px 12px rgba(26,107,122,0.4)); }
          50% { filter: brightness(1.2) drop-shadow(0 2px 20px rgba(26,107,122,0.7)); }
        }

        @keyframes pl-progress-sweep {
          0% { transform: translateX(-100%); }
          60%, 100% { transform: translateX(100%); }
        }

        @keyframes pl-dot-bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.3); opacity: 1; }
        }

        @keyframes pl-reflection-flicker {
          0%, 100% { opacity: 0.3; transform: translateX(-50%) scaleY(1); }
          50% { opacity: 0.7; transform: translateX(-50%) scaleY(0.85); }
        }

        /* Mobile responsiveness */
        @media (max-width: 480px) {
          .pl-moon { width: 60px; height: 60px; top: 5%; right: 8%; }
          .pl-logo-ring { width: 96px; height: 96px; }
          .pl-logo-img { width: 60px; height: 60px; }
          .pl-brand-primary { font-size: 14px; letter-spacing: 0.15em; }
          .pl-boat-wrap { width: 130px; }
          .pl-card { margin-bottom: 38%; }
          .pl-progress-wrap { width: 130px; }
        }
      `}} />

      {/* Ambient glows */}
      <div className="pl-glow-tl" />
      <div className="pl-glow-br" />

      {/* Moon */}
      <div className="pl-moon" />

      {/* Horizon line */}
      <div className="pl-horizon" />

      {/* Water reflection shimmer (moonlight on water) */}
      <div className="pl-reflection" />

      {/* ── Animated waves ── */}
      <div className="pl-wave-wrap">
        {/* Wave 1 — deep teal base */}
        <svg className="pl-wave-1" viewBox="0 0 1440 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,100 C120,60 240,140 360,100 C480,60 600,140 720,100 C840,60 960,140 1080,100 C1200,60 1320,140 1440,100 L1440,200 L0,200 Z"
            fill="rgba(7,27,42,0.90)"
          />
          <path
            d="M0,120 C100,80 220,155 360,120 C500,85 620,155 720,120 C820,85 960,155 1080,120 C1200,85 1320,155 1440,120 L1440,200 L0,200 Z"
            fill="rgba(7,27,42,0.70)"
          />
        </svg>

        {/* Wave 2 — mid layer */}
        <svg className="pl-wave-2" viewBox="0 0 1440 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,110 C180,70 300,150 480,110 C660,70 780,150 960,110 C1140,70 1260,150 1440,110 L1440,200 L0,200 Z"
            fill="rgba(13,50,71,0.6)"
          />
        </svg>

        {/* Wave 3 — top shimmer */}
        <svg className="pl-wave-3" viewBox="0 0 1440 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,80 C200,40 340,130 540,80 C740,30 880,130 1080,80 C1280,30 1360,120 1440,80 L1440,200 L0,200 Z"
            fill="rgba(26,107,122,0.15)"
          />
        </svg>
      </div>

      {/* ── Boat silhouette ── */}
      <div className="pl-boat-wrap">
        <svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" fill="none">
          {/* Hull */}
          <path
            d="M15 65 L30 45 L170 45 L185 65 Q185 72 175 74 L25 74 Q15 72 15 65 Z"
            fill="#0a2030"
            stroke="rgba(229,218,197,0.20)"
            strokeWidth="1"
          />
          {/* Cabin */}
          <rect x="60" y="28" width="80" height="20" rx="4"
            fill="#071b2a"
            stroke="rgba(229,218,197,0.18)"
            strokeWidth="0.8"
          />
          {/* Windows */}
          <rect x="70" y="33" width="12" height="8" rx="2" fill="rgba(229,218,197,0.20)" />
          <rect x="88" y="33" width="12" height="8" rx="2" fill="rgba(229,218,197,0.15)" />
          <rect x="106" y="33" width="12" height="8" rx="2" fill="rgba(229,218,197,0.20)" />
          {/* Mast */}
          <line x1="100" y1="0" x2="100" y2="30" stroke="rgba(229,218,197,0.30)" strokeWidth="1.2" />
          {/* Sail / Flag */}
          <path d="M100 2 L130 14 L100 26 Z" fill="rgba(26,107,122,0.50)" />
          {/* Light on mast top */}
          <circle cx="100" cy="2" r="2" fill="rgba(229,218,197,0.7)">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Water line shimmer */}
          <line x1="15" y1="74" x2="185" y2="74" stroke="rgba(26,107,122,0.30)" strokeWidth="0.8" />
          {/* Propeller wash */}
          <ellipse cx="175" cy="76" rx="10" ry="3" fill="rgba(255,255,255,0.06)" />
          <ellipse cx="185" cy="76" rx="6" ry="2" fill="rgba(255,255,255,0.04)" />
        </svg>
      </div>

      {/* ── Center Card (logo + brand + progress) ── */}
      <div className="pl-card">
        {/* Logo ring */}
        <div className="pl-logo-ring">
          <div className="pl-logo-ring-orbit" />
          <img
            src="/icon-192x192.png"
            alt="Telangana Boat Tourism"
            className="pl-logo-img"
          />
        </div>

        {/* Brand name */}
        <div className="pl-brand">
          <span className="pl-brand-primary">Telangana Boat Tourism</span>
          <div className="pl-brand-divider">
            <span className="pl-brand-divider-line" />
            <span className="pl-brand-secondary">Est. 2004 · Bhadrachalam</span>
            <span className="pl-brand-divider-line" />
          </div>
        </div>

        {/* Animated progress bar */}
        <div className="pl-progress-wrap" role="progressbar" aria-label="Loading">
          <div className="pl-progress-bar" />
        </div>

        {/* Animated dots */}
        <div className="pl-loading-dots" aria-hidden="true">
          <span /><span /><span /><span /><span />
        </div>
      </div>
    </div>
  );
}
