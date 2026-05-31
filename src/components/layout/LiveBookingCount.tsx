'use client';

import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

export default function LiveBookingCount() {
  const [count, setCount] = useState<number>(10000);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/v1/bookings/live-count');
        if (res.ok) {
          const data = await res.json();
          setCount(data.count);
        }
      } catch (err) {
        console.error('Failed to fetch live booking count', err);
      }
    };

    fetchCount();
    // Optional: Refresh every 60 seconds
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-w-0 shrink-0 items-center gap-0.5 rounded-full border border-orange-200 bg-orange-50 px-1.5 py-1 shadow-sm transition-all hover:bg-orange-100 min-[380px]:gap-1 min-[380px]:px-2 sm:px-3">
      <Zap className="h-3 w-3 shrink-0 text-orange-500 fill-orange-500 sm:h-3.5 sm:w-3.5" />
      <div className="flex min-w-0 items-baseline gap-0.5 sm:gap-1">
        <span className="text-[9.5px] font-black tracking-tight text-orange-700 min-[380px]:text-[10px] sm:text-[11px]">
          {count.toLocaleString()}
        </span>
        <span className="hidden text-[8px] font-extrabold uppercase tracking-wide text-orange-600/80 min-[420px]:inline sm:text-[10px]">
          Bookings
        </span>
      </div>
    </div>
  );
}
