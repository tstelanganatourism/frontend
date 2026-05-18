'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Mail, Lock, ArrowRight, AlertCircle, EyeOff, Eye } from 'lucide-react';
import { agentLogin } from '@/services/authService';

const loginSchema = z.object({
  email: z.string().email('Enter a valid agent email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginData = z.infer<typeof loginSchema>;

function AgentLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  const onLoginSubmit = async (data: LoginData) => {
    setApiError(null);
    try {
      await agentLogin(data);
      const destination = redirect || '/';
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setApiError(err?.response?.data?.detail || 'Invalid credentials or unauthorized.');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#050c16] flex items-center justify-center px-4 py-12">
      {/* Dynamic Glowing Mesh Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.18),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.12),transparent_55%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-indigo-500/8 blur-[130px] pointer-events-none" />

      {/* Cyber Grid Lines for tech aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500/25 to-indigo-500/10 border border-teal-500/30 shadow-[0_0_35px_rgba(20,184,166,0.25)]">
            <span className="absolute inset-0 rounded-2xl bg-teal-400/20 blur-md animate-pulse pointer-events-none" />
            <Briefcase className="h-7 w-7 text-teal-400 relative z-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase sm:text-4xl bg-gradient-to-r from-white via-white to-teal-300 bg-clip-text text-transparent">
            Agent Portal
          </h1>
          <p className="mt-2 text-xs font-medium uppercase tracking-widest text-teal-400/60">
            Secure Access Gateway
          </p>
        </div>

        {/* Premium Translucent Glassmorphic Card */}
        <div className="relative rounded-3xl border border-white/[0.08] bg-[#07111e]/60 p-8 backdrop-blur-3xl shadow-[0_32px_80px_rgba(0,0,0,0.75)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />
          
          <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-6 relative z-10" noValidate>
            <div>
              <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-widest text-teal-400/70">
                Agent Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-teal-400" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="username"
                  placeholder="agent@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-black/45 py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-teal-400 focus:bg-black/60 focus:ring-4 focus:ring-teal-400/10"
                />
              </div>
              {errors.email && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400 font-medium">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-widest text-teal-400/70">
                Secure Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-teal-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-black/45 py-3.5 pl-12 pr-12 text-sm text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-teal-400 focus:bg-black/60 focus:ring-4 focus:ring-teal-400/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-teal-400 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400 font-medium">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.password.message}
                </p>
              )}
            </div>

            <AnimatePresence>
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="flex items-start gap-2.5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3.5 text-sm text-red-300"
                >
                  <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-400" />
                  <span>{apiError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting}
              className="relative mt-8 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-teal-400 to-[#10b981] hover:from-teal-350 hover:to-[#059669] py-4 text-sm font-black uppercase tracking-wider text-black shadow-[0_8px_30px_rgba(20,184,166,0.3)] transition-all hover:shadow-[0_12px_40px_rgba(20,184,166,0.5)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-5 w-5 animate-spin text-black" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Agent Portal</span>
                  <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function AgentLoginPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-[calc(100vh-4rem)] w-full bg-[#050c16] flex items-center justify-center">
        <div className="text-teal-400/60 text-sm font-semibold tracking-wider animate-pulse uppercase">
          Loading Secret Agent Portal...
        </div>
      </div>
    }>
      <AgentLoginContent />
    </Suspense>
  );
}
