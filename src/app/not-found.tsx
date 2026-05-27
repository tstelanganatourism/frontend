'use client';

import Link from 'next/link';
import { Compass, ArrowRight, Home, Search, Map } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-50">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#5ac4d7]/20 to-transparent blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[#0f3d56]/10 to-transparent blur-[100px]" />
      </div>

      <div className="container px-4 relative z-10 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Animated 404 Text */}
          <h1 className="text-[12rem] md:text-[18rem] font-black tracking-tighter text-slate-900/5 select-none leading-none">
            404
          </h1>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            <motion.div
              initial={{ rotate: -15, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}
              className="mb-6 bg-white p-5 rounded-3xl shadow-xl shadow-[#0f3d56]/5 border border-slate-100"
            >
              <Compass className="h-14 w-14 text-[#5ac4d7]" />
            </motion.div>
            
            <h2 className="text-3xl md:text-5xl font-black text-[#0f3d56] mb-4 tracking-tight">
              Destination Not Found
            </h2>
            <p className="text-lg text-slate-500 max-w-lg mx-auto font-medium mb-10 leading-relaxed">
              It seems you've navigated into uncharted waters. The page you're looking for has drifted away or doesn't exist.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <Link 
                href="/"
                className="group relative flex items-center justify-center gap-2 w-full sm:w-auto overflow-hidden rounded-full bg-[#0f3d56] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-[#0f3d56]/20 transition-all hover:-translate-y-1 hover:bg-[#1a4f6d]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Return Home
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer" />
              </Link>
              
              <Link 
                href="/boat-rides"
                className="group flex items-center justify-center gap-2 w-full sm:w-auto rounded-full bg-white border-2 border-slate-200 px-8 py-4 text-sm font-bold text-[#0f3d56] transition-all hover:border-[#5ac4d7] hover:text-[#5ac4d7] hover:shadow-lg hover:shadow-[#5ac4d7]/10"
              >
                <Map className="h-4 w-4" />
                Browse Boat Rides
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
