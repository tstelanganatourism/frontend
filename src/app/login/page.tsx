'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Waves, ArrowRight, AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { touristLogin, getGoogleAuthUrl } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { isAuthenticated, user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && isAuthenticated && user) {
      const destination = redirect || (user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'AGENT' ? '/agent/dashboard' : '/dashboard');
      router.push(destination);
    }
  }, [isHydrated, isAuthenticated, user, redirect, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    try {
      await touristLogin(data);
      const destination = redirect || '/';
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Login failed. Please try again.';
      setApiError(msg);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const url = await getGoogleAuthUrl(undefined, redirect || undefined);
      window.location.href = url;
    } catch {
      setApiError('Google login unavailable. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#061d2b] flex items-center justify-center px-4 py-8">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(26,107,122,0.28),transparent_60%),radial-gradient(ellipse_at_80%_20%,rgba(15,61,86,0.45),transparent_55%)]" />
      <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778912237/slider7_fainya.jpg')] bg-cover bg-center opacity-[0.07]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden bg-white shadow-md p-1 border border-white/20">
            <img 
              src="https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1778914224/logo1_shpjk5.jpg" 
              alt="Papikondalu Tourism Logo" 
              className="h-full w-full object-contain rounded-xl"
            />
          </div>
          <h1 className="text-2xl font-black text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-white/60">Sign in to your Papikondalu Tourism account</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/12 bg-white/8 p-7 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
          {/* Google sign-in */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || isSubmitting}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/18 disabled:opacity-60"
          >
            {googleLoading ? (
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/15" />
            <span className="text-xs font-medium text-white/40">or sign in with email</span>
            <div className="h-px flex-1 bg-white/15" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/15 bg-white/8 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none ring-0 transition-all duration-200 focus:border-[#5ac4d7]/70 focus:bg-white/12 focus:ring-2 focus:ring-[#5ac4d7]/20"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle className="h-3 w-3" /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-[#5ac4d7] hover:text-white transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Your password"
                  className="w-full rounded-xl border border-white/15 bg-white/8 py-3 pl-10 pr-10 text-sm text-white placeholder-white/30 outline-none ring-0 transition-all duration-200 focus:border-[#5ac4d7]/70 focus:bg-white/12 focus:ring-2 focus:ring-[#5ac4d7]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle className="h-3 w-3" /> {errors.password.message}
                </p>
              )}
            </div>

            {/* API Error */}
            <AnimatePresence>
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {apiError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || googleLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a6b7a] py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(26,107,122,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1d7a8a] hover:shadow-[0_12px_32px_rgba(26,107,122,0.5)] disabled:opacity-60 disabled:translate-y-0"
            >
              {isSubmitting ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-white/50">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-[#5ac4d7] hover:text-white transition-colors">
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-[calc(100vh-4rem)] w-full bg-[#061d2b] flex items-center justify-center">
        <div className="text-white/60 text-sm">Loading sign in...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
