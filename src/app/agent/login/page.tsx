'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Mail, Lock, ArrowRight, AlertCircle, EyeOff, Eye, Waves, MapPin, TrendingUp, Users } from 'lucide-react';
import { agentLogin } from '@/services/authService';

const loginSchema = z.object({
  email: z.string().email('Enter a valid agent email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginData = z.infer<typeof loginSchema>;

function getAuthErrorMessage(error: unknown, fallback: string) {
  const responseError = error as { response?: { data?: { detail?: string } } };
  return responseError.response?.data?.detail || fallback;
}

function AgentLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  const onLoginSubmit = async (data: LoginData) => {
    setApiError(null);
    try {
      await agentLogin(data);
      router.push(redirect || '/');
      router.refresh();
    } catch (err: unknown) {
      setApiError(getAuthErrorMessage(err, 'Invalid credentials or unauthorized.'));
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex">
      {/* ── LEFT PANEL: Brand Content ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-[#061d2b]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://res.cloudinary.com/dpdab3e97/image/upload/q_auto/f_auto/v1779431943/papikondalu-tour-packages-ap-1_hje1jh.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#061d2b]/70 via-[#061d2b]/40 to-[#0f3d56]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061d2b]/90 via-transparent to-[#061d2b]/30" />

        <div className="relative z-10 flex flex-col h-full p-12 justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/10 p-1 border border-white/20">
              <img src="/apple-touch-icon.png" alt="TS Boat Tourism" className="h-full w-full object-contain rounded-lg" />
            </div>
            <div>
              <p className="text-white font-black text-sm tracking-wide">TS Boat Tourism</p>
              <p className="text-white/50 text-xs">Agent Partner Portal</p>
            </div>
          </div>

          {/* Headline */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-4 w-4 text-teal-400" />
              <span className="text-teal-400 text-xs font-bold uppercase tracking-widest">Agent Partner Network</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Grow your<br />
              <span className="text-teal-400">travel</span> business<br />
              with us.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Access exclusive commission rates, real-time availability, and dedicated support — all in one portal.
            </p>

            {/* Benefits */}
            <div className="space-y-3 mt-8">
              {[
                { icon: TrendingUp, label: 'Competitive Commission Rates', sub: 'Up to 15% on all bookings' },
                { icon: Users, label: 'Dedicated Support', sub: 'Priority agent helpdesk' },
                { icon: Waves, label: 'Live Availability', sub: 'Real-time booking management' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-teal-400/15 border border-teal-400/20 flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">{item.label}</p>
                    <p className="text-white/45 text-xs">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="flex flex-wrap gap-2">
            {['Papikondalu', 'Bhadrachalam', 'Maredumilli', 'Kolluru'].map(loc => (
              <div key={loc} className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5">
                <MapPin className="h-3 w-3 text-teal-400" />
                <span className="text-white/70 text-xs font-semibold">{loc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Agent Login Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile brand */}
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden border border-slate-200">
              <img src="/apple-touch-icon.png" alt="TS Boat Tourism" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-slate-900 font-black text-sm">TS Boat Tourism</p>
              <p className="text-slate-400 text-xs">Agent Partner Portal</p>
            </div>
          </div>

          {/* Icon + heading */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Agent Portal</h1>
              <p className="text-xs text-slate-400">Partner access only</p>
            </div>
          </div>

          <p className="text-sm text-slate-500 mb-8">Sign in with your agent credentials to manage bookings and commissions.</p>

          <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="username"
                  placeholder="agent@example.com"
                  className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-300 outline-none transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                />
              </div>
              {errors.email && <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  className={`w-full rounded-xl border pl-10 pr-11 py-3 text-sm text-slate-900 placeholder-slate-300 outline-none transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.password.message}</p>}
            </div>

            <AnimatePresence>
              {apiError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{apiError}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting
                ? <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>
                : <><span>Sign In to Agent Portal</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <Link href="/login" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">← Customer Login</Link>
            <Link href="/admin/login" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">Admin Portal →</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AgentLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] w-full bg-white flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    }>
      <AgentLoginContent />
    </Suspense>
  );
}
