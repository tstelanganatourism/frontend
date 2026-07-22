'use client';

import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

export default function LiveBookingCount() {
  const [count, setCount] = useState<number>(10000);

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/v1/bookings/live-count', {
          signal: controller.signal
        });
        if (res.ok) {
          const data = await res.json();
          setCount(data.count);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Failed to fetch live booking count', err);
      }
    };

    fetchCount();
    // Optional: Refresh every 60 seconds
    const interval = setInterval(fetchCount, 60000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex min-w-0 shrink-0 items-center gap-0.5 rounded-md border border-[#1598a1]/25 bg-[#e8f7f7] px-1.5 py-1 shadow-sm transition-all hover:bg-[#d8f2f2] xs:gap-1 xs:px-2 sm:px-3">
      <Zap className="h-3 w-3 shrink-0 fill-[#1598a1] text-[#1598a1] sm:h-3.5 sm:w-3.5" />
      <div className="flex min-w-0 items-baseline gap-0.5 sm:gap-1">
        <span className="text-[9.5px] font-black tracking-tight text-[#0f3d56] xs:text-[10px] sm:text-[11px]">
          {count.toLocaleString()}
        </span>
        <span className="hidden text-[8px] font-extrabold uppercase tracking-wide text-[#1598a1] xs-menu:inline sm:text-[10px]">
          Bookings
        </span>
      </div>
    </div>
  );
}
