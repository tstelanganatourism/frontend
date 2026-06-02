'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { googleCallback } from '@/services/authService';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const authError = searchParams.get('error');

    if (authError) {
      setError('Google authentication was cancelled or failed.');
      setTimeout(() => router.push('/login'), 3000);
      return;
    }

    if (!code) {
      setError('No authorization code found.');
      setTimeout(() => router.push('/login'), 3000);
      return;
    }

    const state = searchParams.get('state');

    const exchangeCode = async () => {
      try {
        // Construct the exact redirect URI used for the initial request
        const currentUrl = new URL(window.location.href);
        const redirectUri = `${currentUrl.origin}${currentUrl.pathname}`;
        
        await googleCallback(code, redirectUri);
        router.push(state || '/');
        router.refresh();
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to authenticate with Google.');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    exchangeCode();
  }, [searchParams, router]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#061d2b] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(26,107,122,0.28),transparent_60%),radial-gradient(ellipse_at_80%_20%,rgba(15,61,86,0.45),transparent_55%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex flex-col items-center text-center"
      >
        <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-3xl overflow-hidden bg-white shadow-xl p-2 border border-white/20">
          {error ? (
            <img 
              src="https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779020636/ts_tours/objxadvcxuub5q9h1ltn.jpg" 
              alt="Telangana Boat Tourism Logo" 
              className="h-full w-full object-contain rounded-2xl opacity-40 grayscale"
            />
          ) : (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="h-full w-full flex items-center justify-center"
            >
              <img 
                src="https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779020636/ts_tours/objxadvcxuub5q9h1ltn.jpg" 
                alt="Telangana Boat Tourism Logo" 
                className="h-full w-full object-contain rounded-2xl"
              />
            </motion.div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-950/20 backdrop-blur-[1px]">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-black text-white mb-2">
          {error ? 'Authentication Failed' : 'Authenticating...'}
        </h1>
        
        <p className="text-white/60">
          {error || 'Please wait while we securely log you in.'}
        </p>
      </motion.div>
    </div>
  );
}
