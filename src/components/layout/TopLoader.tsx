'use client';

import React from 'react';
import NextTopLoader from 'nextjs-toploader';

/**
 * TopLoader — lightweight navigation progress indicator.
 *
 * Previously this component showed a full-screen PremiumLoader overlay that:
 *  - Blocked ALL user input via `pointer-events: auto`
 *  - Called `event.preventDefault()` on any subsequent link clicks
 *  - Locked navigation for up to 10 seconds, making the site feel frozen/glitched
 *
 * Now it only renders the thin, non-blocking top progress bar.
 * The PremiumLoader is available as a standalone component for use on specific
 * pages (e.g. checkout/payment) where intentional blocking is required.
 */
export default function TopLoader() {
  return (
    <NextTopLoader
      color="#1A6B7A"
      showSpinner={false}
      height={3}
      crawl={true}
      speed={200}
      initialPosition={0.08}
      shadow="0 0 10px #1A6B7A, 0 0 5px rgba(229,218,197,0.5)"
    />
  );
}
