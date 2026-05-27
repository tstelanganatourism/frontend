'use client';

import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="hidden items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 shadow-sm transition-all hover:bg-orange-100 xl:flex">
      <Zap className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
      <div className="flex items-baseline gap-1">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-[11px] font-black tracking-tight text-orange-700"
          >
            {count.toLocaleString()}
          </motion.span>
        </AnimatePresence>
        <span className="text-[10px] font-extrabold uppercase tracking-wide text-orange-600/80">
          Bookings
        </span>
      </div>
    </div>
  );
}
