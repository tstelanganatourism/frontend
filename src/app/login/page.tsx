'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, AlertCircle, Briefcase, ShieldAlert, RefreshCw, CheckCircle2, ChevronLeft, Waves, MapPin, Star } from 'lucide-react';
import { sendPhoneOtp, verifyPhoneOtp } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

function getApiError(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { detail?: string } } };
  return e?.response?.data?.detail || fallback;
}

function useCountdown(initial: number) {
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback((seconds: number) => {
    setRemaining(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  return { remaining, start };
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [locked, setLocked] = useState(false);
  const [apiError, setApiError] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { remaining: cooldown, start: startCooldown } = useCountdown(60);

  useEffect(() => {
    if (isHydrated && isAuthenticated && user) {
      const dest = redirect || (user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'AGENT' ? '/agent/dashboard' : '/dashboard');
      router.replace(dest);
    }
  }, [isHydrated, isAuthenticated, user, redirect, router]);

  const agentHref = `/agent/login${redirect?.startsWith('/agent') ? `?redirect=${encodeURIComponent(redirect)}` : ''}`;
  const adminHref = `/admin/login${redirect?.startsWith('/admin') ? `?redirect=${encodeURIComponent(redirect)}` : ''}`;

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleaned = phone.trim().replace(/\D/g, '');
    if (!/^\d{10}$/.test(cleaned)) {
      setPhoneError('Enter a valid 10-digit mobile number');
      return;
    }
    setPhoneError(''); setApiError(''); setSubmitting(true);
    try {
      const res = await sendPhoneOtp(cleaned);
      setAttemptsLeft(res.attempts_remaining);
      startCooldown(res.cooldown_seconds || 60);
      setStep('otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      const msg = getApiError(err, 'Failed to send OTP. Please try again.');
      if (msg.toLowerCase().includes('wait')) setLocked(msg.toLowerCase().includes('too many'));
      setApiError(msg);
    } finally { setSubmitting(false); }
  };

  const handleOtpChange = (idx: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp]; next[idx] = digit;
    setOtp(next); setOtpError('');
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (digit && idx === 5 && next.every(d => d)) handleVerify(next.join(''));
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      otpRefs.current[5]?.focus();
      setTimeout(() => handleVerify(paste), 50);
    }
  };

  const handleVerify = async (otpValue?: string) => {
    const code = otpValue ?? otp.join('');
    if (code.length < 6) { setOtpError('Enter the 6-digit code'); return; }
    setSubmitting(true); setOtpError('');
    try {
      const res = await verifyPhoneOtp(phone.trim().replace(/\D/g, ''), code);
      const role = res.user?.role;
      const dest = redirect || (role === 'ADMIN' ? '/admin/dashboard' : role === 'AGENT' ? '/agent/dashboard' : '/dashboard');
      router.replace(dest);
    } catch (err) {
      setOtpError(getApiError(err, 'Invalid or expired OTP. Please try again.'));
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally { setSubmitting(false); }
  };

  const handleResend = async () => {
    if (cooldown > 0 || locked) return;
    setOtpError(''); setApiError(''); setSubmitting(true);
    try {
      const res = await sendPhoneOtp(phone.trim().replace(/\D/g, ''));
      setAttemptsLeft(res.attempts_remaining);
      startCooldown(60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      const msg = getApiError(err, 'Failed to resend OTP.');
      if (msg.toLowerCase().includes('too many')) setLocked(true);
      setOtpError(msg);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex">
      {/* ── LEFT PANEL: Scenic Brand Content ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-[#061d2b]">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: "url('https://res.cloudinary.com/r929tquv/image/upload/v1784836276/e62df8f4-a296-43b0-aa24-c63cb3a8f38f_n6bdp6.png')" }}
        />
        {/* Gradient overlay — light enough so the boat image shows through */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#061d2b]/75 via-[#061d2b]/35 to-[#0f3d56]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061d2b]/90 via-transparent to-[#061d2b]/30" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12 justify-between">
          {/* Top: Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/10 p-1 border border-white/20">
              <img src="/apple-touch-icon.png" alt="TS Boat Tourism" className="h-full w-full object-contain rounded-lg" />
            </div>
            <div>
              <p className="text-white font-black text-sm tracking-wide">TS Boat Tourism</p>
              <p className="text-white/50 text-xs">Official Booking Portal</p>
            </div>
          </div>

          {/* Center: Headline */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Waves className="h-5 w-5 text-[#5ac4d7]" />
              <span className="text-[#5ac4d7] text-xs font-bold uppercase tracking-widest">Telangana's Premier River Tourism</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Discover the<br />
              <span className="text-[#5ac4d7]">Godavari</span> like<br />
              never before.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Premium boat tourism experiences across Papikondalu, Maredumilli & Bhadrachalam — bookable in minutes.
            </p>

            {/* Stats row */}
            <div className="flex gap-6 mt-8">
              {[
                { value: '50,000+', label: 'Happy Tourists' },
                { value: '15+', label: 'Scenic Routes' },
                { value: '4.8★', label: 'Avg Rating' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-white font-black text-xl">{s.value}</p>
                  <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Location badges */}
          <div className="flex flex-wrap gap-2">
            {['Papikondalu', 'Bhadrachalam', 'Maredumilli', 'Kolluru'].map(loc => (
              <div key={loc} className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5">
                <MapPin className="h-3 w-3 text-[#5ac4d7]" />
                <span className="text-white/70 text-xs font-semibold">{loc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ── */}
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
              <p className="text-slate-400 text-xs">Official Booking Portal</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.div key="phone" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }}>
                <h1 className="text-2xl font-black text-slate-900 mb-1">Welcome back</h1>
                <p className="text-sm text-slate-500 mb-8">Sign in with your mobile number — no password needed.</p>

                <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mobile Number</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 border-r border-slate-200 pr-3">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-400 font-semibold">+91</span>
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        value={phone}
                        onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setPhoneError(''); setApiError(''); }}
                        placeholder="10-digit number"
                        className={`w-full rounded-xl border pl-24 pr-4 py-3 text-sm text-slate-900 placeholder-slate-300 outline-none transition-all focus:ring-2 focus:ring-[#1a6b7a]/20 focus:border-[#1a6b7a] ${phoneError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                      />
                    </div>
                    {phoneError && <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{phoneError}</p>}
                  </div>

                  {apiError && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{apiError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || phone.replace(/\D/g, '').length !== 10}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a6b7a] py-3.5 text-sm font-bold text-white transition-all hover:bg-[#0f3d56] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>
                      : <><span>Send OTP</span><ArrowRight className="h-4 w-4" /></>}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setOtpError(''); setApiError(''); }}
                  className="mb-6 flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Change number
                </button>

                <h1 className="text-2xl font-black text-slate-900 mb-1">Verify your number</h1>
                <p className="text-sm text-slate-500 mb-2">Enter the 6-digit code sent to</p>
                <p className="text-sm font-bold text-[#1a6b7a] mb-6">+91 {phone.replace(/\D/g, '')}</p>

                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 mb-6">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <p className="text-xs text-emerald-700 font-semibold">OTP sent! Check your SMS.</p>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Enter 6-digit OTP</label>
                  <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => { otpRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        className={`h-12 w-full max-w-[3rem] rounded-xl border text-center text-xl font-black text-slate-900 outline-none transition-all
                          ${digit ? 'border-[#1a6b7a] bg-[#1a6b7a]/8 text-[#1a6b7a]' : 'border-slate-200 bg-slate-50'}
                          focus:border-[#1a6b7a] focus:ring-2 focus:ring-[#1a6b7a]/20
                          ${otpError ? 'border-red-400 bg-red-50' : ''}`}
                        aria-label={`OTP digit ${idx + 1}`}
                      />
                    ))}
                  </div>
                  {otpError && <p className="mt-2 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{otpError}</p>}
                </div>

                <button
                  type="button"
                  onClick={() => handleVerify()}
                  disabled={submitting || otp.some(d => !d)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a6b7a] py-3.5 text-sm font-bold text-white transition-all hover:bg-[#0f3d56] disabled:opacity-50"
                >
                  {submitting ? <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>
                    : <><span>Verify & Sign In</span><ArrowRight className="h-4 w-4" /></>}
                </button>

                <div className="mt-4 text-center">
                  {locked ? (
                    <p className="text-xs text-amber-600 font-semibold">Too many attempts. Please wait 10 minutes.</p>
                  ) : cooldown > 0 ? (
                    <p className="text-xs text-slate-400">Resend in <span className="font-black text-slate-600">{cooldown}s</span> &nbsp;·&nbsp; {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} left</p>
                  ) : attemptsLeft > 0 ? (
                    <button type="button" onClick={handleResend} disabled={submitting}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a6b7a] hover:text-[#0f3d56] transition-colors">
                      <RefreshCw className="h-3.5 w-3.5" /> Resend OTP ({attemptsLeft} left)
                    </button>
                  ) : (
                    <p className="text-xs text-amber-600 font-semibold">No attempts left. Please wait 10 minutes.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Portal logins divider */}
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Portal Logins</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href={agentHref}
                className="group flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-700 transition-all hover:bg-teal-100 hover:border-teal-300">
                <Briefcase className="h-4 w-4 text-teal-500" />
                Agent Login
              </Link>
              <Link href={adminHref}
                className="group flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-bold text-violet-700 transition-all hover:bg-violet-100 hover:border-violet-300">
                <ShieldAlert className="h-4 w-4 text-violet-500" />
                Admin Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] w-full bg-white flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
